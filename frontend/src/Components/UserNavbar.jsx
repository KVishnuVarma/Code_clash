import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import {
  Home,
  User,
  Award,
  Layers,
  List,
  LogOut,
  Palette,
  Moon,
  Sun
} from "lucide-react";



const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/userDashboard/user-dashboard" },
  { id: "problems", label: "Problems", icon: List, path: "/userDashboard/user-problems" },
  { id: "contests", label: "Contests", icon: Layers, path: "/userDashboard/user-contests" },
  { id: "leaderboard", label: "Leaderboard", icon: Award, path: "/userDashboard/user-leaderboard" },
  { id: "profile", label: "Profile", icon: User, path: "/userDashboard/user-profile" }
];

const LoadingSpinner = ({ theme }) => (
  <div className="flex items-center justify-center">
    <div className="relative">
      <div className={`w-6 h-6 rounded-full border-2 ${theme.colors.border} animate-pulse`}></div>
      <div className={`absolute top-0 left-0 w-6 h-6 rounded-full border-2 border-transparent border-t-current ${theme.colors.accent} animate-spin`}></div>
    </div>
  </div>
);

const UserNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { currentTheme, isDarkMode, theme, themes, getThemeColors, toggleDarkMode, changeTheme, isLoading: themeLoading } = useTheme();

  const themeColors = getThemeColors();

  // Get active item based on current location
  const getActiveItem = () => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find(item => item.path === currentPath);
    return activeItem ? activeItem.id : "dashboard";
  };

  const activeItem = getActiveItem();

  // Real navigation handler
  const handleNavigation = (itemId) => {
    const menuItem = menuItems.find(item => item.id === itemId);
    if (menuItem) {
      navigate(menuItem.path);
    }
    setIsOpen(false);
  };

  const handleThemeChange = async (themeKey) => {
    if (themeLoading) return; // Don't allow changes while theme is loading
    
    setIsLoading(true);
    setShowThemeSelector(false);
    
    // Simulate loading animation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    changeTheme(themeKey);
    setIsLoading(false);
  };

  const handleLogout = () => {
    logout();
  };

  const getNavClasses = () => {
    return `${themeColors.navBg} border shadow-lg ${themeColors.shadow}`;
  };

  const getTextClasses = () => {
    return themeColors.text;
  };

  const getActiveClasses = () => {
    return `${themeColors.activeBg} ${themeColors.activeText} shadow-inner`;
  };

  const getHoverClasses = () => {
    return `${themeColors.accentHover} hover:text-gray-800`;
  };

  return (
    <nav className={`fixed w-full z-50 top-0 left-0 transition-all duration-500 border-b ${getNavClasses()}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo with gradient */}
          <div className="flex-shrink-0 flex items-center">
            <span className={`text-2xl font-bold bg-gradient-to-r ${themeColors.gradient} bg-clip-text text-transparent animate-pulse`}>
              CodeClash
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-2 items-center">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`flex items-center px-4 py-2 rounded-xl transition-all duration-300 font-medium text-sm transform hover:scale-105 hover:shadow-md ${
                    activeItem === item.id
                      ? getActiveClasses()
                      : `${getTextClasses()} ${getHoverClasses()}`
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              );
            })}

            {/* Theme Selector */}
            <div className="relative">
              <button
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                className={`p-2 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md ${getTextClasses()} ${getHoverClasses()}`}
                disabled={isLoading || themeLoading}
              >
                {isLoading ? (
                  <LoadingSpinner theme={theme} />
                ) : (
                  <Palette className="w-4 h-4" />
                )}
              </button>

              {showThemeSelector && (
                <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl ${themeColors.bg} border ${themeColors.border} backdrop-blur-lg z-50 overflow-hidden`}>
                  <div className={`p-3 ${themeColors.text} font-medium border-b ${themeColors.border}`}>
                    Choose Theme
                  </div>
                  <div className="p-2 space-y-1">
                    {Object.entries(themes).map(([key, themeOption]) => (
                      <button
                        key={key}
                        onClick={() => handleThemeChange(key)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between ${
                          currentTheme === key
                            ? `${themeColors.activeBg} ${themeColors.activeText}`
                            : `hover:${themeColors.accentBg} ${themeColors.text}`
                        }`}
                      >
                        <span className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 bg-${themeOption.primary}-500`}></div>
                          {themeOption.name}
                        </span>
                        {currentTheme === key && (
                          <div className={`w-2 h-2 rounded-full bg-${themeOption.primary}-500`}></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              disabled={themeLoading}
              className={`p-2 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md ${getTextClasses()} ${getHoverClasses()} ${themeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`flex items-center px-4 py-2 rounded-xl transition-all duration-300 font-medium text-sm transform hover:scale-105 hover:shadow-md text-red-600 hover:bg-red-50 hover:text-red-700`}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              disabled={themeLoading}
              className={`p-2 rounded-lg transition-all duration-300 ${getTextClasses()} ${getHoverClasses()} ${themeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-lg transition-all duration-300 ${getTextClasses()} ${getHoverClasses()}`}
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <span className={`block h-0.5 w-6 bg-current transform transition duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                <span className={`block h-0.5 w-6 bg-current transition duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block h-0.5 w-6 bg-current transform transition duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden ${themeColors.bg} backdrop-blur-lg border-t ${themeColors.border}`}>
        <div className="px-4 py-4 space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 font-medium text-left ${
                  activeItem === item.id
                    ? getActiveClasses()
                    : `${getTextClasses()} ${getHoverClasses()}`
                }`}
              >
                <IconComponent className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}

          {/* Mobile Theme Selector */}
          <div className="pt-2 border-t border-gray-200/50">
            <div className={`text-xs ${themeColors.textSecondary} mb-2 px-4`}>
              Theme
            </div>
            <div className="grid grid-cols-3 gap-2 px-4">
              {Object.entries(themes).map(([key, themeOption]) => (
                <button
                  key={key}
                  onClick={() => handleThemeChange(key)}
                  disabled={isLoading}
                  className={`p-2 rounded-lg transition-all duration-200 flex flex-col items-center space-y-1 ${
                    currentTheme === key
                      ? themeColors.activeBg
                      : `hover:${themeColors.accentBg}`
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-${themeOption.primary}-500`}></div>
                  <span className={`text-xs ${themeColors.text}`}>
                    {themeOption.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 font-medium text-left text-red-600 hover:bg-red-50 hover:text-red-700 mt-4"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;