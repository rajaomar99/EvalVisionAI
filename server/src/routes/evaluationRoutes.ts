import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  getEvaluationBySubmission,
  getEvaluationsByExam,
  updateEvaluation,
} from "../controllers/evaluationController.js";

const router = Router();

router.use(authenticate);

router.get("/exam/:examId", getEvaluationsByExam);
router.get("/:submissionId", getEvaluationBySubmission);
router.put("/:submissionId", updateEvaluation);

export default router;
