import React, { useEffect, useState } from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const colorsPalette = [
  "rgba(255, 99, 132, 0.4)",
  "rgba(54, 162, 235, 0.4)",
  "rgba(255, 206, 86, 0.4)",
  "rgba(75, 192, 192, 0.4)",
  "rgba(153, 102, 255, 0.4)",
  "rgba(255, 159, 64, 0.4)",
  "rgba(199, 199, 199, 0.4)",
];

const borderPalette = colorsPalette.map(c => c.replace("0.4", "1"));

const RadarChart = ({ dataObj, label, size = 400, delay = 0, isComparison = false, colorIndex = 0 }) => {
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowChart(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!showChart) return null;

  let chartData;

  if (isComparison) {
    chartData = {
      labels: dataObj.labels,
      datasets: dataObj.datasets.map((d, idx) => ({
        label: d.label,
        data: d.data,
        backgroundColor: colorsPalette[idx % colorsPalette.length],
        borderColor: borderPalette[idx % borderPalette.length],
        borderWidth: 3,
        pointBackgroundColor: borderPalette[idx % borderPalette.length],
        pointBorderColor: "#fff",
        pointRadius: 6,
        fill: true,
        tension: 0.3,
      })),
    };
  } else {
    const labels = Object.keys(dataObj);
    const values = Object.values(dataObj).map((v) => (v === null ? 0 : v));

    chartData = {
      labels,
      datasets: [
        {
          label: label || "Metrics",
          data: values,
          backgroundColor: colorsPalette[colorIndex % colorsPalette.length],
          borderColor: borderPalette[colorIndex % borderPalette.length],
          borderWidth: 3,
          pointBackgroundColor: borderPalette[colorIndex % borderPalette.length],
          pointBorderColor: "#fff",
          pointRadius: 6,
          fill: true,
          tension: 0.3,
        },
      ],
    };
  }

  return (
    <div style={{ width: size, height: size, margin: "20px auto" }}>
      <Radar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 3000,
            easing: "easeInOutQuart",
            animateRotate: true,
            animateScale: true,
          },
          scales: {
            r: {
              angleLines: { color: "#ccc" },
              grid: { color: "#ddd" },
              suggestedMin: 0,
              suggestedMax: 1,
            },
          },
          plugins: {
            legend: {
              position: "bottom",
              labels: { boxWidth: 20, padding: 15 },
            },
          },
        }}
      />
    </div>
  );
};

export default RadarChart;
