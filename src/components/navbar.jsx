// src/components/Navbar.jsx
import React from "react";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold text-blue-500 cursor-pointer" onClick={() => navigate("/landing")}>
        ML Dashboard
      </div>

      <div className="flex items-center gap-4">
        <span className="text-gray-700 font-medium">{auth.currentUser?.displayName || "User"}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
