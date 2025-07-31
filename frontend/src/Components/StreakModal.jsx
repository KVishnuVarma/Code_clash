import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Trophy, Target, Zap, Calendar as CalendarIcon, TrendingUp, Award, Clock, Code, Crown, Star } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { getUserStreak, useStreakFreeze } from '../services/streakService';
import useAuth from '../hooks/useAuth';
import CalendarHeatmap from './CalendarHeatmap';
import Calendar from './Calendar';

const StreakModal = ({ isOpen, onClose }) => {
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const { token } = useAuth();

  const fetchStreakData = async () => {
    try {
      setLoading(true);
      const data = await getUserStreak(token);
      setStreakData(data);
      
      // Calculate weekly stats
      if (data?.dailyProgress) {
        const last7Days = data.dailyProgress.slice(-7);
        const totalProblems = last7Days.reduce((sum, day) => sum + day.problemsSolved, 0);
        const totalPoints = last7Days.reduce((sum, day) => sum + day.pointsEarned, 0);
        const activeDays = last7Days.filter(day => day.solved).length;
        
        setWeeklyStats({
          totalProblems,
          totalPoints,
          activeDays,
          mostActiveDay: last7Days.reduce((max, day) => 
            day.problemsSolved > max.problemsSolved ? day : max
          , { problemsSolved: 0 })
        });
      }
    } catch (error) {
      console.error('Error fetching streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStreakData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, token]);

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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Your Coding Streak</h2>
                  <p className="text-gray-400">Track your daily progress and achievements</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <>
                {/* Streak Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-xl p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        <Flame className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Current Streak</p>
                        <p className="text-2xl font-bold text-white">{streakData?.currentStreak || 0} days</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-yellow-600/20 to-amber-600/20 border border-yellow-500/30 rounded-xl p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Longest Streak</p>
                        <p className="text-2xl font-bold text-white">{streakData?.longestStreak || 0} days</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Zap className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Freezes Left</p>
                        <p className="text-2xl font-bold text-white">{streakData?.streakFreezes || 0} available</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Badge Section */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-6 border border-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 bg-gradient-to-r ${badgeInfo.color} rounded-xl text-2xl`}>
                        {badgeInfo.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{badgeInfo.name}</h3>
                        <p className="text-gray-400">{badgeInfo.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Next Badge</p>
                      <p className="text-white font-semibold">
                        {streakData?.currentStreak < 7 ? '7 days for Bronze' :
                         streakData?.currentStreak < 15 ? '15 days for Silver' :
                         streakData?.currentStreak < 30 ? '30 days for Gold' :
                         streakData?.currentStreak < 90 ? '90 days for Premium' : 'Maximum achieved!'}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Today's Progress */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-green-400" />
                      <h3 className="text-xl font-bold text-white">Today's Progress</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Time Left</p>
                      <p className="text-white font-mono text-lg">
                        {formatTime(streakData?.timeLeft)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{streakData?.todaySolved ? streakData.todaySolved : 0}</p>
                      <p className="text-gray-400 text-sm">Problems Solved</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{streakData?.todayPoints || 0}</p>
                      <p className="text-gray-400 text-sm">Points Earned</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{streakData?.todaySolved ? '✅' : '❌'}</p>
                      <p className="text-gray-400 text-sm">Streak Status</p>
                    </div>
                  </div>

                  {!streakData?.todaySolved && streakData?.currentStreak > 0 && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                      <p className="text-red-300 text-center font-medium">
                        ⚠️ Complete 1 more problem today to maintain your streak!
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Calendar Section */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-5 h-5 text-blue-400" />
                    <h3 className="text-xl font-bold text-white">Activity Calendar</h3>
                  </div>
                  <Calendar />
                </motion.div>

                {/* Weekly Stats */}
                {weeklyStats && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="bg-gray-800 rounded-xl p-4 border border-gray-700"
                  >
                    <h3 className="text-white font-semibold mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                      This Week's Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{weeklyStats.totalProblems}</p>
                        <p className="text-gray-400 text-sm">Problems Solved</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{weeklyStats.totalPoints}</p>
                        <p className="text-gray-400 text-sm">Points Earned</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{weeklyStats.activeDays}/7</p>
                        <p className="text-gray-400 text-sm">Active Days</p>
                      </div>
                    </div>
                    
                    {/* Top Topics */}
                    {streakData?.topTopics && streakData.topTopics.length > 0 && (
                      <div className="border-t border-gray-700 pt-4">
                        <h4 className="text-white font-semibold mb-3 flex items-center">
                          <Code className="w-4 h-4 text-blue-500 mr-2" />
                          Top Topics This Week
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {streakData.topTopics.map((topicData, index) => (
                            <motion.div
                              key={index}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 px-3 py-1 rounded-full text-sm font-medium"
                            >
                              {topicData.topic} ({topicData.count})
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StreakModal; 