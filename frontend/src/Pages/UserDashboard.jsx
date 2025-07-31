import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Flame, Trophy, Zap, Clock, Code, Calendar as CalendarIcon, TrendingUp, Award, X } from 'lucide-react';
import UserNavbar from "../Components/UserNavbar";
import { useTheme } from "../context/ThemeContext";
import useAuth from "../hooks/useAuth";
import { getUserStreak } from '../services/streakService';
import { getUserSubmissions, getProblemById } from '../services/problemService';
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

      // Use solvedProblems from user object, sort by solvedAt descending
      let recentSolved = [];
      if (user.solvedProblems && Array.isArray(user.solvedProblems)) {
        
        // Handle both old format (just ObjectIds) and new format (objects with problemId and solvedAt)
        recentSolved = user.solvedProblems
          .filter(sp => {
            // If it's the old format (just a string/ObjectId)
            if (typeof sp === 'string' || sp instanceof String) {
              return sp && sp !== 'undefined';
            }
            // If it's the new format (object with problemId and solvedAt)
            if (sp && typeof sp === 'object' && sp.problemId) {
              // Handle Buffer type problemId
              const problemId = sp.problemId;
              if (problemId && problemId.type === 'Buffer' && problemId.data) {
                // Convert Buffer to string
                // eslint-disable-next-line no-undef
                const buffer = Buffer.from(problemId.data);
                const hexString = buffer.toString('hex');
                return hexString.length > 0;
              }
              return problemId && problemId !== 'undefined';
            }
            return false;
          })
          .map(sp => {
            // Convert old format to new format
            if (typeof sp === 'string' || sp instanceof String) {
              return {
                problemId: sp,
                solvedAt: new Date() // Default to current date for old data
              };
            }
            // Handle new format with Buffer problemId
            if (sp.problemId && sp.problemId.type === 'Buffer' && sp.problemId.data) {
              // eslint-disable-next-line no-undef
              const buffer = Buffer.from(sp.problemId.data);
              const hexString = buffer.toString('hex');
              return {
                problemId: hexString,
                solvedAt: sp.solvedAt || new Date()
              };
            }
            return sp;
          })
          .sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt))
          .slice(0, 5);
      }
      
      // If recentSolved is still empty, try a different approach
      if (recentSolved.length === 0) {
        recentSolved = user.solvedProblems
          .filter(sp => sp && typeof sp === 'object')
          .map(sp => {
            // Try to extract problemId from various possible structures
            let problemId = null;
            let solvedAt = null;
            
            // Check if problemId is directly accessible
            if (sp.problemId) {
              if (sp.problemId.type === 'Buffer' && sp.problemId.data) {
                // eslint-disable-next-line no-undef
                problemId = Buffer.from(sp.problemId.data).toString('hex');
              } else if (typeof sp.problemId === 'string') {
                problemId = sp.problemId;
              }
            }
            
            // Check if _id might be the problemId
            if (!problemId && sp._id) {
              if (sp._id.type === 'Buffer' && sp._id.data) {
                // eslint-disable-next-line no-undef
                problemId = Buffer.from(sp._id.data).toString('hex');
              } else if (typeof sp._id === 'string') {
                problemId = sp._id;
              }
            }
            
            // Get solvedAt
            solvedAt = sp.solvedAt || new Date();
            
            return problemId ? { problemId, solvedAt } : null;
          })
          .filter(item => item !== null)
          .sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt))
          .slice(0, 5);
      }

      // Fetch all submissions for this user (to get score/time for each problem)
      const submissionsResponse = await getUserSubmissions(user._id);
      
      // For each recent solved problem, find the latest accepted submission for that problem
      const recentProblemsData = await Promise.all(recentSolved.map(async (sp) => {
        let problem = null;
        
        try {
          problem = await getProblemById(sp.problemId);
        } catch {
          // Continue with null problem, will use fallback title
        }
        
        // Simple direct string match since both are 24-character ObjectId strings
        const sub = submissionsResponse
          .filter(s => s.problemId === sp.problemId)
          .filter(s => s.status === 'Accepted')
          .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
        
        return {
          problemId: sp.problemId,
          solvedAt: sp.solvedAt,
          score: sub?.score || 0,
          timeTaken: sub?.timeTaken || 0,
          submittedAt: sub?.submittedAt || sp.solvedAt,
          problemTitle: problem?.title || `Problem #${sp.problemId}`,
        };
      }));
      setRecentProblems(recentProblemsData);

      // Fetch registered contests
      // const contestsResponse = await getUserRegisteredContests(user._id);
      // setRegisteredContests(contestsResponse);
      setRegisteredContests([]); // Set empty array for now
      
    } catch {
      // Error handling without console.log
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchUserData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Remove user from dependencies to prevent infinite re-renders

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

  // eslint-disable-next-line no-unused-vars
  const badgeInfo = getBadgeInfo(streakData?.badge);

  // Format time
  // eslint-disable-next-line no-unused-vars
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
                  <span className="text-gray-400 text-sm">{user.solvedProblems?.length || 0} solved</span>
                </div>
                
                {recentProblems.length > 0 ? (
                  <div className="space-y-4">
                    {recentProblems.map((submission) => (
                      <div key={submission.problemId} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                              <Code className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">{submission.problemTitle}</h3>
                              <p className="text-gray-400 text-sm">
                                Score: {submission.score} • Time: {submission.timeTaken}s
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-green-400 text-sm font-medium">✓ Solved</span>
                            <p className="text-gray-400 text-xs">
                              {new Date(submission.solvedAt).toLocaleDateString()}
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
