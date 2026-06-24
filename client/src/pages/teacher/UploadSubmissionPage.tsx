import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { confirmSubmission } from "../../services/submissionApi";
import { useUploadThing } from "../../lib/uploadthing";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Uploaded file metadata returned by UploadThing's onClientUploadComplete callback
interface UploadedFile {
  url:  string;
  key:  string;
  name: string;
  type: string;
}

export default function UploadSubmissionPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate   = useNavigate();

  const [studentName, setStudentName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  // UploadThing hook
  const { startUpload } = useUploadThing("submissionUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        setUploadedFile({
          url:  res[0].ufsUrl,
          key:  res[0].key,
          name: res[0].name,
          type: file?.type ?? "",
        });
        setError("");
      }
      setUploading(false);
    },
    onUploadError: (err) => {
      setError(`Upload failed: ${err.message}`);
      setUploading(false);
    },
  });

  // File selection -> immediate cloud upload
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setUploadedFile(null);
    setError("");
    setUploading(true);
    await startUpload([selected]);
  }

  // Final submission confirm
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!uploadedFile) {
      setError("Please select and wait for a file to finish uploading.");
      return;
    }
    if (uploading) {
      setError("Please wait for the file to finish uploading.");
      return;
    }

    try {
      setError("");
      setConfirming(true);

      await confirmSubmission(examId!, {
        studentName,
        fileUrl:          uploadedFile.url,
        utKey:            uploadedFile.key,
        originalFileName: uploadedFile.name || file?.name || "",
        mimeType:         uploadedFile.type || file?.type || "",
      });

      navigate(`/exams/${examId}/submissions`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(
        e.response?.data?.message ?? "Failed to confirm submission. Please try again."
      );
    } finally {
      setConfirming(false);
    }
  }

  const isSubmitting = uploading || confirming;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(`/exams/${examId}`)}
          className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-zinc-900 hover:text-zinc-900"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Exam
        </button>
        <h2 className="text-2xl font-bold text-zinc-900">Upload Answer Sheet</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Upload a scanned PDF or image of the student's work for AI grading.
        </p>
      </div>

      {error && (
        <div className="rounded-sm border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-sm border border-zinc-200 bg-white p-6  space-y-5"
      >
        {/* Student name */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-800">
            Student Name *
          </label>
          <input
            type="text"
            required
            value={studentName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStudentName(e.target.value)}
            className="w-full rounded-sm border border-zinc-300 px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 outline-none transition"
            placeholder="John Doe"
          />
        </div>

        {/* File drop zone */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-800">
            Answer Sheet (PDF, JPG, PNG) *
          </label>
          <div className="mt-1">
            <label
              htmlFor="file-upload"
              className={`flex cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed px-6 py-10 transition ${
                uploadedFile
                  ? "border-zinc-400 bg-zinc-50/40"
                  : uploading
                  ? "border-zinc-300 bg-zinc-100/30"
                  : "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-100/30"
              }`}
            >
              <svg
                className={`mb-3 h-10 w-10 ${uploadedFile ? "text-zinc-500" : uploading ? "text-zinc-500" : "text-zinc-400"}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>

              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <p className="text-sm font-medium text-zinc-900">Uploading…</p>
                  <p className="text-xs text-zinc-400">{file?.name}</p>
                </div>
              ) : uploadedFile ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-zinc-800">Upload complete</p>
                  <p className="mt-1 text-sm text-zinc-600">{uploadedFile.name}</p>
                  <p className="mt-0.5 text-xs text-zinc-400">Click to replace</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium text-zinc-600">Click to upload or drag &amp; drop</p>
                  <p className="mt-1 text-xs text-zinc-400">PDF, JPG, PNG up to 16 MB</p>
                </div>
              )}

              <input
                id="file-upload"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="sr-only"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/exams/${examId}`)}
            className="rounded-sm border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !uploadedFile}
            className="inline-flex items-center gap-2 rounded-sm bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {confirming ? (
              <><LoadingSpinner size="sm" /> Saving…</>
            ) : uploading ? (
              <><LoadingSpinner size="sm" /> Uploading…</>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Submit
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
