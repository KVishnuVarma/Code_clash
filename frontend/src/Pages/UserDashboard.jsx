import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Zap, Clock, Code, Calendar as CalendarIcon, TrendingUp, Award, X } from 'lucide-react';
import UserNavbar from "../Components/UserNavbar";
import { useTheme } from "../context/ThemeContext";
import useAuth from "../hooks/useAuth";
import { getUserStreak } from '../services/streakService';
import { getUserSubmissions } from '../services/problemService';
import { getUserRegisteredContests } from '../services/contestService';
import StreakModal from '../Components/StreakModal';
import Calendar from '../Components/Calendar';

function UserDashboard() {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { user, token } = useAuth();
  
  const [streakData, setStreakData] = useState(null);
  const [recentProblems, setRecentProblems] = useState([]);
  const [registeredContests, setRegisteredContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStreakModal, setShowStreakModal] = useState(false);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch streak data
      const streakResponse = await getUserStreak(token);
      setStreakData(streakResponse);
      
      // Fetch recent solved problems
      const submissionsResponse = await getUserSubmissions(user._id);
      const solvedSubmissions = submissionsResponse
        .filter(sub => sub.status === 'Accepted')
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 5);
      setRecentProblems(solvedSubmissions);
      
      // Fetch registered contests
      const contestsResponse = await getUserRegisteredContests(user._id);
      setRegisteredContests(contestsResponse);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchUserData();
    }
  }, [user, token]);

  // Get badge info
  const getBadgeInfo = (badge) => {
    switch (badge) {
      case 'bronze':
        return { name: 'Bronze Badge', icon: '🥉', color: 'from-amber-600 to-orange-600', description: '7+ day streak' };
      case 'silver':
        return { name: 'Silver Badge', icon: '🥈', color: 'from-gray-400 to-gray-600', description: '15+ day streak' };
      case 'gold':
        return { name: 'Gold Badge', icon: '🥇', color: 'from-yellow-500 to-orange-500', description: '30+ day streak' };
      case 'premium':
        return { name: 'Premium Badge', icon: '👑', color: 'from-purple-500 to-pink-500', description: '90+ day streak' };
      default:
        return { name: 'No Badge', icon: '⭐', color: 'from-gray-500 to-gray-700', description: 'Start your streak!' };
    }
  };

  const badgeInfo = getBadgeInfo(streakData?.badge);

  // Format time
  const formatTime = (timeObj) => {
    if (!timeObj) return '00:00:00';
    return `${timeObj.hours.toString().padStart(2, '0')}:${timeObj.minutes.toString().padStart(2, '0')}:${timeObj.seconds.toString().padStart(2, '0')}`;
  };

  // Get contest status color
  const getContestStatusColor = (status) => {
    switch (status) {
      case 'Upcoming': return 'text-blue-400';
      case 'Ongoing': return 'text-green-400';
      case 'Completed': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${themeColors.bg}`}>
        <UserNavbar />
        <div className="transition-all duration-300 pt-20 p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeColors.bg}`}>
      <UserNavbar />
      <div className="transition-all duration-300 pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-gray-400">Track your progress and stay updated with your coding journey</p>
          </motion.div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Side - Contests and Recent Problems */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Registered Contests */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Your Contests</h2>
                  <span className="text-gray-400 text-sm">{registeredContests.length} registered</span>
                </div>
                
                {registeredContests.length > 0 ? (
                  <div className="space-y-4">
                    {registeredContests.map((contest) => (
                      <div key={contest._id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-semibold">{contest.title}</h3>
                            <p className="text-gray-400 text-sm">Difficulty: {contest.difficulty}</p>
                          </div>
                          <div className="text-right">
                            <span className={`font-medium ${getContestStatusColor(contest.status)}`}>
                              {contest.status}
                            </span>
                            <p className="text-gray-400 text-xs">
                              {new Date(contest.startTime).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No contests registered yet</p>
                    <p className="text-gray-500 text-sm">Join contests to compete with others!</p>
                  </div>
                )}
              </motion.div>

              {/* Recent Solved Problems */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Recent Solutions</h2>
                  <span className="text-gray-400 text-sm">{recentProblems.length} solved</span>
                </div>
                
                {recentProblems.length > 0 ? (
                  <div className="space-y-4">
                    {recentProblems.map((submission) => (
                      <div key={submission._id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                              <Code className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">Problem #{submission.problemId}</h3>
                              <p className="text-gray-400 text-sm">
                                Score: {submission.score || 0} • Time: {submission.timeTaken || 0}s
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-green-400 text-sm font-medium">✓ Solved</span>
                            <p className="text-gray-400 text-xs">
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Code className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No problems solved yet</p>
                    <p className="text-gray-500 text-sm">Start solving problems to build your streak!</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Side - Calendar with Streak */}
            <div className="space-y-6">
              
              {/* Streak Summary Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30 cursor-pointer hover:from-orange-600/30 hover:to-red-600/30 transition-all duration-300"
                onClick={() => setShowStreakModal(true)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Flame className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Current Streak</h3>
                      <p className="text-2xl font-bold text-white">{streakData?.currentStreak || 0} days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Click to view details</p>
                    <p className="text-orange-400 text-xs">→</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-white font-semibold">{streakData?.longestStreak || 0}</p>
                    <p className="text-gray-400 text-xs">Longest</p>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{streakData?.streakFreezes || 0}</p>
                    <p className="text-gray-400 text-xs">Freezes</p>
                  </div>
                </div>
              </motion.div>

              {/* Calendar */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Calendar className="w-full" />
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
              >
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Points</span>
                    <span className="text-white font-semibold">{user?.points || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Problems Solved</span>
                    <span className="text-white font-semibold">{user?.solvedProblems?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Today's Progress</span>
                    <span className="text-white font-semibold">
                      {streakData?.todaySolved ? '✅' : '❌'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Streak Modal */}
      <StreakModal 
        isOpen={showStreakModal} 
        onClose={() => setShowStreakModal(false)} 
      />
    </div>
  );
}

export default UserDashboard;
