import StatusBadge from "../common/StatusBadge";
import type { Submission } from "../../types/index";
import { Trash2 } from "lucide-react";

interface SubmissionCardProps {
  submission:   Submission;
  isLoading:    boolean;
  onGrade:      (submissionId: string) => void;
  onViewResult: (submissionId: string) => void;
  onDelete?:    (submissionId: string) => void;
}

export default function SubmissionCard({
  submission,
  isLoading,
  onGrade,
  onViewResult,
  onDelete,
}: SubmissionCardProps) {
  const isGraded = submission.status === "graded" || submission.status === "reviewed";

  return (
    <div className="rounded-sm border border-zinc-200 bg-white p-5  transition hover:border-zinc-300 hover:">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-semibold text-zinc-900">
            {submission.studentName}
          </h4>
          <p className="mt-1 text-xs text-zinc-400">
            {submission.originalFileName || "No file"} ·{" "}
            {new Date(submission.createdAt).toLocaleDateString()}
          </p>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      {/* Score preview */}
      {submission.totalAIScore != null && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-500">AI Score:</span>
          <span className="text-sm font-bold text-zinc-900">
            {submission.totalAIScore}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {!isGraded && (
          <button
            onClick={() => onGrade(submission.id)}
            disabled={isLoading}
            className="flex-1 rounded-sm bg-zinc-900 py-2 text-center text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Grading…
              </span>
            ) : (
              "Grade with AI"
            )}
          </button>
        )}
        {isGraded && (
          <button
            onClick={() => onViewResult(submission.id)}
            className="flex-1 rounded-sm bg-zinc-50 py-2 text-center text-xs font-semibold text-zinc-800 transition hover:bg-zinc-100"
          >
            View Result
          </button>
        )}
        <button
          onClick={() => onViewResult(submission.id)}
          className="rounded-sm border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
        >
          Details
        </button>
        {onDelete && (
          <button
            onClick={() => onDelete(submission.id)}
            disabled={isLoading}
            className="flex items-center justify-center rounded-sm border border-zinc-200 px-3 py-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50"
            title="Delete submission"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
