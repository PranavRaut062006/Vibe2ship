# 🚀 Google Cloud Run Production Deployment Guide — LifePilot AI

This document provides complete, step-by-step instructions for deploying **LifePilot AI** to **Google Cloud Run** in a production environment.

---

## 📑 Table of Contents
1. [Deployment Architecture](#1-deployment-architecture)
2. [Prerequisites & GCP Setup](#2-prerequisites--gcp-setup)
3. [Environment Configuration & Secret Management](#3-environment-configuration--secret-management)
4. [Method A: Automated Deployment via Cloud Build (Recommended)](#4-method-a-automated-deployment-via-cloud-build-recommended)
5. [Method B: Manual Step-by-Step Deployment](#5-method-b-manual-step-by-step-deployment)
6. [Verification & Health Checks](#6-verification--health-checks)

---

## 1. Deployment Architecture

LifePilot AI is architected for reliable cloud-native deployment using two isolated microservices on Google Cloud Run:
1. **`lifepilot-backend`**: A Node.js Express server running on lightweight Alpine containerization (`server/Dockerfile`). It manages Firebase Admin mutations, Gemini AI prompt construction, and strict JSON validation.
2. **`lifepilot-frontend`**: A Next.js 16 App Router application running in multi-stage production containerization (`Dockerfile`). It communicates directly with the deployed backend via environment variables.

Both containers listen on `process.env.PORT` (automatically injected as port `8080` by Google Cloud Run) and scale dynamically down to zero when idle to save costs.

```text
[ Global Internet ] 
       │
       ▼ (HTTPS)
┌──────────────────────────────────────────────┐
│  Google Cloud Run: lifepilot-frontend        │  (Next.js 16 App Router)
└──────────────────────────────────────────────┘
       │
       ▼ (REST / JSON over HTTPS)
┌──────────────────────────────────────────────┐
│  Google Cloud Run: lifepilot-backend         │  (Express API Server)
└──────────────────────────────────────────────┘
       │
       ├──────────────────────┬────────────────────────┐
       ▼                      ▼                        ▼
[ Cloud Firestore ]    [ Google Gemini Pro ]    [ Firebase Auth ]
```

---

## 2. Prerequisites & GCP Setup

Before deploying, ensure you have the following installed and configured:
1. **Google Cloud SDK (`gcloud`)**: Installed and authenticated (`gcloud auth login`).
2. **Docker**: Installed if testing images locally.
3. **Google Cloud Project**: A billing-enabled GCP project.

Enable the required Google Cloud APIs:
```bash
gcloud services enable run.googleapis.com \
                       cloudbuild.googleapis.com \
                       containerregistry.googleapis.com \
                       secretmanager.googleapis.com
```

Set your active project ID:
```bash
export PROJECT_ID="your-gcp-project-id"
gcloud config set project $PROJECT_ID
```

---

## 3. Environment Configuration & Secret Management

Do not hardcode secrets. Copy `.env.production.example` and prepare your values.

For secure production deployments, store sensitive keys inside **Google Secret Manager**:
```bash
# Create secrets for Gemini API Key and Firebase Private Key
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create GEMINI_API_KEY --data-file=-
echo -n "YOUR_FIREBASE_PRIVATE_KEY" | gcloud secrets create FIREBASE_PRIVATE_KEY --data-file=-
```

---

## 4. Method A: Automated Deployment via Cloud Build (Recommended)

We have provided a ready-to-use `cloudbuild.yaml` in the project root that builds and deploys both microservices sequentially.

Run the following command from the project root, substituting your specific environment credentials:

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_DEPLOY_REGION="us-central1",_GEMINI_API_KEY="YOUR_KEY",_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID",_FIREBASE_CLIENT_EMAIL="YOUR_EMAIL",_FIREBASE_API_KEY="YOUR_FB_KEY",_FIREBASE_AUTH_DOMAIN="YOUR_DOMAIN",_FIREBASE_STORAGE_BUCKET="YOUR_BUCKET",_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER",_FIREBASE_APP_ID="YOUR_APP_ID" .
```

*Note: Once the backend builds and deploys during step 3 of Cloud Build, update `_NEXT_PUBLIC_API_URL` to match the generated `https://lifepilot-backend-xyz.a.run.app` URL.*

---

## 5. Method B: Manual Step-by-Step Deployment

If you prefer deploying services individually:

### Step 1: Deploy the Express Backend Service
Navigate to `./server` and deploy to Cloud Run:
```bash
cd server

gcloud run deploy lifepilot-backend \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=YOUR_GEMINI_KEY,FIREBASE_PROJECT_ID=YOUR_PROJECT_ID,FIREBASE_CLIENT_EMAIL=YOUR_CLIENT_EMAIL"
```
After deployment finishes, note the generated service URL (e.g., `https://lifepilot-backend-12345-uc.a.run.app`).

### Step 2: Deploy the Next.js Frontend Service
Return to the project root and deploy the frontend, passing the backend service URL as a build arg and environment variable:
```bash
cd ..

gcloud run deploy lifepilot-frontend \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="NEXT_PUBLIC_API_URL=https://lifepilot-backend-12345-uc.a.run.app,NEXT_PUBLIC_GEMINI_API_KEY=YOUR_GEMINI_KEY,NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FB_KEY,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_DOMAIN,NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_BUCKET,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER,NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID"
```

---

## 6. Verification & Health Checks

Once deployed, verify production readiness:

1. **Backend Liveness Probe**: Open terminal or browser and test the backend health endpoint:
   ```bash
   curl https://lifepilot-backend-12345-uc.a.run.app/api/health
   ```
   **Expected Response**:
   ```json
   { "status": "ok", "service": "LifePilot AI Backend (Firestore)", "timestamp": "..." }
   ```

2. **Frontend UI Rendering**: Open your `lifepilot-frontend` URL in a browser. Verify login redirection, task creation, and AI Chat planning. All components will securely communicate with the cloud-deployed backend API without any localhost dependencies.
