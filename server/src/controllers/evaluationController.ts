import { Request, Response } from "express";
import Submission from "../models/Submission.js";
import Evaluation from "../models/Evaluation.js";
import { handleError } from "../utils/handleError.js";
import { ForbiddenError, NotFoundError } from "../utils/errors.js";

// Controllers

export const getEvaluationBySubmission = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new ForbiddenError("Not authenticated");
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) throw new NotFoundError("Submission");

    if (submission.teacherId.toString() !== req.user.id) {
      throw new ForbiddenError("Forbidden: not your submission");
    }

    const evaluation = await Evaluation.findOne({
      submissionId: req.params.submissionId,
    });

    if (!evaluation) throw new NotFoundError("AI evaluation for this submission");

    return res.status(200).json({ evaluation });
  } catch (err) {
    return handleError(err, res, "getEvaluationBySubmission");
  }
};

export const getEvaluationsByExam = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new ForbiddenError("Not authenticated");
    const evaluations = await Evaluation.find({
      examId: req.params.examId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({ count: evaluations.length, evaluations });
  } catch (err) {
    return handleError(err, res, "getEvaluationsByExam");
  }
};

export const updateEvaluation = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new ForbiddenError("Not authenticated");
    const { criteriaScores, overallFeedback, totalScore } = req.body as Record<string, any>;
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId);
    if (!submission) throw new NotFoundError("Submission");

    if (submission.teacherId.toString() !== req.user.id) {
      throw new ForbiddenError("Forbidden: not your submission");
    }

    const evaluation = await Evaluation.findOne({ submissionId });
    if (!evaluation) throw new NotFoundError("Evaluation");

    const updates: any = {};
    if (criteriaScores !== undefined) {
      updates.criteriaScores = criteriaScores;
      updates.totalScore = criteriaScores.reduce((sum: number, item: any) => sum + (Number(item.score) || 0), 0);
    } else if (totalScore !== undefined) {
      updates.totalScore = totalScore;
    }
    if (overallFeedback !== undefined) updates.overallFeedback = overallFeedback;

    Object.assign(evaluation, updates);
    await evaluation.save();

    await Submission.findByIdAndUpdate(submissionId, {
      totalAIScore: evaluation.totalScore,
      status: "reviewed",
    });

    return res.status(200).json({ evaluation });
  } catch (err) {
    return handleError(err, res, "updateEvaluation");
  }
};
