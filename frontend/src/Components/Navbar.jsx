import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Hide Navbar if user is not an admin
  if (!user || user.role !== "admin") return null;

  return (
    <nav className="bg-[#0A192F] text-white px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-[#00D8FF]">
          CodeClash Admin
        </Link>

        <div className="hidden md:flex space-x-6 items-center font-semibold tracking-wide text-gray-200">
          <Link
            to="/admin-dashboard"
            className="relative px-4 py-2 rounded-full transition-all duration-300 
    hover:bg-gradient-to-r from-[#00D8FF] to-[#0078FF] hover:text-gray-900 
    hover:shadow-lg hover:scale-110"
          >
            Dashboard
          </Link>

          <Link
            to="/admin-dashboard/violation-monitor"
            className="relative px-4 py-2 rounded-full transition-all duration-300 
    hover:bg-gradient-to-r from-[#00D8FF] to-[#0078FF] hover:text-gray-900 
    hover:shadow-lg hover:scale-110"
          >
            Violation Monitor
          </Link>

          <Link
            to="/admin-dashboard/contests"
            className="relative px-4 py-2 rounded-full transition-all duration-300 
    hover:bg-gradient-to-r from-[#00D8FF] to-[#0078FF] hover:text-gray-900 
    hover:shadow-lg hover:scale-110"
          >
            Contests
          </Link>

          <Link
            to="/admin-dashboard/problems"
            className="relative px-4 py-2 rounded-full transition-all duration-300 
    hover:bg-gradient-to-r from-[#00D8FF] to-[#0078FF] hover:text-gray-900 
    hover:shadow-lg hover:scale-110"
          >
            Problems
          </Link>

          <Link
            to="/admin-dashboard/leaderboard"
            className="relative px-4 py-2 rounded-full transition-all duration-300 
    hover:bg-gradient-to-r from-[#00D8FF] to-[#0078FF] hover:text-gray-900 
    hover:shadow-lg hover:scale-110"
          >
            Leaderboard
          </Link>

          <div className="flex justify-end pl-8">
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-2 
      rounded-full shadow-md transition-all hover:scale-105 hover:shadow-lg hover:from-red-600 hover:to-red-800"
            >
              Logout
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-xl focus:outline-none"
        >
          {isOpen ? "✖" : "☰"}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#0A192F] p-4 flex flex-col space-y-4 text-center">
          <Link
            to="/admin-dashboard"
            className="hover:text-[#00D8FF] transition-all"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/admin-dashboard/violation-monitor"
            className="hover:text-[#00D8FF] transition-all"
            onClick={() => setIsOpen(false)}
          >
            Violation Monitor
          </Link>
          <Link
            to="/admin-dashboard/contests"
            className="hover:text-[#00D8FF] transition-all"
            onClick={() => setIsOpen(false)}
          >
            Contests
          </Link>
          <Link
            to="/admin-dashboard/problems"
            className="hover:text-[#00D8FF] transition-all"
            onClick={() => setIsOpen(false)}
          >
            Problems
          </Link>
          <Link
            to="/admin-dashboard/leaderboard"
            className="hover:text-[#00D8FF] transition-all"
            onClick={() => setIsOpen(false)}
          >
            Leaderboard
          </Link>
          <Link
            to="/admin-dashboard/users"
            className="hover:text-[#00D8FF] transition-all"
            onClick={() => setIsOpen(false)}
          >
            Users
          </Link>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-5 py-2 rounded-md shadow-md transition-all hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
