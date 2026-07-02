import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { getEvaluationBySubmission, getEvaluationsByExam, updateEvaluation } from "../controllers/evaluationController.js";
import { validate } from "../middleware/validate.js";
import { UpdateEvaluationSchema } from "../schemas/evaluation.schema.js";
import { SubmissionIdParamSchema } from "../schemas/submission.schema.js";
import { ExamIdParamSchema } from "../schemas/exam.schema.js";

const router = Router();

router.use(authenticate);

router.get("/:submissionId", validate(SubmissionIdParamSchema, "params"), getEvaluationBySubmission);
router.get("/exam/:examId", validate(ExamIdParamSchema, "params"), getEvaluationsByExam);
router.put("/:submissionId", validate(SubmissionIdParamSchema, "params"), validate(UpdateEvaluationSchema), updateEvaluation);

export default router;
