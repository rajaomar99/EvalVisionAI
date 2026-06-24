import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { listExams } from "../../services/examApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import type { Exam } from "../../types/index";
import { Plus } from "lucide-react";

interface DashboardStats {
  totalExams:  number;
  pendingCount: number;
  recentExams: Exam[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats,   setStats]   = useState<DashboardStats>({ totalExams: 0, pendingCount: 0, recentExams: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listExams()
      .then(({ count, pendingCount, exams }) => {
        setStats({ totalExams: count, pendingCount: pendingCount || 0, recentExams: exams.slice(0, 5) });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-zinc-200 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Dashboard</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Welcome back, {user?.name || "User"}. Here's the latest from your evaluation pipeline.
          </p>
        </div>
        <Link
          to="/exams/new"
          className="inline-flex items-center gap-2 rounded-sm bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" />
          Create Exam
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-px bg-zinc-200 border border-zinc-200 sm:grid-cols-3">
        <div className="bg-white p-6 transition-colors hover:bg-zinc-50">
          <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">Total Exams</p>
          <p className="mt-2 text-4xl font-bold tracking-tighter text-zinc-900">{stats.totalExams}</p>
        </div>
        <div className="bg-white p-6 transition-colors hover:bg-zinc-50">
          <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">Pending Submissions</p>
          <p className="mt-2 text-4xl font-bold tracking-tighter text-zinc-900">{stats.pendingCount}</p>
        </div>
        <div className="bg-white p-6 transition-colors hover:bg-zinc-50">
          <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">Grading Engine</p>
          <p className="mt-2 text-4xl font-bold tracking-tighter text-zinc-900">Ready</p>
        </div>
      </div>

      {/* Recent exams */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold tracking-tight text-zinc-900">Recent Exams</h3>
          <Link to="/exams" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
            View all &rarr;
          </Link>
        </div>

        {stats.recentExams.length === 0 ? (
          <div className="border border-zinc-200 bg-zinc-50 px-6 py-12 text-center rounded-sm">
            <p className="text-sm text-zinc-500">No exams provisioned yet. Start the pipeline to begin.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 border-t border-zinc-200">
            {stats.recentExams.map((exam) => (
              <Link
                key={exam.id}
                to={`/exams/${exam.id}`}
                className="group flex items-center justify-between py-4 transition-colors hover:bg-zinc-50"
              >
                <div>
                  <h4 className="font-semibold text-zinc-900 group-hover:underline decoration-zinc-300 underline-offset-4">{exam.title}</h4>
                  <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                    <span className="font-medium text-zinc-700">{exam.subject || "No subject"}</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-300" />
                    <span>{exam.questions?.length ?? 0} questions</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-300" />
                    <span>{exam.totalMarks} marks</span>
                  </div>
                </div>
                <div className="text-sm font-medium text-zinc-400 group-hover:text-zinc-900 transition-colors">
                  Open
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
