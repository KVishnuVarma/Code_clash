import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  User,
  Award,
  Layers,
  List,
  LogOut
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ onExpandChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout(); // Use AuthContext logout to properly handle timer cleanup
  };

  const handleMouseEnter = () => {
    setIsExpanded(true);
    if (onExpandChange) onExpandChange(true);
  };
  const handleMouseLeave = () => {
    setIsExpanded(false);
    if (onExpandChange) onExpandChange(false);
  };

  const sidebarVariants = {
    expanded: {
      width: "240px",
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    collapsed: {
      width: "85px",
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const menuItems = [
    { path: "/userDashboard/user-dashboard", label: "Dashboard", icon: Home },
    { path: "/userDashboard/user-profile", label: "Profile", icon: User },
    { path: "/userDashboard/user-leaderboard", label: "Leaderboard", icon: Award },
    { path: "/userDashboard/user-contests", label: "Contests", icon: Layers },
    { path: "/userDashboard/user-problems", label: "Problems", icon: List }
  ];

  return (
    <motion.div
      className="h-screen bg-white shadow-lg flex flex-col"
      initial="collapsed"
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ minWidth: isExpanded ? "240px" : "85px" }}
    >
      {/* Logo/Header */}
      <div className="flex items-center justify-center h-20 bg-gray-50 border-b border-gray-100">
        <AnimatePresence>
          {isExpanded ? (
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xl font-bold text-gray-800"
            >
              Code Clash
            </motion.h2>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold text-gray-800"
              textAlign="start"
            >
              C
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className={`
              flex items-center px-3 py-3 rounded-lg transition-all duration-200
              ${location.pathname === item.path
                ? "bg-gray-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-blue-500"
              }
            `}
          >
            <item.icon size={28} />
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="ml-3 font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </a>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-3">
        <button
          onClick={handleLogout}
          className={`
            flex items-center w-full px-3 py-3 rounded-lg
            text-gray-600 transition-all duration-200
            hover:bg-red-50 hover:text-red-600
          `}
        >
          <LogOut size={22} />
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3 font-medium"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;