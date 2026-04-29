"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-10 w-full appearance-none rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-crimson-500/50 focus:border-crimson-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" className="bg-surface-800">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface-800">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 pointer-events-none" />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
