import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  listSubmissionsByExam,
  getSubmission,
  uploadSubmission,
  checkPlagiarism,
  deleteSubmission,
} from "../controllers/submissionController.js";

const router = Router();

router.use(authenticate);

router.post("/confirm/:examId", uploadSubmission);
router.get("/exam/:examId/plagiarism", checkPlagiarism);
router.get("/exam/:examId", listSubmissionsByExam);
router.get("/:id", getSubmission);
router.delete("/:id", deleteSubmission);

export default router;
