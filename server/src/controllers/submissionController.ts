import { Request, Response } from "express";
import Exam from "../models/Exam.js";
import Submission from "../models/Submission.js";
import Evaluation from "../models/Evaluation.js";
import { utapi } from "../utils/uploadthingApi.js";
import { handleError } from "../utils/handleError.js";
import { ForbiddenError, NotFoundError } from "../utils/errors.js";
import { confirmSubmissionDto, submissionIdParamDto } from "../schemas/submission.schema.js";
import { examIdParamDto } from "../schemas/exam.schema.js";

// Similarity helper (Dice coefficient on word sets)
function similarity(text1: string, text2: string): number {
  const getWords = (t: string) => t.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const words1 = new Set(getWords(text1));
  const words2 = new Set(getWords(text2));

  if (words1.size < 10 || words2.size < 10) return 0;

  let intersectionCount = 0;
  for (const word of words1) {
    if (words2.has(word)) intersectionCount++;
  }
  return (2 * intersectionCount) / (words1.size + words2.size);
}

// Controllers

export const uploadSubmission = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new ForbiddenError("Not authenticated");

    const { examId } = req.params as examIdParamDto;
    const { studentName, fileUrl, utKey, originalFileName, mimeType }: confirmSubmissionDto = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) throw new NotFoundError("Exam");

    if (exam.teacherId.toString() !== req.user.id) {
      // Clean up the orphaned UploadThing file since we're rejecting the submission
      if (utKey) {
        await utapi.deleteFiles(utKey).catch((e: Error) =>
          console.error("[UT] Failed to delete orphaned file:", e.message)
        );
      }
      throw new ForbiddenError("Forbidden: you do not own this exam");
    }

    const submission = await Submission.create({
      studentName:      studentName,
      examId:           exam._id,
      teacherId:        req.user.id,
      fileUrl:          fileUrl,
      utKey:            utKey,
      originalFileName: originalFileName || "",
      mimeType:         mimeType || "",
      uploadDate:       new Date(),
      status:           "pending",
    });

    return res.status(201).json({
      submissionId:    submission._id,
      fileUrl:         submission.fileUrl,
      status:          submission.status,
    });
  } catch (err) {
    return handleError(err, res, "uploadSubmission");
  }
};

export const listSubmissionsByExam = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new ForbiddenError("Not authenticated");

    const { examId } = req.params as examIdParamDto;
    const exam = await Exam.findById(examId);
    if (!exam) throw new NotFoundError("Exam");

    if (exam.teacherId.toString() !== req.user.id) {
      throw new ForbiddenError("Forbidden: not your exam");
    }

    const submissions = await Submission.find({ examId: exam._id }).sort({ createdAt: -1 });
    return res.status(200).json({ count: submissions.length, submissions });
  } catch (err) {
    return handleError(err, res, "listSubmissionsByExam");
  }
};

export const getSubmission = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new ForbiddenError("Not authenticated");

    const { submissionId } = req.params as submissionIdParamDto;
    const submission = await Submission.findById(submissionId);
    if (!submission) throw new NotFoundError("Submission");

    if (submission.teacherId.toString() !== req.user.id) {
      throw new ForbiddenError("Forbidden: not your submission");
    }

    return res.status(200).json({ submission });
  } catch (err) {
    return handleError(err, res, "getSubmission");
  }
};

export const checkPlagiarism = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new ForbiddenError("Not authenticated");

    const { examId } = req.params as examIdParamDto;
    const exam = await Exam.findById(examId);
    if (!exam) throw new NotFoundError("Exam");

    if (exam.teacherId.toString() !== req.user.id) {
      throw new ForbiddenError("Forbidden: not your exam");
    }

    const submissions = await Submission.find({
      examId: exam._id,
      status: { $in: ["graded", "reviewed"] },
    });

    if (submissions.length < 2) {
      return res.status(200).json({
        message: "Not enough submissions to perform plagiarism check",
        flagged: [],
      });
    }

    const submissionIds = submissions.map((s) => s._id);
    const evaluations = await Evaluation.find({
      submissionId: { $in: submissionIds },
    });

    // Build text lookup per submission
    const textLookup: Record<string, { name: string; text: string }> = {};
    for (const sub of submissions) {
      const evalDoc = evaluations.find(
        (e) => e.submissionId.toString() === sub._id.toString()
      );
      let text = evalDoc?.extractedText || "";
      if (!text && sub.answers) {
        text = sub.answers.map((a) => a.extractedText || "").join(" ");
      }
      textLookup[sub._id.toString()] = { name: sub.studentName, text };
    }

    const flagged: Array<{ studentA: string; studentB: string; similarityPercentage: number }> = [];
    const THRESHOLD = 0.5;

    for (let i = 0; i < submissions.length; i++) {
      for (let j = i + 1; j < submissions.length; j++) {
        const id1 = submissions[i]._id.toString();
        const id2 = submissions[j]._id.toString();
        const t1 = textLookup[id1];
        const t2 = textLookup[id2];

        if (t1.text.length < 50 || t2.text.length < 50) continue;

        const sim = similarity(t1.text, t2.text);
        if (sim >= THRESHOLD) {
          flagged.push({
            studentA: t1.name,
            studentB: t2.name,
            similarityPercentage: Math.round(sim * 100),
          });
        }
      }
    }

    flagged.sort((a, b) => b.similarityPercentage - a.similarityPercentage);
    return res.status(200).json({ flagged });
  } catch (err) {
    return handleError(err, res, "checkPlagiarism");
  }
};

export const deleteSubmission = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new ForbiddenError("Not authenticated");

    const { submissionId } = req.params as submissionIdParamDto;
    const submission = await Submission.findById(submissionId);
    if (!submission) throw new NotFoundError("Submission");

    if (submission.teacherId.toString() !== req.user.id) {
      throw new ForbiddenError("Forbidden: not your submission");
    }

    if (submission.utKey) {
      await utapi.deleteFiles(submission.utKey).catch((e: Error) =>
        console.error("[UT] Failed to delete submission image on delete:", e.message)
      );
    }

    await Evaluation.findOneAndDelete({ submissionId: submission._id });

    await Submission.findByIdAndDelete(submission._id);

    return res.status(200).json({ message: "Submission deleted successfully" });
  } catch (err) {
    return handleError(err, res, "deleteSubmission");
  }
};
