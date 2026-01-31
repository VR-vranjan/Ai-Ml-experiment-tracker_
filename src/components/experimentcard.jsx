// src/components/ExperimentCard.jsx
import React from "react";

const ExperimentCard = ({ title, value, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
    >
      <h3 className="text-gray-500 font-medium">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
};

export default ExperimentCard;
