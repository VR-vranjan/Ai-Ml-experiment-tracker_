import { useState } from "react";

function UploadDataset() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload-dataset/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Error uploading:", err);
      alert("Upload failed. Check console for details.");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Upload Dataset</h2>

      <input type="file" onChange={handleFileChange} className="mb-2"/>
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {result && (
        <div className="mt-4 bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Experiment Result</h3>
          <p><strong>Experiment ID:</strong> {result.experimentId}</p>
          <div className="mt-2">
            <strong>Metrics:</strong>
            <pre className="text-sm">{JSON.stringify(result.metrics, null, 2)}</pre>
          </div>
          <div className="mt-2">
            <strong>Hyperparameters:</strong>
            <pre className="text-sm">{JSON.stringify(result.hyperparameters, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadDataset;
