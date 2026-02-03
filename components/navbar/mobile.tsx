import { Search, History, Clock } from "lucide-react";
import { RefObject } from "react";

interface MobileProps {
  input: RefObject<HTMLInputElement | null>;
  setOpen: (open: boolean) => void;
}

export default function MobileNav({ input, setOpen }: MobileProps) {
  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 flex h-16 items-center justify-around border-t border-slate-200 bg-white px-6 md:hidden dark:border-slate-800 dark:bg-[#020617]">
      <button
        onClick={() => input.current?.click()}
        className="flex flex-col items-center gap-1 text-blue-600"
      >
        <Search className="h-5 w-5" />
        <span className="text-[10px] font-bold tracking-widest uppercase">
          Scan
        </span>
      </button>
      <button
        onClick={() => setOpen(true)}
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
  );
}
