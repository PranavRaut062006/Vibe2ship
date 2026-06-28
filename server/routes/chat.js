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

    // Fetch user context from Firestore
    const tasksSnap = await db.collection('tasks').get();
    const tasks = tasksSnap.docs.map(d => ({ _id: d.id, id: d.id, ...d.data() }));

    const todayDate = new Date().toISOString().split('T')[0];
    const schedDoc = await db.collection('schedules').doc(todayDate).get();
    const todaySchedule = schedDoc.exists ? schedDoc.data() : null;

    const goalsSnap = await db.collection('goals').get();
    const goals = goalsSnap.docs.map(d => ({ _id: d.id, id: d.id, ...d.data() }));

    const habitsSnap = await db.collection('habits').get();
    const habits = habitsSnap.docs.map(d => ({ _id: d.id, id: d.id, ...d.data() }));

    const userDoc = await db.collection('users').doc('default-user').get();
    const user = userDoc.exists ? { _id: 'default-user', id: 'default-user', ...userDoc.data() } : null;

    const memSnap = await db.collection('userMemory').get();
    const memories = memSnap.docs.map(d => ({ _id: d.id, id: d.id, ...d.data() }));

    const userContext = {
      tasks,
      todaySchedule: todaySchedule ? todaySchedule.blocks : [],
      goals,
      habits,
      consistencyScore: user?.consistencyScore || 0,
      productivityMode: user?.productivityMode || 'Balanced',
      memories
    };

    // Call Gemini (STRICT AI PROCESSING PIPELINE: proposals are generated but NOT saved directly)
    const aiResponse = await chatWithAI(history, userContext);

    // Save AI assistant reply with proposed actions for user approval
    const assistantMsgData = {
      role: 'assistant',
      content: aiResponse.content || "I have analyzed your request.",
      proposedTasks: aiResponse.proposedTasks || [],
      proposedScheduleBlocks: aiResponse.proposedScheduleBlocks || [],
      approved: false,
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
    res.status(error.code === 'QUOTA_EXCEEDED' ? 429 : 500).json({ error: error.error || error.message || "Failed to process chat message", code: error.code || "CHAT_FAILED" });
  }
});

// POST approve AI proposed actions (HUMAN-IN-THE-LOOP APPROVAL STEP)
router.post('/approve/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const docRef = db.collection('chatMessages').doc(messageId);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Message not found" });

    const msgData = doc.data();
    if (msgData.approved) {
      return res.status(400).json({ error: "These proposals have already been approved and saved." });
    }

    const batch = db.batch();
    let createdTaskCount = 0;
    let updatedSchedule = false;

    // Save approved tasks
    if (msgData.proposedTasks && msgData.proposedTasks.length > 0) {
      for (const t of msgData.proposedTasks) {
        const newRef = db.collection('tasks').doc();
        batch.set(newRef, {
          userId: 'default-user',
          title: t.title || 'AI Task',
          description: t.description || t.reasoning || '',
          category: t.category || 'Focus',
          priority: t.priority || 'P2',
          deadline: t.deadline || new Date().toISOString().split('T')[0],
          scheduledDate: t.deadline || new Date().toISOString().split('T')[0],
          scheduledTime: t.scheduledTime || '09:00',
          estimatedMinutes: Number(t.estimatedMinutes) || 60,
          recurring: t.recurring || 'none',
          customInterval: Number(t.customInterval) || 1,
          status: 'pending',
          source: 'ai_assistant',
          createdAt: new Date().toISOString()
        });
        createdTaskCount++;
      }
    }

    // Save approved schedule blocks
    if (msgData.proposedScheduleBlocks && msgData.proposedScheduleBlocks.length > 0) {
      const todayDate = new Date().toISOString().split('T')[0];
      const schedRef = db.collection('schedules').doc(todayDate);
      batch.set(schedRef, {
        date: todayDate,
        blocks: msgData.proposedScheduleBlocks
      }, { merge: true });
      updatedSchedule = true;
    }

    // Mark message as approved
    batch.update(docRef, { approved: true });

    await batch.commit();

    res.json({
      success: true,
      createdTaskCount,
      updatedSchedule,
      message: "Proposals approved and saved to Firebase."
    });
  } catch (error) {
    console.error("POST /api/chat/approve error:", error);
    res.status(500).json({ error: "Failed to approve proposals" });
  }
});

export default router;
