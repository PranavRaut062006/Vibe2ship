# 🧠 LifeSaver AI — Gemini API Integration & Hackathon Setup Guide

Welcome to **LifeSaver AI**, your AI Executive Productivity Companion built with **Next.js 16**, **React 19**, **CSS Modules**, and **Express.js**.

---

## 🚀 Quick Start (Running Locally)

To run both the Frontend Command Center and Backend Server simultaneously:

### 1. Start the Backend Express API Server
Open a terminal and run:
```bash
npm start
```
*Runs on `http://localhost:5000`*

### 2. Start the Next.js Frontend Command Center
Open a second terminal and run:
```bash
npm run dev
```
*Runs on `http://localhost:3000`*

---

## 🔑 Connecting Your Google Gemini API Key

LifeSaver AI is designed to integrate seamlessly with the **Google Gemini API** (`@google/genai` SDK) for autonomous scheduling, task extraction, and multimodal vision analysis.

### Step 1: Get an API Key
Get your free API key from [Google AI Studio](https://aistudio.google.com/).

### Step 2: Set Environment Variables
Create a `.env.local` file in the root directory of your project:
```env
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyYourActualAPIKeyHere
GEMINI_API_KEY=AIzaSyYourActualAPIKeyHere
PORT=5000
```

---

## 💡 How Gemini Powers Each Module

### 1. Autonomous Task Extraction (AI Inbox)
* **Model:** `gemini-2.5-flash`
* **Prompt Schema:** When scanning simulated Gmail threads or uploaded PDFs in `/inbox`, send the raw text to Gemini requesting a JSON array of structured tasks:
```javascript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function extractTasksFromEmail(emailText) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Analyze this email and extract task deliverables. Return ONLY valid JSON:
    [{ "title": "string", "priority": "P1|P2|P3", "estimatedMinutes": number }]
    Email: ${emailText}`
  });
  return JSON.parse(response.text);
}
```

### 2. Timetable & Syllabus Multimodal Vision Scan (Onboarding & Chat)
* **Model:** `gemini-2.5-flash`
* **Multimodal Capability:** When users upload course timetable photos (`PNG`/`PDF`) in `/onboarding` or `/aichat`, convert the file to base64 and pass it to Gemini Vision to extract recurring slots:
```javascript
async function scanTimetableImage(base64ImageBuffer, mimeType) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        inlineData: {
          data: base64ImageBuffer,
          mimeType: mimeType
        }
      },
      "Extract all course titles, days of week, and time slots from this timetable image as JSON."
    ]
  });
  return response.text;
}
```

### 3. Smart Schedule Replanning Engine
* **Model:** `gemini-2.5-pro` (or `gemini-2.5-flash`)
* **Reasoning:** When the user delays a task or selects an **Adaptive Mode** (`Study First`, `Career Mode`, `Health First`), feed the pending queue into Gemini to generate an optimized timeline avoiding burnout bottlenecks.

---

## 🌟 Hackathon Presentation Tips
1. **Showcase the Dashboard (`/`):** Point out the **Morning AI Brief**, **Consistency Ring**, and **Burnout Wellness Intervention Card**.
2. **Demonstrate Autonomous Inbox (`/inbox`):** Click **"Simulate AI Scan"** to watch the laser animation extract structured tasks from noise.
3. **Show Smart Schedule (`/schedule`):** Click **"Replan Schedule"** to show how LifeSaver AI dynamically reorganizes the afternoon when delays happen.
4. **Interactive AI Chat (`/aichat`):** Demonstrate rich embedded UI action buttons directly inside AI chat responses.
5. **Progress Report (`/progress`):** Highlight the **87/100 Consistency Ring**, **Behavioral Archetype ("Deadline Sprinter")**, and **AI Memory Manager**.
