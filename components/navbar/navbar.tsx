import { useState } from "react";
import {
  FileText,
  Languages,
  Sun,
  Moon,
  ChevronDown,
  History,
} from "lucide-react";

interface NavbarProps {
  dark: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  currLang: string;
  langChange: (lang: string) => void;
}

export default function Navbar({
  dark,
  toggle,
  setOpen,
  currLang,
  langChange,
}: NavbarProps) {
  const [langOpen, setLangOpen] = useState(false);

  const langs = [
    { code: "en", label: "English", short: "EN" },
    { code: "es", label: "Spanish", short: "ES" },
    { code: "zh", label: "Chinese", short: "ZH" },
    { code: "fr", label: "French", short: "FR" },
  ];

  const handleSelect = (language: string) => {
    langChange(language);
    setLangOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/70 px-5 backdrop-blur-xl backdrop-saturate-150 md:px-8 dark:border-slate-800/80 dark:bg-slate-950/70">
      <div className="flex items-center gap-3">
        <div className="group flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 shadow-md dark:from-white dark:to-slate-200">
            <FileText className="h-5 w-5 text-white dark:text-slate-900" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Plainly</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setOpen(true)}
          className="group relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300 ease-out hover:scale-110 hover:bg-slate-100 active:scale-95 dark:hover:bg-slate-800"
          aria-label="View history"
        >
          <History className="h-[18px] w-[18px] text-slate-500 transition-all duration-300 group-hover:-rotate-12 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-white" />
        </button>

        <button
          onClick={toggle}
          className="group relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300 ease-out hover:scale-110 hover:bg-slate-100 active:scale-95 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {dark ? (
            <Sun className="h-[18px] w-[18px] text-slate-400 transition-all duration-300 group-hover:rotate-45 group-hover:text-amber-500" />
          ) : (
            <Moon className="h-[18px] w-[18px] text-slate-500 transition-all duration-300 group-hover:-rotate-12 group-hover:text-indigo-600" />
          )}
        </button>

        <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-800" />

        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-all duration-300 ease-out hover:border-slate-400 hover:shadow-md hover:shadow-slate-900/10 active:scale-[0.97] dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:shadow-black/20"
          >
            <Languages className="h-4 w-4" />
            <span className="font-mono text-xs">{currLang.toUpperCase()}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}
            />
          </button>

          {langOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setLangOpen(false)}
              />

              <div className="absolute top-full right-0 z-50 mt-2 w-36 overflow-hidden rounded-lg border border-slate-200 bg-white/95 p-1 shadow-lg shadow-slate-900/10 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-black/20">
                {langs.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleSelect(l.code)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[13px] transition-colors duration-150 ${
                      currLang === l.code
                        ? "bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-white"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white"
                    }`}
                  >
                    <span>{l.label}</span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {l.short}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
