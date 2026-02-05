import {
  Lightbulb,
  Clock,
  ExternalLink,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";
import { Checklist, Summary } from "@/types/types";

interface SummaryProps {
  busy: boolean;
  summary: Summary | null;
  progress: string;
  result: string | null;
  original: string | null;
  toggle: (index: number) => void;
}

export default function SummaryView({
  busy,
  summary,
  progress,
  result,
  original,
  toggle,
}: SummaryProps) {
  return (
    <section className="relative bg-slate-50 p-6 md:p-10 lg:col-span-8 dark:bg-slate-950">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="bg-gradient-fade pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-3xl">
        <div className="card-hover overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900">
          <div className="space-y-6 p-6 md:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div className="space-y-2">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  {busy && (
                    <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                  )}
                  Subject Analysis
                </p>
                <h3 className="text-xl font-bold tracking-tight text-balance text-slate-900 md:text-2xl dark:text-white">
                  {busy
                    ? "Processing your document..."
                    : summary?.subject || "Ready to analyze"}
                </h3>
              </div>

              <div className="flex flex-col items-start gap-2 md:items-end">
                <div
                  className={`rounded-md px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase ${
                    summary?.urgency
                      ? `urgency-${summary.urgency.toLowerCase()}`
                      : "urgency-no"
                  }`}
                >
                  {summary?.urgency || "No"} Urgency
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-mono text-xs">
                    {summary?.deadline || "No deadline"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 border-y border-slate-100 py-6 md:grid-cols-12 md:py-8 dark:border-slate-800">
              <div className="md:col-span-4">
                <h4 className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  Plain Translation
                </h4>
                {busy && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
                    {progress || "Working..."}
                  </div>
                )}
              </div>
              <div className="md:col-span-8">
                <p className="text-base leading-relaxed text-pretty text-slate-600 dark:text-slate-300">
                  {busy
                    ? "Please wait while our AI reads and interprets your document..."
                    : summary?.translation ||
                      result ||
                      "Upload a document to see a plain-language explanation here."}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Action Items
              </h4>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {busy ? (
                  <>
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="flex animate-pulse items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50"
                      >
                        <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <div className="h-4 flex-1 rounded bg-slate-200 dark:bg-slate-700" />
                      </div>
                    ))}
                  </>
                ) : summary?.checklist ? (
                  summary.checklist.map((item: Checklist, i: number) => (
                    <button
                      key={i}
                      onClick={() => toggle(i)}
                      className={`group flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-300 ease-out active:scale-[0.97] ${
                        item.done
                          ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-800/50 dark:bg-emerald-950/30"
                          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-500 dark:hover:shadow-black/20"
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {item.done ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-300 transition-colors group-hover:text-slate-400 dark:text-slate-600 dark:group-hover:text-slate-500" />
                        )}
                      </div>

                      <span
                        className={`text-sm font-medium transition-all ${
                          item.done
                            ? "text-slate-400 line-through decoration-slate-300 dark:text-slate-500 dark:decoration-slate-600"
                            : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {item.task}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="col-span-2 rounded-xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
                    <p className="text-sm text-slate-400">
                      Action items will appear here after analysis
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3 md:px-8 dark:border-slate-800 dark:bg-slate-900/50">
            <button
              onClick={() => original && window.open(original, "_blank")}
              disabled={!original}
              className="group inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40 dark:text-slate-400 dark:hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Original
              <span className="hidden text-slate-400 transition-transform group-hover:translate-x-0.5 md:inline">
                &rarr;
              </span>
            </button>
          </div>
        </div>

        <div className="hover-glow mt-6 flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20">
            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-1.5">
            <p className="font-bold text-slate-900 dark:text-white">
              Plainly Insight
            </p>
            <p className="text-sm leading-relaxed text-pretty text-slate-600 dark:text-slate-300">
              {busy
                ? "Generating personalized tips..."
                : summary?.legalTip ||
                  "AI-powered tips will appear here based on your document content."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
