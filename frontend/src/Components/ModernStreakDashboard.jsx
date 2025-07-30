import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Target, Zap, Calendar as CalendarIcon, TrendingUp, Award, Clock, Code, Crown } from 'lucide-react';
import { getUserStreak } from '../services/streakService';
import useAuth from '../hooks/useAuth';
import StreakFlameIcon from './StreakFlameIcon';
import CalendarHeatmap from './CalendarHeatmap';
import Calendar from './Calendar';

const ModernStreakDashboard = () => {
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
    fetchStreakData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchStreakData, 30000);
    return () => clearInterval(interval);
  }, [token]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-700 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Your Coding Streak</h1>
            <p className="text-gray-400">Track your daily progress and achievements</p>
          </div>
          <StreakFlameIcon 
            streakCount={streakData?.currentStreak || 0} 
            todaySolved={streakData?.todaySolved || false}
          />
        </motion.div>

        {/* Streak Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-red-600/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-6 border border-red-500/30"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <Flame className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Current Streak</p>
                <p className="text-3xl font-bold text-white">{streakData?.currentStreak || 0} days</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-yellow-600/20 to-amber-600/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Longest Streak</p>
                <p className="text-3xl font-bold text-white">{streakData?.longestStreak || 0} days</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Freezes Left</p>
                <p className="text-3xl font-bold text-white">{streakData?.streakFreezes || 0} available</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Badge Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-xl p-6 border border-gray-600"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className={`p-4 bg-gradient-to-r ${badgeInfo.color} rounded-xl text-3xl`}>
                {badgeInfo.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{badgeInfo.name}</h3>
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
          className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Clock className="w-6 h-6 text-green-400" />
              <h3 className="text-2xl font-bold text-white">Today's Progress</h3>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Time Left</p>
              <p className="text-white font-mono text-xl">
                {formatTime(streakData?.timeLeft)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-white">{streakData?.todaySolved ? streakData.todaySolved : 0}</p>
              <p className="text-gray-400">Problems Solved</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-white">{streakData?.todayPoints || 0}</p>
              <p className="text-gray-400">Points Earned</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-white">{streakData?.todaySolved ? '✅' : '❌'}</p>
              <p className="text-gray-400">Streak Status</p>
            </div>
          </div>

          {!streakData?.todaySolved && streakData?.currentStreak > 0 && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-300 text-center font-medium text-lg">
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
            <CalendarIcon className="w-6 h-6 text-blue-400" />
            <h3 className="text-2xl font-bold text-white">Activity Calendar</h3>
          </div>
          <Calendar />
        </motion.div>

        {/* Weekly Stats */}
        {weeklyStats && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
              This Week's Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{weeklyStats.totalProblems}</p>
                <p className="text-gray-400">Problems Solved</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{weeklyStats.totalPoints}</p>
                <p className="text-gray-400">Points Earned</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{weeklyStats.activeDays}/7</p>
                <p className="text-gray-400">Active Days</p>
              </div>
            </div>
            
            {/* Top Topics */}
            {streakData?.topTopics && streakData.topTopics.length > 0 && (
              <div className="border-t border-gray-700 pt-4 mt-4">
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
      </div>
    </div>
  );
};

export default ModernStreakDashboard; 