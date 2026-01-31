import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#4ade80", "#facc15"]; // Green = Completed, Yellow = In Progress

const StatusPieChart = ({ experiments }) => {
  const requiredModels = [
    "decision_tree",
    "knn",
    "logistic_regression",
    "random_forest",
    "svm",
  ];

  const isCompleted = (exp) =>
    requiredModels.every(
      (model) => exp.metrics?.[model] && Object.keys(exp.metrics[model]).length > 0
    );

  const completedCount = experiments.filter(isCompleted).length;
  const inProgressCount = experiments.length - completedCount;

  const data = [
    { name: "Completed", value: completedCount },
    { name: "In Progress", value: inProgressCount },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          options={{ responsive: true, maintainAspectRatio: false }}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default StatusPieChart;
