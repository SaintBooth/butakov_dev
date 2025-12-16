import { cn } from "@/lib/utils";

export const ceramicCardClasses = "bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-white/50";

export const liquidCardClasses = "bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-[0_0_15px_-3px_rgba(15,212,200,0.1)] bg-gradient-to-b from-white/5 to-transparent";

export const getCardClasses = (isDark: boolean, readingSurface?: boolean) => {
  if (readingSurface) {
    return "bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-white/10";
  }
  return isDark ? liquidCardClasses : ceramicCardClasses;
};
