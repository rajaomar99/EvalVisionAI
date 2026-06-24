import type { SubmissionStatus } from "../../types/index";

interface StatusBadgeProps {
  status: SubmissionStatus | string; // string fallback for unknown values
}

const styles: Record<string, string> = {
  pending:    "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  graded:     "bg-teal-100 text-teal-700",
  reviewed:   "bg-sky-100 text-sky-700",
  failed:     "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        styles[status] ?? "bg-zinc-100 text-zinc-600"
      }`}
    >
      {status}
    </span>
  );
}
