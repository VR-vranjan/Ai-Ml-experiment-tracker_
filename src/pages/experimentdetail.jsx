// src/pages/ExperimentDetail.jsx
import React, { useEffect, useState, useRef } from "react"; 
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useParams } from "react-router-dom";
import Loader from "../components/loader";
import RadarChart from "../components/RadarChart";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ExperimentDetail = () => {
  const { id } = useParams();
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModels, setExpandedModels] = useState({});
  const [showMetrics, setShowMetrics] = useState({}); 
  const radarChartRefs = useRef({}); // For capturing charts

  useEffect(() => {
    const fetchExperiment = async () => {
      try {
        const docRef = doc(db, "experiments", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setExperiment({ id: docSnap.id, ...docSnap.data() });
      } catch (err) {
        console.error("Error fetching experiment:", err);
      }
      setLoading(false);
    };
    fetchExperiment();
  }, [id]);

  const toggleModel = (modelName) => {
    setExpandedModels((prev) => ({ ...prev, [modelName]: !prev[modelName] }));
    setTimeout(() => {
      setShowMetrics((prev) => ({ ...prev, [modelName]: true }));
    }, 1500); // delay metrics after chart
  };

  if (loading) return <Loader />;
  if (!experiment) return <p className="p-6">Experiment not found.</p>;

  const createdAt = experiment.createdAt?.seconds
    ? new Date(experiment.createdAt.seconds * 1000)
    : new Date(experiment.createdAt);

  // Prepare combined data for comparison chart
  const combinedData = {
    labels: [],
    datasets: [],
  };
  if (experiment.metrics) {
    const allLabelsSet = new Set();
    Object.values(experiment.metrics).forEach((metrics) => {
      Object.keys(metrics).forEach((key) => allLabelsSet.add(key));
    });
    combinedData.labels = Array.from(allLabelsSet);

    Object.entries(experiment.metrics).forEach(([modelName, metrics], idx) => {
      const dataArray = combinedData.labels.map((label) => metrics[label] ?? 0);
      combinedData.datasets.push({ label: modelName, data: dataArray });
    });
  }

  // Generate AI-powered dynamic suggestions
  const generateAISuggestions = () => {
    if (!experiment?.metrics) return ["No suggestions available."];
    const suggestions = [];
    const metricsPriority = ["accuracy", "precision", "recall", "f1_score"];

    Object.entries(experiment.metrics).forEach(([modelName, metrics]) => {
      metricsPriority.forEach((metric) => {
        const value = metrics[metric];
        if (value === null || value === undefined) return;

        if (value < 0.6) {
          suggestions.push(
            `${modelName}: Low ${metric} (${value.toFixed(2)}). Consider tuning hyperparameters or preprocessing features.`
          );
        } else if (value > 0.85) {
          suggestions.push(
            `${modelName}: High ${metric} (${value.toFixed(2)}). Current settings performing well.`
          );
        } else {
          suggestions.push(
            `${modelName}: Moderate ${metric} (${value.toFixed(2)}). Minor tuning can improve performance.`
          );
        }
      });
    });

    const topModel = Object.entries(experiment.metrics).reduce((prev, [model, metrics]) => {
      const acc = metrics.accuracy ?? 0;
      return acc > (prev.acc || 0) ? { model, acc } : prev;
    }, {});
    if (topModel.model) {
      suggestions.push(`Top performing model: ${topModel.model} with accuracy ${topModel.acc.toFixed(2)}`);
    }

    return suggestions;
  };

  // Download PDF report
  const downloadReport = async () => {
    const doc = new jsPDF("p", "pt", "a4");
    let yOffset = 40;

    doc.setFontSize(18);
    doc.text(`Experiment Report: ${experiment.name}`, 40, yOffset);
    yOffset += 25;

    doc.setFontSize(12);
    doc.text(`Status: ${experiment.status}`, 40, yOffset);
    yOffset += 15;
    doc.text(`Created At: ${createdAt.toLocaleString()}`, 40, yOffset);
    yOffset += 15;

    // Dataset Info (if available)
    if (experiment.datasetName) {
      doc.setFontSize(14);
      doc.text("Dataset Information:", 40, yOffset);
      yOffset += 15;
      doc.setFontSize(12);
      if (experiment.features) doc.text(`Features: ${experiment.features.join(", ")}`, 40, yOffset);
      yOffset += 15;
      if (experiment.target) doc.text(`Target: ${experiment.target}`, 40, yOffset);
      yOffset += 15;
      if (experiment.preprocessing) doc.text(`Preprocessing: ${experiment.preprocessing}`, 40, yOffset);
      yOffset += 20;
    }

    // Individual Models
    for (let [modelName, metrics] of Object.entries(experiment.metrics)) {
      const hyperparams = experiment.hyperparameters?.[modelName] || {};
      doc.setFontSize(14);
      doc.text(`${modelName} Metrics & Hyperparameters`, 40, yOffset);
      yOffset += 10;

      // Metrics table
      autoTable(doc, {
        startY: yOffset,
        head: [["Metric", "Value"]],
        body: Object.entries(metrics).map(([k, v]) => [k, v ?? "null"]),
        theme: "grid",
        margin: { left: 40 },
        styles: { fontSize: 10 },
      });
      yOffset = doc.lastAutoTable.finalY + 10;

      // Hyperparameters table
      if (Object.keys(hyperparams).length > 0) {
        autoTable(doc, {
          startY: yOffset,
          head: [["Hyperparameter", "Value"]],
          body: Object.entries(hyperparams).map(([k, v]) => [k, v ?? "null"]),
          theme: "grid",
          margin: { left: 40 },
          styles: { fontSize: 10 },
        });
        yOffset = doc.lastAutoTable.finalY + 10;
      }

      // Add RadarChart as image
      if (radarChartRefs.current[modelName]) {
        const chartCanvas = radarChartRefs.current[modelName].querySelector("canvas");
        if (chartCanvas) {
          const chartImg = chartCanvas.toDataURL("image/png", 1.0);
          if (yOffset > 500) {
            doc.addPage();
            yOffset = 40;
          }
          doc.addImage(chartImg, "PNG", 60, yOffset, 400, 200);
          yOffset += 210;
        }
      }
    }

    // Combined Chart
    if (combinedData.datasets.length > 0 && radarChartRefs.current["combined"]) {
      const chartCanvas = radarChartRefs.current["combined"].querySelector("canvas");
      if (chartCanvas) {
        const chartImg = chartCanvas.toDataURL("image/png", 1.0);
        if (yOffset > 500) {
          doc.addPage();
          yOffset = 40;
        }
        doc.setFontSize(14);
        doc.text("Combined Models Comparison", 40, yOffset);
        yOffset += 15;
        doc.addImage(chartImg, "PNG", 60, yOffset, 400, 200);
        yOffset += 210;
      }
    }

    // AI Suggestions
    doc.setFontSize(14);
    doc.text("AI Suggestions:", 40, yOffset);
    yOffset += 15;
    doc.setFontSize(12);
    const suggestions = generateAISuggestions();
    suggestions.forEach((sugg) => {
      if (yOffset > 750) {
        doc.addPage();
        yOffset = 40;
      }
      doc.text(`• ${sugg}`, 50, yOffset);
      yOffset += 12;
    });

    doc.save(`${experiment.name}_report.pdf`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{experiment.name}</h2>
      <p><strong>Status:</strong> {experiment.status}</p>
      <p><strong>Created At:</strong> {createdAt.toLocaleString()}</p>

      {/* Individual Models */}
      {experiment.metrics && Object.keys(experiment.metrics).length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">Models Metrics & Hyperparameters:</h3>
          {Object.keys(experiment.metrics).map((modelName, idx) => {
            const modelMetrics = experiment.metrics[modelName] || {};
            const modelHyperparams = experiment.hyperparameters?.[modelName] || {};

            return (
              <div
                key={modelName}
                className="border p-3 mb-6 rounded cursor-pointer"
                onClick={() => toggleModel(modelName)}
                ref={el => radarChartRefs.current[modelName] = el}
              >
                <h4 className="font-semibold flex justify-between">
                  {modelName} {expandedModels[modelName] ? "▲" : "▼"}
                </h4>

                {expandedModels[modelName] && (
                  <div className="mt-2 ml-4">
                    <RadarChart
                      dataObj={modelMetrics}
                      label={modelName}
                      delay={idx * 400}
                      colorIndex={idx}
                    />

                    {showMetrics[modelName] && (
                      <div className="mt-4 transition-all duration-700 ease-in">
                        <div className="mb-2">
                          <strong>Metrics:</strong>
                          <ul className="list-disc list-inside ml-5">
                            {Object.entries(modelMetrics).map(([key, value]) => (
                              <li key={key}>{key}: {value === null ? "null" : value.toString()}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="mb-2">
                          <strong>Hyperparameters:</strong>
                          <ul className="list-disc list-inside ml-5">
                            {Object.entries(modelHyperparams).length > 0
                              ? Object.entries(modelHyperparams).map(([key, value]) => (
                                  <li key={key}>{key}: {value === null ? "null" : value.toString()}</li>
                                ))
                              : <li>None</li>
                            }
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Combined Comparison Chart */}
      {combinedData.datasets.length > 0 && (
        <div className="mt-8 border p-4 rounded bg-gray-50" ref={el => radarChartRefs.current["combined"] = el}>
          <h3 className="text-xl font-semibold mb-3">All Models Comparison</h3>
          <RadarChart
            dataObj={combinedData}
            isComparison={true}
            delay={0}
          />
        </div>
      )}

      {/* File Download */}
      {experiment.fileUrl && (
        <div className="mt-4">
          <a
            href={experiment.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Download Dataset / File
          </a>
        </div>
      )}

      {/* PDF Report Download */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={downloadReport}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
        >
          Download Full Experiment Report (PDF)
        </button>
      </div>
    </div>
  );
};

export default ExperimentDetail;
