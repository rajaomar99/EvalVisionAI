import mongoose, { Schema, HydratedDocument } from "mongoose";

// Interfaces
export interface ICriterionScore {
  criterionId: string;
  score:       number;
  feedback:    string;
}

export interface IEvaluation {
  submissionId:    mongoose.Types.ObjectId;
  examId:          mongoose.Types.ObjectId;
  criteriaScores:  ICriterionScore[];
  overallFeedback: string;
  totalScore:      number;
  extractedText:   string;
  createdAt:       Date;
  updatedAt:       Date;
}

export type EvaluationDocument = HydratedDocument<IEvaluation>;

// Schema
const criterionScoreSchema = new Schema<ICriterionScore>(
  {
    criterionId: { type: String, required: true },
    score:       { type: Number, required: true, default: 0 },
    feedback:    { type: String, default: "" },
  },
  { _id: false }
);

const evaluationSchema = new Schema<IEvaluation>(
  {
    submissionId: { type: Schema.Types.ObjectId, ref: "Submission", required: true, index: true },
    examId:       { type: Schema.Types.ObjectId, ref: "Exam",       required: true, index: true },
    criteriaScores:  { type: [criterionScoreSchema], default: [] },
    overallFeedback: { type: String, default: "" },
    totalScore:      { type: Number, default: 0 },
    extractedText:   { type: String, default: "" },
  },
  { timestamps: true }
);

evaluationSchema.index({ submissionId: 1 }, { unique: true });

const Evaluation = mongoose.model<IEvaluation>("Evaluation", evaluationSchema);
export default Evaluation;
