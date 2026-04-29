"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon, Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
}

export default function PageHeader({
  title,
  subtitle,
  actionLabel,
  actionIcon: ActionIcon = Plus,
  onAction,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-surface-400 mt-1">{subtitle}</p>}
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="sm:w-auto w-full">
          <ActionIcon className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
