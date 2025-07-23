import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  User,
  Award,
  Layers,
  List,
  LogOut
} from "lucide-react";

const menuItems = [
  { path: "/userDashboard/user-dashboard", label: "Dashboard", icon: Home },
  { path: "/userDashboard/user-profile", label: "Profile", icon: User },
  { path: "/userDashboard/user-leaderboard", label: "Leaderboard", icon: Award },
  { path: "/userDashboard/user-contests", label: "Contests", icon: Layers },
  { path: "/userDashboard/user-problems", label: "Problems", icon: List }
];

const UserNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-50 top-0 left-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-bold text-blue-600">CodeClash</span>
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 font-medium text-base ${
                  location.pathname === item.path
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-blue-100 hover:text-blue-600"
                }`}
              >
                <item.icon size={22} className="mr-2" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-red-100 hover:text-red-600 transition-all duration-200 font-medium"
            >
              <LogOut size={20} className="mr-2" />
              Logout
            </button>
          </div>
          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 flex flex-col">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 font-medium text-base ${
                  location.pathname === item.path
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-blue-100 hover:text-blue-600"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon size={22} className="mr-2" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => { setIsOpen(false); handleLogout(); }}
              className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-red-100 hover:text-red-600 transition-all duration-200 font-medium"
            >
              <LogOut size={20} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default UserNavbar; 