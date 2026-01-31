// src/components/Sidebar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/landing" },
    { name: "Add Experiment", path: "/experiment-form" },
    { name: "Experiment List", path: "/experiment-list" },
  ];

  return (
    <aside className="w-64 bg-white shadow-md h-screen p-6 hidden md:block">
      <h2 className="text-xl font-bold mb-6">Navigation</h2>
      <ul className="flex flex-col gap-3">
        {menuItems.map((item) => (
          <li
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`cursor-pointer p-2 rounded hover:bg-blue-100 ${
              location.pathname === item.path ? "bg-blue-200 font-semibold" : ""
            }`}
          >
            {item.name}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
