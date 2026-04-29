"use client";

import React from "react";
import { Bell, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TopBarProps {
  title: string;
  subtitle?: string;
  lowStockCount?: number;
  onMenuClick?: () => void;
}

export default function TopBar({ title, subtitle, lowStockCount = 0, onMenuClick }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-surface-900/80 backdrop-blur-xl border-b border-surface-700/50">
      <div className="flex items-center gap-4 min-w-0">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-surface-400 hover:text-white hover:bg-surface-800 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg lg:text-xl font-bold text-white truncate">{title}</h1>
          {subtitle && <p className="hidden sm:block text-xs lg:text-sm text-surface-400 truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
        {lowStockCount > 0 && (
          <div className="relative p-2 text-surface-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-surface-800">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-crimson-500 text-[10px] text-white flex items-center justify-center font-bold ring-2 ring-surface-900">
              {lowStockCount > 9 ? "9+" : lowStockCount}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
