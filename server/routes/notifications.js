import express from 'express';
import { db } from '../lib/firebaseAdmin.js';

const router = express.Router();

// GET centralized notifications
router.get('/', async (req, res) => {
  try {
    // Fetch persistent notifications
    const snap = await db.collection('notifications').get();
    const stored = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Generate real-time dynamic alerts from live Firebase state
    const dynamicAlerts = [];

    // 1. Pending Approvals check (chat proposals)
    const chatSnap = await db.collection('chatMessages').where('approved', '==', false).get();
    const unapprovedChats = chatSnap.docs.filter(d => {
      const data = d.data();
      return (data.proposedTasks?.length > 0 || data.proposedScheduleBlocks?.length > 0);
    });
    if (unapprovedChats.length > 0) {
      dynamicAlerts.push({
        id: 'alert_pending_approvals',
        type: 'Pending Approval',
        title: 'AI Proposals Require Review',
        message: `You have ${unapprovedChats.length} unapproved AI scheduling proposal(s) in the Intelligence Hub.`,
        priority: 'high',
        actionUrl: '/aichat',
        createdAt: new Date().toISOString()
      });
    }

    // 2. Deadline Alerts check
    const todayStr = new Date().toISOString().split('T')[0];
    const tasksSnap = await db.collection('tasks').get();
    const tasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    const dueToday = tasks.filter(t => (t.status === 'pending' || t.status === 'approved') && (t.deadline === todayStr || t.scheduledDate === todayStr));
    if (dueToday.length > 0) {
      dynamicAlerts.push({
        id: 'alert_due_today',
        type: 'Deadline Alert',
        title: 'Action Items Due Today',
        message: `You have ${dueToday.length} task(s) scheduled for completion today including "${dueToday[0].title}".`,
        priority: 'medium',
        actionUrl: '/planner',
        createdAt: new Date().toISOString()
      });
    }

    const delayed = tasks.filter(t => (t.status === 'pending' || t.status === 'approved') && ((t.deadline && t.deadline < todayStr) || (t.scheduledDate && t.scheduledDate < todayStr)));
    if (delayed.length > 0) {
      dynamicAlerts.push({
        id: 'alert_delayed',
        type: 'Recovery Suggestion',
        title: 'Overdue Tasks Detected',
        message: `${delayed.length} task(s) are past their deadline. Trigger Dynamic Replanning or choose a Recovery Plan.`,
        priority: 'high',
        actionUrl: '/schedule',
        createdAt: new Date().toISOString()
      });
    }

    // 3. Burnout Warning check (check today's schedule blocks)
    const schedDoc = await db.collection('schedules').doc(todayStr).get();
    if (schedDoc.exists) {
      const blocks = schedDoc.data().blocks || [];
      const focusBlocks = blocks.filter(b => b.type === 'focus' || b.type === 'assignment');
      if (focusBlocks.length >= 4) {
        dynamicAlerts.push({
          id: 'alert_burnout',
          type: 'Burnout Warning',
          title: 'High Cognitive Load Detected',
          message: `Your schedule today has ${focusBlocks.length} intense focus blocks. LifePilot AI recommends taking a 20-minute cognitive break.`,
          priority: 'high',
          actionUrl: '/schedule',
          createdAt: new Date().toISOString()
        });
      }
    }

    // Combine stored and dynamic alerts, sort by createdAt desc
    const combined = [...dynamicAlerts, ...stored];
    const sorted = combined.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json({ notifications: sorted, unreadCount: sorted.length });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notification center alerts" });
  }
});

// POST mark notification resolved/read
router.post('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.startsWith('alert_')) {
      await db.collection('notifications').doc(id).delete();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to resolve notification" });
  }
});

export default router;
