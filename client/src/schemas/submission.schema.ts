import { z } from "zod";

export const ConfirmSubmissionSchema = z.object({
  studentName:      z.string().min(1, "Student name is required").trim(),
  fileUrl:          z.string().min(1, "A file must be uploaded first"),
  utKey:            z.string().min(1, "utKey is required"),
  originalFileName: z.string().optional().default(""),
  mimeType:         z.string().optional().default(""),
});
