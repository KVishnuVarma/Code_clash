import { useState, useEffect } from "react";
import UserNavbar from "../Components/UserNavbar";
import { useTheme } from "../context/ThemeContext";
import { getAllContests, registerForContest } from "../services/contestService";
import useAuth from "../hooks/useAuth";
import ContestCard from "../Components/ContestCard";

function Contests() {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch contests after authentication is complete and user is available
    if (!authLoading && user) {
      fetchContests();
    }
  }, [authLoading, user]);

  const fetchContests = async () => {
    try {
      const data = await getAllContests();
      setContests(data);
    } catch (error) {
      console.error("Error fetching contests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (contestId) => {
    try {
      setError(null);
      console.log('Starting contest registration for contest:', contestId);
      
      const result = await registerForContest(contestId);
      console.log('Registration result:', result);
      
      console.log('Refreshing contests list...');
      await fetchContests();
      console.log('Contests list refreshed');
    } catch (error) {
      console.error("Error registering for contest:", {
        message: error.message,
        stack: error.stack
      });
      setError(error.message);
      
      if (error.message.includes('No authentication token found')) {
        console.log('No token found, redirecting to login...');
        window.location.href = '/login';
      }
    }
  };

  const isUserRegistered = (contest) => {
    return contest.participants.some(p => 
      p.userId && (p.userId === user.id || p.userId._id === user.id)
    );
  };

  return (
    <div className={`min-h-screen ${themeColors.bg}`}>
      <UserNavbar />
      <div className="p-6 transition-all duration-300 pt-20">
        <h1 className={`text-3xl font-bold ${themeColors.text} mb-6`}>Contests</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {loading ? (
          <div className={`${themeColors.textSecondary}`}>Loading contests...</div>
        ) : contests.length === 0 ? (
          <div className={`${themeColors.textSecondary}`}>No upcoming contests</div>
        ) : (
          <div className="space-y-2">
            {contests.map((contest) => (
              <ContestCard 
                key={contest._id}
                contest={contest}
                onRegister={handleRegister}
                isRegistered={isUserRegistered(contest)}
                user={user}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Contests;
