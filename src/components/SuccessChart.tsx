import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface SuccessChartProps {
  totalSolved: number;
  totalUnsolved: number;
}

const SuccessChart: React.FC<SuccessChartProps> = ({
  totalSolved,
  totalUnsolved,
}) => {
  const total = totalSolved + totalUnsolved;
  const percentage = total > 0 ? ((totalSolved / total) * 100).toFixed(1) : "0";

  const data = [
    { name: "Solved", value: totalSolved },
    { name: "Unsolved", value: totalUnsolved },
  ];

  const COLORS = ["#3B82F6", "#E11D48"];

  return (
    <div className="mr-10 relative w-40 h-40 flex items-center justify-center">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            startAngle={90}
            endAngle={450}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) =>
              name === "Solved"
                ? [`${value} solved`, "Solved"]
                : [`${value} unsolved`, "Unsolved"]
            }
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center text (percentage) */}
      <div className="absolute text-center">
        <span className="text-lg font-semibold">{percentage}%</span>
      </div>
    </div>
  );
};

export default SuccessChart;
