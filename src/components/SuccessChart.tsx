"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface SuccessChartProps {
  totalSolved: number;
  totalAttemptedUnsolved: number;
  totalNotTried: number;
  size?: number; // optional override for outer container (px)
}

const COLORS = ["#3B82F6", "#E11D48", "#9CA3AF"]; // blue, red, gray
const NAMES = ["Solved", "Attempted Unsolved", "Not Tried"];

const formatNumber = (n: number) => n.toLocaleString();

const SuccessChart: React.FC<SuccessChartProps> = ({
  totalSolved,
  totalAttemptedUnsolved,
  totalNotTried,
  size = 180, // 🔥 slightly bigger by default
}) => {
  const data = useMemo(
    () => [
      { name: NAMES[0], value: Math.max(0, Math.round(totalSolved)) },
      { name: NAMES[1], value: Math.max(0, Math.round(totalAttemptedUnsolved)) },
      { name: NAMES[2], value: Math.max(0, Math.round(totalNotTried)) },
    ],
    [totalSolved, totalAttemptedUnsolved, totalNotTried]
  );

  const total = data.reduce((s, d) => s + d.value, 0);

  const withPerc = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        percent: total > 0 ? Math.round((d.value / total) * 1000) / 10 : 0,
      })),
    [data, total]
  );

  const centerText = useMemo(() => {
    const solved = withPerc[0]?.percent ?? 0;
    return `${solved}%`;
  }, [withPerc]);

  const tooltipFormatter = (value: number, name: string) => {
    const item = withPerc.find((i) => i.name === name) || null;
    const pct = item ? `${item.percent}%` : "";
    return [`${formatNumber(value)} (${pct})`, name];
  };

  const emptyData = [{ name: "empty", value: 1 }];

  return (
    <div
      style={{ width: size, height: size + 40 }}
      aria-hidden
      className="relative flex flex-col items-center"
    >
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={total === 0 ? emptyData : withPerc}
              cx="50%"
              cy="50%"
              innerRadius={size * 0.33}
              outerRadius={size * 0.45}
              startAngle={90}
              endAngle={450}
              dataKey="value"
              stroke="none"
              isAnimationActive={true}
            >
              {(total === 0 ? emptyData : withPerc).map((entry, index) => {
                if (total === 0) return <Cell key={`cell-empty`} fill="#E5E7EB" />;
                return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
              })}
            </Pie>

            <Tooltip
              formatter={tooltipFormatter}
              cursor={{ fill: "transparent" }}
              wrapperStyle={{
                zIndex: 9999,
                fontSize: "0.75rem",
                backgroundColor: "#fff",
                borderRadius: "8px",
                padding: "4px 8px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
          style={{ pointerEvents: "none" }}
        >
          <div className="text-base font-semibold text-gray-800">{centerText}</div>
          <div className="text-xs text-gray-500">Solved</div>
        </div>
      </div>


      {/* <div className="flex flex-col justify-center gap-3 mt-5 text-xs text-gray-600">
        {withPerc.map((d, i) => (
          <div key={i} className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: COLORS[i] }}
            ></span>
            <span className="font-medium">{d.name}</span>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default React.memo(SuccessChart);
