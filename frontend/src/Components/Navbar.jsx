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

  return (
    <nav className="bg-[#0A192F] text-white px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        <Link to="/" className="text-2xl font-bold text-[#00D8FF]">
          CodeClash
        </Link>

        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/" className="hover:text-[#00D8FF] transition-all">Home</Link>
          <Link to="/contests" className="hover:text-[#00D8FF] transition-all">Contests</Link>
          <Link to="/leaderboard" className="hover:text-[#00D8FF] transition-all">Leaderboard</Link>
          <div className="ml-4">
            {!user ? (
              <Link 
                to="/login" 
                className="bg-[#00D8FF] text-[#0A192F] font-semibold px-5 py-2 rounded-md shadow-md transition-all hover:bg-[#00AACC]"
              >
                Login
              </Link>
            ) : (
              <button 
                onClick={handleLogout} 
                className="bg-red-500 text-white px-5 py-2 rounded-md shadow-md transition-all hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-xl focus:outline-none">
          {isOpen ? "✖" : "☰"}
        </button>
      </div>
      {isOpen && (
        <div className="md:hidden bg-[#0A192F] p-4 flex flex-col space-y-4 text-center">
          <Link to="/" className="hover:text-[#00D8FF] transition-all" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/contests" className="hover:text-[#00D8FF] transition-all" onClick={() => setIsOpen(false)}>Contests</Link>
          <Link to="/leaderboard" className="hover:text-[#00D8FF] transition-all" onClick={() => setIsOpen(false)}>Leaderboard</Link>
          {user && <Link to="/profile" className="hover:text-[#00D8FF] transition-all" onClick={() => setIsOpen(false)}>Profile</Link>}
          {user?.role === "admin" && (
            <Link to="/admin" className="hover:text-[#FFD700] transition-all font-semibold" onClick={() => setIsOpen(false)}>Admin Panel</Link>
          )}
          <div className="mt-4">
            {!user ? (
              <Link 
                to="/login" 
                className="bg-[#00D8FF] text-[#0A192F] font-semibold px-5 py-2 rounded-md shadow-md transition-all hover:bg-[#00AACC]"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            ) : (
              <button 
                onClick={handleLogout} 
                className="bg-red-500 text-white px-5 py-2 rounded-md shadow-md transition-all hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
