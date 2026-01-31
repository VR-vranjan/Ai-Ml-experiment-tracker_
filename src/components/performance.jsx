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

const PerformanceLineChart = ({ experiments }) => {
  const requiredModels = [
    "decision_tree",
    "knn",
    "logistic_regression",
    "random_forest",
    "svm",
  ];

  const sortedExperiments = [...experiments].sort((a, b) => {
    const aTime = a.createdAt?.seconds
      ? a.createdAt.seconds * 1000
      : new Date(a.createdAt).getTime();
    const bTime = b.createdAt?.seconds
      ? b.createdAt.seconds * 1000
      : new Date(b.createdAt).getTime();
    return aTime - bTime;
  });

  const data = sortedExperiments.map((exp) => {
    const metrics = exp.metrics || {};
    const accuracies = requiredModels.map(
      (model) => metrics[model]?.accuracy ?? 0
    );
    const avgAccuracy =
      accuracies.reduce((a, b) => a + b, 0) / accuracies.length;

    const createdAt = exp.createdAt?.seconds
      ? new Date(exp.createdAt.seconds * 1000)
      : new Date(exp.createdAt);

    return {
      name: exp.name,
      date: createdAt.toLocaleDateString(),
      avgAccuracy: Number(avgAccuracy.toFixed(2)),
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis
          domain={[0, 1]}
          tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
        />
        <Tooltip formatter={(value) => `${(value * 100).toFixed(2)}%`} />
        <Legend verticalAlign="bottom" height={36} />
        <Line
          data={data}
          options={{ responsive: true, maintainAspectRatio: false }}
          type="monotone"
          dataKey="avgAccuracy"
          stroke="#3b82f6"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PerformanceLineChart;
