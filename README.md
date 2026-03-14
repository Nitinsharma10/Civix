# 🏙️ Micro-Task — Civic Issue Reporting Platform

A full-stack civic engagement platform where community residents can **report**, **track**, and **verify** resolution of local issues — powered by AI triage, an interactive GPS map, and a community points system.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Points & Designations](#-points--designations)
- [Roles & Permissions](#-roles--permissions)
- [Pages & Routes](#-pages--routes)

---

## 🔍 Overview

Micro-Task bridges the gap between residents and local civic administration. Users submit issues with photos and GPS locations; a **hybrid AI pipeline** uses local BLIP ML for severity estimation and always calls **n8n + LLM** for category/department analysis. Admins manage issues through a dedicated panel and upload proof when resolving them — residents then vote to verify the fix is real.

---

## ✨ Key Features

### For Residents
| Feature | Description |
|---|---|
| 🗺️ **Interactive Map** | Leaflet/OpenStreetMap map auto-zooms to your GPS location on load; all reported issues shown as colour-coded pins |
| 📝 **Issue Reporting** | Two-step form: image upload → AI analysis preview → confirm & submit |
| 🤖 **AI Enrichment** | n8n webhook classifies category, predicts department, and scores severity (0–10) automatically |
| 🔍 **Duplicate Detection** | Haversine distance (200 m radius) + Jaccard text similarity warns before submitting near-duplicates |
| 🎙️ **Voice Input** | Sarvam AI speech-to-text lets you dictate issue descriptions |
| 📖 **Read More / Less** | Long descriptions are truncated with a smooth animated expand/collapse toggle |
| 👍 **Upvoting** | Toggle upvote on any issue; count updates optimistically |
| 💬 **Comments** | Thread-style comments per issue |
| ✅ **Resolution Verification** | Residents upvote the admin's proof photo to confirm a fix is real |
| 🏅 **Points & Badges** | Earn points for reporting, attending events, and getting issues resolved |

### For Admins
| Feature | Description |
|---|---|
| 🗂️ **Issue Management** | Approve, assign in-progress, and resolve issues with proof-image upload |
| 🗺️ **Admin Map** | Same interactive map with inline status-change buttons inside pop-ups |
| 📊 **Analytics Dashboard** | Donut charts, bar charts, severity histogram, and quick-insight summaries |
| ✏️ **Inline Editing** | Edit title, description, category, department, and severity score |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 16** (App Router) | React framework with SSR/SSG |
| **TypeScript** | Type safety across all components |
| **Tailwind CSS v4** | Utility-first styling |
| **Leaflet.js** | Interactive maps (OpenStreetMap tiles, no API key needed) |
| **Clerk** | Authentication — sign-in, sign-up, session management |
| **Lucide React** | Icon library |
| **Sarvam AI** | Speech-to-text for Indian language voice input |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | REST API server |
| **MongoDB + Mongoose** | Database — issues, users, comments, events |
| **Clerk Express SDK** | JWT verification and auth middleware |
| **Cloudinary** | Image upload and CDN hosting |
| **FastAPI + HuggingFace BLIP** | Local image captioning and severity estimation (`Salesforce/blip-image-captioning-base`) |
| **n8n** | No-code AI workflow — calls LLM to enrich issue data |
| **Axios** | Webhook HTTP calls with configurable timeouts |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Browser / Client                    │
│  Next.js App Router  ·  Clerk  ·  Leaflet  ·  Sarvam    │
└────────────────────┬────────────────────────────────────┘
                     │ REST API calls
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Express Backend (:5500)                  │
│                                                          │
│  POST /api/issues/preview  ──► BLIP ML Severity Service  │
│                          └──► n8n Webhook (always)       │
│  POST /api/issues          ──► MongoDB                   │
│  PATCH /api/issues/:id     ──► MongoDB                   │
│  POST /api/issues/:id/resolve ──► Cloudinary → MongoDB   │
│  GET  /api/events          ──► MongoDB                   │
│  POST /api/users/sync      ──► Clerk API → MongoDB       │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│         MongoDB Atlas  (issues · users · events)          │
└──────────────────────────────────────────────────────────┘

Issue Submission Flow:
  1. User fills form (title, description, optional image + GPS)
  2. `/preview` uploads image to Cloudinary
  3. Backend sends image to local BLIP ML service (`/analyze-severity`)
  4. Backend always calls n8n webhook for category/department analysis
  5. If ML confidence ≥ 0.80, ML severity overrides n8n severity
  6. If ML confidence < 0.80 (or ML fails), n8n severity is used
  7. UI shows preview fields for user review/edit
  8. `/issues` saves confirmed fields to MongoDB
```

---

## 📁 Project Structure



---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A **MongoDB Atlas** cluster (free tier works)
- A **Clerk** account — [clerk.com](https://clerk.com) (free tier works)
- A **Cloudinary** account — [cloudinary.com](https://cloudinary.com) (free tier works)
- *(Optional)* An **n8n** instance with the AI workflow webhook for issue enrichment
- *(Optional)* A **Sarvam AI** API key for speech-to-text — [sarvam.ai](https://sarvam.ai)

---

### 1. Backend Setup

```bash
# Clone and enter the backend directory
cd Micro-Task/backend

# Install dependencies
npm install

# Create your environment file (see Environment Variables section below)
cp .env.example .env   # or create .env manually

# Start development server (auto-restarts on changes)
npm run dev

# — OR — start production server
npm start
```

The backend starts on **http://localhost:5500** by default.

---

### 2. Frontend Setup

```bash
cd Micro-Task/frontend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env   # or create .env manually

# Start the Next.js development server
npm run dev
```

The frontend starts on **http://localhost:3000**.

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

### Backend — `backend/.env`

```env
# Server
PORT=5500

# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<AppName>

# Clerk — from your Clerk dashboard → API Keys
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Cloudinary — from your Cloudinary dashboard
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>

# AI integrations
N8N_WEBHOOK_URL=https://<your-n8n-host>/webhook/<id>
ML_SERVICE_URL=http://127.0.0.1:8000/analyze-severity
ML_CONFIDENCE_THRESHOLD=0.80
```

### Python ML Service — `backend/ml-service`

```bash
cd Micro-Task/backend/ml-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

### Frontend — `frontend/.env`

```env
# Clerk public key (safe to expose)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Clerk secret key (server-side only — never expose publicly)
CLERK_SECRET_KEY=sk_test_...

# Post-auth redirect destinations
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/feed
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/feed

# Backend API base URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:5500

# Sarvam AI speech-to-text (optional — disables voice input if absent)
SARVAM_API_KEY=sk_...
```

> ⚠️ **Never commit `.env` files.** Both `.env` files are already in `.gitignore`.

---

## 📡 API Reference

### Issues

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/issues/preview` | ✅ Required | Upload image to Cloudinary, run local BLIP severity analysis, always call n8n, and override severity when ML confidence is high. |
| `POST` | `/api/issues` | ✅ Required | Save a confirmed issue to MongoDB. |
| `GET` | `/api/issues` | ❌ Public | List all issues (newest first) with reporter info joined. |
| `GET` | `/api/issues/pending-verifications` | ❌ Public | List resolved issues awaiting resident verification. |
| `POST` | `/api/issues/check-duplicate` | ❌ Public | Check for near-duplicate issues within 200 m using Haversine + Jaccard similarity. |
| `GET` | `/api/issues/:id` | ❌ Public | Get a single issue by ID. |
| `PATCH` | `/api/issues/:id` | ✅ Admin | Update issue fields (status, severity, department, etc.). |
| `PATCH` | `/api/issues/:id/resolve` | ✅ Admin | Resolve an issue with a mandatory proof image upload. Awards reporter points. |
| `PATCH` | `/api/issues/:id/upvote` | ✅ Required | Toggle upvote for the authenticated user. |
| `PATCH` | `/api/issues/:id/verify-upvote` | ✅ Required | Upvote admin's resolution proof (one-way). Auto-marks as verified at 3 upvotes. |
| `GET` | `/api/issues/:id/comments` | ❌ Public | List all comments for an issue. |
| `POST` | `/api/issues/:id/comments` | ✅ Required | Post a comment on an issue. |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/users/sync` | ✅ Required | Upsert user in MongoDB from Clerk profile (called after every login). |
| `GET` | `/api/users/me` | ✅ Required | Return the current user's MongoDB document (includes points, designation, role). |

### Events

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/events` | ❌ Public | List all community events with organiser info joined. |
| `POST` | `/api/events` | ✅ Required | Create a new event. Awards organiser **+80 points**. |
| `PATCH` | `/api/events/:id/interested` | ✅ Required | Toggle "Interested" status. Awards/revokes **±10 points**. |
| `PATCH` | `/api/events/:id/participating` | ✅ Required | Toggle "Participating" status. Awards/revokes **±20 points**. |

---

## 🏅 Points & Designations

Residents earn points through civic engagement. Points unlock designations displayed on their profile.

### Point Events

| Action | Points |
|--------|--------|
| Organise a community event | **+80** |
| Participate in an event | **+20** |
| Mark interest in an event | **+10** |
| Issue resolved (severity 7–10) | **+50** |
| Issue resolved (severity 4–6) | **+30** |
| Issue resolved (severity 1–3) | **+10** |
| Issue resolved (unknown severity) | **+20** |

### Designation Tiers

| Designation | Points Required |
|-------------|----------------|
| 🟢 **Newcomer** | 0+ |
| 🔵 **Mitra** *(Friend)* | 100+ |
| 🟠 **Rakshak** *(Protector)* | 300+ |
| 🔴 **Nayak** *(Leader)* | 700+ |

---

## 👥 Roles & Permissions

| Permission | Resident | Admin |
|------------|----------|-------|
| Browse the feed | ✅ | ✅ |
| View the map | ✅ | ✅ |
| Report an issue | ✅ | ✅ |
| Upvote issues | ✅ | ✅ |
| Comment on issues | ✅ | ✅ |
| Verify resolution proof | ✅ | ✅ |
| Create / join events | ✅ | ✅ |
| Change issue status | ❌ | ✅ |
| Resolve with proof image | ❌ | ✅ |
| Edit issue fields | ❌ | ✅ |
| View analytics dashboard | ❌ | ✅ |

> **Setting a user as admin:** Update the user's `role` field in MongoDB directly:
> ```js
> db.users.updateOne({ clerkUserId: "user_xxx" }, { $set: { role: "admin" } })
> ```

---

## 🗺️ Pages & Routes

| Route | Who | Description |
|-------|-----|-------------|
| `/` | All | Landing page — redirects to `/feed` if signed in |
| `/feed` | Residents | Community issue feed with Post Issue form |
| `/map` | Residents | Interactive Leaflet map — auto-zooms to your GPS location |
| `/events` | Residents | Community events listing |
| `/admin/issues` | Admin | Issue management table with edit/resolve controls |
| `/admin/map` | Admin | Admin version of the map with inline status buttons |
| `/admin/analytics` | Admin | Charts: status donut, severity histogram, department bars |
| `/sso-callback` | Auth | Clerk OAuth callback handler |

---

## 🔧 Available Scripts

### Backend
```bash
npm run dev     # Start with nodemon (auto-restart)
npm start       # Start without hot-reload (production)
```

### Frontend
```bash
npm run dev     # Start Next.js dev server with Turbopack
npm run build   # Production build
npm start       # Serve production build
npm run lint    # Run ESLint
```
