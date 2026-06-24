import React from "react";
import type { CriterionScore } from "../../types/index";

// Helpers
function scoreColor(score: number, max: number | undefined): string {
  if (!max) return "bg-zinc-100 text-zinc-800";
  const pct = score / max;
  if (pct >= 0.8) return "bg-zinc-100 text-zinc-800";
  if (pct >= 0.5) return "bg-zinc-100 text-zinc-800";
  return "bg-zinc-100 text-zinc-800";
}

function formatCriterionId(id: string): string {
  const match = String(id).match(/^q(\d+)$/i);
  if (match) return `Q${parseInt(match[1], 10) + 1}`;
  return id;
}

// Props
interface CriteriaScoreListProps {
  criteriaScores?:   CriterionScore[];
  maxScoreMap?:      Record<string, number>;
  isEditing?:        boolean;
  onScoreChange?:    (index: number, newScore: string) => void;
  onFeedbackChange?: (index: number, newFeedback: string) => void;
}

export default function CriteriaScoreList({
  criteriaScores = [],
  maxScoreMap = {},
  isEditing = false,
  onScoreChange = () => {},
  onFeedbackChange = () => {},
}: CriteriaScoreListProps) {
  if (!criteriaScores.length) {
    return (
      <p className="text-sm text-zinc-400 italic">
        No criteria scores available.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {criteriaScores.map((cs, index) => {
        const max = maxScoreMap[cs.criterionId];
        return (
          <li
            key={cs.criterionId}
            className="rounded-sm border border-zinc-200 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-800">
                {formatCriterionId(cs.criterionId)}
              </span>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    className="w-20 rounded border border-zinc-300 p-1 text-sm font-semibold focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={cs.score}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onScoreChange(index, e.target.value)
                    }
                  />
                  {max != null && (
                    <span className="text-sm font-semibold text-zinc-500">/ {max}</span>
                  )}
                </div>
              ) : (
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-bold ${scoreColor(cs.score, max)}`}
                >
                  {cs.score}
                  {max != null ? ` / ${max}` : ""}
                </span>
              )}
            </div>

            {(cs.feedback || isEditing) &&
              (isEditing ? (
                <textarea
                  className="mt-2 text-sm leading-relaxed text-zinc-600 w-full rounded border border-zinc-300 p-2 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[60px]"
                  value={cs.feedback ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    onFeedbackChange(index, e.target.value)
                  }
                  placeholder="Provide feedback..."
                />
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {cs.feedback}
                </p>
              ))}
          </li>
        );
      })}
    </ul>
  );
}
