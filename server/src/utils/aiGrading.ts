import axios from "axios";
import { env } from "../config/env.js";

const AI_BASE = env.AI_SERVICE_URL;
const AI_API_KEY = env.AI_API_KEY;

// Types
interface Question {
  questionText: string;
  maxMarks: number;
  type?: string;
}

interface GradeWithAIOptions {
  fileUrl: string;
  mimeType?: string;
  rubricFileUrl?: string;
  questions: Question[];
  assignmentTitle?: string;
  courseName?: string;
}

export async function gradeWithAI(opts: GradeWithAIOptions): Promise<unknown> {
  const {
    fileUrl,
    mimeType,
    rubricFileUrl,
    questions,
    assignmentTitle = "",
    courseName      = "",
  } = opts;

  if (!fileUrl) {
    throw new Error("fileUrl is required for AI grading - no text-based grading supported");
  }

  const { data } = await axios.post(
    `${AI_BASE}/ai/grade/url`,
    {
      fileUrl,
      mimeType: mimeType || "application/octet-stream",
      rubricFileUrl: rubricFileUrl || "",
      questions,
      assignmentTitle,
      courseName,
    },
    { 
      timeout: 120_000,
      headers: { "X-API-Key": AI_API_KEY }
    }
  );

  return data;
}
