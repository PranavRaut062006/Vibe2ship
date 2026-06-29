const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
};

async function request(endpoint, options = {}) {
  const url = `${getBaseUrl()}${endpoint}`;
  const userId = typeof window !== 'undefined' ? (localStorage.getItem('lifepilot_uid') || 'default-user') : 'default-user';
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

// Tasks
export const fetchTasks = () => request('/api/tasks');
export const createTask = (data) => request('/api/tasks', { method: 'POST', body: JSON.stringify(data) });
export const updateTask = (id, data) => request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTask = (id) => request(`/api/tasks/${id}`, { method: 'DELETE' });

// Schedule
export const fetchSchedule = (date = 'today') => request(`/api/schedule/${date}`);
export const generateSchedule = (date = 'today') => request('/api/schedule/generate', { method: 'POST', body: JSON.stringify({ date }) });
export const replanSchedule = (delayedTask, reason) => request('/api/schedule/replan', { method: 'PUT', body: JSON.stringify({ delayedTask, reason }) });
export const updateScheduleBlocks = (date = 'today', blocks) => request(`/api/schedule/${date}/blocks`, { method: 'PUT', body: JSON.stringify({ blocks }) });

export const extractTimetableImage = (imageBase64, mimeType) => request('/api/schedule/extract-image', { method: 'POST', body: JSON.stringify({ imageBase64, mimeType }) });

// Chat
export const fetchChatHistory = () => request('/api/chat/history');
export const sendChatMessage = (content) => request('/api/chat', { method: 'POST', body: JSON.stringify({ content }) });
export const approveChatProposals = (messageId) => request(`/api/chat/approve/${messageId}`, { method: 'POST' });

// User & Memory
export const fetchUser = () => request('/api/user');
export const updateUser = (data) => request('/api/user', { method: 'PUT', body: JSON.stringify(data) });
export const fetchMemories = () => request('/api/memory');
export const updateMemory = (key, value) => request(`/api/memory/${encodeURIComponent(key)}`, { method: 'PUT', body: JSON.stringify({ value }) });
export const deleteMemory = (key) => request(`/api/memory/${encodeURIComponent(key)}`, { method: 'DELETE' });

// Goals
export const fetchGoals = () => request('/api/goals');
export const createGoal = (data) => request('/api/goals', { method: 'POST', body: JSON.stringify(data) });
export const updateGoal = (id, data) => request(`/api/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteGoal = (id) => request(`/api/goals/${id}`, { method: 'DELETE' });

// Habits
export const fetchHabits = () => request('/api/habits');
export const createHabit = (data) => request('/api/habits', { method: 'POST', body: JSON.stringify(data) });
export const updateHabit = (id, data) => request(`/api/habits/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteHabit = (id) => request(`/api/habits/${id}`, { method: 'DELETE' });

// Insights & Consistency
export const fetchInsights = () => request('/api/insights');

// Notifications
export const fetchNotifications = () => request('/api/notifications');
export const resolveNotification = (id) => request(`/api/notifications/${id}/resolve`, { method: 'POST' });

// Phase 4 Schedule AI Intelligence (Burnout, Dynamic Replan, Recovery)
export const checkScheduleBurnout = (date = 'today') => request(`/api/schedule/${date}/burnout`);
export const triggerDynamicReplan = (date = 'today', reason) => request(`/api/schedule/${date}/replan-dynamic`, { method: 'POST', body: JSON.stringify({ reason }) });
export const generateRecoveryPlans = () => request('/api/schedule/recovery-plans', { method: 'POST' });

