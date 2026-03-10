"use client";

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

type DataPoint = { maand: string; orgs: number; arr: number };

interface GrowthChartProps {
  data: DataPoint[];
}

export function GrowthChart({ data }: GrowthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={110}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id="arrGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#10B981" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="orgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="maand"
          tick={{ fill: "#9E9890", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#9E9890", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#FFFFFF",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: "10px",
            fontSize: "11px",
            color: "#1C1814",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
          labelStyle={{ color: "#9E9890", marginBottom: "4px" }}
          formatter={(value: number, name: string) => {
            if (name === "arr") return [`€${value.toLocaleString("nl-NL")}`, "MRR"];
            return [value, "Nieuwe orgs"];
          }}
        />
        <Area
          type="monotone"
          dataKey="orgs"
          stroke="#3B82F6"
          strokeWidth={2}
          fill="url(#orgGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#3B82F6" }}
        />
        <Area
          type="monotone"
          dataKey="arr"
          stroke="#10B981"
          strokeWidth={2}
          fill="url(#arrGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#10B981" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
