import { z } from "zod";

// Single Question
export const QuestionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  maxMarks:     z.number("Max marks is required")
                  .min(1, "Max marks must be at least 1"),
  type:         z.enum(["subjective", "mcq"]),
});

// Create Exam
export const CreateExamSchema = z.object({
  title:         z.string().min(1, "Title is required").trim(),
  subject:       z.string().trim(),
  questions:     z.array(QuestionSchema).min(1, "Add at least one question"),
  rubricFileUrl: z.url("Please upload a rubric file first"),
  rubricFileKey: z.string().min(1, "rubricFileKey is required"),
});

// Update Exam (all fields optional)
export const UpdateExamSchema = z.object({
  title:         z.string().min(1, "Title is required").trim().optional(),
  subject:       z.string().trim().optional(),
  questions:     z.array(QuestionSchema).min(1, "Add at least one question").optional(),
  rubricFileUrl: z.url("rubricFileUrl must be a valid URL").optional(),
  rubricFileKey: z.string().optional(),
});
