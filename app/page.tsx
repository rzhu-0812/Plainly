"use client";

import { useState, useEffect, useRef } from "react";
import {
  Camera,
  FileText,
  Upload,
  Languages,
  AlertCircle,
  Clock,
  Sun,
  Moon,
  History,
  ShieldCheck,
  Search,
  ChevronRight,
  X,
  Trash2,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabase";
import { OCR } from "@/utils/ocr";
import { summarizeText } from "@/utils/analyze";
import { Summary } from "@/types/types";
import { saveDoc, deleteDoc } from "@/utils/db";

export default function Plainly() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [deviceId, setDeviceId] = useState<string>("");

  const [result, setResult] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>("");

  const [summary, setSummary] = useState<Summary | null>(null);
  const [original, setOriginal] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const fileInput = useRef<HTMLInputElement>(null);
  const results = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") setIsDark(true);

    let id = localStorage.getItem("plainly_device_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("plainly_device_id", id);
    }
    setDeviceId(id);
  }, []);

  useEffect(() => {
    if (mounted) fetchHistory();
  }, [mounted]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  const fetchHistory = async () => {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false });
    if (data) setHistory(data);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    processDocument(files[0]);
  };

  const loadHistory = (item: any) => {
    setSummary({
      subject: item.subject,
      translation: item.translation,
      urgency: item.urgency,
      deadline: item.deadline,
      checklist: item.checklist,
      legalTip: item.legal_tip,
    });
    setResult(item.raw_text);
    setOriginal(item.file_url);
    setHistoryOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const processDocument = async (file: File) => {
    setAnalyzing(true);
    setResult(null);
    setSummary(null);
    setOriginal(null);
    setProgress("");
    let fullText = "";

    try {
      const url = URL.createObjectURL(file);
      setOriginal(url);

      if (file.type === "application/pdf") {
        setProgress("Processing PDF...");

        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

        const arrayBuff = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuff }).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context) {
            await page.render({
              canvasContext: context,
              viewport,
              canvas: canvas,
            }).promise;

            const blob = await new Promise<Blob | null>((resolve) =>
              canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85)
            );

            if (blob) {
              const formData = new FormData();
              formData.append("file", blob, `page-${i}.jpg`);

              const response = await OCR(formData);
              if (response.success) {
                fullText += (fullText ? "\n\n" : "") + response.text;
                setResult(fullText);
              }
            }
          }
        }
      } else {
        setProgress("Compressing image...");

        let compressed = file;

        if (file.type.startsWith("image/")) {
          const options = {
            maxSizeMB: 1.5,
            maxWidthOrHeight: 2048,
            useWebWorker: true,
          };

          try {
            compressed = await imageCompression(file, options);
          } catch (err) {
            console.error("Compression failed, using original", err);
          }
        }

        setProgress("Running Google OCR...");
        const formData = new FormData();
        formData.append("file", compressed);

        const response = await OCR(formData);

        if (response.success) {
          fullText = response.text || "No text extracted";
          setResult(fullText);
        } else {
          alert("Error: " + (response.error || "Unknown error"));
        }
      }

      if (fullText) {
        setLoading(true);
        setProgress("Intrepreting document...");

        const aiSummary = await summarizeText(fullText);

        if (aiSummary) {
          setSummary(aiSummary);
          setProgress("Saving to Supabase...");

          const saved = await saveDoc(file, aiSummary, fullText, deviceId);

          if (saved.success) {
            console.log("Document saved in Supabase!");
            setOriginal(saved.data.file_url);
            fetchHistory();
          }
        } else {
          console.error("AI analysis failed");
        }
      }
    } catch (err) {
      alert("Error communicating with OCR");
    } finally {
      setAnalyzing(false);
      setLoading(false);
      setProgress("");
      if (fileInput.current) {
        fileInput.current.value = "";
      }
    }
  };

  const delDoc = async (e: React.MouseEvent, item: any) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this scan?")) return;

    const response = await deleteDoc(item.id, item.file_url);
    if (response.success) {
      fetchHistory();
      if (original === item.file_url) {
        setSummary(null);
        setResult(null);
        setOriginal(null);
      }
    } else {
      alert("Failed to delete: " + response.error);
    }
  };

  if (!mounted) return null;

  const busy = analyzing || loading;

  return (
    <div className={isDark ? "dark" : ""}>
      <input
        type="file"
        ref={fileInput}
        onChange={(e) => handleFiles(e.target.files)}
        accept="image/*,application/pdf"
        className="hidden"
      />

      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors duration-300 selection:bg-blue-100 dark:bg-[#020617] dark:text-slate-100 dark:selection:bg-blue-900">
        <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-[#020617]/80">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">PLAINLY</span>
            </div>

            <div className="hidden items-center gap-6 text-sm font-medium text-slate-500 md:flex dark:text-slate-400">
              <button className="text-blue-600 dark:text-blue-400">
                Workspace
              </button>
              <button
                onClick={() => setHistoryOpen(true)}
                className="transition hover:text-slate-900 dark:hover:text-slate-100"
              >
                History
              </button>
              <button className="transition hover:text-slate-900 dark:hover:text-slate-100">
                Reminders
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="rounded-md border border-transparent p-2 transition-colors hover:border-slate-200 hover:bg-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-800"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-slate-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-500" />
              )}
            </button>
            <div className="h-4 w-px bg-slate-200 dark:border-slate-800" />
            <button className="flex items-center gap-2 rounded bg-slate-900 px-3 py-1.5 text-xs font-bold tracking-widest text-white uppercase dark:bg-white dark:text-slate-900">
              <Languages className="h-3.5 w-3.5" />
              EN
            </button>
          </div>
        </nav>

        <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1440px] grid-cols-1 overflow-hidden lg:grid-cols-12">
          <aside className="space-y-10 border-r border-slate-200 bg-white p-8 lg:col-span-4 dark:border-slate-800 dark:bg-[#020617]">
            <div className="space-y-4">
              <h1 className="text-3xl leading-tight font-semibold tracking-tight">
                Translate bureaucracy into{" "}
                <span className="italic">action.</span>
              </h1>
              <p className="leading-relaxed text-slate-500 dark:text-slate-400">
                Clarity for small businesses and families navigating government
                documentation.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => fileInput.current?.click()}
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
                onClick={() => !busy && fileInput.current?.click()}
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
                All data is encrypted. We serve urban non-profits and small
                businesses with private, localized document processing.
              </p>
            </div>
          </aside>

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
                      {(busy
                        ? ["Extracting actions..."]
                        : summary?.checklist || ["Waiting for document..."]
                      ).map((task, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-900/40"
                        >
                          <div className="h-5 w-5 flex-shrink-0 rounded border border-slate-300 dark:border-slate-700" />
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {task}
                          </span>
                        </div>
                      ))}
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
                    <button className="text-xs font-bold text-slate-400 hover:underline">
                      Download Summary PDF
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
        </main>

        <div
          className={`fixed inset-y-0 right-0 z-[100] w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-[#0F172A] ${historyOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <History className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-bold">Document History</h2>
              </div>
              <button
                onClick={() => setHistoryOpen(false)}
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
                    onClick={() => loadHistory(item)}
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

        {historyOpen && (
          <div
            onClick={() => setHistoryOpen(false)}
            className="fixed inset-0 z-[90] bg-slate-900/20 backdrop-blur-sm"
          />
        )}

        <div className="fixed right-0 bottom-0 left-0 z-50 flex h-16 items-center justify-around border-t border-slate-200 bg-white px-6 md:hidden dark:border-slate-800 dark:bg-[#020617]">
          <button
            onClick={() => fileInput.current?.click()}
            className="flex flex-col items-center gap-1 text-blue-600"
          >
            <Search className="h-5 w-5" />
            <span className="text-[10px] font-bold tracking-widest uppercase">
              Scan
            </span>
          </button>
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex flex-col items-center gap-1 text-slate-400"
          >
            <History className="h-5 w-5" />
            <span className="text-[10px] font-bold tracking-widest uppercase">
              History
            </span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <Clock className="h-5 w-5" />
            <span className="text-[10px] font-bold tracking-widest uppercase">
              Reminders
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
