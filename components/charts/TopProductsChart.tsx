"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TopProduct } from "@/types";

interface TopProductsChartProps {
  data: TopProduct[];
}

export default function TopProductsChart({ data }: TopProductsChartProps) {
  const formatValue = (value: number) => {
    if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₦${(value / 1000).toFixed(0)}K`;
    return `₦${value}`;
  };

  return (
    <div className="rounded-xl border border-surface-700/50 bg-surface-800/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Top Selling Products</h3>
      <div className="h-[300px]">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-surface-400 text-sm">
            No sales data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="name"
                stroke="#475569"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(val) => val.length > 12 ? val.slice(0, 12) + "…" : val}
              />
              <YAxis
                stroke="#475569"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={formatValue}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
                formatter={(value: any) => [formatValue(Number(value) || 0), "Revenue"]}
              />
              <Bar
                dataKey="revenue"
                fill="#dc2626"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
