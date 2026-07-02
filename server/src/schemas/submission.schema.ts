import { z } from "zod";

export const ConfirmSubmissionSchema = z.object({
  studentName:      z.string().min(1, "Student name is required").trim(),
  fileUrl:          z.url("fileUrl must be a valid URL"),
  utKey:            z.string().min(1, "utKey is required"),
  originalFileName: z.string().optional().default(""),
  mimeType:         z.string().optional().default(""),
});

const mongoId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID format");
export const SubmissionIdParamSchema = z.object({
  submissionId: mongoId,
});

export type confirmSubmissionDto = z.infer<typeof ConfirmSubmissionSchema>;
export type submissionIdParamDto = z.infer<typeof SubmissionIdParamSchema>;
