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
          <CartesianGrid stroke="rgba(212,175,55,0.08)" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fill: "#f0e6d8", fontSize: 11 }} axisLine={{ stroke: "rgba(212,175,55,0.22)" }} />
          <YAxis allowDecimals={false} tick={{ fill: "#f0e6d8", fontSize: 11 }} axisLine={{ stroke: "rgba(212,175,55,0.22)" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f0812",
              border: "1px solid rgba(212,175,55,0.35)",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Line type="monotone" dataKey="count" stroke="#d4af37" strokeWidth={2} dot={{ fill: "#7f1d2a", r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
