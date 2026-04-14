// src/pages/Landing.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import ExperimentCard from "../components/experimentCard";
import ChartCard from "../components/chartCard";
import Loader from "../components/loader";
import { auth, db } from "../services/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import StatusPieChart from "../components/statuschart";
import PerformanceLineChart from "../components/performance";
import MetricsLineChart from "../components/MetricsLineChart";
import { onAuthStateChanged } from "firebase/auth";

const Landing = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0 });

  const requiredModels = [
    "decision_tree",
    "knn",
    "logistic_regression",
    "random_forest",
    "svm",
  ];

  const isCompleted = (exp) => {
    const metrics = exp.metrics || {};
    return requiredModels.every(
      (model) => metrics[model] && Object.keys(metrics[model]).length > 0
    );
  };

  useEffect(() => {
  let unsubscribeFirestore;

  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setUser(user);
    setLoading(true);

    const q = query(
      collection(db, "experiments"),
      where("createdBy", "==", user.uid)
    );

    unsubscribeFirestore = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("🔥 FIRESTORE DATA:", data);

        setExperiments(data);
        setLoading(false);
      },
      (error) => {
        console.error("❌ SNAPSHOT ERROR:", error);
      }
    );
  });

  return () => {
    unsubscribeAuth();
    if (unsubscribeFirestore) unsubscribeFirestore();
  };
}, [navigate]);

  if (loading) return <Loader />;

  const metricsDataForCharts = {};
  requiredModels.forEach((model) => {
    metricsDataForCharts[model] = experiments.map((exp) => ({
      name: exp.name,
      accuracy: exp.metrics?.[model]?.accuracy || 0,
      precision: exp.metrics?.[model]?.precision || 0,
      recall: exp.metrics?.[model]?.recall || 0,
      f1_score: exp.metrics?.[model]?.f1_score || 0,
    }));
  });

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Hello, {user?.displayName || "User"}!
          </h1>
          <p className="text-gray-600 mb-4">
            Here’s your experiment summary and metrics.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <ExperimentCard title="Total Experiments" value={stats.total} />
            <ExperimentCard title="Completed" value={stats.completed} />
            <ExperimentCard title="In Progress" value={stats.inProgress} />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              onClick={() => navigate("/experiment-form")}
            >
              Add New Experiment
            </button>
            <button
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              onClick={() => navigate("/experiment-list")}
            >
              View All Experiments
            </button>
          </div>

          {/* Recent Experiments */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Recent Experiments</h2>
            {experiments.length === 0 ? (
              <p className="text-gray-600">No experiments yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {experiments.slice(0, 5).map((exp) => (
                  <ExperimentCard
                    key={exp.id}
                    title={exp.name}
                    value={isCompleted(exp) ? "Completed" : "In Progress"}
                    metrics={exp.metrics}
                    onClick={() => navigate(`/experiment/${exp.id}`)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Insights Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Intelligent Experiment Insights
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Top Performing Model */}
              <div className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-500">
                <h3 className="text-lg font-semibold mb-3 tracking-wide">
                  Top Performing Model
                </h3>
                <p className="text-white font-bold text-base">
                  {(() => {
                    let bestModel = "";
                    let bestAccuracy = 0;
                    experiments.forEach((exp) => {
                      requiredModels.forEach((model) => {
                        const acc = exp.metrics?.[model]?.accuracy || 0;
                        if (acc > bestAccuracy) {
                          bestAccuracy = acc;
                          bestModel = model;
                        }
                      });
                    });
                    return bestModel
                      ? `${bestModel} (${(bestAccuracy * 100).toFixed(2)}%)`
                      : "No data";
                  })()}
                </p>
              </div>

              {/* Best Hyperparameters */}
              <div className="bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-500">
                <h3 className="text-lg font-semibold mb-3 tracking-wide">
                  Best Hyperparameters
                </h3>
                <ul className="text-white text-sm list-disc list-inside max-h-36 overflow-y-auto">
                  {(() => {
                    const topHyperparams = [];
                    experiments.forEach((exp) => {
                      requiredModels.forEach((model) => {
                        const hyper = exp.metrics?.[model]
                          ? exp.hyperparameters?.[model]
                          : null;
                        if (hyper)
                          topHyperparams.push(
                            `${model}: ${JSON.stringify(hyper)}`
                          );
                      });
                    });
                    return topHyperparams.length > 0 ? (
                      topHyperparams
                        .slice(0, 5)
                        .map((h, i) => <li key={i}>{h}</li>)
                    ) : (
                      <li>No data</li>
                    );
                  })()}
                </ul>
              </div>

              {/* Dataset Performance Trends */}
              <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-500">
                <h3 className="text-lg font-semibold mb-3 tracking-wide">
                  Dataset Performance Trends
                </h3>
                <ul className="text-white text-sm list-disc list-inside max-h-36 overflow-y-auto">
                  {(() => {
                    return experiments.length > 0 ? (
                      experiments.slice(0, 5).map((exp) => {
                        const bestAcc = Math.max(
                          ...requiredModels.map(
                            (m) => exp.metrics?.[m]?.accuracy || 0
                          )
                        );
                        return (
                          <li key={exp.id}>
                            {exp.name}: {(bestAcc * 100).toFixed(2)}%
                          </li>
                        );
                      })
                    ) : (
                      <li>No data</li>
                    );
                  })()}
                </ul>
              </div>

              {/* Alerts / Anomalies */}
              <div className="bg-gradient-to-br from-red-400 via-red-500 to-red-600 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-500">
                <h3 className="text-lg font-semibold mb-3 tracking-wide">
                  Alerts / Anomalies
                </h3>
                <ul className="text-white text-sm list-disc list-inside max-h-36 overflow-y-auto">
                  {(() => {
                    const alerts = [];
                    experiments.forEach((exp) => {
                      requiredModels.forEach((model) => {
                        const acc = exp.metrics?.[model]?.accuracy || 1;
                        if (acc < 0.5)
                          alerts.push(
                            `${exp.name} - ${model} accuracy dropped (${(
                              acc * 100
                            ).toFixed(2)}%)`
                          );
                      });
                    });
                    return alerts.length > 0 ? (
                      alerts.map((a, i) => <li key={i}>{a}</li>)
                    ) : (
                      <li>No anomalies detected</li>
                    );
                  })()}
                </ul>
              </div>
            </div>
          </div>

          {/* Analytics Charts */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Experiment Analytics</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <ChartCard title="Experiment Status Overview">
                <StatusPieChart experiments={experiments} />
              </ChartCard>
              <ChartCard title="Performance Over Time">
                <PerformanceLineChart experiments={experiments} />
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {requiredModels.map((model) => (
                <ChartCard key={model} title={`${model} Metrics`}>
                  <MetricsLineChart data={metricsDataForCharts[model]} />
                </ChartCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
