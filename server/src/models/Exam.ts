import mongoose, { Schema, HydratedDocument } from "mongoose";

// Interfaces
export interface IQuestion {
  questionText: string;
  maxMarks:     number;
  type:         "subjective" | "mcq";
}

export interface IExam {
  title:         string;
  subject:       string;
  teacherId:     mongoose.Types.ObjectId;
  totalMarks:    number;
  questions:     IQuestion[];
  rubricFile:    string;
  rubricFileKey: string;
  createdAt:     Date;
  updatedAt:     Date;
}

export type ExamDocument = HydratedDocument<IExam>;

// Schema
const questionSchema = new Schema<IQuestion>(
  {
    questionText: { type: String, required: [true, "Question text is required"] },
    maxMarks:     { type: Number, required: [true, "Max marks is required"], min: [1, "Max marks must be at least 1"] },
    type:         {
      type: String,
      enum: { values: ["subjective", "mcq"], message: "Type must be subjective or mcq" },
      default: "subjective",
    },
  },
  { _id: false }
);

const examSchema = new Schema<IExam>(
  {
    title:      { type: String, required: [true, "Title is required"], trim: true },
    subject:    { type: String, trim: true, default: "" },
    teacherId:  { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    totalMarks: { type: Number, default: 0 },
    questions:  {
      type: [questionSchema],
      validate: {
        validator: (arr: IQuestion[]) => arr.length > 0,
        message: "At least one question is required",
      },
    },
    rubricFile:    { type: String, default: "" },
    rubricFileKey: { type: String, default: "" },
  },
  { timestamps: true }
);

examSchema.pre("save", function (next) {
  if (this.isModified("questions")) {
    this.totalMarks = this.questions.reduce((sum, q) => sum + q.maxMarks, 0);
  }
  next();
});

const Exam = mongoose.model<IExam>("Exam", examSchema);
export default Exam;
