"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartDataPoint } from "@/types";

interface RevenueChartProps {
  data: ChartDataPoint[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const formatValue = (value: number) => {
    if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₦${(value / 1000).toFixed(0)}K`;
    return `₦${value}`;
  };

  return (
    <div className="rounded-xl border border-surface-700/50 bg-surface-800/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Revenue Overview</h3>
      <div className="h-[300px]">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-surface-400 text-sm">
            No revenue data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                stroke="#475569"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
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
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#dc2626"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
