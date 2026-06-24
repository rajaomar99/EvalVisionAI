import { z } from "zod";

// Question sub-schema
export const QuestionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  maxMarks:     z.number({ error: "Max marks must be a number" })
                 .int("Max marks must be a whole number")
                 .min(1, "Max marks must be at least 1"),
  type:         z.enum(["subjective", "mcq"]).default("subjective"),
});

export type QuestionInput = z.infer<typeof QuestionSchema>;

// Create
export const CreateExamSchema = z.object({
  title:         z.string().min(1, "Title is required").trim(),
  subject:       z.string().trim().optional().default(""),
  questions:     z.array(QuestionSchema).min(1, "At least one question is required"),
  rubricFileUrl: z.url("rubricFileUrl must be a valid URL"),
  rubricFileKey: z.string().optional().default(""),
});

export type CreateExamInput = z.infer<typeof CreateExamSchema>;

// Update (all fields optional except id, handled via params)
export const UpdateExamSchema = z.object({
  title:         z.string().min(1).trim().optional(),
  subject:       z.string().trim().optional(),
  questions:     z.array(QuestionSchema).min(1).optional(),
  rubricFileUrl: z.string().url("rubricFileUrl must be a valid URL").optional(),
  rubricFileKey: z.string().optional(),
});

export type UpdateExamInput = z.infer<typeof UpdateExamSchema>;

// MongoDB ObjectId params
const mongoId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID format");

export const ExamIdParamSchema = z.object({
  id: mongoId,
});

export type ExamIdParam = z.infer<typeof ExamIdParamSchema>;
