import { z } from "zod";

// Single question
export const QuestionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  maxMarks:     z.coerce
                  .number({ error: "Max marks must be a number" })
                  .int("Max marks must be a whole number")
                  .min(1, "Max marks must be at least 1"),
  type:         z.enum(["subjective", "mcq"]).default("subjective"),
});

export type QuestionFormValues = z.infer<typeof QuestionSchema>;

// Create / Edit exam
// rubricFileUrl is required on creation - the user must upload before submitting.
export const CreateExamSchema = z.object({
  title:         z.string().min(1, "Title is required").trim(),
  subject:       z.string().trim().optional().default(""),
  questions:     z
    .array(QuestionSchema)
    .min(1, "Add at least one question"),
  rubricFileUrl: z.url("A rubric file must be uploaded first"),
  rubricFileKey: z.string().optional().default(""),
});

export type CreateExamFormValues = z.infer<typeof CreateExamSchema>;

// Edit exam (all fields optional)
// Separate schema so the form doesn't force a rubric re-upload on every edit.
export const UpdateExamSchema = z.object({
  title:         z.string().min(1, "Title is required").trim().optional(),
  subject:       z.string().trim().optional(),
  questions:     z.array(QuestionSchema).min(1, "Add at least one question").optional(),
  rubricFileUrl: z.url("rubricFileUrl must be a valid URL").optional(),
  rubricFileKey: z.string().optional(),
});

export type UpdateExamFormValues = z.infer<typeof UpdateExamSchema>;
