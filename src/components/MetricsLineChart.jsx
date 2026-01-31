// src/components/MetricsLineChart.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MetricsLineChart = ({ data }) => {
  if (!data || data.length === 0) return <p>No data available</p>;

  const colors = {
    accuracy: "#4CAF50", // green
    precision: "#2196F3", // blue
    recall: "#FF9800", // orange
    f1_score: "#F44336", // red
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-bold">{label}</p>
          {payload.map((p) => (
            <p key={p.dataKey} style={{ color: p.color }}>
              {p.dataKey}: {(p.value * 100).toFixed(2)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis
          tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`}
          domain={[0, 1]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {Object.keys(colors).map((metric) => (
          <Line
            key={metric}
            type="monotone"
            dataKey={metric}
            stroke={colors[metric]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
            animationDuration={1200}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MetricsLineChart;
