import { z } from "zod";

const mongoId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID format");

// Criterion score sub-schema
export const CriterionScoreSchema = z.object({
  criterionId: z.string().min(1, "criterionId is required"),
  score:       z.number({ error: "Score must be a number" }).min(0, "Score cannot be negative"),
  feedback:    z.string().optional().default(""),
});

export type CriterionScoreInput = z.infer<typeof CriterionScoreSchema>;

// Update evaluation body
export const UpdateEvaluationSchema = z.object({
  criteriaScores:  z.array(CriterionScoreSchema).optional(),
  overallFeedback: z.string().optional(),
  totalScore:      z.number().min(0).optional(),
}).refine(
  (data) => data.criteriaScores !== undefined || data.totalScore !== undefined,
  { message: "Provide at least criteriaScores or totalScore" }
);

export type UpdateEvaluationInput = z.infer<typeof UpdateEvaluationSchema>;

// Route params
export const SubmissionIdParamSchema = z.object({
  submissionId: mongoId,
});

export const ExamIdParamSchema = z.object({
  examId: mongoId,
});

export type SubmissionIdParam = z.infer<typeof SubmissionIdParamSchema>;
export type ExamIdParam = z.infer<typeof ExamIdParamSchema>;
