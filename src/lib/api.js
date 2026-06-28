const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
};

async function request(endpoint, options = {}) {
  const url = `${getBaseUrl()}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
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

// Inbox
export const scanInboxEmail = (emailText) => request('/api/inbox/scan', { method: 'POST', body: JSON.stringify({ emailText }) });
export const approveInboxTask = (taskId) => request(`/api/inbox/approve/${taskId}`, { method: 'POST' });

// Chat
export const fetchChatHistory = () => request('/api/chat/history');
export const sendChatMessage = (content) => request('/api/chat', { method: 'POST', body: JSON.stringify({ content }) });

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

