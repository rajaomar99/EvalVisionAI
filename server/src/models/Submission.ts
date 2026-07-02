import mongoose, { Schema } from "mongoose";

// Interfaces
export interface IAnswer {
  questionIndex: number;
  extractedText: string;
  aiScore:       number | null;
  finalScore:    number | null;
  confidence:    number | null;
}

export interface ISubmission {
  studentName:      string;
  examId:           mongoose.Types.ObjectId;
  teacherId:        mongoose.Types.ObjectId;
  answers:          IAnswer[];
  totalAIScore:     number | null;
  totalFinalScore:  number | null;
  fileUrl:          string;
  utKey:            string;
  originalFileName: string;
  mimeType:         string;
  uploadDate:       Date | null;
  status:           "pending" | "graded" | "reviewed";
  createdAt:        Date;
  updatedAt:        Date;
}

// Schema
const answerSchema = new Schema<IAnswer>(
  {
    questionIndex: { type: Number, required: true },
    extractedText: { type: String, default: "" },
    aiScore:       { type: Number, default: null },
    finalScore:    { type: Number, default: null },
    confidence:    { type: Number, default: null },
  },
  { _id: false }
);

const submissionSchema = new Schema<ISubmission>(
  {
    studentName:      { type: String, required: [true, "Student name is required"], trim: true },
    examId:           { type: Schema.Types.ObjectId, ref: "Exam",  required: true, index: true },
    teacherId:        { type: Schema.Types.ObjectId, ref: "User",  required: true, index: true },
    answers:          { type: [answerSchema], default: [] },
    totalAIScore:     { type: Number, default: null },
    totalFinalScore:  { type: Number, default: null },
    fileUrl:          { type: String, required: [true, "File URL is required"] },
    utKey:            { type: String, required: [true, "UploadThing Key is required"] },
    originalFileName: { type: String, default: "" },
    mimeType:         { type: String, default: "" },
    uploadDate:       { type: Date,   default: null },
    status: {
      type: String,
      enum: { values: ["pending", "graded", "reviewed"] },
      default: "pending",
    },
  },
  { timestamps: true }
);

const Submission = mongoose.model<ISubmission>("Submission", submissionSchema);
export default Submission;
