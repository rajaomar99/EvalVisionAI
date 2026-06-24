import apiClient from "./http";

export async function gradeSubmission(submissionId: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(
    `/ai/grade/${submissionId}`
  );
  return data;
}
