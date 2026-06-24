import apiClient from "./http";
import type {
  ExamResponse,
  ExamListResponse,
  ExamAnalytics,
  CreateExamPayload,
  UpdateExamPayload,
} from "../types/index";

export async function listExams(): Promise<ExamListResponse> {
  const { data } = await apiClient.get<ExamListResponse>("/exams");
  return data;
}

export async function getExam(examId: string): Promise<ExamResponse> {
  const { data } = await apiClient.get<ExamResponse>(`/exams/${examId}`);
  return data;
}

export async function getExamAnalytics(examId: string): Promise<ExamAnalytics> {
  const { data } = await apiClient.get<ExamAnalytics>(`/exams/${examId}/analytics`);
  return data;
}

/**
 * Create a new exam.
 * @param payload - title, subject, questions[], rubricFileUrl, rubricFileKey
 */
export async function createExam(payload: CreateExamPayload): Promise<ExamResponse> {
  const { data } = await apiClient.post<ExamResponse>("/exams", payload);
  return data;
}

/**
 * Update an existing exam (all fields optional).
 */
export async function updateExam(
  examId: string,
  payload: UpdateExamPayload
): Promise<ExamResponse> {
  const { data } = await apiClient.put<ExamResponse>(`/exams/${examId}`, payload);
  return data;
}

export async function deleteExam(examId: string): Promise<{ message: string }> {
  const { data } = await apiClient.delete<{ message: string }>(`/exams/${examId}`);
  return data;
}
