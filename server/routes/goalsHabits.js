import express from 'express';
import { db } from '../lib/firebaseAdmin.js';

const router = express.Router();

// ==========================================
// GOALS ENDPOINTS
// ==========================================

// GET all goals
router.get('/goals', async (req, res) => {
  try {
    const snapshot = await db.collection('goals').get();
    const goals = snapshot.docs.map(doc => ({
      _id: doc.id,
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    
    res.json({ goals });
  } catch (error) {
    console.error("GET /api/goals error:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

// POST create goal
router.post('/goals', async (req, res) => {
  try {
    const { title, description, category, targetDate, progress, targetValue, currentValue, status } = req.body;
    const goalData = {
      title: title || 'New Goal',
      description: description || '',
      category: category || 'General',
      targetDate: targetDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      progress: Number(progress) || 0,
      targetValue: Number(targetValue) || 100,
      currentValue: Number(currentValue) || 0,
      status: status || 'in-progress',
      createdAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('goals').add(goalData);
    res.status(201).json({ goal: { _id: docRef.id, id: docRef.id, ...goalData } });
  } catch (error) {
    console.error("POST /api/goals error:", error);
    res.status(500).json({ error: "Failed to create goal" });
  }
});

// PUT update goal
router.put('/goals/:id', async (req, res) => {
  try {
    const docRef = db.collection('goals').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Goal not found" });

    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.id;

    await docRef.set(updateData, { merge: true });
    const updatedDoc = await docRef.get();
    res.json({ goal: { _id: updatedDoc.id, id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (error) {
    console.error("PUT /api/goals/:id error:", error);
    res.status(500).json({ error: "Failed to update goal" });
  }
});

// DELETE goal
router.delete('/goals/:id', async (req, res) => {
  try {
    const docRef = db.collection('goals').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Goal not found" });
    
    await docRef.delete();
    res.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/goals/:id error:", error);
    res.status(500).json({ error: "Failed to delete goal" });
  }
});

// ==========================================
// HABITS ENDPOINTS
// ==========================================

// GET all habits
router.get('/habits', async (req, res) => {
  try {
    const snapshot = await db.collection('habits').get();
    const habits = snapshot.docs.map(doc => ({
      _id: doc.id,
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    
    res.json({ habits });
  } catch (error) {
    console.error("GET /api/habits error:", error);
    res.status(500).json({ error: "Failed to fetch habits" });
  }
});

// POST create habit
router.post('/habits', async (req, res) => {
  try {
    const { title, category, frequency, targetDaysPerWeek, streak, completedDates } = req.body;
    const habitData = {
      title: title || 'New Habit',
      category: category || 'Health',
      frequency: frequency || 'daily', // daily, weekly
      targetDaysPerWeek: Number(targetDaysPerWeek) || 7,
      streak: Number(streak) || 0,
      completedDates: Array.isArray(completedDates) ? completedDates : [],
      createdAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('habits').add(habitData);
    res.status(201).json({ habit: { _id: docRef.id, id: docRef.id, ...habitData } });
  } catch (error) {
    console.error("POST /api/habits error:", error);
    res.status(500).json({ error: "Failed to create habit" });
  }
});

// PUT update habit (e.g. toggle completion for today)
router.put('/habits/:id', async (req, res) => {
  try {
    const docRef = db.collection('habits').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Habit not found" });

    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.id;

    await docRef.set(updateData, { merge: true });
    const updatedDoc = await docRef.get();
    res.json({ habit: { _id: updatedDoc.id, id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (error) {
    console.error("PUT /api/habits/:id error:", error);
    res.status(500).json({ error: "Failed to update habit" });
  }
});

// DELETE habit
router.delete('/habits/:id', async (req, res) => {
  try {
    const docRef = db.collection('habits').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Habit not found" });
    
    await docRef.delete();
    res.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/habits/:id error:", error);
    res.status(500).json({ error: "Failed to delete habit" });
  }
});

export default router;
