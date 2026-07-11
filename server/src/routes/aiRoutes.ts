import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { gradeSubmission } from "../controllers/aiController.js";
import { SubmissionIdParamSchema } from "../schemas/submission.schema.js";
import { validate } from "../middleware/validate.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/grade/:submissionId", aiLimiter, validate(SubmissionIdParamSchema, "params"), authenticate, gradeSubmission);

export default router;
