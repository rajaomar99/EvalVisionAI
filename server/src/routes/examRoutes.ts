import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  createExam,
  listExams,
  getExam,
  updateExam,
  deleteExam,
  getExamAnalytics,
} from "../controllers/examController.js";

const router = Router();

router.use(authenticate);

router.post("/", createExam);
router.get("/", listExams);
router.get("/:id/analytics", getExamAnalytics);
router.get("/:id", getExam);
router.put("/:id", updateExam);
router.delete("/:id", deleteExam);

export default router;
