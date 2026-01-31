import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import Loader from "../components/loader";
import axios from "axios";

const ExperimentForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "In Progress",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a CSV file!");

    setLoading(true);
    setError("");

    try {
      const formDataBackend = new FormData();
      formDataBackend.append("file", file);

      const res = await axios.post("http://127.0.0.1:8000/upload-dataset/", formDataBackend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const experimentData = {
        name: formData.name || file.name.split(".")[0],
        description: formData.description,
        status: "Completed",
        createdBy: auth.currentUser?.uid || "unknown",
        metrics: res.data?.metrics || {},
        hyperparameters: res.data?.hyperparameters || {},
        experimentId: res.data?.experimentId || "",
        createdAt: new Date()
      };

      // Use experiment name as document ID
      const experimentRef = doc(db, "experiments", experimentData.name);
      await setDoc(experimentRef, experimentData, { merge: true });

      navigate("/landing");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">Add New Experiment</h2>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <input
          type="text"
          name="name"
          placeholder="Experiment Name"
          value={formData.name}
          onChange={handleChange}
          className="border p-3 rounded-lg mb-4 w-full"
        />
        <textarea
          name="description"
          placeholder="Experiment Description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className="border p-3 rounded-lg mb-4 w-full"
        />
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="mb-4 w-full"
        />

        <button type="submit" disabled={loading} className="bg-blue-500 text-white py-3 rounded-lg w-full">
          {loading ? <Loader /> : "Add Experiment"}
        </button>
      </form>
    </div>
  );
};

export default ExperimentForm;
