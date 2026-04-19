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
          <CartesianGrid stroke="rgba(109,159,122,0.1)" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fill: "#ebe4ef", fontSize: 11 }} axisLine={{ stroke: "rgba(212,184,125,0.2)" }} />
          <YAxis allowDecimals={false} tick={{ fill: "#ebe4ef", fontSize: 11 }} axisLine={{ stroke: "rgba(212,184,125,0.2)" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#120818",
              border: "1px solid rgba(149,82,128,0.45)",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Line type="monotone" dataKey="count" stroke="#b87aa5" strokeWidth={2} dot={{ fill: "#6d9f7a", r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
