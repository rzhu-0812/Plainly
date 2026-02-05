import { AlertCircle, Clock } from "lucide-react";
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
    <section className="bg-slate-50/50 p-8 md:p-12 lg:col-span-8 dark:bg-slate-950/20">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
          <div className="space-y-8 p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="mb-2 text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase dark:text-blue-400">
                  Subject Analysis
                </p>
                <h3 className="text-2xl font-bold">
                  {busy
                    ? "Thinking..."
                    : summary?.subject || "Waiting for upload"}
                </h3>
              </div>

              <div className="flex flex-col items-start gap-2 md:items-end">
                <div
                  className={`rounded px-2 py-0.5 text-[10px] font-black tracking-wider uppercase ${
                    summary?.urgency
                      ? `urgency-${summary.urgency.toLowerCase()}`
                      : "urgency-no"
                  }`}
                >
                  {summary?.urgency || "No"} Urgency
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <Clock className="h-4 w-4" />
                  Deadline: {summary?.deadline || "TBD"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 border-y border-slate-100 py-8 md:grid-cols-12 dark:border-slate-800">
              <div className="md:col-span-4">
                <h4 className="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">
                  Plainly Translation
                </h4>
                {busy && (
                  <div className="animate-pulse text-xs text-blue-500">
                    {progress}
                  </div>
                )}
              </div>
              <div className="md:col-span-8">
                <p className="text-lg leading-relaxed font-light whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                  {busy
                    ? "Please wait while our AI reads your document..."
                    : summary?.translation ||
                      result ||
                      "Upload a document to get started."}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                Procedural Checklist
              </h4>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {busy ? (
                  <div className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                    <div className="h-5 w-5 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                    <span className="text-sm text-slate-400">
                      Extracting actions...
                    </span>
                  </div>
                ) : summary?.checklist ? (
                  summary.checklist.map((item: Checklist, i: number) => (
                    <button
                      key={i}
                      onClick={() => toggle(i)}
                      className={`group flex items-start gap-4 rounded-lg border p-4 text-left transition-all ${
                        item.done
                          ? "border-blue-200 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10"
                          : "border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-white dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700"
                      }`}
                    >
                      <div
                        className={`mt-0.5 h-5 w-5 flex-shrink-0 rounded-full border transition-colors ${
                          item.done
                            ? "border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500"
                            : "border-slate-300 bg-white group-hover:border-blue-400 dark:border-slate-600 dark:bg-slate-950"
                        }`}
                      />

                      <span
                        className={`text-sm font-medium transition-all ${
                          item.done
                            ? "text-slate-400 line-through decoration-slate-400/50"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {item.task}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="text-sm text-slate-400">
                    Waiting for document...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-8 py-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.open(original!, "_blank")}
                disabled={!original}
                className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
              >
                View Original Document
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-start gap-4 rounded-xl border border-blue-100 bg-blue-50/30 p-6 dark:border-blue-900/30 dark:bg-blue-950/10">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="space-y-1 text-sm">
            <p className="font-bold text-blue-900 dark:text-blue-100">
              Plainly Insight
            </p>
            <p className="leading-relaxed text-blue-700/70 dark:text-blue-300/60">
              {busy
                ? "Generating legal tips..."
                : summary?.legalTip ||
                  "AI-powered tips will appear here based on your document content."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
