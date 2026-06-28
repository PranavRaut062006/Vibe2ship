import express from 'express';
import { db } from '../lib/firebaseAdmin.js';

const router = express.Router();

// GET all memories
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('userMemory').get();
    const memories = snapshot.docs.map(doc => ({
      _id: doc.id,
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    
    res.json({ memories });
  } catch (error) {
    console.error("GET /api/memory error:", error);
    res.status(500).json({ error: "Failed to fetch memories" });
  }
});

// PUT update or create memory by key
router.put('/:key', async (req, res) => {
  try {
    const { value } = req.body;
    const docId = encodeURIComponent(req.params.key);
    const docRef = db.collection('userMemory').doc(docId);
    
    const memoryData = {
      key: req.params.key,
      value,
      updatedAt: new Date().toISOString()
    };
    
    await docRef.set(memoryData);
    const memory = { _id: docId, id: docId, ...memoryData };
    
    res.json({ memory });
  } catch (error) {
    console.error("PUT /api/memory/:key error:", error);
    res.status(500).json({ error: "Failed to update memory" });
  }
});

// DELETE forget memory by key
router.delete('/:key', async (req, res) => {
  try {
    const docId = encodeURIComponent(req.params.key);
    await db.collection('userMemory').doc(docId).delete();
    
    // Cleanup any docs that might match by query key
    const snapshot = await db.collection('userMemory').where('key', '==', req.params.key).get();
    if (!snapshot.empty) {
      const batch = db.batch();
      snapshot.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/memory/:key error:", error);
    res.status(500).json({ error: "Failed to delete memory" });
  }
});

export default router;
