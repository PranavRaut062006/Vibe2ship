import express from 'express';
import { db } from '../lib/firebaseAdmin.js';
import { chatWithAI } from '../services/gemini.js';

const router = express.Router();

// GET chat history
router.get('/history', async (req, res) => {
  try {
    const snapshot = await db.collection('chatMessages').get();
    const messages = snapshot.docs.map(doc => ({
      _id: doc.id,
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    
    res.json({ messages });
  } catch (error) {
    console.error("GET /api/chat/history error:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// POST send message
router.post('/', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Message content is required" });

    // Save user message
    const userMsgData = {
      role: 'user',
      content,
      createdAt: new Date().toISOString()
    };
    const userDocRef = await db.collection('chatMessages').add(userMsgData);
    const userMsg = { _id: userDocRef.id, id: userDocRef.id, ...userMsgData };

    // Fetch conversation history (last 10 messages sorted chronologically)
    const allMsgSnap = await db.collection('chatMessages').get();
    const history = allMsgSnap.docs.map(doc => ({
      _id: doc.id,
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)).slice(-10);

    // Fetch user context
    const tasksSnap = await db.collection('tasks').where('status', '==', 'approved').get();
    const tasks = tasksSnap.docs.map(d => ({ _id: d.id, id: d.id, ...d.data() }));

    const todayDate = new Date().toISOString().split('T')[0];
    const schedDoc = await db.collection('schedules').doc(todayDate).get();
    const todaySchedule = schedDoc.exists ? schedDoc.data() : null;

    const userDoc = await db.collection('users').doc('default-user').get();
    const user = userDoc.exists ? { _id: 'default-user', id: 'default-user', ...userDoc.data() } : null;

    const memSnap = await db.collection('userMemory').get();
    const memories = memSnap.docs.map(d => ({ _id: d.id, id: d.id, ...d.data() }));

    const userContext = {
      tasks,
      todaySchedule: todaySchedule ? todaySchedule.blocks : [],
      consistencyScore: user?.consistencyScore || 0,
      memories
    };

    // Call Gemini
    const aiResponse = await chatWithAI(history, userContext);

    // If Gemini extracted tasks to create from the conversation, save them to database
    if (aiResponse.createdTasks && Array.isArray(aiResponse.createdTasks) && aiResponse.createdTasks.length > 0) {
      const batch = db.batch();
      for (const t of aiResponse.createdTasks) {
        const newRef = db.collection('tasks').doc();
        batch.set(newRef, {
          userId: 'default-user',
          title: t.title,
          deadline: t.deadline || 'Today',
          priority: t.priority || 'P2',
          estimatedMinutes: t.estimatedMinutes || 45,
          category: t.category || 'Focus',
          status: 'approved',
          source: 'manual',
          aiConfidence: 95,
          createdAt: new Date().toISOString()
        });
      }
      await batch.commit();
      console.log(`🤖 Gemini autonomously created ${aiResponse.createdTasks.length} task(s) from chat!`);
    }

    // Save AI assistant reply
    const assistantMsgData = {
      role: 'assistant',
      content: aiResponse.content || "I have processed your request.",
      embedType: aiResponse.embedType || null,
      actions: aiResponse.actions || [],
      createdAt: new Date().toISOString()
    };
    const asstDocRef = await db.collection('chatMessages').add(assistantMsgData);
    const assistantMsg = { _id: asstDocRef.id, id: asstDocRef.id, ...assistantMsgData };

    res.json({
      userMessage: userMsg,
      assistantMessage: assistantMsg
    });
  } catch (error) {
    console.error("POST /api/chat error:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

export default router;
