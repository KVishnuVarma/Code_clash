import UserNavbar from '../Components/UserNavbar';
import { useTheme } from '../context/ThemeContext';

function Profile() {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  return (
    <div className={`min-h-screen ${themeColors.bg}`}>
      <UserNavbar />
      <div className="p-6 transition-all duration-300 text-center pt-20">
        <h1 className={`text-3xl font-bold ${themeColors.text} mb-4`}>Profile</h1>
        <p className={themeColors.textSecondary}>Profile content coming soon...</p>
      </div>
    </div>
  );
}

export default Profile;