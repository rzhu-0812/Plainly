import { useState } from "react";
import { FileText, Languages, Sun, Moon, ChevronDown } from "lucide-react";

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
    { code: "en", label: "EN" },
    { code: "es", label: "ES" },
    { code: "zh", label: "ZH" },
    { code: "fr", label: "FR" },
  ];

  const handleSelect = (language: string) => {
    langChange(language);
    setLangOpen(false);
  };

  return (
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
            onClick={() => setOpen(true)}
            className="transition hover:text-slate-900 dark:hover:text-slate-100"
          >
            History
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          className="rounded-md border border-transparent p-2 transition-colors hover:border-slate-200 hover:bg-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-800"
        >
          {dark ? (
            <Sun className="h-4 w-4 text-slate-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-500" />
          )}
        </button>
        <div className="h-4 w-px bg-slate-200 dark:border-slate-800" />

        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2 rounded bg-slate-900 px-3 py-1.5 text-xs font-bold tracking-widest text-white uppercase dark:bg-white dark:text-slate-900"
          >
            <Languages className="h-3.5 w-3.5" />
            {currLang.toUpperCase()}
            <ChevronDown
              className={`h-3 w-3 transition-transform ${langOpen ? "rotate-180" : ""}`}
            />
          </button>

          {langOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setLangOpen(false)}
              />

              <div className="absolute top-full right-0 z-50 mt-2 flex w-24 flex-col rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                {langs.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleSelect(l.code)}
                    className="px-4 py-2 text-left text-xs font-bold transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {l.label}
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
