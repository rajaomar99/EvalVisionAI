import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ArrowRight, Brain, FileSearch, ShieldAlert, PenTool, ListChecks, Zap } from "lucide-react";

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-white min-h-screen font-sans text-zinc-900 selection:bg-zinc-200">
      {/* HERO */}
      <section className="px-6 py-16 sm:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">

          <h1 className="text-5xl font-bold tracking-tighter sm:text-7xl lg:text-[7rem] leading-[1.1] max-w-5xl">
            Precision grading.
            <br />
            <span className="text-zinc-400">Zero overhead.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg font-medium leading-relaxed text-zinc-500 sm:text-xl">
            A rigid, automated evaluation pipeline. Upload handwritten sheets, apply 
            your custom rubric, and let deterministic AI extract and grade instantly.
          </p>

          <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-3 rounded-sm bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-3 rounded-sm bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
                >
                  Start Pipeline
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-sm border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* METRICS / DIVIDER */}
      <section className="border-y border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col divide-y divide-zinc-200 sm:flex-row sm:divide-x sm:divide-y-0">
          {[
            { value: "10x", label: "Throughput" },
            { value: "95%+", label: "Accuracy" },
            { value: "24/7", label: "Availability" },
          ].map((stat) => (
            <div key={stat.label} className="flex-1 px-6 py-12 sm:px-12 lg:px-24 text-center">
              <p className="text-4xl font-bold tracking-tighter text-zinc-900">{stat.value}</p>
              <p className="mt-2 text-sm font-medium text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES BENTO GRID */}
      <section className="px-6 py-24 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Engineered for scale.
            </h2>
            <p className="mt-4 text-lg text-zinc-500">
              The entire evaluation stack, consolidated into a single highly performant interface.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-px bg-zinc-200 border border-zinc-200 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Brain,
                title: "Rubric-Driven AI",
                desc: "LLMs locked to strict rubric adherence. Get repeatable, auditable grading tailored to your criteria.",
              },
              {
                icon: FileSearch,
                title: "Vision-Powered Parsing",
                desc: "Multimodal AI accurately extracts handwritten text, equations, and diagrams from scanned student sheets.",
              },
              {
                icon: ShieldAlert,
                title: "Plagiarism Detection",
                desc: "Automatically cross-check all submissions to instantly flag similarities and academic dishonesty.",
              },
              {
                icon: PenTool,
                title: "Custom Assessments",
                desc: "Define precise questions, max marks, and model answers to tightly constrain the evaluation logic.",
              },
              {
                icon: ListChecks,
                title: "Granular Feedback",
                desc: "Receive transparent, criterion-by-criterion score breakdowns rather than opaque, black-box grades.",
              },
              {
                icon: Zap,
                title: "Instant Turnaround",
                desc: "Process complex exams in seconds. Shift from hours of manual grading to a streamlined pipeline.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative bg-white p-8 transition-colors hover:bg-zinc-50 sm:p-12"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-sm bg-zinc-100 text-zinc-900 transition-colors group-hover:bg-zinc-900 group-hover:text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-zinc-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-zinc-200 px-6 py-24 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-4xl font-bold tracking-tighter text-zinc-900 sm:text-5xl">
            Deploy EvalVision today.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-500">
            Shift from manual grading to an automated, auditable pipeline.
          </p>
          <div className="mt-10 flex justify-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 rounded-sm bg-zinc-900 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
              >
                Launch App
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-sm bg-zinc-900 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
              >
                Start Pipeline
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200 px-6 py-12 sm:px-12 lg:px-24">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-zinc-900 text-white">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight text-zinc-900">EvalVision AI</span>
          </div>
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
