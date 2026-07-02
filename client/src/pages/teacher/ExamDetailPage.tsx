import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getExam, deleteExam, getExamAnalytics } from "../../services/examApi";
import { getSubmissionsByExam } from "../../services/submissionApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmModal from "../../components/common/ConfirmModal";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from "recharts";
import type { Exam, Submission, ExamAnalytics } from "../../types/index";

export default function ExamDetailPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate   = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [analytics, setAnalytics] = useState<ExamAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [examRes, subRes, analyticsRes] = await Promise.all([
          getExam(examId!),
          getSubmissionsByExam(examId!).catch(() => ({ count: 0, submissions: [] })),
          getExamAnalytics(examId!).catch(() => null),
        ]);
        setExam(examRes.exam);
        setSubmissions(subRes.submissions ?? []);
        if (analyticsRes) setAnalytics(analyticsRes);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } };
        setError(e.response?.data?.message ?? "Failed to load exam");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [examId]);

  async function handleDelete() {
    try {
      await deleteExam(examId!);
      navigate("/exams");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Delete failed");
      setShowDelete(false);
    }
  }

  function handleDownloadRubric() {
    if (!exam?.rubricFileUrl) {
      alert("No rubric file is attached to this exam.");
      return;
    }
    window.open(exam.rubricFileUrl, "_blank", "noopener,noreferrer");
  }

  if (loading) return <LoadingSpinner className="py-20" />;

  if (error && !exam) {
    return (
      <div className="rounded-sm border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800">{error}</div>
    );
  }
  
  if (!exam) return null;

  const graded = submissions.filter((s) => s.status === "graded" || s.status === "reviewed").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            onClick={() => navigate("/exams")}
            className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-zinc-900 hover:text-zinc-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Exams
          </button>
          <h2 className="text-2xl font-bold text-zinc-900">{exam.title}</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {exam.subject || "No subject"} · {exam.questions.length} questions · {exam.totalMarks} total marks
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/exams/${examId}/submissions`} className="inline-flex items-center gap-2 rounded-sm bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            AI Grading Dashboard
          </Link>
          <Link to={`/exams/${examId}/upload`} className="inline-flex items-center gap-2 rounded-sm bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Upload Submission
          </Link>
          <Link to={`/exams/${examId}/edit`} className="rounded-sm border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50">
            Edit
          </Link>
          <button
            onClick={() => setShowDelete(true)}
            className="rounded-sm border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
          >
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-sm border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800">{error}</div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-sm border border-zinc-200 bg-white p-5 text-center ">
          <p className="text-3xl font-bold text-zinc-900">{submissions.length}</p>
          <p className="mt-1 text-sm text-zinc-500">Total Submissions</p>
        </div>
        <div className="rounded-sm border border-zinc-200 bg-white p-5 text-center ">
          <p className="text-3xl font-bold text-zinc-900">{graded}</p>
          <p className="mt-1 text-sm text-zinc-500">Graded</p>
        </div>
        <div className="rounded-sm border border-zinc-200 bg-white p-5 text-center ">
          <p className="text-3xl font-bold text-amber-600">{submissions.length - graded}</p>
          <p className="mt-1 text-sm text-zinc-500">Pending</p>
        </div>
      </div>

      {/* Questions Preview */}
      <div className="rounded-sm border border-zinc-200 bg-white p-6 ">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">Questions</h3>
        <div className="space-y-4">
          {exam.questions.map((q, idx) => (
            <div key={idx} className="rounded-sm border border-zinc-200 bg-zinc-50/50 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-zinc-800">Q{idx + 1}. {q.questionText}</p>
                </div>
                <div className="ml-3 flex flex-col items-end gap-1">
                  <span className="rounded-full bg-zinc-100 px-3 py-0.5 text-xs font-bold text-zinc-900">{q.maxMarks} marks</span>
                  <span className="text-xs capitalize text-zinc-400">{q.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rubric */}
      {exam.rubricFileUrl && (
        <div className="rounded-sm border border-zinc-200 bg-white p-6 ">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Rubric Document</h3>
          <button
            onClick={handleDownloadRubric}
            className="inline-flex items-center gap-2 rounded-sm bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Download Uploaded Rubric
          </button>
        </div>
      )}

      {/* Submissions */}
      <div className="rounded-sm border border-zinc-200 bg-white p-6 ">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Submissions ({submissions.length})</h3>
          {submissions.length > 0 && (
            <Link to={`/exams/${examId}/submissions`} className="text-sm font-medium text-zinc-900 hover:text-zinc-900">
              AI Grading Dashboard
            </Link>
          )}
        </div>

        {submissions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-zinc-400">No submissions yet</p>
            <Link to={`/exams/${examId}/upload`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 hover:text-zinc-900">
              Upload first submission
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
                  <th className="pb-3 font-semibold">Student</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">AI Score</th>
                  <th className="pb-3 font-semibold">File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-50">
                    <td className="py-3 font-medium text-zinc-900">{sub.studentName}</td>
                    <td className="py-3 text-zinc-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
                    <td className="py-3"><StatusBadge status={sub.status} /></td>
                    <td className="py-3 font-semibold text-zinc-800">{sub.totalAIScore != null ? sub.totalAIScore : "-"}</td>
                    <td className="py-3 text-xs text-zinc-400">{sub.originalFileName || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Analytics */}
      {analytics && submissions.length > 0 && (
        <div className="rounded-sm border border-zinc-200 bg-white p-6 ">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">Analytics Dashboard</h3>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-sm border border-zinc-200 p-4">
              <h4 className="mb-4 text-sm font-semibold text-zinc-800">Score Distribution</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.distribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "#F1F5F9" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                    <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-sm border border-zinc-200 p-4">
              <h4 className="mb-4 text-sm font-semibold text-zinc-800">Question-wise Performance</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={analytics.questionPerformance}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="question" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "#F1F5F9" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                    <Bar dataKey="averageScore" fill="#10B981" radius={[4, 4, 0, 0]} name="Avg Score" />
                    <Line type="monotone" dataKey="maxScore" stroke="#CBD5E1" strokeWidth={2} name="Max Score" dot={{ r: 4, fill: "#CBD5E1" }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={showDelete}
        title="Delete Exam"
        message="Are you sure? This will permanently delete this exam."
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
