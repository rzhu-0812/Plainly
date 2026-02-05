import { Search, History, Clock } from "lucide-react";
import { RefObject } from "react";

interface MobileProps {
  input: RefObject<HTMLInputElement | null>;
  setOpen: (open: boolean) => void;
}

export default function MobileNav({ input, setOpen }: MobileProps) {
  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 flex h-16 items-center justify-around border-t border-slate-200/80 bg-white/80 px-6 backdrop-blur-xl backdrop-saturate-150 md:hidden dark:border-slate-800/80 dark:bg-slate-950/80">
      <button
        onClick={() => input.current?.click()}
        className="group flex flex-col items-center gap-1.5 transition-transform active:scale-95"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 shadow-sm transition-all group-hover:scale-105 group-hover:shadow-md dark:bg-white">
          <Search className="h-4 w-4 text-white dark:text-slate-900" />
        </div>
        <span className="text-[10px] font-semibold tracking-wide text-slate-900 dark:text-white">
          Scan
        </span>
      </button>
      <button
        onClick={() => setOpen(true)}
        className="group flex flex-col items-center gap-1.5 transition-transform active:scale-95"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full transition-colors group-hover:bg-slate-100 dark:group-hover:bg-slate-800">
          <History className="h-4 w-4 text-slate-400 transition-colors group-hover:text-slate-600 dark:group-hover:text-slate-300" />
        </div>
        <span className="text-[10px] font-medium tracking-wide text-slate-400 transition-colors group-hover:text-slate-600 dark:group-hover:text-slate-300">
          History
        </span>
      </button>
      <button className="group flex flex-col items-center gap-1.5 transition-transform active:scale-95">
        <div className="flex h-9 w-9 items-center justify-center rounded-full transition-colors group-hover:bg-slate-100 dark:group-hover:bg-slate-800">
          <Clock className="h-4 w-4 text-slate-400 transition-colors group-hover:text-slate-600 dark:group-hover:text-slate-300" />
        </div>
        <span className="text-[10px] font-medium tracking-wide text-slate-400 transition-colors group-hover:text-slate-600 dark:group-hover:text-slate-300">
          Reminders
        </span>
      </button>
    </div>
  );
}
