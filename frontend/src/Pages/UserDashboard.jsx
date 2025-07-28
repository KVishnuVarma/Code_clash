import UserNavbar from "../Components/UserNavbar";
import { useTheme } from "../context/ThemeContext";

function UserDashboard() {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  return (
    <div className={`min-h-screen ${themeColors.bg}`}>
      <UserNavbar />
      <div className="p-6 transition-all duration-300 pt-20">
        <h1 className={`text-center text-2xl font-bold ${themeColors.text}`}>Welcome to the User Dashboard</h1>
      </div>
    </div>
  );
}

export default UserDashboard;
