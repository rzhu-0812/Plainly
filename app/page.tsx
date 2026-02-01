"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  Camera, FileText, Upload, Languages, AlertCircle,
  Clock, Sun, Moon, History, ShieldCheck, Search, 
  ChevronRight
} from 'lucide-react';
import { OCR } from '@/utils/ocr';
import imageCompression from 'browser-image-compression';

export default function Plainly() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [result, setResult] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') setIsDark(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    processDocument(files[0]);
  };

  const processDocument = async (file: File) => {
    setAnalyzing(true);
    setResult(null);
    setProgress("");
    let fullText = "";

    try {
      if (file.type === 'application/pdf') {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

        const arrayBuff = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuff }).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context) {
            await page.render({
              canvasContext: context, 
              viewport,
              canvas: canvas
            }).promise;

            const blob = await new Promise<Blob | null>((resolve) =>
              canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.85)
            );

            if (blob) {
              const formData = new FormData();
              formData.append('file', blob, `page-${i}.jpg`);
              
              const response = await OCR(formData);
              if (response.success) {
                fullText += (fullText ? "\n\n" : "") + response.text;
                setResult(fullText);
              }
            }
          }
        }
      } else {
        let compressed = file;

        if (file.type.startsWith('image/')) {
          const options = {
            maxSizeMB: 1.5,
            maxWidthOrHeight: 2048,
            useWebWorker: true
          };

          try {
            compressed = await imageCompression(file, options);
          } catch (err) {
            console.error("Compression failed, using original", err);
          }
        }

        const formData = new FormData();
        formData.append('file', compressed);

        const response = await OCR(formData);

        if (response.success) {
          setResult(response.text || "No text extracted");
        } else {
          alert("Error: " + (response.error || "Unknown error"));
        }
      }
    } catch (err) {
      alert("Error communicating with OCR");
    } finally {
      setAnalyzing(false);
      setProgress("");
      if (fileInput.current) {
        fileInput.current.value = ""
      };
    }
  };

  if (!mounted) return null;

  return (
    <div className={isDark ? "dark" : ""}>
      <input
        type="file"
        ref={fileInput}
        onChange={(e) => handleFiles(e.target.files)}
        accept="image/*,application/pdf"
        className="hidden"
        capture="environment"
      />

      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
        <nav className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <FileText className="text-white w-5 h-5" />
              </div>
              <span className="font-bold tracking-tight text-lg">PLAINLY</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
              <a href="#" className="text-blue-600 dark:text-blue-400">Workspace</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition">History</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition">Reminders</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              {isDark ? <Sun className="w-4 h-4 text-slate-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
            </button>
            <div className="h-4 w-px bg-slate-200 dark:border-slate-800" />
            <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900">
              <Languages className="w-3.5 h-3.5" />
              EN
            </button>
          </div>
        </nav>

        <main className="max-w-[1440px] mx-auto min-h-[calc(100-4rem)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          <aside className="lg:col-span-4 border-r border-slate-200 dark:border-slate-800 p-8 space-y-10 bg-white dark:bg-[#020617]">
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight leading-tight">
                Translate bureaucracy into <span className="italic">action.</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Clarity for small businesses and families navigating government documentation.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => fileInput.current?.click()}
                disabled={analyzing}
                className="w-full flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Camera className={`w-5 h-5 ${analyzing ? 'animate-spin' : 'opacity-80'}`} />
                  <span className="font-medium">{analyzing ? 'Analyzing...' : 'Scan with Device'}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
              </button>

              <div 
                onClick={() => fileInput.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleFiles(e.dataTransfer.files); }}
                className="relative group cursor-pointer w-full"
              >
                <div className="absolute inset-0 bg-blue-500/5 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 group-hover:border-blue-400 dark:group-hover:border-blue-500/50 transition-colors" />
                <div className="relative p-10 flex flex-col items-center justify-center text-center gap-3 cursor-pointer">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <div className="text-sm">
                    <span className="font-semibold">Click to upload</span>
                    <span className="text-slate-500"> or drag PDF</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" /> 
                Data Privacy
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                All data is encrypted. We serve urban non-profits and small businesses with private, localized document processing.
              </p>
            </div>
          </aside>

          <section className="lg:col-span-8 p-8 md:p-12 bg-slate-50/50 dark:bg-slate-950/20">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-8 space-y-8">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2">Subject Analysis</p>
                      <h3 className="text-2xl font-bold">Zoning Variance Notice</h3>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <div className="px-2 py-0.5 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-wider rounded">
                        High Urgency
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        Expires: Nov 28, 2024
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-y border-slate-100 dark:border-slate-800 py-8">
                    <div className="md:col-span-4">
                      <h4 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest">Plainly Translation</h4>
                      {analyzing && <div className="text-xs text-blue-500 animate-pulse">Running Google OCR...</div>}
                    </div>
                    <div className="md:col-span-8">
                      <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-light">
                        {analyzing ? (
                          "Please wait while our AI reads your document..."
                        ) : (
                          result || "A neighbor is requesting to expand their storefront by 5 feet. This may impact your sidewalk access. You have 14 days to file an objection if this interferes with your business operations."
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-widest">Procedural Checklist</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "Review Site Plan (attached)",
                        "Measure your sidewalk clearance",
                        "Draft 'Letter of Intent' to City Clerk",
                        "Attend public hearing on Nov 30"
                      ].map((task, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors">
                          <div className="w-5 h-5 rounded border border-slate-300 dark:border-slate-700 flex-shrink-0" />
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 px-8 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">View Original Document</button>
                    <button className="text-xs font-bold text-slate-400 hover:underline">Download Summary PDF</button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-start gap-4 p-6 border border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-950/10 rounded-xl">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="text-sm space-y-1">
                  <p className="font-bold text-blue-900 dark:text-blue-100">Legal Tip</p>
                  <p className="text-blue-700/70 dark:text-blue-300/60 leading-relaxed">Under City Ordinance 49-C, you are entitled to a sun-light impact study for any new construction over 10 feet. Consider requesting this at the hearing.</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#020617] border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-6 z-50">
          <button
            onClick={() => fileInput.current?.click()}
            className="flex flex-col items-center gap-1 text-blue-600">
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Scan</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <History className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">History</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <Clock className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Reminders</span>
          </button>
        </div>
      </div>
    </div>
  );
}