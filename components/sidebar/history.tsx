import { History, X, Trash2, FileText } from "lucide-react";

interface HistoryProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  history: any[];
  load: (item: any) => void;
  delDoc: (e: React.MouseEvent, item: any) => void;
}

export default function HistorySidebar({
  open,
  setOpen,
  history,
  load,
  delDoc,
}: HistoryProps) {
  return (
    <>
      <div
        className={`fixed inset-y-0 right-0 z-[100] w-full max-w-md border-l border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition-transform duration-300 ease-out dark:border-slate-800/80 dark:bg-slate-950/95 dark:shadow-black/30 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <History className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Document History</h2>
                <p className="text-xs text-slate-500">
                  {history.length} document{history.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 hover:bg-slate-100 active:scale-95 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <FileText className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  No documents yet
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Upload a document to get started
                </p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => load(item)}
                  className="group relative w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/15 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-slate-500 dark:hover:shadow-black/30"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      delDoc(e, item);
                    }}
                    className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-md text-slate-400 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 active:scale-95 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="mb-2 flex items-center justify-between pr-8">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                        item.urgency
                          ? `urgency-${item.urgency.toLowerCase()}`
                          : "urgency-no"
                      }`}
                    >
                      {item.urgency || "No"} Urgency
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="truncate pr-6 text-sm font-bold text-slate-900 dark:text-white">
                    {item.subject}
                  </h4>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {item.translation}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[90] bg-slate-950/20 backdrop-blur-sm transition-opacity dark:bg-slate-950/50"
        />
      )}
    </>
  );
}
