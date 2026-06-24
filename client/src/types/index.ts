// Domain types

// User
export interface User {
  id:        string;
  name:      string;
  email:     string;
  createdAt: string;
  updatedAt: string;
}

// Exam
export interface Question {
  questionText: string;
  maxMarks:     number;
  type:         "subjective" | "mcq";
}

export interface Exam {
  id:            string;
  title:         string;
  subject:       string;
  teacherId:     string;
  totalMarks:    number;
  questions:     Question[];
  rubricFile:    string;
  rubricFileKey: string;
  createdAt:     string;
  updatedAt:     string;
}

// Submission
export interface Answer {
  questionIndex: number;
  extractedText: string;
  aiScore:       number | null;
  finalScore:    number | null;
  confidence:    number | null;
}

export type SubmissionStatus = "pending" | "graded" | "reviewed";

export interface Submission {
  id:               string;
  studentName:      string;
  examId:           string;
  teacherId:        string;
  answers:          Answer[];
  totalAIScore:     number | null;
  totalFinalScore:  number | null;
  fileUrl:          string;
  utKey:            string;
  originalFileName: string;
  mimeType:         string;
  uploadDate:       string | null;
  status:           SubmissionStatus;
  createdAt:        string;
  updatedAt:        string;
}

// Evaluation
export interface CriterionScore {
  criterionId: string;
  score:       number;
  feedback:    string;
}


export interface Evaluation {
  id:              string;
  submissionId:    string;
  examId:          string;
  criteriaScores:  CriterionScore[];
  overallFeedback: string;
  totalScore:      number;
  extractedText:   string;
  createdAt:       string;
  updatedAt:       string;
}

// Plagiarism
export interface PlagiarismPair {
  studentA:             string;
  studentB:             string;
  similarityPercentage: number;
}

// Analytics
export interface ScoreBin {
  name:  string;
  count: number;
  min:   number;
  max:   number;
}

export interface QuestionPerformance {
  question:     string; // "Q1", "Q2", ...
  averageScore: number;
  maxScore:     number;
  percentage:   number;
}

export interface ExamAnalytics {
  totalSubmissions:    number;
  averageScore:        number;
  highestScore:        number;
  lowestScore:         number;
  distribution:        ScoreBin[];
  questionPerformance: QuestionPerformance[];
}

// API response shapes

export interface AuthResponse            { user: User }
export interface ExamResponse            { exam: Exam }
export interface ExamListResponse        { count: number; pendingCount?: number; exams: Exam[] }
export interface SubmissionResponse      { submission: Submission }
export interface SubmissionListResponse  { count: number; submissions: Submission[] }
export interface EvaluationResponse      { evaluation: Evaluation }
export interface EvaluationListResponse  { count: number; evaluations: Evaluation[] }
export interface PlagiarismResponse      { flagged: PlagiarismPair[] }
export interface ConfirmSubmissionResponse {
  submissionId: string;
  fileUrl:      string;
  status:       SubmissionStatus;
}

// Service input types

export interface LoginPayload    { email: string; password: string }
export interface RegisterPayload { name: string; email: string; password: string }

export interface QuestionInput {
  questionText: string;
  maxMarks:     number;
  type?:        "subjective" | "mcq";
}

export interface CreateExamPayload {
  title:         string;
  subject?:      string;
  questions:     QuestionInput[];
  rubricFileUrl: string;
  rubricFileKey?: string;
}

export interface UpdateExamPayload {
  title?:         string;
  subject?:       string;
  questions?:     QuestionInput[];
  rubricFileUrl?: string;
  rubricFileKey?: string;
}

export interface ConfirmSubmissionPayload {
  studentName:       string;
  fileUrl:           string;
  utKey?:            string;
  originalFileName?: string;
  mimeType?:         string;
}

export interface UpdateEvaluationPayload {
  criteriaScores?:  CriterionScore[];
  overallFeedback?: string;
  totalScore?:      number;
}

// API error shape
export interface ApiError {
  message: string;
}
