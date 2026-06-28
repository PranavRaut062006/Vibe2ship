import express from 'express';
import { db } from '../lib/firebaseAdmin.js';
import { extractTasksFromEmail } from '../services/gemini.js';

const router = express.Router();

// POST scan email text (Does NOT write to Firebase; returns proposals for preview & selection)
router.post('/scan', async (req, res) => {
  try {
    const { emailText } = req.body;
    if (!emailText || !emailText.trim()) {
      return res.json({ extractedTasks: [], message: "No email content provided." });
    }

    // Call Gemini with standardized JSON schema
    const extractedArray = await extractTasksFromEmail(emailText);
    if (!extractedArray || extractedArray.length === 0) {
      return res.json({ extractedTasks: [], message: "No actionable tasks detected in email." });
    }

    // Fetch existing tasks from Firestore to prevent duplicates
    const tasksSnap = await db.collection('tasks').get();
    const existingTitles = new Set(tasksSnap.docs.map(d => (d.data().title || '').toLowerCase().trim()));

    // Filter duplicates and attach AI reasoning
    const nonDuplicates = extractedArray.filter(item => {
      const titleClean = (item.title || '').toLowerCase().trim();
      return titleClean && !existingTitles.has(titleClean);
    }).map((item, idx) => ({
      tempId: `temp_${Date.now()}_${idx}`,
      title: item.title || "Extracted Task",
      description: item.description || item.reasoning || "Extracted from communication",
      deadline: item.deadline || "Tomorrow",
      priority: item.priority || "P2",
      estimatedMinutes: Number(item.estimatedMinutes) || 45,
      category: item.category || "Work",
      reasoning: item.reasoning || `AI extracted with ${item.aiConfidence || 95}% confidence based on action verbs and deadlines.`,
      aiConfidence: item.aiConfidence || 95,
      source: "gmail",
      sourceEmail: emailText.substring(0, 100) + '...'
    }));

    res.json({ extractedTasks: nonDuplicates });
  } catch (error) {
    console.error("POST /api/inbox/scan error:", error);
    res.status(error.code === 'QUOTA_EXCEEDED' ? 429 : 500).json({ error: error.error || "Failed to scan email text", code: error.code || "SCAN_FAILED" });
  }
});

// POST save approved tasks (ONLY called after user selection & approval)
router.post('/save-approved', async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: "No tasks provided for saving." });
    }

    const batch = db.batch();
    const createdTasks = [];

    for (const t of tasks) {
      const docRef = db.collection('tasks').doc();
      const taskData = {
        userId: 'default-user',
        title: t.title || "Approved Email Task",
        description: t.description || t.reasoning || "",
        deadline: t.deadline || new Date().toISOString().split('T')[0],
        scheduledDate: t.deadline || new Date().toISOString().split('T')[0],
        scheduledTime: '09:00',
        priority: t.priority || "P2",
        estimatedMinutes: Number(t.estimatedMinutes) || 45,
        category: t.category || "Work",
        status: "pending",
        source: "gmail",
        aiReasoning: t.reasoning || "",
        aiConfidence: t.aiConfidence || 95,
        createdAt: new Date().toISOString()
      };
      batch.set(docRef, taskData);
      createdTasks.push({ _id: docRef.id, id: docRef.id, ...taskData });
    }

    await batch.commit();
    res.json({ success: true, createdTasks, count: createdTasks.length });
  } catch (error) {
    console.error("POST /api/inbox/save-approved error:", error);
    res.status(500).json({ error: "Failed to save approved tasks to Firebase" });
  }
});

export default router;
