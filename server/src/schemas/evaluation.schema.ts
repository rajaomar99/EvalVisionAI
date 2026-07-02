import { z } from "zod";

// Single Criterion score
export const CriterionScoreSchema = z.object({
  criterionId: z.string().min(1, "criterionId is required"),
  score:       z.number({ error: "Score must be a number" }).min(0, "Score cannot be negative"),
  feedback:    z.string().optional().default(""),
});

// Update evaluation body (teacher review)
export const UpdateEvaluationSchema = z.object({
  criteriaScores:  z.array(CriterionScoreSchema).optional(),
  overallFeedback: z.string().optional(),
  totalScore:      z.number().min(0, "Total score cannot be negative").optional(),
})
.refine(
  (data) => data.criteriaScores !== undefined || data.totalScore !== undefined,
  { message: "Provide at least one of criteriaScores or totalScore" }
);

export type updateEvaluationDto = z.infer<typeof UpdateEvaluationSchema>;
