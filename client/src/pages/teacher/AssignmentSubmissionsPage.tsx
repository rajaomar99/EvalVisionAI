import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { TriangleAlert } from "lucide-react";
import AIResultPanel from "../../components/teacher/AIResultPanel";
import SubmissionCard from "../../components/teacher/SubmissionCard";
import ConfirmModal from "../../components/common/ConfirmModal";
import { gradeSubmission } from "../../services/aiApi";
import { getSubmissionsByExam, checkPlagiarism, deleteSubmission } from "../../services/submissionApi";
import { getEvaluation } from "../../services/evaluationApi";
import type { Submission, Evaluation, PlagiarismPair } from "../../types/index";

export default function AssignmentSubmissionsPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingSubmissionId, setLoadingSubmissionId] = useState<string | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [plagiarismResults, setPlagiarismResults] = useState<PlagiarismPair[] | null>(null);

  // Deletion state
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch submissions
  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { submissions: subs } = await getSubmissionsByExam(examId!);
      setSubmissions(subs);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    if (examId) fetchSubmissions();
  }, [examId, fetchSubmissions]);

  // AI Grade action
  async function handleGrade(submissionId: string) {
    try {
      setLoadingSubmissionId(submissionId);
      setError(null);
      await gradeSubmission(submissionId);
      await fetchSubmissions();
      const { evaluation } = await getEvaluation(submissionId);
      setSelectedEvaluation(evaluation);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "AI grading failed - please try again");
    } finally {
      setLoadingSubmissionId(null);
    }
  }

  // View result action - fetch real Evaluation
  async function handleViewResult(submissionId: string) {
    try {
      const { evaluation } = await getEvaluation(submissionId);
      setSelectedEvaluation(evaluation);
    } catch {
      const sub = submissions.find((s) => s.id === submissionId);
      if (!sub) return;

      const criteriaScores = (sub.answers ?? []).map((a) => ({
        criterionId: `q${a.questionIndex + 1}`,
        score:       a.aiScore ?? 0,
        feedback:    "",
      }));

      setSelectedEvaluation({
        id:            "",
        submissionId:   sub.id,
        examId:         sub.examId,
        criteriaScores,
        totalScore:      sub.totalAIScore ?? 0,
        overallFeedback: "",
        extractedText:   "",
        createdAt:       "",
        updatedAt:       "",
      });
    }
  }

  // Plagiarism Check
  async function handleCheckPlagiarism() {
    try {
      setIsCheckingPlagiarism(true);
      setError(null);
      const res = await checkPlagiarism(examId!);
      setPlagiarismResults(res.flagged ?? []);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Failed to run plagiarism check");
    } finally {
      setIsCheckingPlagiarism(false);
    }
  }

  const handleEvaluationUpdated = (updatedEval: Evaluation) => {
    setSelectedEvaluation(updatedEval);
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === updatedEval.submissionId
          ? { ...sub, totalAIScore: updatedEval.totalScore, status: "reviewed" }
          : sub
      )
    );
  };

  const handleDeleteConfirm = async () => {
    if (!submissionToDelete) return;
    setIsDeleting(true);
    try {
      await deleteSubmission(submissionToDelete);
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionToDelete));
      
      if (selectedEvaluation?.submissionId === submissionToDelete) {
        setSelectedEvaluation(null);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Failed to delete submission");
    } finally {
      setIsDeleting(false);
      setSubmissionToDelete(null);
    }
  };

  // Render
  return (
    <section className="space-y-6">
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">AI Grading Dashboard</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Review student submissions and trigger AI-powered rubric grading.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCheckPlagiarism}
              disabled={isCheckingPlagiarism || submissions.length < 2}
              className="inline-flex items-center gap-2 rounded-sm bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50"
            >
              {isCheckingPlagiarism ? (
                <span>Checking...</span>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  Check Plagiarism
                </>
              )}
            </button>
            <Link
              to={`/exams/${examId}/upload`}
              className="inline-flex items-center gap-2 rounded-sm bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Upload
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-sm border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800">
          {error}
        </div>
      )}

      {/* Plagiarism Results */}
      {plagiarismResults !== null && (
        <div className="rounded-sm border border-zinc-200 bg-zinc-50 p-5 ">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-zinc-900">Plagiarism Check Results</h3>
            <button onClick={() => setPlagiarismResults(null)} className="text-zinc-800 hover:text-zinc-900">
              Dismiss
            </button>
          </div>
          {plagiarismResults.length === 0 ? (
            <p className="text-sm text-zinc-800">
              Good news! No flagged pairs found above the similarity threshold.
            </p>
          ) : (
            <ul className="space-y-2">
              {plagiarismResults.map((res, i) => (
                <li key={i} className="rounded-sm bg-white/60 px-4 py-3 text-sm text-zinc-900 flex items-center">
                  <TriangleAlert className="mr-2 inline-block h-4 w-4 text-amber-600" />
                  <span>
                    <span className="font-semibold">{res.studentA}</span> and{" "}
                    <span className="font-semibold">{res.studentB}</span> share a{" "}
                    <span className="font-bold text-zinc-900">{res.similarityPercentage}%</span> text similarity.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-900 border-t-transparent" />
        </div>
      )}

      {!loading && submissions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-zinc-200 px-6 py-16 text-center">
          <p className="text-sm text-zinc-500">No submissions found for this exam.</p>
          <Link
            to={`/exams/${examId}/upload`}
            className="mt-4 text-sm font-medium text-zinc-900 hover:text-zinc-900"
          >
            Upload first submission
          </Link>
        </div>
      )}

      {!loading && submissions.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            {submissions.map((sub) => (
              <SubmissionCard
                key={sub.id}
                submission={sub}
                isLoading={loadingSubmissionId === sub.id}
                onGrade={handleGrade}
                onViewResult={handleViewResult}
                onDelete={(id) => setSubmissionToDelete(id)}
              />
            ))}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            {selectedEvaluation ? (
              <AIResultPanel
                evaluation={selectedEvaluation}
                onClose={() => setSelectedEvaluation(null)}
                onEvaluationUpdated={handleEvaluationUpdated}
              />
            ) : (
              <div className="flex h-64 items-center justify-center rounded-sm border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-400">
                Select a submission and grade or view results here.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!submissionToDelete}
        title="Delete Submission"
        message="Are you sure you want to delete this submission? This action will permanently remove the uploaded submission and any associated AI evaluation."
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        onConfirm={handleDeleteConfirm}
        onCancel={() => !isDeleting && setSubmissionToDelete(null)}
      />
    </section>
  );
}
