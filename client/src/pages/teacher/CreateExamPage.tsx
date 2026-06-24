import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createExam, getExam, updateExam } from "../../services/examApi";
import { useUploadThing } from "../../lib/uploadthing";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import type { QuestionInput } from "../../types/index";

type QuestionType = "subjective" | "mcq";

interface QuestionDraft extends QuestionInput {
  type: QuestionType;
}

const emptyQuestion = (): QuestionDraft => ({
  questionText: "",
  maxMarks:     1,
  type:         "subjective",
});

export default function CreateExamPage() {
  const { examId } = useParams<{ examId?: string }>(); // present when editing
  const navigate   = useNavigate();
  const isEdit     = !!examId;
  
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [rubricFile, setRubricFile] = useState<File | null>(null);
  const [rubricFileUrl, setRubricFileUrl] = useState(""); // URL returned by UploadThing
  const [rubricFileKey, setRubricFileKey] = useState(""); // Key returned by UploadThing
  const [uploadingRubric, setUploadingRubric] = useState(false);
  const [rubricUploadError, setRubricUploadError] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState("");

  // UploadThing hook
  const { startUpload } = useUploadThing("rubricUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        setRubricFileUrl(res[0].ufsUrl);
        setRubricFileKey(res[0].key);
        setRubricUploadError("");
      }
      setUploadingRubric(false);
    },
    onUploadError: (err) => {
      setRubricUploadError(`Upload failed: ${err.message}`);
      setUploadingRubric(false);
    },
  });

  // Pre-fill when editing
  useEffect(() => {
    if (!isEdit || !examId) return;
    getExam(examId)
      .then(({ exam }) => {
        setTitle(exam.title);
        setSubject(exam.subject ?? "");
        setQuestions(
          exam.questions.map((q) => ({
            questionText: q.questionText,
            maxMarks:     q.maxMarks,
            type:         (q.type ?? "subjective") as QuestionType,
          }))
        );
        if (exam.rubricFile)    setRubricFileUrl(exam.rubricFile);
        if (exam.rubricFileKey) setRubricFileKey(exam.rubricFileKey);
      })
      .catch((err: unknown) => {
        const e = err as { response?: { data?: { message?: string } } };
        setError(e.response?.data?.message ?? "Failed to load exam");
      })
      .finally(() => setFetching(false));
  }, [examId, isEdit]);

  // Question helpers
  function updateQuestion(index: number, field: keyof QuestionDraft, value: string | number) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  // File selection -> immediate upload
  async function handleRubricChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRubricFile(file);
    setRubricFileUrl("");
    setRubricFileKey("");
    setRubricUploadError("");
    setUploadingRubric(true);
    await startUpload([file]);
  }

  // Submit
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setError("");

      if (!rubricFileUrl) {
        setError(
          isEdit
            ? "Please upload a rubric file (or keep the existing one)."
            : "Please upload a rubric file before submitting."
        );
        return;
      }
      if (uploadingRubric) {
        setError("Please wait for the rubric file to finish uploading.");
        return;
      }

      setLoading(true);

      const payload = { title, subject, questions, rubricFileUrl, rubricFileKey };

      if (isEdit) {
        await updateExam(examId!, payload);
        navigate(`/exams/${examId}`);
      } else {
        const { exam } = await createExam(payload);
        navigate(`/exams/${exam.id}`);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Failed to save exam");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <LoadingSpinner className="py-20" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <button
          onClick={() => navigate(isEdit ? `/exams/${examId}` : "/exams")}
          className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-zinc-900 hover:text-zinc-900"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>
        <h2 className="text-2xl font-bold text-zinc-900">{isEdit ? "Edit Exam" : "Create New Exam"}</h2>
        <p className="mt-1 text-sm text-zinc-500">
          {isEdit ? "Update the exam details and questions below." : "Define the exam structure, questions, and grading rubric."}
        </p>
      </div>

      {error && (
        <div className="rounded-sm border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic info */}
        <div className="rounded-sm border border-zinc-200 bg-white p-6  space-y-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Exam Details</h3>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-800">Title *</label>
            <input
              type="text" required value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              className="w-full rounded-sm border border-zinc-300 px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 outline-none transition"
              placeholder="Midterm Exam"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-800">Subject</label>
            <input
              type="text" value={subject}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
              className="w-full rounded-sm border border-zinc-300 px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 outline-none transition"
              placeholder="Physics, Math, English…"
            />
          </div>

          {/* Rubric upload */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-800">
              Rubric / Grading Instructions (Document) {!isEdit && "*"}
            </label>
            <input
              type="file" accept=".pdf,.doc,.docx,.txt"
              onChange={handleRubricChange}
              disabled={uploadingRubric}
              className="w-full rounded-sm border border-zinc-300 px-3 py-2.5 text-sm file:mr-4 file:rounded-sm file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-zinc-900 hover:file:bg-zinc-100 disabled:opacity-60"
            />
            {uploadingRubric && (
              <div className="mt-2 flex items-center gap-2 text-sm text-zinc-900">
                <LoadingSpinner size="sm" /><span>Uploading…</span>
              </div>
            )}
            {rubricUploadError && <p className="mt-1 text-xs text-zinc-900">{rubricUploadError}</p>}
            {rubricFileUrl && !uploadingRubric && (
              <p className="mt-1 text-xs text-zinc-900">
                Rubric uploaded successfully{isEdit && " (replaces existing)"}
              </p>
            )}
            {isEdit && !rubricFile && (
              <p className="mt-1 text-xs text-zinc-500">Leave blank to keep the existing rubric file.</p>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Questions ({questions.length})
            </h3>
            <button
              type="button" onClick={addQuestion}
              className="inline-flex items-center gap-1 rounded-sm bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-200"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Question
            </button>
          </div>

          {questions.map((q, idx) => (
            <div key={idx} className="rounded-sm border border-zinc-200 bg-white p-5  space-y-4">
              <div className="flex items-start justify-between">
                <span className="rounded-full bg-zinc-100 px-3 py-0.5 text-xs font-bold text-zinc-500">Q{idx + 1}</span>
                {questions.length > 1 && (
                  <button
                    type="button" onClick={() => removeQuestion(idx)}
                    className="text-sm text-zinc-500 hover:text-zinc-800 transition"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-800">Question Text *</label>
                <textarea
                  rows={2} required value={q.questionText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    updateQuestion(idx, "questionText", e.target.value)
                  }
                  className="w-full rounded-sm border border-zinc-300 px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 outline-none transition resize-y"
                  placeholder="Enter the question…"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-800">Max Marks *</label>
                  <input
                    type="number" required min={1} value={q.maxMarks}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateQuestion(idx, "maxMarks", Number(e.target.value))
                    }
                    className="w-full rounded-sm border border-zinc-300 px-3 py-2.5 text-sm focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 outline-none transition"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-800">Type</label>
                  <select
                    value={q.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      updateQuestion(idx, "type", e.target.value)
                    }
                    className="w-full rounded-sm border border-zinc-300 px-3 py-2.5 text-sm focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 outline-none transition"
                  >
                    <option value="subjective">Subjective</option>
                    <option value="mcq">MCQ</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(isEdit ? `/exams/${examId}` : "/exams")}
            className="rounded-sm border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="submit" disabled={loading || uploadingRubric}
            className="inline-flex items-center gap-2 rounded-sm bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save Changes" : "Create Exam")}
          </button>
        </div>
      </form>
    </div>
  );
}
