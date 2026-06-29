<div align="center">
  <img src="https://via.placeholder.com/120x120/6C63FF/ffffff?text=LP" alt="LifePilot AI Logo" width="100" height="100" style="border-radius: 24px;" />
  
  # LifePilot AI
  ### Executive Productivity & Autonomous Task Companion

  <p align="center">
    An intelligent, full-stack productivity ecosystem that bridges natural AI conversation, dynamic scheduling, and real-time habit tracking.
  </p>

  [![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%7C%20Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
  [![Gemini API](https://img.shields.io/badge/Google%20Gemini-Pro%20API-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
  [![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Platform-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://cloud.google.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

  ---

  | 🏆 Hackathon Submission | 🎥 Video Demo | 🌐 Live Web App | 📊 Presentation Deck |
  | :---: | :---: | :---: | :---: |
  | **Vibe2Ship Hackathon 2026** | [Watch Demo Video](#) | [Launch Application](#) | [View Slide Deck](#) |

</div>

---

## 📑 Table of Contents
1. [Problem Statement](#-problem-statement)
2. [Our Solution](#-our-solution)
3. [Key Features](#-key-features)
4. [Complete User Journey](#-complete-user-journey)
5. [Complete System Architecture](#-complete-system-architecture)
6. [Workflows & AI Execution](#-workflows--ai-execution)
   - [AI Workflow](#ai-workflow)
   - [Planner Workflow](#planner-workflow)
   - [Voice Workflow](#voice-workflow)
7. [Folder Structure](#-folder-structure)
8. [Installation & Setup Guide](#-installation--setup-guide)
9. [Screenshots & UI Showcase](#-screenshots--ui-showcase)
10. [Performance & Engineering Optimizations](#-performance--engineering-optimizations)
11. [Google Technologies Used (Mandatory)](#-google-technologies-used-mandatory)
12. [Future Scope](#-future-scope)
13. [Credits & Acknowledgements](#-credits--acknowledgements)
14. [Open Source Credits](#-open-source-credits)
15. [Team & License](#-team--license)

---

## 🛑 Problem Statement

Modern knowledge workers and students are overwhelmed by fragmentation. Traditional productivity software forces users into manual, static overhead:

1. **Static Lists Fail Dynamic Lives**: Standard to-do lists do not account for time constraints, cognitive fatigue, or unexpected disruptions. When a meeting runs late, manual replanning takes more mental effort than doing the work itself.
2. **Reminders Without Context**: Dumb push reminders alert users that a task is due without considering whether they have the dedicated deep-focus time allocated in their calendar to accomplish it.
3. **Cognitive Overload & Burnout**: Users juggle disjointed tools—one app for tasks, another for calendar schedules, a spreadsheet for habits, and sticky notes for goals. This context switching destroys executive focus.
4. **Lack of Autonomous Intelligence**: Current assistants act as passive search engines rather than active executive controllers capable of analyzing workload, resolving timeline conflicts, and enforcing accountability.

---

## 💡 Our Solution

**LifePilot AI** transforms personal productivity from passive record-keeping into active, autonomous executive orchestration. Built on top of Google's advanced **Gemini Pro API** and **Firebase Realtime Firestore**, LifePilot AI acts as a dedicated 24/7 Chief Operating Officer for your personal life.

* **🧠 AI Planning & Replanning**: Simply tell the assistant *"I have an unexpected 2-hour meeting, replan my afternoon"* or *"Plan a structured study routine for my exams next week."* LifePilot evaluates existing commitments and constructs an optimized, conflict-free itinerary.
* **📅 Interactive Timeline & Collision-Free Scheduling**: Drag, drop, resize, and modify blocks directly on a visual timeline. Advanced overlap grouping ensures simultaneous commitments organize side-by-side without visual clutter.
* **🎯 Synchronized Goal & Habit Tracking**: Bridge the gap between daily routines and macro-milestones. Track daily momentum streaks that directly feed into your dynamic **Consistency Score**.
* **🎙️ Voice Assistant Integration**: Speak naturally to your assistant using integrated Web Speech Recognition and Speech Synthesis for hands-free planning and task triage.
* **📊 Executive Productivity Coaching**: Receive real-time cognitive feedback, burnout risk detection, and adaptive mode shifting (*Balanced*, *Deep Focus*, or *Sprint*).

---

## ✨ Key Features

```
+-----------------------------------------------------------------------------------+
| 🌟 LIFE PILOT AI CORE CAPABILITIES                                                |
+------------------------------------+----------------------------------------------+
| 🤖 Structured AI Assistant         | Natural chat generating strict JSON plans    |
| 📅 Visual Timeline Calendar        | Drag-and-drop scheduling with cluster width  |
| 📋 Comprehensive Planner           | Manual task CRUD, recurring logic & priority |
| 🎯 Goal & Habit Dashboard          | Streak tracking & visual progress indicators |
| ⚡ Real Consistency Score          | Algorithm weighting tasks, habits & delays   |
| 🔐 Firebase Protected Auth         | Scoped Google Sign-In with strict isolation  |
+------------------------------------+----------------------------------------------+
```

* **Validated JSON AI Responses**: Every Gemini response passes through strict JSON formatting validation, ensuring the frontend UI renders preview cards that users can approve before saving to Firebase.
* **Universal Task Controls**: Every task or block across the entire application features instant **Mark Complete**, **Edit**, and **Delete** actions that synchronize state immediately across all open tabs.
* **Zero Dummy Data**: The application starts with a clean, empty Firestore schema for new users, ensuring 100% authentic data representation.

---

## 🗺️ Complete User Journey

The following flowchart illustrates the complete user lifecycle within the LifePilot AI ecosystem:

```mermaid
graph TD
    User([👤 User]) --> Login[🔐 Google Login / Authentication]
    Login --> Dashboard[📊 Executive Dashboard Overview]
    
    Dashboard --> Planner[📋 Open Planner & Task Queue]
    Dashboard --> AIAssistant[🤖 Open AI Assistant Chat]
    
    AIAssistant --> Prompt["💬 Prompt: 'Plan my week for upcoming deadline'"]
    Prompt --> GeminiGen[⚡ Gemini API Processing & Context Analysis]
    GeminiGen --> JSONVal{🔍 JSON Schema Valid?}
    
    JSONVal -- No --> Regen[♻️ Auto-Request Correction] --> GeminiGen
    JSONVal -- Yes --> PreviewCard[🖥️ Render Structured Preview Plan]
    
    PreviewCard --> Approval{✋ User Approves Plan?}
    Approval -- Modify / Reject --> AIAssistant
    Approval -- Approve --> FirebaseSave[💾 Commit to Firebase Firestore]
    
    Planner --> FirebaseSave
    FirebaseSave --> SyncEvent[🔄 Window Event Dispatch / Realtime Sync]
    
    SyncEvent --> Calendar[📅 Visual Timeline Calendar Updated]
    SyncEvent --> Goals[🎯 Habit & Goal Progress Refreshed]
    
    Calendar --> TaskAction[✅ Execute & Complete Task]
    TaskAction --> ScoreCalc[📈 Recalculate Consistency Score]
    ScoreCalc --> Dashboard
```

---

## 🏗️ Complete System Architecture

### Overall Architecture Diagram
```mermaid
graph TB
    subgraph Client [💻 Frontend Layer - Next.js App Router]
        UI[AppShell / TopBar / Sidebar]
        Pages[Dashboard / Planner / Schedule / Goals / AI Chat]
        EventBus[Window Event Sync Bus]
    end

    subgraph Server [⚙️ Backend Layer - Node.js Express]
        Router[API Routes / Middleware]
        Controllers[Task / Schedule / Chat / Insights Logic]
        Admin[Firebase Admin SDK]
    end

    subgraph Cloud [☁️ Google Cloud & Firebase Ecosystem]
        Firestore[(Firestore NoSQL Database)]
        FirebaseAuth[Firebase Authentication]
        Gemini[Google Gemini Pro API]
    end

    UI --> Pages
    Pages <--> EventBus
    Pages <-->|HTTP REST / JSON| Router
    Pages <-->|OAuth Popup| FirebaseAuth
    Router --> Controllers
    Controllers <--> Admin
    Admin <--> Firestore
    Controllers <-->|Prompt / Context| Gemini
```

### Data Flow & Scope Isolation
```mermaid
flowchart LR
    ClientReq[Frontend Request] --> Headers["Attach Header: x-user-id"]
    Headers --> ExpressRouter[Express Route Handler]
    ExpressRouter --> Query["Firestore Query: .where('userId', '==', x-user-id)"]
    Query --> FirestoreDb[(Isolated User Documents)]
    FirestoreDb --> Response[Return User-Scoped JSON]
```

---

## ⚙️ Workflows & AI Execution

### AI Workflow
```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant F as Frontend UI
    participant B as Express Backend
    participant G as Google Gemini API
    participant DB as Firebase Firestore

    U->>F: Enter Natural Language Prompt
    F->>B: POST /api/chat { prompt, userId, context }
    B->>DB: Fetch Active Tasks & Schedule Context
    DB-->>B: Return User Context
    B->>G: Generate Content (System Prompt + JSON Enforcement)
    G-->>B: Return Structured JSON String
    B->>B: Validate Schema & Parse JSON
    B-->>F: Return Formatted AI Response & Preview Plan
    F->>U: Render Actionable Preview Card
    U->>F: Click "Approve & Apply Plan"
    F->>B: POST /api/chat/approve { planData }
    B->>DB: Batch Write Tasks & Calendar Blocks
    DB-->>B: Success Confirmation
    B-->>F: Return Updated State
    F->>F: Dispatch 'scheduleUpdated' & 'taskUpdated' Events
    F->>U: UI Automatically Refreshes Across All Views
```

### Planner Workflow
```mermaid
graph TD
    Create[➕ User Creates / Edits Task] --> Validate[Ensure Mandatory Fields: Title, Priority, Deadline]
    Validate --> RecurCheck{🔁 Is Recurring Task?}
    RecurCheck -- Yes --> GenInstances[Generate Future Interval Instances]
    RecurCheck -- No --> SingleTask[Create Single Document]
    GenInstances --> ConflictCheck[⚡ Check Timeline Overlaps]
    SingleTask --> ConflictCheck
    ConflictCheck --> Store[💾 Save to Firestore Tasks Collection]
    Store --> Dispatch[📢 Dispatch Event Bus Update]
    Dispatch --> UpdatePlanner[📋 Refresh Planner View]
    Dispatch --> UpdateCal[📅 Sync with Calendar Timeline]
```

### Voice Workflow
```mermaid
graph LR
    Mic[🎙️ User Audio Input] --> WebSpeech[Web Speech Recognition API]
    WebSpeech --> Transcript[Text Transcript]
    Transcript --> BackendAPI[POST /api/chat]
    BackendAPI --> Gemini[Gemini API Intelligence]
    Gemini --> ExecPlan[Structured Action Plan]
    ExecPlan --> Frontend[Update UI State]
    Frontend --> SpeechSynth[🔊 Web Speech Synthesis Audio Feedback]
```

---

## 📂 Folder Structure

```text
LastMinLifeSaver/
├── .env.local                    # Environment configurations (Firebase & Gemini Keys)
├── package.json                  # Frontend dependencies & Next.js scripts
├── next.config.mjs               # Next.js configuration
├── README.md                     # Flagship project documentation
├── ARCHITECTURE.md               # Detailed system architecture specifications
├── API_DOCUMENTATION.md          # Complete HTTP REST endpoint reference
├── DATABASE_SCHEMA.md            # Firestore NoSQL entity relationship definitions
├── PROJECT_REPORT.md             # Formal engineering & hackathon project report
├── DEMO_GUIDE.md                 # 30s/2m/5m presentation guide & FAQ
├── server/                       # Express Backend Services
│   ├── index.js                  # Server entrypoint & middleware mounting
│   ├── package.json              # Backend scripts & dependencies
│   ├── lib/
│   │   ├── firebaseAdmin.js      # Firebase Admin SDK initialization
│   │   └── gemini.js             # Google Gemini Pro API configuration & helper
│   └── routes/
│       ├── chat.js               # AI Assistant prompt handling & JSON parsing
│       ├── tasks.js              # Task CRUD & conflict detection logic
│       ├── schedule.js           # Calendar block management & timeline queries
│       ├── goalsHabits.js        # Goals & Habits progress tracking
│       ├── insights.js           # Dynamic Consistency Score algorithm
│       ├── user.js               # User profile & productivity mode preferences
│       ├── memory.js             # AI persistent user preference memory
│       └── notifications.js      # Background reminder checks
└── src/                          # Next.js 16 App Router Frontend
    ├── app/
    │   ├── layout.js             # Root application shell wrapper
    │   ├── page.js               # Executive Dashboard overview page
    │   ├── page.module.css       # Vanilla CSS modular styling
    │   ├── login/                # Authentication screen
    │   ├── planner/              # Full task queue & management table
    │   ├── schedule/             # Visual timeline calendar page
    │   ├── goals/                # Goals & habits tracking interface
    │   ├── progress/             # Consistency insights & analytics dashboard
    │   ├── aichat/               # Dedicated AI Executive Assistant chat view
    │   └── settings/             # System preferences & API configurations
    ├── components/
    │   ├── layout/               # AppShell, TopBar, Sidebar, MobileNav
    │   ├── schedule/             # TimelineView & visual dragging components
    │   ├── dashboard/            # QuickActionsGrid & summary cards
    │   ├── common/               # AdaptiveModesModal & reusable UI elements
    │   └── overlays/             # CommandPalette, NotificationPanel, QuickAddModal
    └── lib/
        ├── api.js                # Frontend HTTP client wrapper with x-user-id scoping
        └── firebase.js           # Client-side Firebase Auth & Firestore init
```

---

## 🚀 Installation & Setup Guide

### 1. Prerequisites
* **Node.js**: Version 18.x or higher installed.
* **Google Cloud / Firebase Account**: A Firebase project with Firestore Database and Authentication (Google Sign-In enabled).
* **Gemini API Key**: An API key generated from [Google AI Studio](https://aistudio.google.com/).

### 2. Environment Variables (`.env.local`)
Create a `.env.local` file in the root directory and populate it with your credentials:
```env
# Next.js / Client Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# Server Gemini & Firebase Admin Credentials
GEMINI_API_KEY=AIzaSy...
FIREBASE_PROJECT_ID=your-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
PORT=5000
```

### 3. Running Locally
Step 1: Install root frontend dependencies:
```bash
npm install
```

Step 2: Start the Next.js development server:
```bash
npm run dev
```
The frontend UI will be available at `http://localhost:3000`.

Step 3: Open a second terminal, navigate to `/server`, install dependencies, and start the backend:
```bash
cd server
npm install
node index.js
```
The Express API backend will listen on `http://localhost:5000`.

---

## 🖥️ Screenshots & UI Showcase

| Executive Dashboard | Visual Timeline Calendar |
| :---: | :---: |
| ![Dashboard](https://via.placeholder.com/600x350/1e1e2d/6C63FF?text=Executive+Dashboard+Overview) | ![Calendar](https://via.placeholder.com/600x350/1e1e2d/34d399?text=Visual+Timeline+Calendar) |
| *Real-time task summaries, schedule overview, and Consistency Score.* | *Drag-and-drop time blocks with cluster collision overlap formatting.* |

| AI Executive Assistant | Goals & Habits Tracking |
| :---: | :---: |
| ![AI Chat](https://via.placeholder.com/600x350/1e1e2d/a5b4fc?text=AI+Assistant+Chat+%26+Preview+Cards) | ![Goals](https://via.placeholder.com/600x350/1e1e2d/f472b6?text=Goals+%26+Habits+Milestones) |
| *Structured conversational planning with JSON validation and approval.* | *Long-term milestones and daily streak building.* |

---

## ⚡ Performance & Engineering Optimizations

1. **Authentication Scoping & Security**: Client requests automatically inject an `x-user-id` header mapped from authenticated Firebase sessions. All server routes enforce strict document scoping (`.where('userId', '==', req.headers['x-user-id'])`), guaranteeing complete user data privacy.
2. **Realtime Window Event Bus**: To prevent excessive network polling and avoid heavy Redux boilerplates, components communicate via customized browser window events (`taskUpdated`, `scheduleUpdated`, `userAuthChanged`), triggering instant localized state re-fetches.
3. **Cluster Collision CSS Partitioning**: Instead of complex JavaScript canvas rendering for overlapping timeline blocks, our schedule algorithm groups overlapping time blocks into connected clusters and dynamically calculates CSS `calc()` width and left offsets, ensuring flawless UI performance.
4. **Self-Correcting JSON Prompting**: Gemini prompts enforce strict JSON formatting instructions. Backend controllers catch malformed AI returns and gracefully sanitize or request structural corrections without crashing the client UI.

---

## 🌐 Google Technologies Used (Mandatory)

### 1. Google Gemini API
* **Purpose**: Serves as the core reasoning engine for task breakdown, natural language scheduling, deadline risk assessment, and executive coaching.
* **Implementation**: Integrated via `@google/genai` SDK inside `server/lib/gemini.js`. System instructions constrain the LLM to act as an executive productivity companion.
* **Validation & Approval Flow**: The LLM outputs structured JSON schema representing proposed timeline adjustments. The frontend presents these proposals as visual preview cards. Only upon user click approval are batch writes committed to Firestore.

### 2. Gemini Pro High (Antigravity IDE)
* **AI-Assisted Development Environment**: The Google DeepMind **Antigravity** environment powered by **Gemini Pro High** was utilized throughout the hackathon as an AI pair-programming assistant for:
  * Evaluating modular architecture workflows.
  * Generating initial boilerplate structures and styling tokens.
  * Debugging complex timeline overlap CSS algorithms.
  * Refactoring Express routing hierarchies.
* **Verification Note**: *All generated code, architecture designs, data models, and feature integrations were rigorously reviewed, modified, tested, and validated by the human development team.*

### 3. Firebase & Google Cloud Platform
* **Firestore NoSQL Database**: Serves as the persistent cloud database storing collections for `users`, `tasks`, `calendarEvents`, `goals`, `habits`, `chatMessages`, and `settings`.
* **Firebase Authentication**: Provides secure OAuth Google Sign-In with persistent local session storage.
* **Google Cloud Hosting Infrastructure**: Backend API services and frontend assets are optimized for deployment across scalable Google Cloud serverless environments.

---

## 🔮 Future Scope

While the current flagship release provides a robust, fully functional productivity system, planned future expansion includes:
* **📧 Automated Gmail Task Extraction**: Re-integrating OAuth email scanning to parse incoming messages for action items and meeting invitations.
* **📱 Native Mobile Application**: Building a React Native / Flutter mobile companion with push notifications and widget integrations.
* **🔄 Google Calendar Bi-directional Sync**: Real-time two-way OAuth synchronization with Google Workspace calendars.
* **💬 WhatsApp & Telegram Bot Triage**: Allowing users to send voice notes or text messages via messaging apps to instantly populate their planner queue.
* **👥 Team & Workspace Collaboration**: Shared executive dashboards for delegating tasks and synchronizing team schedules.

---

## 👏 Credits & Acknowledgements

### Development Tools
We extend our appreciation to the modern AI tools that accelerated our development workflow:
* **Antigravity IDE & Google Gemini Pro High**: Used for advanced code suggestions, system design discussions, and rapid prototyping.
* **ChatGPT**: Consulted for documentation structuring and syntax formatting references.

> [!IMPORTANT]
> **Engineering Integrity Statement**: All project architecture, core algorithms (such as consistency score weighting and cluster overlap partitioning), frontend implementations, debugging, testing, and deployment validations were conceived and executed by the hackathon development team.

---

## 📜 Open Source Credits

LifePilot AI is built upon reliable open-source libraries and frameworks. No external repositories were directly copied; only publicly available packages installed via `npm` were utilized:

| Library / Package | Version | Author / Maintainer | Purpose | License |
| :--- | :--- | :--- | :--- | :--- |
| **Next.js** | `16.2.9` | Vercel | Full-stack React framework & App Router | MIT |
| **React** | `19.2.4` | Meta Open Source | Core UI rendering engine | MIT |
| **Express** | `4.19.x` | OpenJS Foundation | Backend REST API server framework | MIT |
| **Firebase** | `12.15.0` | Google | Authentication SDK & Firestore client | Apache-2.0 |
| **Lucide React** | `1.21.0` | Lucide Contributors | Modern, consistent UI icon suite | ISC |
| **Framer Motion** | `12.42.0` | Framer | Smooth micro-animations and transitions | MIT |
| **Three.js / Drei** | `0.185.0` | Ricardo Cabello (mrdoob) | 3D visual elements & canvas rendering | MIT |

---

## 👥 Team & License

### Hackathon Team
* **Lead Architect & Full-Stack Developer**: *Pranav Raut* & Team
* **UI/UX & Product Designer**: *Team LifePilot*

### License
Distributed under the MIT License. See `LICENSE` for more information.

---
<p align="center">
  Built with ❤️ for the <strong>Vibe2Ship Hackathon 2026</strong> powered by Google DeepMind & Gemini.
</p>
