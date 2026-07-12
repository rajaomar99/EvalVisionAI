import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { createExam, getExam, updateExam } from "../../services/examApi";
import { useUploadThing } from "../../lib/uploadthing";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { CreateExamSchema } from "../../schemas/exam.schema";

type CreateExamFormValues = z.infer<typeof CreateExamSchema>;

const emptyQuestion = () => ({
  questionText: "",
  maxMarks:     1,
  type:         "subjective" as const,
});

export default function CreateExamPage() {
  const { examId } = useParams<{ examId?: string }>();
  const navigate   = useNavigate();
  const isEdit     = !!examId;

  // External state: upload lifecycle (outside RHF's responsibility)
  const [fetching, setFetching]             = useState(isEdit);
  const [uploadingRubric, setUploadingRubric] = useState(false);
  const [rubricUploadError, setRubricUploadError] = useState("");
  const [rubricFile, setRubricFile]         = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateExamFormValues>({
    resolver: zodResolver(CreateExamSchema),
    mode: "onChange",
    defaultValues: {
      title:         "",
      subject:       "",
      questions:     [emptyQuestion()],
      rubricFileUrl: "",
      rubricFileKey: "",
    },
  });

  // useFieldArray replaces manual addQuestion / removeQuestion / updateQuestion
  const { fields, append, remove } = useFieldArray({ control, name: "questions" });

  // Watch rubricFileUrl so we can show the success status in the UI
  const rubricFileUrl = watch("rubricFileUrl");

  // Pre-fill form when editing
  useEffect(() => {
    if (!isEdit || !examId) return;
    async function fetchExam() {
      try {
        const { exam } = await getExam(examId!);
        reset({
          title:         exam.title,
          subject:       exam.subject ?? "",
          questions:     exam.questions.map((q) => ({
            questionText: q.questionText,
            maxMarks:     q.maxMarks,
            type:         (q.type ?? "subjective") as "subjective" | "mcq",
          })),
          rubricFileUrl: exam.rubricFileUrl,
          rubricFileKey: exam.rubricFileKey,
        });
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } };
        toast.error(e.response?.data?.message ?? "Failed to load exam");
      } finally {
        setFetching(false);
      }
    }
    fetchExam();
  }, [examId, isEdit, reset]);

  // UploadThing hook - syncs result into RHF via setValue
  const { startUpload } = useUploadThing("rubricUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        setValue("rubricFileUrl", res[0].ufsUrl, { shouldValidate: true });
        setValue("rubricFileKey", res[0].key);
        setRubricUploadError("");
      }
      setUploadingRubric(false);
    },
    onUploadError: (err) => {
      setRubricUploadError(`Upload failed: ${err.message}`);
      setUploadingRubric(false);
    },
  });

  // File selected -> immediately upload
  async function handleRubricChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRubricFile(file);
    setValue("rubricFileUrl", "", { shouldValidate: false });
    setValue("rubricFileKey", "");
    setRubricUploadError("");
    setUploadingRubric(true);
    await startUpload([file]);
  }

  async function onSubmit(data: CreateExamFormValues) {
    if (uploadingRubric) {
      toast.error("Please wait for the rubric file to finish uploading.");
      return;
    }
    try {
      const payload = {
        title:         data.title,
        subject:       data.subject,
        questions:     data.questions,
        rubricFileUrl: data.rubricFileUrl,
        rubricFileKey: data.rubricFileKey,
      };

      if (isEdit) {
        await updateExam(examId!, payload);
        toast.success("Exam updated successfully!");
        navigate(`/exams/${examId}`);
      } else {
        const { exam } = await createExam(payload);
        toast.success("Exam created successfully!");
        navigate(`/exams/${exam.id}`);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? "Failed to save exam");
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic info */}
        <div className="rounded-sm border border-zinc-200 bg-white p-6 space-y-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Exam Details</h3>

          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-800">Title *</label>
            <input
              type="text"
              {...register("title")}
              className="w-full rounded-sm border border-zinc-300 px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 outline-none transition"
              placeholder="Midterm Exam"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-800">Subject</label>
            <input
              type="text"
              {...register("subject")}
              className="w-full rounded-sm border border-zinc-300 px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 outline-none transition"
              placeholder="Physics, Math, English…"
            />
            {errors.subject && (
              <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>
            )}
          </div>

          {/* Rubric upload */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-800">
              Rubric / Grading Instructions (Document) {!isEdit && "*"}
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleRubricChange}
              disabled={uploadingRubric}
              className="w-full rounded-sm border border-zinc-300 px-3 py-2.5 text-sm file:mr-4 file:rounded-sm file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-zinc-900 hover:file:bg-zinc-100 disabled:opacity-60"
            />
            {uploadingRubric && (
              <div className="mt-2 flex items-center gap-2 text-sm text-zinc-900">
                <LoadingSpinner size="sm" /><span>Uploading…</span>
              </div>
            )}
            {rubricUploadError && (
              <p className="mt-1 text-xs text-red-500">{rubricUploadError}</p>
            )}
            {rubricFileUrl && !uploadingRubric && (
              <p className="mt-1 text-xs text-zinc-900">
                Rubric uploaded successfully{isEdit && " (replaces existing)"}
              </p>
            )}
            {isEdit && !rubricFile && (
              <p className="mt-1 text-xs text-zinc-500">Leave blank to keep the existing rubric file.</p>
            )}
            {/* Zod field error for rubricFileUrl (e.g. submitted without uploading) */}
            {errors.rubricFileUrl && !uploadingRubric && !rubricFileUrl && (
              <p className="mt-1 text-xs text-red-500">{errors.rubricFileUrl.message}</p>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Questions ({fields.length})
            </h3>
            <button
              type="button"
              onClick={() => append(emptyQuestion())}
              className="inline-flex items-center gap-1 rounded-sm bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-200"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Question
            </button>
          </div>

          {fields.map((field, idx) => (
            <div key={field.id} className="rounded-sm border border-zinc-200 bg-white p-5 space-y-4">
              <div className="flex items-start justify-between">
                <span className="rounded-full bg-zinc-100 px-3 py-0.5 text-xs font-bold text-zinc-500">Q{idx + 1}</span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="text-sm text-zinc-500 hover:text-zinc-800 transition"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Question Text */}
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-800">Question Text *</label>
                <textarea
                  rows={2}
                  {...register(`questions.${idx}.questionText`)}
                  className="w-full rounded-sm border border-zinc-300 px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 outline-none transition resize-y"
                  placeholder="Enter the question…"
                />
                {errors.questions?.[idx]?.questionText && (
                  <p className="mt-1 text-xs text-red-500">{errors.questions[idx].questionText.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Max Marks */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-800">Max Marks *</label>
                  <input
                    type="number"
                    min={1}
                    {...register(`questions.${idx}.maxMarks`, { valueAsNumber: true })}
                    className="w-full rounded-sm border border-zinc-300 px-3 py-2.5 text-sm focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 outline-none transition"
                  />
                  {errors.questions?.[idx]?.maxMarks && (
                    <p className="mt-1 text-xs text-red-500">{errors.questions[idx].maxMarks.message}</p>
                  )}
                </div>

                {/* Type */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-800">Type</label>
                  <select
                    {...register(`questions.${idx}.type`)}
                    className="w-full rounded-sm border border-zinc-300 px-3 py-2.5 text-sm focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 outline-none transition"
                  >
                    <option value="subjective">Subjective</option>
                    <option value="mcq">MCQ</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          {/* Array-level error (e.g. no questions added) */}
          {errors.questions?.root && (
            <p className="text-xs text-red-500">{errors.questions.root.message}</p>
          )}
          {errors.questions?.message && (
            <p className="text-xs text-red-500">{errors.questions.message}</p>
          )}
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
            type="submit"
            disabled={isSubmitting || uploadingRubric}
            className="inline-flex items-center gap-2 rounded-sm bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {isSubmitting
              ? (isEdit ? "Saving…" : "Creating…")
              : (isEdit ? "Save Changes" : "Create Exam")}
          </button>
        </div>
      </form>
    </div>
  );
}
