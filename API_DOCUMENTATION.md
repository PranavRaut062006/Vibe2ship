# API Documentation — LifePilot AI REST Service

This document provides complete technical specifications for the HTTP REST API endpoints served by the **LifePilot AI Backend Express Server**.

---

## 📑 Table of Contents
1. [Authentication & Security Headers](#1-authentication--security-headers)
2. [Task Management API (Planner)](#2-task-management-api-planner)
3. [Schedule & Calendar API](#3-schedule--calendar-api)
4. [AI Executive Assistant API](#4-ai-executive-assistant-api)
5. [Goals & Habits API](#5-goals--habits-api)
6. [Insights & Consistency API](#6-insights--consistency-api)
7. [User Profile & Preferences API](#7-user-profile--preferences-api)
8. [System & Health API](#8-system--health-api)
9. [Integration & Security Guidelines](#9-integration--security-guidelines)

---

## 1. Authentication & Security Headers

All REST API requests originating from the client frontend must include the following mandatory identification header to enforce user data isolation:

| Header Name | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `x-user-id` | `string` | **Yes** | Authenticated Firebase User UID. Defaults to `'default-user'` if unauthenticated in guest demo mode. | `user_abc123xyz` |
| `Content-Type` | `string` | **Yes** (POST/PUT) | Must specify JSON body formatting. | `application/json` |

---

## 2. Task Management API (Planner)

### `GET /api/tasks`
* **Description**: Retrieves all manual tasks, recurring instances, and deadlines associated with the authenticated user.
* **Method**: `GET`
* **Authentication**: Required (`x-user-id`)
* **Response Status**: `200 OK`
```json
{
  "tasks": [
    {
      "_id": "task_101",
      "userId": "user_abc123xyz",
      "title": "Finalize Hackathon Pitch Deck",
      "category": "Work",
      "priority": "P1",
      "deadline": "2026-06-30",
      "status": "pending",
      "estimatedMinutes": 90
    }
  ]
}
```

### `POST /api/tasks`
* **Description**: Creates a new task in Firestore. Automatically evaluates schedule conflicts and generates recurring instances if requested.
* **Method**: `POST`
* **Request Body**:
```json
{
  "title": "Complete Code Review",
  "category": "Engineering",
  "priority": "P2",
  "deadline": "2026-07-02",
  "estimatedMinutes": 60,
  "recurring": "weekly"
}
```
* **Response Status**: `201 Created`
```json
{
  "success": true,
  "task": { "_id": "task_102", "title": "Complete Code Review", "status": "pending" },
  "conflicts": { "hasConflict": false, "conflictsWith": [] }
}
```

### `PUT /api/tasks/:id`
* **Description**: Updates existing task properties (e.g., marking status as `'completed'`, updating titles).
* **Method**: `PUT`
* **URL Parameters**: `id` (Task Document ID)
* **Request Body**: `{ "status": "completed" }`
* **Response Status**: `200 OK`

### `DELETE /api/tasks/:id`
* **Description**: Permanently deletes a task document from Firestore.
* **Method**: `DELETE`
* **Response Status**: `200 OK`

---

## 3. Schedule & Calendar API

### `GET /api/schedule`
* **Description**: Fetches structured timeline blocks scheduled for a specific date.
* **Method**: `GET`
* **Query Parameters**: `date` (`YYYY-MM-DD` or `'today'`)
* **Response Status**: `200 OK`
```json
{
  "schedule": {
    "date": "today",
    "blocks": [
      {
        "_id": "blk_01",
        "title": "Deep Focus: System Architecture",
        "startTime": "09:00",
        "endTime": "11:00",
        "type": "focus",
        "why": "High priority task scheduled during peak energy hours."
      }
    ]
  }
}
```

### `POST /api/schedule`
* **Description**: Batch overwrites or updates the daily calendar block array following drag-and-drop or AI schedule approval.
* **Method**: `POST`
* **Request Body**:
```json
{
  "date": "today",
  "blocks": [
    { "title": "Team Standup", "startTime": "11:00", "endTime": "11:30", "type": "meeting" }
  ]
}
```
* **Response Status**: `200 OK`

---

## 4. AI Executive Assistant API

### `POST /api/chat`
* **Description**: Submits a user conversation prompt to Google Gemini Pro. The backend attaches live task and schedule context, enforcing structured JSON output.
* **Method**: `POST`
* **Request Body**:
```json
{
  "prompt": "I have an emergency client call from 2 to 3 PM. Replan my afternoon schedule.",
  "history": []
}
```
* **Response Status**: `200 OK`
```json
{
  "reply": "I have adjusted your afternoon schedule to accommodate the emergency client call and pushed your study session to 3:30 PM.",
  "proposedSchedule": [
    { "title": "Emergency Client Call", "startTime": "14:00", "endTime": "15:00", "type": "meeting" },
    { "title": "Study Session", "startTime": "15:30", "endTime": "17:00", "type": "focus" }
  ],
  "proposedTasks": []
}
```

### `POST /api/chat/approve`
* **Description**: Commits an AI-generated schedule proposal directly into the user's active Firestore timeline.
* **Method**: `POST`
* **Request Body**: `{ "planData": { "proposedSchedule": [...] } }`
* **Response Status**: `200 OK`

---

## 5. Goals & Habits API

### `GET /api/goals` & `POST /api/goals`
* **Description**: Retrieves or creates long-term executive milestones.

### `GET /api/habits` & `POST /api/habits`
* **Description**: Retrieves or creates daily recurring habit routines tracked for streak computation.
* **Example Habit Payload**:
```json
{
  "title": "Morning Meditation",
  "targetDays": 7,
  "completedDays": 5,
  "streak": 12
}
```

---

## 6. Insights & Consistency API

### `GET /api/insights`
* **Description**: Calculates and returns user productivity analytics and dynamic Consistency Score.
* **Response Status**: `200 OK`
```json
{
  "consistencyScore": 92,
  "taskCompletionRate": 85,
  "completedCount": 17,
  "pendingCount": 3,
  "delayedCount": 0,
  "avgHabitProgress": 80,
  "avgGoalProgress": 65,
  "streak": 5,
  "mostPostponed": "Admin Tasks",
  "mostProductiveHours": "09:00 - 11:00 AM"
}
```

---

## 7. User Profile & Preferences API

### `GET /api/user` & `PUT /api/user`
* **Description**: Manages user display name, email, and productivity operating modes (`Balanced`, `Deep Focus`, `Sprint`).

---

## 8. System & Health API

### `GET /api/health`
* **Description**: Liveness probe endpoint checking backend uptime and Firestore connectivity.
* **Response Status**: `200 OK`
```json
{
  "status": "ok",
  "service": "LifePilot AI Backend (Firestore)",
  "timestamp": "2026-06-29T12:50:17.000Z"
}
```

---

## 9. Integration & Security Guidelines

1. **Gemini Integration & Rate Limiting**: The backend utilizes `@google/genai`. Errors such as `429 Too Many Requests` or quota limits are intercepted and returned as user-friendly error strings (`"AI rate limit reached. Please wait a moment."`).
2. **Input Validation**: All POST payloads undergo JSON syntax inspection before query execution. Missing required keys (`title` on tasks) result in `400 Bad Request`.
3. **Data Security**: Express CORS policy is configured to allow requests exclusively from authorized frontend web domains during production deployment.
