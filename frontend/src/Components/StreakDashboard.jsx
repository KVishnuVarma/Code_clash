import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Flame, Trophy, Target, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getUserStreak, useStreakFreeze } from '../services/streakService';
import toast from 'react-hot-toast';
import Calendar from './Calendar';

const StreakDashboard = () => {
  const [date, setDate] = useState(new Date());
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingFreeze, setUsingFreeze] = useState(false);
  const { user, token } = useAuth();
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  useEffect(() => {
    fetchStreakData();
  }, []);

  const fetchStreakData = async () => {
    try {
      setLoading(true);
      const data = await getUserStreak(token);
      setStreakData(data);
    } catch (error) {
      console.error('Error fetching streak data:', error);
      toast.error('Failed to load streak data');
    } finally {
      setLoading(false);
    }
  };

  const handleUseFreeze = async () => {
    try {
      setUsingFreeze(true);
      await useStreakFreeze(token);
      toast.success('Streak freeze used successfully!');
      await fetchStreakData(); // Refresh data
    } catch (error) {
      toast.error(error.message || 'Failed to use streak freeze');
    } finally {
      setUsingFreeze(false);
    }
  };

  const getDayStatus = (day) => {
    if (!streakData?.dailyProgress) return 'empty';
    
    const dayDate = new Date(day);
    dayDate.setHours(0, 0, 0, 0);
    
    const progress = streakData.dailyProgress.find(
      p => {
        const progressDate = new Date(p.date);
        return progressDate.getTime() === dayDate.getTime();
      }
    );
    
    if (progress) {
      return progress.problemsSolved > 0 ? 'solved' : 'freeze';
    }
    
    return 'empty';
  };

  const getWeekDays = () => {
    const today = new Date();
    const weekDays = [];
    
    // Get the last 7 days
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      weekDays.push(day);
    }
    
    return weekDays;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDayLabel = (date) => {
    const today = new Date();
    const dayDate = new Date(date);
    
    if (dayDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dayDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return dayDate.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${themeColors.bg} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeColors.bg} p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className={`text-4xl font-bold ${themeColors.text} mb-2`}>
            Your Coding Streak
          </h1>
          <p className={`text-lg ${themeColors.textSecondary}`}>
            Keep the momentum going! Solve problems daily to maintain your streak.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Streak Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Current Streak Card */}
            <div className={`${themeColors.cardBg} rounded-xl p-6 shadow-lg border ${themeColors.border}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-bold ${themeColors.text}`}>Current Streak</h2>
                <Flame className="w-8 h-8 text-orange-500" />
              </div>
              
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-500 mb-2">
                  {streakData?.currentStreak || 0}
                </div>
                <p className={`text-lg ${themeColors.textSecondary}`}>days</p>
                
                {streakData?.currentStreak > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((streakData.currentStreak / 50) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className={`text-sm ${themeColors.textSecondary} mt-2`}>
                      {streakData.currentStreak} / 50 days
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Longest Streak Card */}
            <div className={`${themeColors.cardBg} rounded-xl p-6 shadow-lg border ${themeColors.border}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-bold ${themeColors.text}`}>Longest Streak</h2>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              
              <div className="text-center">
                <div className="text-5xl font-bold text-yellow-500 mb-2">
                  {streakData?.longestStreak || 0}
                </div>
                <p className={`text-lg ${themeColors.textSecondary}`}>days</p>
              </div>
            </div>

            {/* Today's Progress */}
            <div className={`${themeColors.cardBg} rounded-xl p-6 shadow-lg border ${themeColors.border}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-bold ${themeColors.text}`}>Today's Progress</h2>
                <Target className="w-8 h-8 text-green-500" />
              </div>
              
              <div className="text-center">
                <div className="text-5xl font-bold text-green-500 mb-2">
                  {streakData?.todaySolved || 0}
                </div>
                <p className={`text-lg ${themeColors.textSecondary} mb-2`}>problems solved</p>
                
                <div className="text-3xl font-bold text-blue-500">
                  {streakData?.todayPoints || 0}
                </div>
                <p className={`text-sm ${themeColors.textSecondary}`}>points earned</p>
              </div>
            </div>

            {/* Streak Freezes */}
            <div className={`${themeColors.cardBg} rounded-xl p-6 shadow-lg border ${themeColors.border}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-bold ${themeColors.text}`}>Streak Freezes</h2>
                <Zap className="w-8 h-8 text-blue-500" />
              </div>
              
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-500 mb-2">
                  {streakData?.streakFreezes || 0}
                </div>
                <p className={`text-lg ${themeColors.textSecondary} mb-4`}>available</p>
                
                <button
                  onClick={handleUseFreeze}
                  disabled={usingFreeze || streakData?.streakFreezes <= 0}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    streakData?.streakFreezes > 0 && !usingFreeze
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {usingFreeze ? 'Using Freeze...' : 'Use Streak Freeze'}
                </button>
                
                <p className={`text-xs ${themeColors.textSecondary} mt-2`}>
                  Use a freeze to maintain your streak when you miss a day
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Calendar and Weekly View */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
                         {/* Calendar Component */}
             <div className={`${themeColors.cardBg} rounded-xl p-6 shadow-lg border ${themeColors.border}`}>
               <div className="flex items-center justify-between mb-6">
                 <h2 className={`text-2xl font-bold ${themeColors.text}`}>Activity Calendar</h2>
                 <CalendarIcon className="w-8 h-8 text-purple-500" />
               </div>
               
               <div className="mb-4">
                 <Calendar
                   mode="single"
                   selected={date}
                   onSelect={setDate}
                   className="rounded-lg border"
                 />
               </div>
               
               <div className="text-center">
                 <p className={`text-lg ${themeColors.textSecondary} mb-4`}>
                   Selected: {formatDate(date)}
                 </p>
                 
                 {getDayStatus(date) === 'solved' && (
                   <div className="flex items-center justify-center space-x-2 text-green-500">
                     <CheckCircle className="w-6 h-6" />
                     <span className="font-semibold">Problems solved on this day!</span>
                   </div>
                 )}
                 
                 {getDayStatus(date) === 'freeze' && (
                   <div className="flex items-center justify-center space-x-2 text-blue-500">
                     <Zap className="w-6 h-6" />
                     <span className="font-semibold">Streak freeze used on this day</span>
                   </div>
                 )}
                 
                 {getDayStatus(date) === 'empty' && (
                   <div className="flex items-center justify-center space-x-2 text-gray-500">
                     <AlertCircle className="w-6 h-6" />
                     <span className="font-semibold">No activity on this day</span>
                   </div>
                 )}
               </div>
             </div>

            {/* Weekly Activity */}
            <div className={`${themeColors.cardBg} rounded-xl p-6 shadow-lg border ${themeColors.border}`}>
              <h2 className={`text-2xl font-bold ${themeColors.text} mb-6`}>This Week's Activity</h2>
              
              <div className="grid grid-cols-7 gap-2">
                {getWeekDays().map((day, index) => {
                  const status = getDayStatus(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className={`relative p-3 rounded-lg text-center transition-all duration-200 ${
                        status === 'solved' 
                          ? 'bg-green-500 text-white' 
                          : status === 'freeze'
                          ? 'bg-blue-500 text-white'
                          : isToday
                          ? 'bg-yellow-500 text-white'
                          : `${themeColors.bg} ${themeColors.text} border ${themeColors.border}`
                      }`}
                    >
                      <div className="text-xs font-semibold mb-1">
                        {getDayLabel(day)}
                      </div>
                      <div className="text-lg font-bold">
                        {day.getDate()}
                      </div>
                      
                      {status === 'solved' && (
                        <div className="absolute -top-1 -right-1">
                          <Flame className="w-4 h-4 text-orange-300" />
                        </div>
                      )}
                      
                      {status === 'freeze' && (
                        <div className="absolute -top-1 -right-1">
                          <Zap className="w-4 h-4 text-blue-300" />
                        </div>
                      )}
                      
                      {isToday && status === 'empty' && (
                        <div className="absolute -top-1 -right-1">
                          <Target className="w-4 h-4 text-yellow-300" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              
              <div className="mt-4 flex justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className={themeColors.textSecondary}>Solved</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className={themeColors.textSecondary}>Freeze Used</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className={themeColors.textSecondary}>Today</span>
                </div>
              </div>
            </div>

            {/* Motivation Message */}
            <div className={`${themeColors.cardBg} rounded-xl p-6 shadow-lg border ${themeColors.border}`}>
              <div className="text-center">
                <Flame className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className={`text-xl font-bold ${themeColors.text} mb-2`}>
                  Don't let your hard work go to waste!
                </h3>
                <p className={`${themeColors.textSecondary} mb-4`}>
                  Code today to keep your streak alive and earn more points.
                </p>
                
                {streakData?.currentStreak > 0 && (
                  <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-4 rounded-lg">
                    <div className="text-2xl font-bold mb-1">
                      {streakData.currentStreak} Day{streakData.currentStreak !== 1 ? 's' : ''} Strong!
                    </div>
                    <div className="text-sm opacity-90">
                      Keep up the amazing work!
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StreakDashboard; 