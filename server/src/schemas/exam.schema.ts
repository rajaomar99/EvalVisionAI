import { z } from "zod";

// Single Question
export const QuestionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  maxMarks:     z.number({ error: "Max marks must be a number" })
                 .int("Max marks must be a whole number")
                 .min(1, "Max marks must be at least 1"),
  type:         z.enum(["subjective", "mcq"]).default("subjective"),
});

// Create Exam
export const CreateExamSchema = z.object({
  title:         z.string().min(1, "Title is required").trim(),
  subject:       z.string().trim().optional().default(""),
  questions:     z.array(QuestionSchema).min(1, "At least one question is required"),
  rubricFileUrl: z.url("rubricFileUrl must be a valid URL"),
  rubricFileKey: z.string().min(1, "rubricFileKey is required"),
});

// Update Exam (all fields optional except id, handled via params)
export const UpdateExamSchema = z.object({
  title:         z.string().min(1, "Title is required").trim().optional(),
  subject:       z.string().trim().optional(),
  questions:     z.array(QuestionSchema).min(1).optional(),
  rubricFileUrl: z.url("rubricFileUrl must be a valid URL").optional(),
  rubricFileKey: z.string().optional(),
});

const mongoId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID format");
export const ExamIdParamSchema = z.object({
  examId: mongoId,
});

export type createExamDto = z.infer<typeof CreateExamSchema>;
export type updateExamDto = z.infer<typeof UpdateExamSchema>;
export type examIdParamDto = z.infer<typeof ExamIdParamSchema>;
