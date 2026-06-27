import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'LifeSaver AI Backend', timestamp: new Date() });
});

// Mock Tasks Endpoint
app.get('/api/tasks', (req, res) => {
  res.json({
    tasks: [
      { id: 1, name: 'Finalize API Integration', priority: 'Urgent', due: '3:00 PM', done: false },
      { id: 2, name: 'Review PR #42 — Auth Module', priority: 'High', due: '5:00 PM', done: false }
    ]
  });
});

// Mock AI Replan Endpoint
app.post('/api/ai/replan', (req, res) => {
  const { tasks } = req.body;
  res.json({
    message: 'AI successfully optimized the schedule.',
    updatedPlan: tasks || []
  });
});

app.listen(PORT, () => {
  console.log(`🚀 LifeSaver AI Backend running on http://localhost:${PORT}`);
});
