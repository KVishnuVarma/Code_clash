import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import UserNavbar from "../Components/UserNavbar";
import { useTheme } from "../context/ThemeContext";
import { Search, Filter, Award, Flame, Code, User as UserIcon } from "lucide-react";

function LeaderBoard() {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("points"); // points, streak, solved

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        // Fetch both regular leaderboard and streak leaderboard
        const [regularResponse, streakResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/api/leaderboard`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/streak/leaderboard`)
        ]);

        if (!regularResponse.ok || !streakResponse.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }

        const regularData = await regularResponse.json();
        const streakData = await streakResponse.json();

        // Combine and enrich the data
        const combinedData = regularData.map(user => {
          const streakUser = streakData.leaderboard.find(su => su.email === user.email);
          return {
            ...user,
            currentStreak: streakUser?.currentStreak || 0,
            longestStreak: streakUser?.longestStreak || 0,
            badge: streakUser?.badge || 'none',
            solvedCount: user.solvedProblems?.length || 0,
            displayName: user.displayName || user.username || user.name // Use username as display name
          };
        });

        setUsers(combinedData);
        setFilteredUsers(combinedData);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  useEffect(() => {
    // Apply search filter
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  useEffect(() => {
    // Apply sorting based on filter
    let sorted = [...filteredUsers];
    
    switch(filterBy) {
      case "points":
        sorted.sort((a, b) => b.points - a.points);
        break;
      case "streak":
        sorted.sort((a, b) => b.currentStreak - a.currentStreak);
        break;
      case "solved":
        sorted.sort((a, b) => b.solvedCount - a.solvedCount);
        break;
      default:
        sorted.sort((a, b) => b.points - a.points);
    }
    
    setFilteredUsers(sorted);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterBy]);

  // eslint-disable-next-line no-unused-vars
  const handleUserClick = (username) => {
    if (username) {
      navigate(`/profile/user/${username}`);
    }
  };

  const getBadgeColor = (badge) => {
    switch(badge) {
      case 'bronze': return 'text-amber-600';
      case 'silver': return 'text-gray-400';
      case 'gold': return 'text-yellow-400';
      case 'premium': return 'text-purple-500';
      default: return themeColors.textSecondary;
    }
  };

  const getRankStyle = (index) => {
    if (index === 0) return `bg-yellow-500/10 ${themeColors.text}`;
    if (index === 1) return `bg-gray-400/10 ${themeColors.text}`;
    if (index === 2) return `bg-amber-600/10 ${themeColors.text}`;
    return themeColors.text;
  };

  return (
    <div className={`min-h-screen ${themeColors.bg}`}>
      <UserNavbar />
      <div className="p-6 transition-all duration-300 pt-20">
        <div className={`rounded-lg shadow-lg ${themeColors.cardBg} p-6 mb-6`}>
          <h1 className={`text-2xl font-bold mb-6 ${themeColors.text}`}>Leaderboard</h1>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className={`relative flex-1`}>
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none`}>
                <Search className={`h-5 w-5 ${themeColors.textSecondary}`} />
              </div>
              <input
                type="text"
                placeholder="Search by name, username or department..."
                className={`pl-10 pr-4 py-2 w-full rounded-lg ${themeColors.input} ${themeColors.text} focus:outline-none focus:ring-2 ${themeColors.focusRing}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterBy("points")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${filterBy === "points" ? `${themeColors.accentBg} ${themeColors.accentText}` : `${themeColors.buttonBg} ${themeColors.text}`}`}
              >
                <Award className="h-4 w-4" />
                Points
              </button>
              <button
                onClick={() => setFilterBy("streak")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${filterBy === "streak" ? `${themeColors.accentBg} ${themeColors.accentText}` : `${themeColors.buttonBg} ${themeColors.text}`}`}
              >
                <Flame className="h-4 w-4" />
                Streak
              </button>
              <button
                onClick={() => setFilterBy("solved")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${filterBy === "solved" ? `${themeColors.accentBg} ${themeColors.accentText}` : `${themeColors.buttonBg} ${themeColors.text}`}`}
              >
                <Code className="h-4 w-4" />
                Solved
              </button>
            </div>
          </div>
          
          {/* Leaderboard Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className={`w-12 h-12 rounded-full border-4 ${themeColors.accentBorder} border-t-transparent animate-spin`}></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${themeColors.tableBg} border-b ${themeColors.border}`}>
                    <th className="px-4 py-3 text-left">Rank</th>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Department</th>
                    <th className="px-4 py-3 text-center">Points</th>
                    <th className="px-4 py-3 text-center">Streak</th>
                    <th className="px-4 py-3 text-center">Problems Solved</th>
                    <th className="px-4 py-3 text-center">Badge</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                      <tr 
                        key={user._id} 
                        className={`border-b ${themeColors.border} hover:${themeColors.hoverBg} cursor-pointer transition-colors ${getRankStyle(index)}`}
                      >
                        <td className="px-4 py-4 font-semibold">{index + 1}</td>
                        <td className="px-4 py-4">
                          <Link to={`/profile/name/${encodeURIComponent(user.name)}`} className="flex items-center gap-3 hover:underline">
                            {user.profilePicture ? (
                              <img 
                                src={user.profilePicture} 
                                alt={user.displayName} 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${themeColors.accentBg} ${themeColors.accentText}`}>
                                <UserIcon className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <div className={`font-medium ${themeColors.text}`}>{user.displayName}</div>
                              {user.username && user.username !== user.displayName && (
                                <div className={`text-sm ${themeColors.textSecondary}`}>@{user.username}</div>
                              )}
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-4">{user.department || "N/A"}</td>
                        <td className="px-4 py-4 text-center font-semibold">{user.points}</td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Flame className="w-4 h-4 text-orange-500" />
                            {user.currentStreak}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">{user.solvedCount}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`capitalize font-medium ${getBadgeColor(user.badge)}`}>
                            {user.badge !== 'none' ? user.badge : '-'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className={`px-4 py-8 text-center ${themeColors.textSecondary}`}>
                        {searchTerm ? "No users found matching your search" : "No users found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LeaderBoard;
