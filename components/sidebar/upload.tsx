import { Camera, Upload, ShieldCheck, Sparkles } from "lucide-react";
import { RefObject, useState, useRef, useEffect } from "react";

interface UploadProps {
  input: RefObject<HTMLInputElement | null>;
  busy: boolean;
  handleFiles: (files: FileList | null) => void;
}

const phrases = [
  { text: "plain English.", lang: "en" },
  { text: "español sencillo.", lang: "es" },
  { text: "简单中文。", lang: "zh" },
  { text: "français simple.", lang: "fr" },
];

export default function UploadSidebar({
  input,
  busy,
  handleFiles,
}: UploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<
    "visible" | "fading" | "entering"
  >("visible");
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase("fading");

      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
        setAnimationPhase("entering");

        setTimeout(() => {
          setAnimationPhase("visible");
        }, 50);
      }, 600);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dropRef.current) return;
    const rect = dropRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <aside className="relative flex flex-col gap-8 border-r border-slate-200/80 bg-white p-6 md:p-8 lg:col-span-4 dark:border-slate-800/80 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-900/30" />

      <div className="relative space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:border-slate-600">
          <Sparkles className="h-3 w-3" />
          AI-Powered Analysis
        </div>

        <h1 className="text-2xl leading-tight font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white">
          Paperwork explained in
          <br />
          <span
            className={`inline-block bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent italic transition-all duration-700 ease-out dark:from-amber-400 dark:via-yellow-400 dark:to-amber-400 ${
              animationPhase === "fading"
                ? "translate-y-3 scale-95 opacity-0 blur-sm"
                : animationPhase === "entering"
                  ? "-translate-y-3 scale-95 opacity-0 blur-sm"
                  : "blur-0 translate-y-0 scale-100 opacity-100"
            }`}
          >
            {phrases[phraseIndex].text}
          </span>
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-pretty text-slate-500 dark:text-slate-400">
          Stop guessing what government notices mean. We translate complex legal
          documents into simple action plans.
        </p>
      </div>

      <div className="relative">
        <div
          ref={dropRef}
          onClick={() => !busy && input.current?.click()}
          onMouseMove={handleMouseMove}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            if (!busy) handleFiles(e.dataTransfer.files);
          }}
          className={`upload-zone group w-full cursor-pointer border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100/50 shadow-inner hover:border-slate-400 hover:from-white hover:to-slate-50 hover:shadow-lg dark:border-slate-700 dark:from-slate-900/50 dark:to-slate-900/80 dark:hover:border-slate-500 dark:hover:from-slate-800/50 dark:hover:to-slate-800/80 ${isDragging ? "dragging" : ""} ${busy ? "pointer-events-none opacity-50" : ""}`}
          style={{
            background: !isDragging
              ? `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(148, 163, 184, 0.15), transparent 60%)`
              : undefined,
          }}
        >
          <div className="relative flex flex-col items-center justify-center gap-4 p-8 text-center md:p-12">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 shadow-slate-900/10 ring-slate-200/80 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl dark:bg-slate-800 dark:shadow-black/20 dark:ring-slate-700 ${isDragging ? "scale-125 bg-slate-900 dark:bg-white" : ""}`}
            >
              <Upload
                className={`h-7 w-7 transition-all duration-300 ${isDragging ? "text-white dark:text-slate-900" : "text-slate-600 group-hover:text-slate-800 dark:text-slate-300 dark:group-hover:text-white"} ${busy ? "animate-pulse" : ""}`}
              />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {busy
                  ? "Analyzing..."
                  : isDragging
                    ? "Drop to upload"
                    : "Drop files here"}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                or click to browse your files
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                PDF
              </span>
              <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                PNG
              </span>
              <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                JPG
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                input.current?.click();
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 font-semibold text-white shadow-lg shadow-slate-900/25 transition-all duration-200 hover:bg-slate-800 hover:shadow-xl active:scale-[0.98] md:hidden dark:bg-white dark:text-slate-900 dark:shadow-black/20"
            >
              <Camera className="h-5 w-5" />
              <span>Scan with Camera</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative mt-auto space-y-3 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 dark:border-slate-800 dark:from-slate-900/50 dark:to-slate-900/30">
        <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5" />
          Privacy First
        </div>
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          End-to-end encryption. Your documents are processed securely and never
          stored without permission.
        </p>
      </div>
    </aside>
  );
}
