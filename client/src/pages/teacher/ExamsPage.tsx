import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listExams, deleteExam } from "../../services/examApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ConfirmModal from "../../components/common/ConfirmModal";
import type { Exam } from "../../types/index";

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  async function fetchExams() {
    try {
      setLoading(true);
      const { exams: data } = await listExams();
      setExams(data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Failed to load exams");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchExams(); }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteExam(deleteTarget);
      setExams((prev) => prev.filter((e) => e.id !== deleteTarget));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Delete failed");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Exams</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Manage your exams, define questions, and rubrics
          </p>
        </div>
        <Link
          to="/exams/new"
          className="inline-flex items-center gap-2 rounded-sm bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Exam
        </Link>
      </div>

      {error && (
        <div className="rounded-sm border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800">{error}</div>
      )}

      {loading && <LoadingSpinner className="py-20" />}

      {!loading && exams.length === 0 && (
        <EmptyState
          icon={
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
          title="No exams yet"
          description="Create your first exam to start grading student submissions with AI."
          action={
            <Link to="/exams/new" className="inline-flex items-center gap-2 rounded-sm bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800">
              Create Exam
            </Link>
          }
        />
      )}

      {!loading && exams.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <div key={exam.id} className="group relative rounded-sm border border-zinc-200 bg-white p-5  transition hover:border-zinc-300 hover:">
              <Link to={`/exams/${exam.id}`} className="block">
                <div className="mb-3 flex items-start justify-between">
                  <div className="rounded-sm bg-zinc-100 p-2 text-zinc-900">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-3 py-0.5 text-xs font-semibold text-zinc-600">
                    {exam.totalMarks} marks
                  </span>
                </div>
                <h3 className="font-semibold text-zinc-900 group-hover:text-zinc-900">{exam.title}</h3>
                <p className="mt-1 text-xs text-zinc-400">
                  {exam.subject || "No subject"} · {exam.questions?.length ?? 0} questions
                </p>
                <p className="mt-2 text-xs text-zinc-400">
                  Created {new Date(exam.createdAt).toLocaleDateString()}
                </p>
              </Link>
              <div className="mt-4 flex gap-2 border-t border-zinc-200 pt-3">
                <Link to={`/exams/${exam.id}`} className="flex-1 rounded-sm bg-zinc-100 py-1.5 text-center text-xs font-medium text-zinc-900 transition hover:bg-zinc-200">View</Link>
                <Link to={`/exams/${exam.id}/edit`} className="flex-1 rounded-sm bg-zinc-50 py-1.5 text-center text-xs font-medium text-zinc-600 transition hover:bg-zinc-100">Edit</Link>
                <button
                  onClick={(e: React.MouseEvent) => { e.preventDefault(); setDeleteTarget(exam.id); }}
                  className="flex-1 rounded-sm bg-zinc-50 py-1.5 text-center text-xs font-medium text-zinc-900 transition hover:bg-zinc-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Exam"
        message="Are you sure? This will permanently delete this exam and cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
