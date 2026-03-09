"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface DonutChartProps {
  value: number;     // 0-100
  label: string;
  trend?: number;
  color?: string;
}

export function DonutChart({ value, label, trend, color = "#C8522A" }: DonutChartProps) {
  const data = [
    { value },
    { value: 100 - value },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={42}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={color} />
              <Cell fill="#F0E8DC" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-ink">{value}%</span>
        </div>
      </div>
      <p className="text-xs font-semibold text-ink mt-1">{label}</p>
      {trend !== undefined && (
        <p className={`text-xs font-bold ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
          {trend >= 0 ? "+" : ""}{trend}%
        </p>
      )}
    </div>
  );
}

interface SessionBarProps {
  sessions: { label: string; value: number; color?: string }[];
}

export function SessionBars({ sessions }: SessionBarProps) {
  const max = Math.max(...sessions.map(s => s.value), 1);

  return (
    <div className="flex items-end gap-2 h-20">
      {sessions.map((s, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div className="w-full rounded-t-lg" style={{
            height: `${(s.value / max) * 64}px`,
            background: s.color ?? (i % 2 === 0 ? "#C8522A" : "#E8896A"),
          }} />
          <span className="text-[9px] text-ink-muted text-center leading-tight">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
