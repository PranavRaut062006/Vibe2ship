import { GoogleGenAI } from '@google/genai';
import { Prompts } from './prompts.js';

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

// Robust JSON cleaner and parser with automatic retry if formatting is malformed
async function generateValidatedJSON(ai, prompt, modelName = 'gemini-2.5-flash', contents = null, retries = 1) {
  const payloadContents = contents || prompt;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: payloadContents,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text || '';
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (err) {
      console.warn(`[Gemini JSON Parse Attempt ${attempt + 1}/${retries + 1} Failed]:`, err.message);
      if (attempt === retries) {
        throw new Error("Invalid JSON returned from AI model after regeneration attempt.");
      }
    }
  }
}

export async function extractTasksFromEmail(emailText) {
  try {
    if (!emailText || !emailText.trim()) return [];
    const ai = getAI();
    const prompt = Prompts.gmailExtraction(emailText);
    const parsed = await generateValidatedJSON(ai, prompt);
    return Array.isArray(parsed) ? parsed : (parsed.tasks || []);
  } catch (error) {
    throw formatGeminiError(error);
  }
}

export async function generateSchedule(tasks, userMemory, date) {
  try {
    if (!tasks || tasks.length === 0) return [];
    const ai = getAI();
    const prompt = Prompts.scheduling(tasks, userMemory, date);
    const parsed = await generateValidatedJSON(ai, prompt);
    return Array.isArray(parsed) ? parsed : (parsed.blocks || []);
  } catch (error) {
    throw formatGeminiError(error);
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
Return ONLY valid JSON object matching this schema:
{
  "explanation": "Executive explanation of how AI rearranged the schedule",
  "blocks": [ updated array of schedule block objects with startTime, endTime, type, title, taskId ]
}`;

    return await generateValidatedJSON(ai, prompt);
  } catch (error) {
    throw formatGeminiError(error);
  }
}

export async function chatWithAI(messages, userContext) {
  try {
    const ai = getAI();
    const lastUserMsg = messages.length > 0 ? messages[messages.length - 1].content : "";
    const prompt = Prompts.planner(lastUserMsg, userContext);
    
    const parsed = await generateValidatedJSON(ai, prompt);
    return {
      content: parsed.content || "I have analyzed your request based on your executive profile.",
      proposedTasks: Array.isArray(parsed.proposedTasks) ? parsed.proposedTasks : [],
      proposedScheduleBlocks: Array.isArray(parsed.proposedScheduleBlocks) ? parsed.proposedScheduleBlocks : []
    };
  } catch (error) {
    const formatted = formatGeminiError(error);
    return {
      content: `⚠️ **AI Processing Error**: ${formatted.error}`,
      proposedTasks: [],
      proposedScheduleBlocks: []
    };
  }
}

export async function extractTimetableFromImage(imageBase64, mimeType = 'image/png') {
  try {
    const ai = getAI();
    const promptText = Prompts.timetableExtraction();
    
    const contents = [
      {
        role: 'user',
        parts: [
          { text: promptText },
          {
            inlineData: {
              data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
              mimeType
            }
          }
        ]
      }
    ];

    const parsed = await generateValidatedJSON(ai, null, 'gemini-2.5-flash', contents);
    return parsed;
  } catch (error) {
    throw formatGeminiError(error);
  }
}

export async function breakdownGoal(goalTitle, goalCategory, targetDate) {
  try {
    const ai = getAI();
    const prompt = Prompts.goalBreakdown(goalTitle, goalCategory, targetDate);
    return await generateValidatedJSON(ai, prompt);
  } catch (error) {
    throw formatGeminiError(error);
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

    return await generateValidatedJSON(ai, prompt);
  } catch (error) {
    throw formatGeminiError(error);
  }
}
