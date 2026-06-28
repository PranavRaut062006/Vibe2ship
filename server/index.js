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
import inboxRouter from './routes/inbox.js';
import chatRouter from './routes/chat.js';
import userRouter from './routes/user.js';
import memoryRouter from './routes/memory.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Firestore Default User
const initFirestore = async () => {
  try {
    const userRef = db.collection('users').doc('default-user');
    const doc = await userRef.get();
    if (!doc.exists) {
      console.log("🌱 Initializing clean user profile in Firestore...");
      await userRef.set({
        name: 'New User',
        email: 'user@focusflow.ai',
        consistencyScore: 0,
        productivityMode: 'Focus',
        streak: 0,
        createdAt: new Date().toISOString()
      });
      console.log("✅ Fresh user profile created in Firestore!");
    } else {
      console.log("🔥 Connected to Firebase Firestore");
    }
  } catch (err) {
    console.error("❌ Error verifying Firestore default user:", err.message);
  }
};

initFirestore();

// Mount Routes
app.use('/api/tasks', tasksRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/inbox', inboxRouter);
app.use('/api/chat', chatRouter);
app.use('/api/user', userRouter);
app.use('/api/memory', memoryRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FocusFlow AI Backend (Firestore)', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 FocusFlow AI Backend running on http://localhost:${PORT}`);
});
