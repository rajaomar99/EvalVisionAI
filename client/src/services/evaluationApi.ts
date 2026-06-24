import apiClient from "./http";
import type {
  EvaluationResponse,
  EvaluationListResponse,
  UpdateEvaluationPayload,
} from "../types/index";

export async function getEvaluation(submissionId: string): Promise<EvaluationResponse> {
  const { data } = await apiClient.get<EvaluationResponse>(`/evaluations/${submissionId}`);
  return data;
}

export async function getEvaluationsByExam(examId: string): Promise<EvaluationListResponse> {
  const { data } = await apiClient.get<EvaluationListResponse>(`/evaluations/exam/${examId}`);
  return data;
}

export async function updateEvaluation(
  submissionId: string,
  payload: UpdateEvaluationPayload
): Promise<EvaluationResponse> {
  const { data } = await apiClient.put<EvaluationResponse>(
    `/evaluations/${submissionId}`,
    payload
  );
  return data;
}
