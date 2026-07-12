"use client";

import { Sun, Moon, LogOut } from "lucide-react";
import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onLogout: () => void;
  children?: ReactNode;
  maxWidth?: string;
}

export function AdminPageHeader({
  icon, title, subtitle, theme, onToggleTheme, onLogout, children, maxWidth = "max-w-6xl"
}: AdminPageHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-gray-950/95">
      <div className={`mx-auto flex h-14 ${maxWidth} items-center justify-between px-4 md:px-6`}>
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="text-[13px] font-extrabold leading-none text-gray-900 dark:text-white">{title}</p>
            <p className="text-[10px] text-gray-500">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {children}
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={2.5} /> : <Moon className="h-4 w-4" strokeWidth={2.5} />}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-xl border border-red-900/40 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-600 hover:text-red-500 transition-colors dark:bg-red-950/40 dark:text-red-400 dark:hover:text-red-300"
          >
            <LogOut className="h-3.5 w-3.5" /><span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
