import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export interface ColorClasses {
  bg: string;
  text: string;
  border: string;
  lightBg: string;
  glow: string;
}
export function getScopeColorClasses(color: string): ColorClasses {
  const mapping: Record<string, ColorClasses> = {
    emerald: {
      bg: "bg-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500/20",
      lightBg: "bg-emerald-50/50 dark:bg-emerald-950/30",
      glow: "shadow-[0_0_12px_rgba(16,185,129,0.4)]",
    },
    sky: {
      bg: "bg-sky-500",
      text: "text-sky-600 dark:text-sky-400",
      border: "border-sky-500/20",
      lightBg: "bg-sky-50/50 dark:bg-sky-950/30",
      glow: "shadow-[0_0_12px_rgba(14,165,233,0.4)]",
    },
    amber: {
      bg: "bg-amber-500",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/20",
      lightBg: "bg-amber-50/50 dark:bg-amber-950/30",
      glow: "shadow-[0_0_12px_rgba(245,158,11,0.4)]",
    },
    rose: {
      bg: "bg-rose-500",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-500/20",
      lightBg: "bg-rose-50/50 dark:bg-rose-950/30",
      glow: "shadow-[0_0_12px_rgba(244,63,94,0.4)]",
    },
    violet: {
      bg: "bg-violet-500",
      text: "text-violet-600 dark:text-violet-400",
      border: "border-violet-500/20",
      lightBg: "bg-violet-50/50 dark:bg-violet-950/30",
      glow: "shadow-[0_0_12px_rgba(139,92,246,0.4)]",
    },
    indigo: {
      bg: "bg-indigo-500",
      text: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-500/20",
      lightBg: "bg-indigo-50/50 dark:bg-indigo-950/30",
      glow: "shadow-[0_0_12px_rgba(79,70,229,0.4)]",
    },
    cyan: {
      bg: "bg-cyan-500",
      text: "text-cyan-600 dark:text-cyan-400",
      border: "border-cyan-500/20",
      lightBg: "bg-cyan-50/50 dark:bg-cyan-950/30",
      glow: "shadow-[0_0_12px_rgba(6,182,212,0.4)]",
    },
    fuchsia: {
      bg: "bg-fuchsia-500",
      text: "text-fuchsia-600 dark:text-fuchsia-400",
      border: "border-fuchsia-500/20",
      lightBg: "bg-fuchsia-50/50 dark:bg-fuchsia-950/30",
      glow: "shadow-[0_0_12px_rgba(217,70,239,0.4)]",
    },
  };
  return mapping[color] || mapping.emerald;
}
export function formatCurrencyAmount(amount: number, currency: string = 'USD', locale?: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (e) {
    return `${currency} ${amount.toFixed(2)}`;
  }
}