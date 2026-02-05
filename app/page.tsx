"use client";

import { useState, useEffect, useRef } from "react";

import UploadSidebar from "@/components/sidebar/upload";
import HistorySidebar from "@/components/sidebar/history";
import Navbar from "@/components/navbar/navbar";
import MobileNav from "@/components/navbar/mobile";
import SummaryView from "@/components/summary";

import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabase";
import { OCR } from "@/utils/ocr";
import { summarizeText } from "@/utils/analyze";
import { Summary, Checklist } from "@/types/types";
import { saveDoc, deleteDoc, updateChecklist } from "@/utils/db";
import { translateSummary } from "@/utils/translate";

export default function Plainly() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  const [deviceId, setDeviceId] = useState<string>("");

  const [result, setResult] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>("");

  const [summary, setSummary] = useState<Summary | null>(null);
  const [original, setOriginal] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [currDoc, setCurrDoc] = useState<string | null>(null);
  const [lang, setLang] = useState("en");

  const fileInput = useRef<HTMLInputElement>(null);

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

  const toggle = () => {
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

  const load = (item: any) => {
    setCurrDoc(item.id);

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
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggle = async (index: number) => {
    if (!summary || !currDoc) return;

    const newList = [...summary.checklist];
    newList[index] = {
      ...newList[index],
      done: !newList[index].done,
    };

    setSummary({
      ...summary,
      checklist: newList,
    });

    setHistory((prev) =>
      prev.map((doc) =>
        doc.id === currDoc ? { ...doc, checklist: newList } : doc
      )
    );
  };

  const handleLangChange = async (newLang: string) => {
    if (!summary || newLang === lang) {
      setLang(newLang);
      return;
    }

    setLoading(true);
    setProgress(`Translating to ${newLang.toUpperCase()}...`);

    const translated = await translateSummary(summary, newLang);

    if (translated) {
      setSummary(translated);
      setLang(newLang);
    } else {
      alert("Translation failed.");
    }

    setLoading(false);
    setProgress("");
  };

  const processDocument = async (file: File) => {
    setAnalyzing(true);
    setResult(null);
    setSummary(null);
    setOriginal(null);
    setCurrDoc(null);
    setProgress("");
    let text = "";

    const url = URL.createObjectURL(file);
    setOriginal(url);

    try {
      if (file.type === "application/pdf") {
        setProgress("Processing PDF...");

        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

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
                text += (text ? "\n\n" : "") + response.text;
                setResult(text);
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
          text = response.text || "No text extracted";
          setResult(text);
        } else {
          alert("Error: " + (response.error || "Unknown error"));
        }
      }

      if (text) {
        setLoading(true);
        setProgress("Intrepreting document...");

        const aiSummary = await summarizeText(text);

        if (aiSummary) {
          setSummary(aiSummary);
          setProgress("Saving to Supabase...");

          const saved = await saveDoc(file, aiSummary, text, deviceId);

          if (saved.success) {
            console.log("Document saved in Supabase!");
            URL.revokeObjectURL(url);
            setOriginal(saved.data.file_url);
            setCurrDoc(saved.data.id);
            fetchHistory();
          }
        } else {
          console.error("AI analysis failed");
        }
      }
    } catch (err) {
      URL.revokeObjectURL(url);
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
        <Navbar
          dark={isDark}
          toggle={toggle}
          setOpen={setOpen}
          currLang={lang}
          langChange={handleLangChange}
        />

        <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1440px] grid-cols-1 overflow-hidden lg:grid-cols-12">
          <UploadSidebar
            input={fileInput}
            busy={busy}
            handleFiles={handleFiles}
          />

          <SummaryView
            busy={busy}
            summary={summary}
            progress={progress}
            result={result}
            original={original}
            toggle={handleToggle}
          />
        </main>

        <HistorySidebar
          open={open}
          setOpen={setOpen}
          history={history}
          load={load}
          delDoc={delDoc}
        />

        <MobileNav input={fileInput} setOpen={setOpen} />
      </div>
    </div>
  );
}
