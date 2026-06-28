import express from 'express';
import { db } from '../lib/firebaseAdmin.js';

const router = express.Router();

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
    const { title, deadline, priority, estimatedMinutes, category, status, source, aiConfidence } = req.body;
    const taskData = {
      title,
      deadline: deadline || 'Today',
      priority: priority || 'P2',
      estimatedMinutes: estimatedMinutes || 45,
      category: category || 'Focus',
      status: status || 'approved',
      source: source || 'manual',
      aiConfidence: aiConfidence || 94,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('tasks').add(taskData);
    const newTask = {
      _id: docRef.id,
      id: docRef.id,
      ...taskData
    };
    
    res.status(201).json({ task: newTask });
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

    await docRef.set(updateData, { merge: true });
    const updatedDoc = await docRef.get();
    const updatedTask = {
      _id: updatedDoc.id,
      id: updatedDoc.id,
      ...updatedDoc.data()
    };

    res.json({ task: updatedTask });
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
