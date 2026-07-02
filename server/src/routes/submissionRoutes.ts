import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { listSubmissionsByExam, getSubmission, uploadSubmission, checkPlagiarism, deleteSubmission } from "../controllers/submissionController.js";
import { validate } from "../middleware/validate.js";
import { ConfirmSubmissionSchema } from "../schemas/submission.schema.js";
import { ExamIdParamSchema } from "../schemas/exam.schema.js";
import { SubmissionIdParamSchema } from "../schemas/submission.schema.js";

const router = Router();

router.use(authenticate);

router.post("/confirm/:examId", validate(ExamIdParamSchema, "params"), validate(ConfirmSubmissionSchema), uploadSubmission);
router.get("/exam/:examId", validate(ExamIdParamSchema, "params"), listSubmissionsByExam);
router.get("/:submissionId", validate(SubmissionIdParamSchema, "params"), getSubmission);
router.get("/exam/:examId/plagiarism", validate(ExamIdParamSchema, "params"), checkPlagiarism);
router.delete("/:submissionId", validate(SubmissionIdParamSchema, "params"), deleteSubmission);

export default router;
