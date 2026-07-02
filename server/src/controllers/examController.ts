import { Request, Response } from "express";
import Exam from "../models/Exam.js";
import Submission from "../models/Submission.js";
import Evaluation from "../models/Evaluation.js";
import { utapi } from "../utils/uploadthingApi.js";
import { handleError } from "../utils/handleError.js";
import { ForbiddenError, NotFoundError } from "../utils/errors.js";
import { createExamDto, examIdParamDto, updateExamDto } from "../schemas/exam.schema.js";

// Controllers

export const createExam = async (req: Request, res: Response) => {
  try {
    const { title, subject, questions, rubricFileUrl, rubricFileKey }: createExamDto = req.body;

    if (!req.user) throw new ForbiddenError("Not authenticated");

    const exam = await Exam.create({
      title,
      subject,
      questions,
      teacherId: req.user.id,
      rubricFileUrl,
      rubricFileKey,
    });

    return res.status(201).json({ exam });
  } catch (err) {
    return handleError(err, res, "createExam");
  }
};

export const listExams = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new ForbiddenError("Not authenticated");

    const filter = { teacherId: req.user.id };
    const exams = await Exam.find(filter).sort({ createdAt: -1 });

    const examIds = exams.map(e => e._id);
    const pendingCount = await Submission.countDocuments({
      examId: { $in: examIds },
      status: "pending"
    });

    return res.status(200).json({ count: exams.length, pendingCount, exams });
  } catch (err) {
    return handleError(err, res, "listExams");
  }
};

export const getExam = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new ForbiddenError("Not authenticated");

    const { examId } = req.params as examIdParamDto;
    const exam = await Exam.findById(examId);
    if (!exam) throw new NotFoundError("Exam");

    if (exam.teacherId.toString() !== req.user.id) {
      throw new ForbiddenError("Forbidden: not your exam");
    }

    return res.status(200).json({ exam });
  } catch (err) {
    return handleError(err, res, "getExam");
  }
};

export const updateExam = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new ForbiddenError("Not authenticated");

    const { title, subject, questions, rubricFileUrl, rubricFileKey }: updateExamDto = req.body;
    const { examId } = req.params as examIdParamDto;

    const exam = await Exam.findById(examId);
    if (!exam) throw new NotFoundError("Exam");

    if (exam.teacherId.toString() !== req.user.id) {
      throw new ForbiddenError("Forbidden: not your exam");
    }

    const updates: any = {};
    if (title !== undefined)     updates.title = title;
    if (subject !== undefined)   updates.subject = subject;
    if (questions !== undefined) updates.questions = questions;

    if (rubricFileUrl) {
      // Delete the old rubric from UploadThing if we're replacing it
      if (exam.rubricFileKey) {
        await utapi.deleteFiles(exam.rubricFileKey).catch((e: Error) =>
          console.error("[UT] Failed to delete old rubric:", e.message)
        );
      }
      updates.rubricFileUrl = rubricFileUrl;
      updates.rubricFileKey = rubricFileKey || "";
    }

    Object.assign(exam, updates);
    await exam.save();

    return res.status(200).json({ exam });
  } catch (err) {
    return handleError(err, res, "updateExam");
  }
};

export const deleteExam = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new ForbiddenError("Not authenticated");

    const { examId } = req.params as examIdParamDto;
    const exam = await Exam.findById(examId);
    if (!exam) throw new NotFoundError("Exam");

    if (exam.teacherId.toString() !== req.user.id) {
      throw new ForbiddenError("Forbidden: not your exam");
    }
    if (exam.rubricFileKey) {
      await utapi.deleteFiles(exam.rubricFileKey).catch((e: Error) =>
        console.error("[UT] Failed to delete rubric on exam delete:", e.message)
      );
    }

    const submissions = await Submission.find({ examId: exam._id });
    const utKeysToDelete = submissions.map(s => s.utKey).filter(key => key);
    
    if (utKeysToDelete.length > 0) {
      await utapi.deleteFiles(utKeysToDelete).catch((e: Error) =>
        console.error("[UT] Failed to delete submission files on exam delete:", e.message)
      );
    }

    await Evaluation.deleteMany({ examId: exam._id });

    await Submission.deleteMany({ examId: exam._id });

    await Exam.findByIdAndDelete(examId);
    
    return res.status(200).json({ message: "Exam deleted" });
  } catch (err) {
    return handleError(err, res, "deleteExam");
  }
};

export const getExamAnalytics = async (req: Request, res: Response) => {
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

    if (!submissions.length) {
      return res.status(200).json({
        totalSubmissions: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        distribution: [],
        questionPerformance: [],
      });
    }

    let totalScoreSum = 0;
    let highestScore = 0;
    let lowestScore = exam.totalMarks;

    const bins = [
      { name: "0-20%",   count: 0, min: 0,  max: 20  },
      { name: "21-40%",  count: 0, min: 21, max: 40  },
      { name: "41-60%",  count: 0, min: 41, max: 60  },
      { name: "61-80%",  count: 0, min: 61, max: 80  },
      { name: "81-100%", count: 0, min: 81, max: 100 },
    ];

    for (const sub of submissions) {
      const score = sub.totalAIScore || 0;
      totalScoreSum += score;
      if (score > highestScore) highestScore = score;
      if (score < lowestScore)  lowestScore = score;

      const percentage = exam.totalMarks ? (score / exam.totalMarks) * 100 : 0;
      const bin = bins.find((b) => percentage >= b.min && percentage <= b.max);
      if (bin) bin.count++;
    }

    const averageScore = Number((totalScoreSum / submissions.length).toFixed(2));
    const evaluations = await Evaluation.find({ examId: exam._id });

    const questionPerformance = exam.questions.map((q, idx) => {
      const criterionId = `q${idx + 1}`;
      let totalQuestionScore = 0;
      let count = 0;

      for (const ev of evaluations) {
        const criterion = ev.criteriaScores.find((c) => c.criterionId === criterionId);
        if (criterion) {
          totalQuestionScore += criterion.score || 0;
          count++;
        }
      }

      return {
        question:     `Q${idx + 1}`,
        averageScore: count > 0 ? Number((totalQuestionScore / count).toFixed(2)) : 0,
        maxScore:     q.maxMarks,
        percentage:   count > 0 ? Number(((totalQuestionScore / count / q.maxMarks) * 100).toFixed(1)) : 0,
      };
    });

    return res.status(200).json({
      totalSubmissions: submissions.length,
      averageScore,
      highestScore,
      lowestScore,
      distribution: bins,
      questionPerformance,
    });
  } catch (err) {
    return handleError(err, res, "getExamAnalytics");
  }
};
