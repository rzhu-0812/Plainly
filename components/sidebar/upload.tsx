import { Camera, ChevronRight, Upload, ShieldCheck } from "lucide-react";
import { RefObject } from "react";

interface UploadProps {
  input: RefObject<HTMLInputElement | null>;
  busy: boolean;
  handleFiles: (files: FileList | null) => void;
}

export default function UploadSidebar({
  input,
  busy,
  handleFiles,
}: UploadProps) {
  return (
    <aside className="space-y-10 border-r border-slate-200 bg-white p-8 lg:col-span-4 dark:border-slate-800 dark:bg-[#020617]">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Paperwork explained in
          <span className="mt-1 block italic text-blue-600">plain English.</span>
        </h1>
        <p className="text-base leading-relaxed text-slate-500 dark:text-slate-400">
          Stop guessing what government notices mean. We use AI to translate
          complex legal documents into a simple action plan.
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => input.current?.click()}
          disabled={busy}
          className="group flex w-full items-center justify-between rounded-lg bg-blue-600 p-4 text-white shadow-sm transition-all hover:bg-blue-700"
        >
          <div className="flex items-center gap-3">
            <Camera
              className={`h-5 w-5 ${busy ? "animate-spin" : "opacity-80"}`}
            />
            <span className="font-medium">
              {busy ? "Analyzing..." : "Scan with Device"}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 opacity-50 transition-transform group-hover:translate-x-1" />
        </button>

        <div
          onClick={() => !busy && input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!busy) handleFiles(e.dataTransfer.files);
          }}
          className={`group relative w-full cursor-pointer transition-opacity ${busy ? "pointer-events-none opacity-50" : ""}`}
        >
          <div className="absolute inset-0 rounded-lg border-2 border-dashed border-slate-200 bg-blue-500/5 transition-colors group-hover:border-blue-400 dark:border-slate-800 dark:group-hover:border-blue-500/50" />
          <div className="relative flex cursor-pointer flex-col items-center justify-center gap-3 p-10 text-center">
            <Upload className="h-6 w-6 text-slate-400 transition-colors group-hover:text-blue-500" />
            <div className="text-sm">
              <span className="font-semibold">Click to upload</span>
              <span className="text-slate-500"> or drag PDF</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
          <ShieldCheck className="h-4 w-4" />
          Data Privacy
        </div>
        <p className="text-xs leading-relaxed text-slate-500">
          All data is encrypted. We serve urban non-profits and small businesses
          with private, localized document processing.
        </p>
      </div>
    </aside>
  );
}
