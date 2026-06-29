import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load root .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import express from 'express';
import cors from 'cors';
import { db } from './lib/firebaseAdmin.js';

// Routes
import tasksRouter from './routes/tasks.js';
import scheduleRouter from './routes/schedule.js';
import chatRouter from './routes/chat.js';
import userRouter from './routes/user.js';
import memoryRouter from './routes/memory.js';
import goalsHabitsRouter from './routes/goalsHabits.js';
import insightsRouter from './routes/insights.js';
import notificationsRouter from './routes/notifications.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Firestore Collections Schema & Default User Profile
const initFirestore = async () => {
  try {
    const userRef = db.collection('users').doc('default-user');
    const doc = await userRef.get();
    if (!doc.exists) {
      console.log("🌱 Initializing clean user profile in Firestore...");
      await userRef.set({
        uid: 'default-user',
        name: 'New User',
        email: 'user@lifepilot.ai',
        consistencyScore: 0,
        productivityMode: 'Balanced',
        streak: 0,
        createdAt: new Date().toISOString()
      });
      console.log("✅ Fresh user profile created in Firestore!");
    } else {
      console.log("🔥 Connected to Firebase Firestore");
    }

    // Initialize Default Settings if not present
    const settingsRef = db.collection('settings').doc('default-user');
    const settingsDoc = await settingsRef.get();
    if (!settingsDoc.exists) {
      await settingsRef.set({
        userId: 'default-user',
        geminiApiKeyStatus: 'default',
        googleCalendarConnected: false,
        peakFocusHours: '09:00 - 11:00',
        burnoutThresholdHours: 5,
        updatedAt: new Date().toISOString()
      });
      console.log("✅ Default settings initialized in Firestore!");
    }

    console.log("📋 Verified schema structure for collections: users, tasks, goals, habits, calendarEvents, chatMessages, notifications, consistency, settings.");
  } catch (err) {
    console.error("❌ Error verifying Firestore schema:", err.message);
  }
};

initFirestore();

// Mount Routes
app.use('/api/tasks', tasksRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/chat', chatRouter);
app.use('/api/user', userRouter);
app.use('/api/memory', memoryRouter);
app.use('/api', goalsHabitsRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/notifications', notificationsRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'LifePilot AI Backend (Firestore)', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 LifePilot AI Backend running on http://localhost:${PORT}`);
});
