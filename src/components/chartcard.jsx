import React from "react";

const ChartCard = ({ title, children }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow flex flex-col h-[400px]">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default ChartCard;
