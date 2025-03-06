import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Trophy, List, BarChart, LogOut } from "lucide-react";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 p-6">
      {/* Dashboard Title */}
      <h1 className="text-4xl font-extrabold text-white mb-10 drop-shadow-lg animate-fadeIn">
        Admin Dashboard
      </h1>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {/* Manage Users */}
        <DashboardCard
          title="Manage Users"
          description="View, edit, and manage user accounts."
          to="/admin-dashboard/users"
          icon={<Users size={32} />}
        />

        {/* Manage Contests */}
        <DashboardCard
          title="Manage Contests"
          description="Create and update coding contests."
          to="/admin-dashboard/contests"
          icon={<Trophy size={32} />}
        />

        {/* Manage Problems */}
        <DashboardCard
          title="Manage Problems"
          description="Add, edit, and organize coding problems."
          to="/admin-dashboard/problems"
          icon={<List size={32} />}
        />

        {/* View Leaderboard */}
        <DashboardCard
          title="Leaderboard"
          description="Track top performers in contests."
          to="/admin-dashboard/leaderboard"
          icon={<BarChart size={32} />}
        />

        {/* Logout */}
        <DashboardCard
          title="Logout"
          description="Exit admin panel securely."
          to="/login" // Fixed redirection to login page
          icon={<LogOut size={32} />}
          customClass="bg-gray-500 text-white"
        />
      </div>
    </div>
  );
};

// Reusable Dashboard Card Component with Click Loading Animation
const DashboardCard = ({ title, description, to, icon, customClass = "" }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      navigate(to);
    }, 2000); // 2-second delay before redirection
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-xl bg-gray-800 bg-opacity-40 backdrop-blur-md transition-all transform hover:scale-105 hover:bg-opacity-60 border-2 border-gray-500 hover:border-white hover:shadow-2xl animate-floating ${customClass}`}
      onClick={handleClick}
    >
      {loading ? (
        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <>
          <div className="mb-4 text-gray-300">{icon}</div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-gray-400 text-sm text-center">{description}</p>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
