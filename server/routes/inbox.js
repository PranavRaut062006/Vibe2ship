import express from 'express';
import { db } from '../lib/firebaseAdmin.js';
import { extractTasksFromEmail } from '../services/gemini.js';

const router = express.Router();

// POST scan email text
router.post('/scan', async (req, res) => {
  try {
    const { emailText } = req.body;
    if (!emailText || !emailText.trim()) {
      return res.json({ extractedTasks: [], message: "Can't fetch data from actual email." });
    }

    const extractedArray = await extractTasksFromEmail(emailText);
    if (!extractedArray || extractedArray.length === 0) {
      return res.json({ extractedTasks: [], message: "Can't fetch data from actual email." });
    }
    
    const createdTasks = [];
    for (const item of extractedArray) {
      const taskData = {
        title: item.title || "Extracted Task",
        deadline: item.deadline || "Tomorrow",
        priority: item.priority || "P2",
        estimatedMinutes: item.estimatedMinutes || 45,
        category: item.category || "Focus",
        status: "pending",
        source: "gmail",
        sourceEmail: emailText.substring(0, 80) + '...',
        aiConfidence: item.aiConfidence || 92,
        createdAt: new Date().toISOString()
      };
      const docRef = await db.collection('tasks').add(taskData);
      createdTasks.push({
        _id: docRef.id,
        id: docRef.id,
        ...taskData
      });
    }

    res.json({ extractedTasks: createdTasks });
  } catch (error) {
    console.error("POST /api/inbox/scan error:", error);
    res.status(500).json({ error: "Failed to scan email text" });
  }
});

// POST approve task
router.post('/approve/:taskId', async (req, res) => {
  try {
    const docRef = db.collection('tasks').doc(req.params.taskId);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Task not found" });

    await docRef.set({ status: 'approved' }, { merge: true });
    const updatedDoc = await docRef.get();
    const updatedTask = {
      _id: updatedDoc.id,
      id: updatedDoc.id,
      ...updatedDoc.data()
    };
    res.json({ task: updatedTask, success: true });
  } catch (error) {
    console.error("POST /api/inbox/approve error:", error);
    res.status(500).json({ error: "Failed to approve task" });
  }
});

export default router;
