"use client";

import React, { useState } from "react";
import useSWR from "swr";
import TopBar from "@/components/layout/TopBar";
import StatCard from "@/components/shared/StatCard";
import RevenueChart from "@/components/charts/RevenueChart";
import TopProductsChart from "@/components/charts/TopProductsChart";
import ProfitChart from "@/components/charts/ProfitChart";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

import { useLayout } from "@/context/LayoutContext";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminDashboardPage() {
  const { toggleSidebar } = useLayout();
  const [profitRange, setProfitRange] = useState("30d");
  
  const { data: statsRes, isLoading: statsLoading } = useSWR("/api/dashboard/stats", fetcher);
  const { data: chartRes, isLoading: chartLoading } = useSWR("/api/dashboard/chart", fetcher);
  const { data: profitRes, isLoading: profitLoading } = useSWR(`/api/dashboard/profit?range=${profitRange}`, fetcher);
  const { data: salesRes } = useSWR("/api/sales?limit=5&sort=-createdAt", fetcher);
  const { data: productsRes } = useSWR("/api/products?status=low_stock&limit=5", fetcher);

  const stats = statsRes?.data;
  const chartData = chartRes?.data?.chartData || [];
  const topProducts = chartRes?.data?.topProducts || [];
  const profitData = profitRes?.data || [];
  const recentSales = salesRes?.data || [];
  const lowStockProducts = productsRes?.data || [];

  return (
    <div>
      <TopBar
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening."
        lowStockCount={stats?.lowStockCount || 0}
        onMenuClick={toggleSidebar}
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              label="Total Revenue"
              value={formatCurrency(stats?.totalRevenue || 0)}
              icon={DollarSign}
              trend={stats?.revenueChange}
            />
            <StatCard
              label="Net Profit"
              value={formatCurrency(stats?.totalProfit || 0)}
              icon={TrendingUp}
              trend={stats?.profitChange}
              className="border-emerald-500/20"
            />
            <StatCard
              label="Total Sales"
              value={stats?.totalSales || 0}
              icon={ShoppingCart}
              trend={stats?.salesChange}
            />
            <StatCard
              label="Products"
              value={stats?.totalProducts || 0}
              icon={Package}
            />
            <StatCard
              label="Low Stock"
              value={stats?.lowStockCount || 0}
              icon={AlertTriangle}
              className={stats?.lowStockCount > 0 ? "border-red-500/20" : ""}
            />
          </div>
        )}

        {/* Profit Analysis Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Profit Analysis</h2>
            <div className="w-40">
              <Select
                value={profitRange}
                onChange={(e) => setProfitRange(e.target.value)}
                options={[
                  { value: "24h", label: "Today" },
                  { value: "7d", label: "Last 7 Days" },
                  { value: "30d", label: "Last 30 Days" },
                  { value: "all", label: "All Time" },
                ]}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {profitLoading ? <Skeleton className="h-[380px] rounded-xl" /> : <ProfitChart data={profitData} />}
            </div>
            <div className="lg:col-span-1">
               <TopProductsChart data={topProducts} />
            </div>
          </div>
        </div>

        {/* Secondary Charts & Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart data={chartData} />
          </div>
          <div className="lg:col-span-1 space-y-6">
            {/* Recent Sales */}
            <div className="rounded-xl border border-surface-700/50 bg-surface-800/50 p-6 h-full">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Sales</h3>
              <div className="space-y-3">
                {recentSales.length === 0 ? (
                  <p className="text-surface-400 text-sm">No recent sales</p>
                ) : (
                  recentSales.map((sale: Record<string, unknown>) => (
                    <div
                      key={sale._id as string}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface-900/50 hover:bg-surface-700/30 transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-sm font-medium text-white truncate">
                          {sale.saleNumber as string}
                        </p>
                        <p className="text-xs text-surface-400 truncate">
                          {formatDate(sale.createdAt as string)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-400">
                          {formatCurrency(sale.totalAmount as number)}
                        </p>
                        <p className="text-[10px] text-surface-500">
                          Profit: {formatCurrency(sale.totalProfit as number || 0)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
