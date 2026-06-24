import apiClient from "./http";
import type {
  SubmissionResponse,
  SubmissionListResponse,
  ConfirmSubmissionPayload,
  ConfirmSubmissionResponse,
  PlagiarismResponse,
} from "../types/index";

export async function getSubmissionsByExam(examId: string): Promise<SubmissionListResponse> {
  const { data } = await apiClient.get<SubmissionListResponse>(`/submissions/exam/${examId}`);
  return data;
}

export async function getSubmission(submissionId: string): Promise<SubmissionResponse> {
  const { data } = await apiClient.get<SubmissionResponse>(`/submissions/${submissionId}`);
  return data;
}

/**
 * Confirm a submission after a successful direct UploadThing upload.
 * Should be called after useUploadThing's onClientUploadComplete fires.
 */
export async function confirmSubmission(
  examId: string,
  payload: ConfirmSubmissionPayload
): Promise<ConfirmSubmissionResponse> {
  const { data } = await apiClient.post<ConfirmSubmissionResponse>(
    `/submissions/confirm/${examId}`,
    payload
  );
  return data;
}

export async function checkPlagiarism(examId: string): Promise<PlagiarismResponse> {
  const { data } = await apiClient.get<PlagiarismResponse>(
    `/submissions/exam/${examId}/plagiarism`
  );
  return data;
}

export async function deleteSubmission(submissionId: string): Promise<void> {
  await apiClient.delete(`/submissions/${submissionId}`);
}
