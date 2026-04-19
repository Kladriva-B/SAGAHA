"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type OrdersChartPoint = { date: string; count: number };

export function DashboardOrdersChart({ data }: { data: OrdersChartPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(102,187,106,0.12)" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fill: "#c8e6c9", fontSize: 11 }} axisLine={{ stroke: "rgba(102,187,106,0.2)" }} />
          <YAxis allowDecimals={false} tick={{ fill: "#c8e6c9", fontSize: 11 }} axisLine={{ stroke: "rgba(102,187,106,0.2)" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1b3a24",
              border: "1px solid rgba(102,187,106,0.25)",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Line type="monotone" dataKey="count" stroke="#66bb6a" strokeWidth={2} dot={{ fill: "#2e7d32", r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
