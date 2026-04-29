"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  loading?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onPageChange?: (page: number) => void;
  onRowClick?: (item: T) => void;
  getId?: (item: T) => string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  total = 0,
  page = 1,
  limit = 20,
  loading = false,
  searchPlaceholder = "Search...",
  onSearch,
  onPageChange,
  onRowClick,
  getId,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState("");
  const totalPages = Math.ceil(total / limit);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchValue);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-surface-700/50 bg-surface-800/50 overflow-hidden">
        <div className="p-4 border-b border-surface-700/50">
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-surface-700/50 bg-surface-800/50 overflow-hidden">
      {/* Search bar */}
      {onSearch && (
        <div className="p-4 border-b border-surface-700/50">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary" size="default">
              Search
            </Button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-700/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12">
                  <Inbox className="h-12 w-12 text-surface-600 mx-auto mb-3" />
                  <p className="text-surface-400 text-sm">No data found</p>
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr
                  key={getId ? getId(item) : i}
                  onClick={() => onRowClick?.(item)}
                  className={`border-b border-surface-700/30 transition-colors ${
                    onRowClick
                      ? "cursor-pointer hover:bg-surface-700/30"
                      : "hover:bg-surface-700/20"
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-surface-200">
                      {col.render
                        ? col.render(item)
                        : String(item[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-surface-700/50">
          <p className="text-xs text-surface-400">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-surface-300 px-3">
              {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
