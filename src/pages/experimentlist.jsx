import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";

const ExperimentList = () => {
  const [experiments, setExperiments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "experiments"));
        const expList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExperiments(expList);
      } catch (err) {
        console.error("Error fetching experiments:", err);
      }
    };
    fetchExperiments();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this experiment?")) return;
    try {
      await deleteDoc(doc(db, "experiments", id));
      setExperiments(prev => prev.filter(exp => exp.id !== id));
    } catch (err) {
      console.error("Error deleting experiment:", err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Experiments Dashboard</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Metrics Summary</th>
            <th className="p-2 border">Created At</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {experiments.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-4 text-center">No experiments found.</td>
            </tr>
          ) : (
            experiments.map(exp => {
              const createdAt = exp.createdAt?.seconds
                ? new Date(exp.createdAt.seconds * 1000)
                : new Date(exp.createdAt);

              // Summary: metrics for all models
              const metricsSummary = exp.metrics
                ? Object.entries(exp.metrics)
                    .map(([model, metrics]) => {
                      const acc = metrics?.accuracy != null ? metrics.accuracy.toFixed(2) : "-";
                      return `${model}: Acc ${acc}`;
                    })
                    .join(", ")
                : "No metrics";

              return (
                <tr key={exp.id} className="text-center">
                  <td className="p-2 border">{exp.name}</td>
                  <td className="p-2 border">{exp.status}</td>
                  <td className="p-2 border text-sm">{metricsSummary}</td>
                  <td className="p-2 border">{createdAt.toLocaleString()}</td>
                  <td className="p-2 border flex justify-center gap-2">
                    <button
                      onClick={() => navigate(`/experiment/${exp.id}`)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExperimentList;
