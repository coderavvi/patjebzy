"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  className?: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel = "vs last 30 days",
  className,
}: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-surface-700/50 bg-surface-800/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-surface-600 hover:bg-surface-800/70 group",
        className
      )}
    >
      {/* Glass highlight */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-surface-400 font-medium">{label}</p>
          <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1.5">
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-400" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  isPositive ? "text-emerald-400" : "text-red-400"
                )}
              >
                {isPositive ? "+" : ""}
                {trend}%
              </span>
              <span className="text-xs text-surface-500">{trendLabel}</span>
            </div>
          )}
        </div>
        <div className="h-12 w-12 rounded-xl bg-crimson-500/10 flex items-center justify-center group-hover:bg-crimson-500/15 transition-colors">
          <Icon className="h-6 w-6 text-crimson-400" />
        </div>
      </div>
    </div>
  );
}
