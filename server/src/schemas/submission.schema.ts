import { z } from "zod";

const mongoId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID format");

// Confirm submission (called after UploadThing direct upload)
export const ConfirmSubmissionSchema = z.object({
  studentName:      z.string().min(1, "Student name is required").trim(),
  fileUrl:          z.url("fileUrl must be a valid URL"),
  utKey:            z.string().optional().default(""),
  originalFileName: z.string().optional().default(""),
  mimeType:         z.string().optional().default(""),
});

export type ConfirmSubmissionInput = z.infer<typeof ConfirmSubmissionSchema>;

// Route params
export const ExamIdParamSchema = z.object({
  examId: mongoId,
});

export const SubmissionIdParamSchema = z.object({
  id: mongoId,
});

export const GradeSubmissionParamSchema = z.object({
  submissionId: mongoId,
});

export type ExamIdParam            = z.infer<typeof ExamIdParamSchema>;
export type SubmissionIdParam      = z.infer<typeof SubmissionIdParamSchema>;
export type GradeSubmissionParam   = z.infer<typeof GradeSubmissionParamSchema>;
