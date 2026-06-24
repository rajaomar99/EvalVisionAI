import { z } from "zod";

// Single criterion score row
export const CriterionScoreSchema = z.object({
  criterionId: z.string().min(1),
  score:       z.coerce
                 .number({ error: "Score must be a number" })
                 .min(0, "Score cannot be negative"),
  feedback:    z.string().optional().default(""),
});

export type CriterionScoreFormValues = z.infer<typeof CriterionScoreSchema>;

// Update evaluation (teacher review)
export const UpdateEvaluationSchema = z.object({
  criteriaScores:  z.array(CriterionScoreSchema).optional(),
  overallFeedback: z.string().optional(),
  totalScore:      z.coerce.number().min(0, "Total score cannot be negative").optional(),
}).refine(
  (d) => d.criteriaScores !== undefined || d.totalScore !== undefined,
  { message: "Provide at least one of criteriaScores or totalScore" }
);

export type UpdateEvaluationFormValues = z.infer<typeof UpdateEvaluationSchema>;
