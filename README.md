# EvalVision AI

EvalVision AI is an intelligent platform designed for teachers to automate the evaluation of student exams and assignments. Driven by deterministic LLMs, it drastically cuts down grading time whilst maintaining high accuracy, consistency, and providing constructive feedback directly derived from uploaded rubrics.

Built with a strict, modern monochrome design system, the dashboard feels premium, snappy, and radically simple.

## Features

- **Automated AI Grading:** Utilizes Google Gemini to score student answers against a teacher-uploaded rubric, producing per-question scores, confidence levels, and individual feedback.
- **Vision OCR Text Extraction:** Seamlessly extracts text from scanned images (JPG, PNG) and PDF uploads of student answer sheets using a dedicated Python OCR microservice.
- **Plagiarism Detection:** Detects structural similarity between submissions in a batch using semantic string-matching, flagging suspicious pairs above a configurable threshold.
- **Exam Management:** Create and structure full exams with subjective and MCQ questions. Exams auto-compute total marks and support rubric document uploads (PDF/DOCX).
- **Score Analytics Dashboard:** Per-exam analytics including score distribution charts, question-wise average performance, and grading progress statistics (powered by Recharts).
- **Manual Score Overrides:** Teachers can review AI-generated breakdowns and override individual question scores and feedback notes, with changes reflected in real time.
- **File Upload & Storage:** Rubric documents and student answer sheets are uploaded directly to UploadThing CDN. Files are automatically cleaned up from storage when exams or submissions are deleted.
- **Dual Authentication:** Supports both local email/password accounts (bcrypt-hashed) and Google OAuth 2.0. Sessions are persisted securely in MongoDB via `connect-mongo`.
- **Type-Safe Form Validation:** All forms use React Hook Form with Zod schemas for real-time, per-field inline error messages and dynamic validation on change.
- **API Request Validation:** Backend routes are protected by a Zod `validate` middleware that parses and sanitises all incoming request bodies, params, and queries before they reach controllers.
- **Rate Limiting:** Tiered rate limiting across all API endpoints — strict limits on auth routes to prevent brute-force attacks, and separate limits on expensive AI grading calls.

## Tech Stack

### Frontend (Client)
- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM v6
- **Form State & Validation:** React Hook Form + Zod (`@hookform/resolvers`)
- **Charts:** Recharts
- **Toast Notifications:** Sonner
- **HTTP Client:** Axios
- **File Uploads:** UploadThing (`@uploadthing/react`)
- **Icons:** Lucide React

### Backend (Server)
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Session Store:** `connect-mongo` (MongoDB-backed sessions)
- **Authentication:** Passport.js — Local Strategy + Google OAuth 2.0
- **Password Hashing:** bcryptjs
- **File Storage:** UploadThing
- **Request Validation:** Zod middleware
- **Security:** Helmet, Express Rate Limit (tiered: global, auth, AI)
- **Logging:** Morgan

### AI Evaluation Microservice
- **Language:** Python 3.10+
- **Framework:** FastAPI + Uvicorn
- **LLM:** Google Gemini (`google-genai` SDK, `gemini-flash-lite-latest`)
- **Validation:** Pydantic

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- MongoDB (running locally or MongoDB Atlas)
- Google Cloud Console project (for OAuth 2.0 credentials)
- UploadThing account (for file storage API keys)
- Google AI Studio account (for Gemini API key)

### 1. Installation

Clone the repository and install Node.js monorepo dependencies:
```bash
git clone <REPO_URL>
cd EvalVisionAI
npm install
```

### 2. Environment Variables

Copy the `.env.example` templates and fill in your credentials.

**Backend (`server/.env`)**
```bash
cp server/.env.example server/.env
```
Required: MongoDB URI, Session Secret, Google OAuth Client ID/Secret, UploadThing API keys, AI Service URL and internal API key.

**Frontend (`client/.env`)**
```bash
cp client/.env.example client/.env
```
Defaults to targeting the local backend at `http://localhost:5000/api`.

**AI Service (`ai-service/.env`)**
```bash
cp ai-service/.env.example ai-service/.env
```
Required: Google Gemini API key and an internal `API_KEY` that matches the backend's configuration.

### 3. AI Service Setup (Python)

Create a virtual environment and install Python dependencies:
```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate     # Windows PowerShell
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
cd ..
```

### 4. Run the Application

EvalVision AI is a monorepo. Two terminal sessions are required.

**Terminal 1 — AI Microservice:**
```bash
npm run dev:ai
```

**Terminal 2 — Frontend + Backend:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:5000`.
