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

interface ProfitChartProps {
  data: { date: string; profit: number; revenue: number }[];
}

export default function ProfitChart({ data }: ProfitChartProps) {
  const formatValue = (value: number) => {
    if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₦${(value / 1000).toFixed(0)}K`;
    return `₦${value}`;
  };

  return (
    <div className="rounded-xl border border-surface-700/50 bg-surface-800/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Profit Analysis</h3>
      <div className="h-[300px]">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-surface-400 text-sm">
            No data available for the selected range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#475569"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(val) => new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
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
                formatter={(value: any) => [formatValue(Number(value) || 0), "Profit"]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#profitGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
