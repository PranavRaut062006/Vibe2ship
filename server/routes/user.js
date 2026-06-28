import express from 'express';
import { db } from '../lib/firebaseAdmin.js';

const router = express.Router();

// GET user profile
router.get('/', async (req, res) => {
  try {
    const userRef = db.collection('users').doc('default-user');
    let doc = await userRef.get();
    let userData;
    if (!doc.exists) {
      userData = {
        name: 'New User',
        email: 'user@lifepilot.ai',
        consistencyScore: 0,
        productivityMode: 'Balanced',
        streak: 0,
        createdAt: new Date().toISOString()
      };
      await userRef.set(userData);
    } else {
      userData = doc.data();
    }
    const user = { _id: 'default-user', id: 'default-user', ...userData };
    res.json({ user });
  } catch (error) {
    console.error("GET /api/user error:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// PUT update profile / mode
router.put('/', async (req, res) => {
  try {
    const userRef = db.collection('users').doc('default-user');
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.id;

    await userRef.set(updateData, { merge: true });
    const doc = await userRef.get();
    const user = { _id: 'default-user', id: 'default-user', ...doc.data() };
    res.json({ user });
  } catch (error) {
    console.error("PUT /api/user error:", error);
    res.status(500).json({ error: "Failed to update user profile" });
  }
});

export default router;
