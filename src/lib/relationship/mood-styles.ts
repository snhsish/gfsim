import type { MoodState } from "@/lib/relationship/types";

export const MOOD_BUBBLE_CLASSES: Record<MoodState, string> = {
  normal: "bg-primary text-primary-foreground",
  affectionate: "bg-pink-500/90 dark:bg-pink-600/90 text-white shadow-md shadow-pink-500/20",
  annoyed: "bg-slate-600 dark:bg-slate-700 text-slate-100 rounded-br-sm",
  distant: "bg-muted text-muted-foreground text-xs tracking-wide",
  cycle: "bg-violet-500/90 dark:bg-violet-600/90 text-white",
  pre_breakup: "bg-red-900/80 dark:bg-red-950/80 text-red-100 border border-red-500/30",
  broken: "bg-muted/50 text-muted-foreground/50 grayscale",
};

export const MOOD_TYPING_CLASSES: Record<MoodState, string> = {
  normal: "bg-primary",
  affectionate: "bg-pink-500",
  annoyed: "bg-slate-600",
  distant: "bg-muted",
  cycle: "bg-violet-500",
  pre_breakup: "bg-red-800",
  broken: "bg-muted/50",
};

export const MOOD_AVATAR_BADGE: Record<MoodState, string> = {
  normal: "bg-green-600 dark:bg-green-400",
  affectionate: "bg-pink-500 dark:bg-pink-400",
  annoyed: "bg-amber-500 dark:bg-amber-400",
  distant: "bg-gray-400 dark:bg-gray-500",
  cycle: "bg-violet-500 dark:bg-violet-400",
  pre_breakup: "bg-red-600 dark:bg-red-500",
  broken: "bg-gray-600 dark:bg-gray-600",
};

export const MOOD_HEADER_STATUS: Record<MoodState, string> = {
  normal: "Online",
  affectionate: "Feeling loved \uD83D\uDC95",
  annoyed: "A bit annoyed",
  distant: "Online",
  cycle: "Online",
  pre_breakup: "Online",
  broken: "Broken up",
};
