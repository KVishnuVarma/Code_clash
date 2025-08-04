import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Flame, Trophy, Zap, Clock, Code, Calendar as CalendarIcon, TrendingUp, Award, X, Star, Target, Swords, Sword } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

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

  if (loading) {
    return (
      <div className={`min-h-screen ${themeColors.bg}`}>
        <UserNavbar />
        <div className="transition-all duration-300 pt-20 p-6">
          <div className="animate-pulse space-y-6">
            <div className={`h-8 ${themeColors.accentBg} rounded w-1/3`}></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`h-32 ${themeColors.accentBg} rounded-xl`}></div>
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
            <h1 className={`text-4xl font-bold ${themeColors.text} mb-2`}>Welcome back, {user?.name}!</h1>
            <p className={themeColors.textSecondary}>Track your progress and stay updated with your coding journey</p>
          </motion.div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Side - Hero Section and Recent Problems */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Epic Battle Animation Hero Section - Direct on Background */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative h-80 overflow-hidden"
              >
                {/* Background with grid pattern */}
                <div className={`absolute inset-0 ${themeColors.bg}`}>
                  <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-700/5 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-600/5 rounded-full blur-3xl"></div>
                </div>

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(156,163,175,0.2) 1px, transparent 0)`,
                    backgroundSize: '30px 30px'
                  }}></div>
                </div>

                {/* Left Sword */}
                <motion.div
                  initial={{ x: -300, y: 50, rotate: 45 }}
                  animate={{ 
                    x: animationComplete ? -100 : 50, 
                    y: animationComplete ? 50 : 100,
                    rotate: animationComplete ? 45 : -15 
                  }}
                  transition={{ 
                    duration: 1.5, 
                    ease: "easeOut",
                    delay: 0.5
                  }}
                  className="absolute top-1/2 left-0 transform -translate-y-1/2 z-20"
                >
                  <Sword className="w-16 h-16 text-gray-300 drop-shadow-2xl" />
                  {/* Trail effect */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="absolute -right-8 top-1/2 transform -translate-y-1/2 w-20 h-1 bg-gradient-to-r from-gray-400 to-transparent blur-sm"
                  ></motion.div>
                </motion.div>

                {/* Right Sword */}
                <motion.div
                  initial={{ x: 300, y: 50, rotate: -135 }}
                  animate={{ 
                    x: animationComplete ? 100 : -50, 
                    y: animationComplete ? 50 : 100,
                    rotate: animationComplete ? -135 : 15 
                  }}
                  transition={{ 
                    duration: 1.5, 
                    ease: "easeOut",
                    delay: 0.5
                  }}
                  onAnimationComplete={() => setAnimationComplete(true)}
                  className="absolute top-1/2 right-0 transform -translate-y-1/2 z-20"
                >
                  <Sword className="w-16 h-16 text-gray-400 drop-shadow-2xl" />
                  {/* Trail effect */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="absolute -left-8 top-1/2 transform -translate-y-1/2 w-20 h-1 bg-gradient-to-l from-gray-500 to-transparent blur-sm"
                  ></motion.div>
                </motion.div>

                {/* Center Clash Effect */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: animationComplete ? [0, 1.5, 1] : 0,
                    opacity: animationComplete ? [0, 1, 0.8] : 0
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: animationComplete ? 0.2 : 2,
                    ease: "easeOut"
                  }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
                >
                  {/* Flash/Spark effect */}
                  <div className="relative">
                    <Swords className={`w-12 h-12 ${themeColors.text} animate-pulse`} />
                    <div className={`absolute inset-0 bg-gray-100/20 rounded-full blur-xl animate-pulse`}></div>
                  </div>
                </motion.div>

                {/* Shockwave Ripple Effect */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: animationComplete ? [0, 3, 0] : 0,
                    opacity: animationComplete ? [0, 0.6, 0] : 0
                  }}
                  transition={{ 
                    duration: 1.2, 
                    delay: animationComplete ? 0.3 : 2.3,
                    ease: "easeOut"
                  }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
                >
                  <div className={`w-32 h-32 border-2 border-gray-500/30 rounded-full`}></div>
                </motion.div>

                {/* Second Shockwave */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: animationComplete ? [0, 4, 0] : 0,
                    opacity: animationComplete ? [0, 0.4, 0] : 0
                  }}
                  transition={{ 
                    duration: 1.5, 
                    delay: animationComplete ? 0.5 : 2.5,
                    ease: "easeOut"
                  }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
                >
                  <div className={`w-32 h-32 border border-gray-600/20 rounded-full`}></div>
                </motion.div>

                {/* Battle Text - Aligned Left */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.8, duration: 0.8 }}
                  className="absolute inset-0 flex flex-col justify-center pl-12 z-40"
                >
                  <motion.h2
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 2, duration: 0.6, type: "spring", stiffness: 200 }}
                    className={`text-6xl font-black ${themeColors.text} mb-3 tracking-wider`}
                    style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}
                  >
                    CODE CLASH
                  </motion.h2>
                  
                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 2.3, duration: 0.6 }}
                    className={`${themeColors.textSecondary} text-xl font-medium tracking-wide mb-6`}
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                  >
                    Where Logic Meets Glory
                  </motion.p>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 2.6, duration: 0.6 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(156, 163, 175, 0.3)' }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-8 py-3 ${themeColors.accentBg} hover:${themeColors.bg} ${themeColors.text} font-semibold rounded-full border ${themeColors.border} transition-all duration-300`}
                      style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                    >
                      <div className="flex items-center space-x-2">
                        <Swords className="w-5 h-5" />
                        <span>Enter Battle</span>
                      </div>
                    </motion.button>
                  </motion.div>
                </motion.div>

                {/* Floating particles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      y: [20, -50, -100],
                      x: [0, Math.random() * 40 - 20, Math.random() * 80 - 40]
                    }}
                    transition={{ 
                      duration: 3,
                      delay: 2 + Math.random() * 2,
                      repeat: Infinity,
                      repeatDelay: Math.random() * 3
                    }}
                    className={`absolute w-1 h-1 ${themeColors.textSecondary} rounded-full`}
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${60 + Math.random() * 20}%`
                    }}
                  />
                ))}
              </motion.div>

              {/* Recent Solved Problems - Moved Below Hero */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`${themeColors.accentBg} rounded-xl p-6`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-semibold ${themeColors.text}`}>Recent Solutions</h2>
                  <span className={`${themeColors.textSecondary} text-sm`}>{user.solvedProblems?.length || 0} solved</span>
                </div>
                
                {recentProblems.length > 0 ? (
                  <div className="space-y-3">
                    {recentProblems.map((submission, index) => (
                      <motion.div 
                        key={submission.problemId} 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 * index }}
                        className={`${themeColors.bg} rounded-lg p-4 hover:shadow-lg transition-all duration-300`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                              <Code className="w-4 h-4 text-green-400" />
                            </div>
                            <div>
                              <h3 className={`${themeColors.text} font-medium text-sm`}>{submission.problemTitle}</h3>
                              <p className={`${themeColors.textSecondary} text-xs`}>
                                Score: {submission.score} • Time: {submission.timeTaken}s
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-green-400 text-xs font-medium">✓ Solved</span>
                            <p className={`${themeColors.textSecondary} text-xs`}>
                              {new Date(submission.solvedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Code className={`w-10 h-10 ${themeColors.textSecondary} mx-auto mb-3`} />
                    <p className={`${themeColors.textSecondary} text-sm`}>No problems solved yet</p>
                    <p className={`${themeColors.textSecondary} text-xs`}>Start solving problems to build your streak!</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Side - Compact Streak and Calendar */}
            <div className="space-y-6">
              
              {/* Compact Streak Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`${themeColors.accentBg} rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-300`}
                onClick={() => setShowStreakModal(true)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <h3 className={`${themeColors.text} font-medium text-sm`}>Current Streak</h3>
                  </div>
                  <p className={`${themeColors.textSecondary} text-xs`}>Click for details</p>
                </div>

                <p className={`text-2xl font-bold ${themeColors.text} text-center mb-2`}>
                  {streakData?.currentStreak || 0} days
                </p>
              </motion.div>

              {/* Compact Calendar */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="w-full"
              >
                <div className="flex items-center justify-center mb-3">
                  <CalendarIcon className="w-5 h-5 text-blue-400 mr-2" />
                  <h3 className={`${themeColors.text} font-medium text-sm`}>Activity Calendar</h3>
                </div>
                <div className="w-full">
                  <Calendar className="w-full" />
                </div>
              </motion.div>

              {/* Today's Progress - Enhanced with metrics */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`${themeColors.accentBg} rounded-xl p-4`}
              >
                <h3 className={`${themeColors.text} font-medium mb-4 flex items-center text-sm`}>
                  <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                  Today's Progress
                </h3>
                
                {/* Progress Status */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`${themeColors.textSecondary} text-sm`}>Completed Today</span>
                  <motion.span 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                    className="text-2xl"
                  >
                    {streakData?.todaySolved ? '✅' : '❌'}
                  </motion.span>
                </div>
                
                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className={`${themeColors.bg} rounded-lg p-3 text-center`}
                  >
                    <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                    <p className={`${themeColors.text} font-semibold text-sm`}>{user?.points || 0}</p>
                    <p className={`${themeColors.textSecondary} text-xs`}>Points</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className={`${themeColors.bg} rounded-lg p-3 text-center`}
                  >
                    <Target className="w-6 h-6 text-green-500 mx-auto mb-1" />
                    <p className={`${themeColors.text} font-semibold text-sm`}>{user?.solvedProblems?.length || 0}</p>
                    <p className={`${themeColors.textSecondary} text-xs`}>Solved</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className={`${themeColors.bg} rounded-lg p-3 text-center`}
                  >
                    <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                    <p className={`${themeColors.text} font-semibold text-sm`}>{streakData?.currentStreak || 0}</p>
                    <p className={`${themeColors.textSecondary} text-xs`}>Streak</p>
                  </motion.div>
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