import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { gradeSubmission } from "../controllers/aiController.js";

const router = Router();

router.post("/grade/:submissionId", authenticate, gradeSubmission);

export default router;
