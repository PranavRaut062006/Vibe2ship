import express from 'express';
import { db } from '../lib/firebaseAdmin.js';
import { generateSchedule, replanSchedule } from '../services/gemini.js';

const router = express.Router();

async function getApprovedTasks() {
  const snapshot = await db.collection('tasks').where('status', '==', 'approved').get();
  return snapshot.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() }));
}

async function getMemories() {
  const snapshot = await db.collection('userMemory').get();
  return snapshot.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() }));
}

// GET schedule for date
router.get('/:date', async (req, res) => {
  try {
    const date = req.params.date === 'today' ? new Date().toISOString().split('T')[0] : req.params.date;
    const docRef = db.collection('schedules').doc(date);
    const doc = await docRef.get();
    
    let scheduleData;
    if (!doc.exists) {
      const pendingTasks = await getApprovedTasks();
      const memories = await getMemories();
      const generatedBlocks = await generateSchedule(pendingTasks, memories, date);
      
      scheduleData = { date, blocks: generatedBlocks };
      await docRef.set(scheduleData);
    } else {
      scheduleData = doc.data();
    }
    
    const schedule = {
      _id: docRef.id,
      id: docRef.id,
      ...scheduleData
    };
    
    res.json({ schedule });
  } catch (error) {
    console.error("GET /api/schedule/:date error:", error);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
});

// POST generate schedule
router.post('/generate', async (req, res) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.body;
    const pendingTasks = await getApprovedTasks();
    const memories = await getMemories();
    
    const generatedBlocks = await generateSchedule(pendingTasks, memories, date);
    const scheduleData = { date, blocks: generatedBlocks };
    
    const docRef = db.collection('schedules').doc(date);
    await docRef.set(scheduleData);
    
    const updatedSchedule = {
      _id: docRef.id,
      id: docRef.id,
      ...scheduleData
    };
    
    res.json({ schedule: updatedSchedule });
  } catch (error) {
    console.error("POST /api/schedule/generate error:", error);
    res.status(500).json({ error: "Failed to generate schedule" });
  }
});

// PUT replan schedule
router.put('/replan', async (req, res) => {
  try {
    const { date = new Date().toISOString().split('T')[0], delayedTask, reason = "Task took longer than expected" } = req.body;
    const docRef = db.collection('schedules').doc(date);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: "No active schedule found for today to replan." });
    }
    
    const currentSchedule = doc.data();
    const replanResult = await replanSchedule(currentSchedule.blocks || [], delayedTask, reason);
    
    const newBlocks = replanResult.blocks || currentSchedule.blocks || [];
    await docRef.set({ blocks: newBlocks }, { merge: true });
    
    const updatedSchedule = {
      _id: docRef.id,
      id: docRef.id,
      ...currentSchedule,
      blocks: newBlocks
    };
    
    res.json({
      schedule: updatedSchedule,
      explanation: replanResult.explanation
    });
  } catch (error) {
    console.error("PUT /api/schedule/replan error:", error);
    res.status(500).json({ error: "Failed to replan schedule" });
  }
});

export default router;
