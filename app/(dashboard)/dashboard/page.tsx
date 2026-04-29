"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import StatCard from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign, ShoppingCart, Package, TrendingUp, ClipboardList } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DashboardPage() {
  const { toggleSidebar } = useLayout();
  const { data: statsRes, isLoading: statsLoading } = useSWR("/api/dashboard/stats", fetcher);
  const { data: salesRes } = useSWR("/api/sales?limit=5&sort=-createdAt", fetcher);

  const stats = statsRes?.data;
  const recentSales = salesRes?.data || [];

  return (
    <div>
      <TopBar 
        title="Dashboard" 
        subtitle="Your sales overview" 
        onMenuClick={toggleSidebar}
      />

      <div className="p-6 space-y-6">
        {/* Quick action */}
        <div className="flex justify-end">
          <Link href="/dashboard/record-sale">
            <Button>
              <TrendingUp className="h-4 w-4" />
              Record New Sale
            </Button>
          </Link>
        </div>

        {/* KPI Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              label="My Revenue"
              value={formatCurrency(stats?.totalRevenue || 0)}
              icon={DollarSign}
              trend={stats?.revenueChange}
            />
            <StatCard
              label="My Sales"
              value={stats?.totalSales || 0}
              icon={ShoppingCart}
              trend={stats?.salesChange}
            />
          </div>
        )}

        {/* Recent Sales */}
        <div className="rounded-xl border border-surface-700/50 bg-surface-800/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Sales</h3>
            <Link href="/dashboard/my-sales">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentSales.length === 0 ? (
              <p className="text-surface-400 text-sm">No sales yet. Record your first sale!</p>
            ) : (
              recentSales.map((sale: Record<string, unknown>) => (
                <div
                  key={sale._id as string}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-900/50 hover:bg-surface-700/30 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{sale.saleNumber as string}</p>
                    <p className="text-xs text-surface-400">
                      {(sale.customerName as string) || "Walk-in"} • {formatDate(sale.createdAt as string)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">
                    {formatCurrency(sale.totalAmount as number)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
