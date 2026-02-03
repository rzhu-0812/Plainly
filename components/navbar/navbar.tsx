import { FileText, Languages, Sun, Moon } from "lucide-react";

interface NavbarProps {
  dark: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

export default function Navbar({ dark, toggle, setOpen }: NavbarProps) {
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
          <button className="transition hover:text-slate-900 dark:hover:text-slate-100">
            Reminders
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
        <button className="flex items-center gap-2 rounded bg-slate-900 px-3 py-1.5 text-xs font-bold tracking-widest text-white uppercase dark:bg-white dark:text-slate-900">
          <Languages className="h-3.5 w-3.5" />
          EN
        </button>
      </div>
    </nav>
  );
}
