import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { createExam, listExams, getExam, updateExam, deleteExam, getExamAnalytics } from "../controllers/examController.js";
import { validate } from "../middleware/validate.js";
import { CreateExamSchema, UpdateExamSchema } from "../schemas/exam.schema.js";
import { ExamIdParamSchema } from "../schemas/exam.schema.js";

const router = Router();

router.use(authenticate);

router.post("/", validate(CreateExamSchema), createExam);
router.get("/", listExams);
router.get("/:examId", validate(ExamIdParamSchema, "params"), getExam);
router.put("/:examId", validate(ExamIdParamSchema, "params"), validate(UpdateExamSchema), updateExam);
router.delete("/:examId", validate(ExamIdParamSchema, "params"), deleteExam);
router.get("/:examId/analytics", validate(ExamIdParamSchema, "params"), getExamAnalytics);

export default router;
