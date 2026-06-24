import { Request, Response } from "express";
import Submission from "../models/Submission.js";
import Exam from "../models/Exam.js";
import Evaluation from "../models/Evaluation.js";
import { gradeWithAI } from "../utils/aiGrading.js";
import { handleError } from "../utils/handleError.js";
import { ForbiddenError, NotFoundError, ValidationError } from "../utils/errors.js";

// Controllers

export const gradeSubmission = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new ForbiddenError("Not authenticated");
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId);
    if (!submission) throw new NotFoundError("Submission");

    if (submission.teacherId.toString() !== req.user.id) {
      throw new ForbiddenError("Forbidden: you do not own this submission");
    }

    const exam = await Exam.findById(submission.examId);
    if (!exam) throw new NotFoundError("Exam linked to this submission");

    if (!submission.fileUrl) {
      throw new ValidationError("Submission has no file - cannot grade");
    }


    let aiResponse: any;
    try {
      aiResponse = await gradeWithAI({
        fileUrl:       submission.fileUrl,
        mimeType:      submission.mimeType,
        rubricFileUrl: exam.rubricFile,
        questions:     exam.questions,
        assignmentTitle: exam.title,
        courseName:    exam.subject,
      });
    } catch (err: unknown) {
      const aiErr = err as any;
      const detail = aiErr.response?.data?.detail || aiErr.message || "AI service error";
      const status = aiErr.response?.status || 502;
      const newErr = new Error(`AI grading failed: ${detail}`) as Error & { statusCode?: number };
      newErr.statusCode = status;
      throw newErr;
    }

    if (!aiResponse?.success || !aiResponse?.evaluation) {
      const err = new Error("AI service returned an invalid response") as Error & { statusCode?: number };
      err.statusCode = 502;
      throw err;
    }

    const { evaluation: evalData, extractedText } = aiResponse;

    const evaluation = await Evaluation.findOneAndUpdate(
      { submissionId: submission._id },
      {
        submissionId:    submission._id,
        examId:          exam._id,
        criteriaScores:  evalData.criteriaScores || [],
        overallFeedback: evalData.overallFeedback || "",
        totalScore:      evalData.totalScore ?? 0,
        extractedText:   extractedText || "",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const updatedAnswers = evalData.criteriaScores?.length
      ? exam.questions.map((q, idx) => {
          const criterionId = `q${idx}`;
          const match = evalData.criteriaScores.find((cs: any) => cs.criterionId === criterionId);
          return {
            questionIndex: idx,
            extractedText: submission.answers[idx]?.extractedText || extractedText || "",
            aiScore:       match?.score ?? null,
            finalScore:    submission.answers[idx]?.finalScore ?? null,
            confidence:    null,
          };
        })
      : submission.answers;

    await Submission.findByIdAndUpdate(submissionId, {
      totalAIScore: evalData.totalScore ?? 0,
      status:       "graded",
      answers:      updatedAnswers,
    });

    return res.status(200).json({ message: "AI grading completed", evaluation });
  } catch (err) {
    return handleError(err, res, "gradeSubmission");
  }
};
