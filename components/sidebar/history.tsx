import { History, X, Trash2 } from "lucide-react";

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
        className={`fixed inset-y-0 right-0 z-[100] w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-[#0F172A] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold">Document History</h2>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {history.length === 0 ? (
              <div className="py-20 text-center opacity-50">
                <p>No documents saved yet.</p>
              </div>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => load(item)}
                  className="group relative w-full rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-left transition-all hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900/30"
                >
                  <div
                    onClick={(e) => delDoc(e, item)}
                    className="absolute top-4 right-4 rounded-md p-2 text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </div>

                  <div className="mb-2 flex items-center justify-between pr-8">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                        item.urgency
                          ? `urgency-${item.urgency.toLowerCase()}`
                          : "urgency-no"
                      }`}
                    >
                      {item.urgency} Urgency
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="truncate pr-6 font-bold">{item.subject}</h4>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {item.translation}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[90] bg-slate-900/20 backdrop-blur-sm"
        />
      )}
    </>
  );
}
