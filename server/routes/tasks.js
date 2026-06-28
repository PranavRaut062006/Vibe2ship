import express from 'express';
import { db } from '../lib/firebaseAdmin.js';

const router = express.Router();

// Helper: Parse time HH:MM to minutes from midnight
function timeToMinutes(timeStr) {
  if (!timeStr || !timeStr.includes(':')) return null;
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

// Helper: Convert minutes from midnight to HH:MM
function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Helper: Detect conflicts and suggest alternative slots
async function detectConflictsAndSuggest(taskData, currentTaskId = null) {
  const date = taskData.scheduledDate || taskData.deadline;
  const time = taskData.scheduledTime;
  const duration = Number(taskData.estimatedMinutes) || 45;

  if (!date || !time) {
    return { hasConflict: false, conflictsWith: [], suggestedSlots: [] };
  }

  const startMins = timeToMinutes(time);
  if (startMins === null) return { hasConflict: false, conflictsWith: [], suggestedSlots: [] };
  const endMins = startMins + duration;

  // Fetch existing tasks for this date
  const tasksSnap = await db.collection('tasks').get();
  const existingIntervals = [];

  tasksSnap.docs.forEach(doc => {
    if (doc.id === currentTaskId) return;
    const t = doc.data();
    if (t.status === 'completed') return;
    const tDate = t.scheduledDate || t.deadline;
    if (tDate === date && t.scheduledTime) {
      const tStart = timeToMinutes(t.scheduledTime);
      if (tStart !== null) {
        const tDur = Number(t.estimatedMinutes) || 45;
        existingIntervals.push({
          title: t.title || 'Untitled Task',
          type: 'Task',
          start: tStart,
          end: tStart + tDur
        });
      }
    }
  });

  // Fetch calendar events for this date
  const eventsSnap = await db.collection('calendarEvents').get();
  eventsSnap.docs.forEach(doc => {
    const e = doc.data();
    if (e.date === date && e.startTime) {
      const eStart = timeToMinutes(e.startTime);
      if (eStart !== null) {
        const eEnd = e.endTime ? timeToMinutes(e.endTime) : (eStart + 60);
        existingIntervals.push({
          title: e.title || 'Meeting',
          type: 'Meeting',
          start: eStart,
          end: eEnd
        });
      }
    }
  });

  // Check for overlaps
  const conflictsWith = [];
  existingIntervals.forEach(item => {
    if (Math.max(startMins, item.start) < Math.min(endMins, item.end)) {
      conflictsWith.push(`${item.type}: "${item.title}" (${minutesToTime(item.start)} - ${minutesToTime(item.end)})`);
    }
  });

  // Suggest alternative slots between 08:00 (480) and 20:00 (1200)
  const suggestedSlots = [];
  if (conflictsWith.length > 0) {
    // Sort intervals by start time
    existingIntervals.sort((a, b) => a.start - b.start);
    let candidateStart = 480; // 8:00 AM

    for (let i = 0; i <= existingIntervals.length; i++) {
      const nextStart = i < existingIntervals.length ? existingIntervals[i].start : 1200;
      if (nextStart - candidateStart >= duration) {
        suggestedSlots.push(`${minutesToTime(candidateStart)} - ${minutesToTime(candidateStart + duration)}`);
        if (suggestedSlots.length >= 3) break;
      }
      if (i < existingIntervals.length) {
        candidateStart = Math.max(candidateStart, existingIntervals[i].end);
      }
    }
  }

  return {
    hasConflict: conflictsWith.length > 0,
    conflictsWith,
    suggestedSlots
  };
}

// GET all tasks
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('tasks').get();
    const tasks = snapshot.docs.map(doc => ({
      _id: doc.id,
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    
    res.json({ tasks });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// POST create new task
router.post('/', async (req, res) => {
  try {
    const {
      title, description, category, priority, deadline, scheduledDate, scheduledTime,
      estimatedMinutes, reminder, notes, status, recurring, customInterval
    } = req.body;

    const taskData = {
      title: title || 'New Task',
      description: description || '',
      category: category || 'Work',
      priority: priority || 'P2',
      deadline: deadline || scheduledDate || new Date().toISOString().split('T')[0],
      scheduledDate: scheduledDate || deadline || new Date().toISOString().split('T')[0],
      scheduledTime: scheduledTime || '09:00',
      estimatedMinutes: Number(estimatedMinutes) || 45,
      reminder: reminder || 'none',
      notes: notes || '',
      status: status || 'pending',
      recurring: recurring || 'none',
      customInterval: Number(customInterval) || 1,
      createdAt: new Date().toISOString()
    };

    // Detect time conflicts
    const conflictResult = await detectConflictsAndSuggest(taskData);
    if (conflictResult.hasConflict) {
      taskData.conflictWarning = conflictResult.conflictsWith.join(', ');
      taskData.suggestedSlots = conflictResult.suggestedSlots;
    } else {
      taskData.conflictWarning = null;
      taskData.suggestedSlots = [];
    }
    
    const docRef = await db.collection('tasks').add(taskData);
    const newTask = {
      _id: docRef.id,
      id: docRef.id,
      ...taskData,
      conflictResult
    };
    
    res.status(201).json({ task: newTask, conflictResult });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// PUT update task
router.put('/:id', async (req, res) => {
  try {
    const docRef = db.collection('tasks').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Task not found" });

    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.id;

    const mergedData = { ...doc.data(), ...updateData };

    // Detect time conflicts
    const conflictResult = await detectConflictsAndSuggest(mergedData, req.params.id);
    if (conflictResult.hasConflict) {
      updateData.conflictWarning = conflictResult.conflictsWith.join(', ');
      updateData.suggestedSlots = conflictResult.suggestedSlots;
    } else {
      updateData.conflictWarning = null;
      updateData.suggestedSlots = [];
    }

    await docRef.set(updateData, { merge: true });
    const updatedDoc = await docRef.get();
    const updatedTask = {
      _id: updatedDoc.id,
      id: updatedDoc.id,
      ...updatedDoc.data(),
      conflictResult
    };

    res.json({ task: updatedTask, conflictResult });
  } catch (error) {
    console.error("PUT /api/tasks/:id error:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE delete task
router.delete('/:id', async (req, res) => {
  try {
    const docRef = db.collection('tasks').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Task not found" });
    
    await docRef.delete();
    res.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tasks/:id error:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;
