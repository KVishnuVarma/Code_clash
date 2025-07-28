import UserNavbar from "../Components/UserNavbar";
import { useTheme } from "../context/ThemeContext";

function LeaderBoard() {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  return (
    <div className={`min-h-screen ${themeColors.bg}`}>
      <UserNavbar />
      <div className="p-6 transition-all duration-300 pt-20">
        <h1 className={`text-3xl font-bold ${themeColors.text} mb-4`}>Leaderboard</h1>
        <p className={themeColors.textSecondary}>Leaderboard content coming soon...</p>
      </div>
    </div>
  );
}

export default LeaderBoard;
