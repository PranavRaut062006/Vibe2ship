import { GoogleGenAI } from '@google/genai';

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'dummy-key' || apiKey === 'AIzaSyYourActualAPIKeyHere') {
    const err = new Error("GEMINI_API_KEY is missing or invalid in environment configuration.");
    err.code = "KEY_INVALID";
    throw err;
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to format Gemini API errors
const formatGeminiError = (error) => {
  console.error("Gemini API Error:", error);
  const msg = error?.message || String(error);
  if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('exhausted')) {
    return { error: "Google Gemini API quota exceeded (429). Please try again later or verify billing.", code: "QUOTA_EXCEEDED" };
  }
  if (msg.includes('400') || msg.includes('403') || msg.toLowerCase().includes('key') || error?.code === "KEY_INVALID") {
    return { error: "Invalid Google Gemini API Key. Please verify your key in .env.local or Settings.", code: "KEY_INVALID" };
  }
  return { error: `Gemini processing failed: ${msg}`, code: "GENERAL_ERROR" };
};

// Helper to strip markdown code fences from LLM JSON responses
const cleanAndParseJSON = (text) => {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse Gemini JSON output:", text);
    throw new Error("Invalid JSON returned from AI model.");
  }
};

export async function extractTasksFromEmail(emailText) {
  try {
    if (!emailText || !emailText.trim()) return [];
    const ai = getAI();
    const prompt = `You are LifePilot AI executive assistant. Analyze the following email/text and extract all actionable tasks, project deliverables, or calendar deadlines.
Return ONLY valid JSON array with objects matching this exact schema:
[
  {
    "title": "Clear action-oriented task name",
    "deadline": "e.g. Tomorrow, Friday, 5:00 PM, or Today",
    "priority": "P1" or "P2" or "P3" (P1 is urgent/critical),
    "estimatedMinutes": number (estimated duration in minutes, default 45),
    "category": "Focus" or "Meetings" or "Academic" or "Personal",
    "aiConfidence": number between 85 and 99
  }
]

Email Text:
${emailText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return cleanAndParseJSON(response.text);
  } catch (error) {
    const formatted = formatGeminiError(error);
    throw formatted;
  }
}

export async function generateSchedule(tasks, userMemory, date) {
  try {
    if (!tasks || tasks.length === 0) return [];
    const ai = getAI();
    const prompt = `You are LifePilot AI executive scheduler. Create an optimized day schedule for date: ${date}.
Here are the user's pending tasks: ${JSON.stringify(tasks)}
Here are the user's learned preferences and peak hours: ${JSON.stringify(userMemory)}

Organize blocks between 09:00 and 18:00. Place P1 high priority focus tasks during peak biological hours (e.g. 9 AM - 11 AM if specified). Include short 15-min breaks or buffers between intense blocks.
Return ONLY valid JSON array representing the schedule blocks matching this exact schema:
[
  {
    "taskId": "ID of matching task or null if buffer/break",
    "startTime": "HH:MM (24-hour format, e.g. 09:00)",
    "endTime": "HH:MM (e.g. 10:30)",
    "type": "focus" or "meeting" or "assignment" or "buffer" or "break",
    "title": "Task title or Buffer / Break label"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return cleanAndParseJSON(response.text);
  } catch (error) {
    const formatted = formatGeminiError(error);
    throw formatted;
  }
}

export async function replanSchedule(currentSchedule, delayedTask, reason) {
  try {
    if (!currentSchedule || currentSchedule.length === 0) {
      return { explanation: "No active schedule blocks available to replan.", blocks: [] };
    }
    const ai = getAI();
    const prompt = `You are LifePilot AI autonomous replanning engine. An unexpected delay occurred!
Current Schedule: ${JSON.stringify(currentSchedule)}
Delayed Task / Change: ${JSON.stringify(delayedTask)}
Reason for delay: ${reason}

Dynamically shift downstream blocks to protect high priority items while avoiding burnout bottlenecks.
Return ONLY valid JSON object with this schema:
{
  "explanation": "Executive explanation of how AI rearranged the schedule",
  "blocks": [ updated array of schedule block objects with startTime, endTime, type, title, taskId ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return cleanAndParseJSON(response.text);
  } catch (error) {
    const formatted = formatGeminiError(error);
    throw formatted;
  }
}

export async function chatWithAI(messages, userContext) {
  try {
    const ai = getAI();
    const conversationHistory = messages.map(m => `${m.role === 'user' ? 'User' : 'LifePilot AI'}: ${m.content}`).join('\n');
    const prompt = `You are LifePilot AI, an intelligent executive productivity companion.
User Context:
- Pending Tasks: ${JSON.stringify(userContext?.tasks || [])}
- Today Schedule: ${JSON.stringify(userContext?.todaySchedule || [])}
- Consistency Score: ${userContext?.consistencyScore || 0}/100
- Learned Memories: ${JSON.stringify(userContext?.memories || [])}

Conversation History:
${conversationHistory}

Respond to the user's latest message as an insightful, Bloomberg-terminal style executive advisor. Be concise, direct, supportive, and highly actionable.
If the user asks to create, add, schedule, or remember a task (e.g. "Add buy groceries to my task list", "Remind me to finish assignment by Friday 3pm", "I need to prepare slides for tomorrow"), extract those tasks and return them in the "createdTasks" array so they get added to their live database.
Return ONLY valid JSON object with this schema:
{
  "content": "Your markdown formatted executive advice response (confirming any added tasks)",
  "embedType": null or "progress_breakdown" or "warning" or "question",
  "actions": [ { "label": "Action button text", "primary": boolean } ],
  "createdTasks": [ { "title": "Task title", "deadline": "Deadline string e.g. Today or Friday 5pm", "priority": "P1" or "P2" or "P3", "estimatedMinutes": 45, "category": "Focus" or "Meetings" or "Personal" } ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return cleanAndParseJSON(response.text);
  } catch (error) {
    const formatted = formatGeminiError(error);
    return {
      content: `⚠️ **AI Processing Error**: ${formatted.error}`,
      embedType: "warning",
      actions: []
    };
  }
}

export async function analyzeBehavior(taskHistory) {
  try {
    if (!taskHistory || taskHistory.length === 0) {
      return {
        peakHours: "Not determined yet",
        mostPostponed: "None",
        avgDelay: "0 mins",
        behaviorType: "New User",
        memories: []
      };
    }
    const ai = getAI();
    const prompt = `Analyze this user's task completion and productivity history: ${JSON.stringify(taskHistory)}
Determine their biological peak focus hours, items they postpone most often, average task start delay, behavioral archetype, and actionable learned memories.
Return ONLY valid JSON matching this schema:
{
  "peakHours": "e.g. 9 AM – 11 AM",
  "mostPostponed": "e.g. DSA Practice or Admin work",
  "avgDelay": "e.g. 34 minutes",
  "behaviorType": "e.g. Deadline Sprinter or Deep Focus Strategist",
  "memories": [ { "key": "Peak Window", "value": "9 AM - 11 AM" } ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return cleanAndParseJSON(response.text);
  } catch (error) {
    const formatted = formatGeminiError(error);
    throw formatted;
  }
}
