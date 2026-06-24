# EvalVision AI

EvalVision AI is an intelligent platform designed for teachers to automate the evaluation of student exams and assignments. Driven by deterministic LLMs, it drastically cuts down grading time whilst maintaining high accuracy, consistency, and providing constructive feedback directly derived from uploaded rubrics. 

Built with a strict, modern monochrome design system, the dashboard feels premium, snappy, and radically simple.

## Features

- **Automated AI Grading:** Utilizes LLMs to score answers according to a custom teacher-uploaded rubric document.
- **Vision OCR Text Extraction:** Seamlessly extracts text from images and PDF uploads of student exams.
- **Plagiarism Checker:** Uses a robust semantic string-matching methodology strictly geared toward evaluating structural similarities among assignments in a batch.
- **Exam Management Dashboard:** Create and structure Exams (Subjective Questions, MCQs) coupled with analytics.
- **Manual Overrides:** Teachers can intuitively override generated scores, view the breakdown of total evaluation points, and update criteria feedbacks through a seamless React dashboard.

## Tech Stack

### Frontend (Client)
- **Framework:** React.js + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **Charts:** Recharts

### Backend (Server)
- **Framework:** Node.js + Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** Google OAuth 2.0 + Express Sessions
- **File Storage:** UploadThing

### AI Evaluation Service
- **Framework:** Python + FastAPI
- **LLM Integration:** Google Gemini Models API (`gemini-flash-lite-latest`)

---

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- MongoDB (Running locally or MongoDB Atlas)
- Google Cloud Console Project (For OAuth credentials)
- UploadThing Account (For file storage API keys)

### 1. Installation

Clone the repository and install the Node.js monorepo dependencies:
```bash
git clone <REPO_URL>
cd EvalVisionAI
npm install
```

### 2. Environment Variables

Copy the `.env.example` templates to their respective `.env` files and fill in your actual credentials.

**Backend (`server/.env`)**
```bash
cp server/.env.example server/.env
```
Ensure you provide your MongoDB URI, a strong Session Secret, your Google OAuth Client credentials, and your UploadThing API keys.

**Frontend (`client/.env`)**
```bash
cp client/.env.example client/.env
```
*(Defaults to targeting the local backend at `http://localhost:5000/api`)*

**AI Service (`ai-service/.env`)**
```bash
cp ai-service/.env.example ai-service/.env
```
Ensure you provide your Google Gemini API key and an internal `API_KEY` that matches the backend configuration.

### 3. AI Service Setup (Python)

Create a virtual environment and install the Python dependencies:
```bash
cd ai-service
python -m venv .venv
source .venv/Scripts/activate # On Windows PowerShell: .venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 4. Run the Application

EvalVision AI is set up as a monorepo. You need two terminal tabs to run the stack.

**Terminal 1 (AI Microservice):**
```bash
npm run dev:ai
```

**Terminal 2 (Frontend + Backend):**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:5000`.
