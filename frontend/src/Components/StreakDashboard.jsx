/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Flame, Trophy, Target, Zap, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Clock, Circle, CheckCircle2 } from 'lucide-react';

// Mock hooks and services for demonstration
const useAuth = () => ({ user: { name: 'Demo User' }, token: 'demo-token' });

const getUserStreak = async () => ({
  currentStreak: 15,
  longestStreak: 42,
  todaySolved: 3,
  todayPoints: 150,
  streakFreezes: 2,
  dailyProgress: [
    { date: new Date().toISOString(), problemsSolved: 3 },
    { date: new Date(Date.now() - 86400000).toISOString(), problemsSolved: 2 },
    { date: new Date(Date.now() - 172800000).toISOString(), problemsSolved: 1 },
  ]
});

const useStreakFreeze = async () => ({ success: true });

// Calendar Component
const Calendar = ({ className = "" }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState([]);

  useEffect(() => {
    generateCalendarData();
  }, [currentDate]);

  const generateCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const weeks = [];
    let currentWeek = [];

    for (let d = new Date(startDate); d <= lastDay || currentWeek.length < 7; d.setDate(d.getDate() + 1)) {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push({
        day: d.getDate(),
        date: new Date(d),
        isCurrentMonth: d.getMonth() === month,
        isToday: d.toDateString() === new Date().toDateString()
      });
    }
    if (currentWeek.length > 0) weeks.push(currentWeek);
    setCalendarData(weeks);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={className}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        </button>
        
        <h3 className="text-sm font-medium text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        
        <button
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center">
            <span className="text-xs text-gray-500 font-medium">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarData.map((week, weekIndex) =>
          week.map((day, dayIndex) => (
            <motion.div
              key={`${weekIndex}-${dayIndex}`}
              whileHover={{ scale: 1.05 }}
              className={`relative p-2 text-center rounded text-xs transition-all duration-200 ${
                day.isToday
                  ? 'bg-white text-black font-semibold'
                  : day.isCurrentMonth
                  ? 'text-white hover:bg-gray-800'
                  : 'text-gray-600'
              }`}
            >
              {day.day}
              {day.isToday && (
                <div className="absolute -top-1 -right-1">
                  <Circle className="w-2 h-2 text-black fill-current" />
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

// Calendar Heatmap Component
const CalendarHeatmap = ({ dailyProgress = [] }) => {
  const generateHeatmapData = () => {
    const heatmap = [];
    const today = new Date();
    const startDate = new Date(today.getFullYear(), 0, 1); // January 1st
    
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const progress = dailyProgress.find(p => 
        new Date(p.date).toDateString() === d.toDateString()
      );
      
      heatmap.push({
        date: new Date(d),
        problemsSolved: progress ? progress.problemsSolved : 0
      });
    }
    
    return heatmap;
  };

  const getIntensity = (problemsSolved) => {
    if (problemsSolved === 0) return 'bg-gray-900';
    if (problemsSolved === 1) return 'bg-green-900';
    if (problemsSolved === 2) return 'bg-green-700';
    if (problemsSolved === 3) return 'bg-green-500';
    return 'bg-green-300';
  };

  const heatmapData = generateHeatmapData();
  const weeks = [];
  let currentWeek = [];
  
  heatmapData.forEach((day) => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-1 min-w-max">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col space-y-1">
            {week.map((day, dayIndex) => (
              <motion.div
                key={`${weekIndex}-${dayIndex}`}
                whileHover={{ scale: 1.2 }}
                className={`w-3 h-3 rounded-sm ${getIntensity(day.problemsSolved)} transition-all duration-200`}
                title={`${day.date.toLocaleDateString()}: ${day.problemsSolved} problems solved`}
              />
            ))}
          </div>
        ))}
      </div>
      
      <div className="mt-3 flex justify-center space-x-3 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-900 rounded-sm"></div>
          <span className="text-gray-400">0</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-900 rounded-sm"></div>
          <span className="text-gray-400">1</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
          <span className="text-gray-400">2</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          <span className="text-gray-400">3+</span>
        </div>
      </div>
    </div>
  );
};

const StreakDashboard = () => {
  const [date] = useState(new Date());
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingFreeze, setUsingFreeze] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchStreakData();

  }, [fetchStreakData]);

   
  const fetchStreakData = async () => {
    try {
      setLoading(true);
      const data = await getUserStreak(token);
      setStreakData(data);
    } catch (error) {
      console.error('Error fetching streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseFreeze = async () => {
    try {
      setUsingFreeze(true);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      await useStreakFreeze(token);
      await fetchStreakData();
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      console.error('Failed to use streak freeze');
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

  const getMotivationalMessage = () => {
    const streak = streakData?.currentStreak || 0;
    
    if (streak === 0) {
      return {
        title: "Start Your Journey",
        message: "Every expert was once a beginner. Start solving problems today and build your coding streak!",
        icon: Target
      };
    } else if (streak < 7) {
      return {
        title: "Building Momentum",
        message: "Great start! Keep going for a week to establish a solid habit.",
        icon: Zap
      };
    } else if (streak < 30) {
      return {
        title: "Consistency is Key",
        message: "You're building a strong foundation. Keep up the excellent work!",
        icon: Flame
      };
    } else if (streak < 100) {
      return {
        title: "Impressive Dedication",
        message: "You're in the top tier of consistent coders. Your future self will thank you!",
        icon: Trophy
      };
    } else {
      return {
        title: "Legendary Status",
        message: "You're a coding legend! Your discipline and consistency are truly inspiring.",
        icon: Trophy
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  const motivation = getMotivationalMessage();
  const MotivationIcon = motivation.icon;

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-white mb-1">
            Coding Streak
          </h1>
          <p className="text-sm text-gray-400">
            Solve problems daily to maintain your streak
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column - Streak Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Current Streak Card */}
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white">Current Streak</h2>
                <Flame className="w-5 h-5 text-white" />
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {streakData?.currentStreak || 0}
                </div>
                <p className="text-sm text-gray-400 mb-3">days</p>
                
                {streakData?.currentStreak > 0 && (
                  <div>
                    <div className="w-full bg-gray-800 rounded-full h-1">
                      <div 
                        className="bg-white h-1 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((streakData.currentStreak / 50) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {streakData.currentStreak} / 50 days
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Longest Streak Card */}
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white">Best Streak</h2>
                <Trophy className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-400 mb-1">
                  {streakData?.longestStreak || 0}
                </div>
                <p className="text-sm text-gray-500">days</p>
              </div>
            </div>

            {/* Today's Progress */}
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white">Today</h2>
                <Target className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {streakData?.todaySolved || 0}
                </div>
                <p className="text-sm text-gray-400 mb-2">problems</p>
                
                <div className="text-2xl font-bold text-gray-400">
                  {streakData?.todayPoints || 0}
                </div>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </div>

            {/* Streak Freezes */}
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white">Freezes</h2>
                <Zap className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-400 mb-1">
                  {streakData?.streakFreezes || 0}
                </div>
                <p className="text-sm text-gray-500 mb-3">available</p>
                
                <button
                  onClick={handleUseFreeze}
                  disabled={usingFreeze || streakData?.streakFreezes <= 0}
                  className={`px-4 py-2 rounded text-sm font-medium transition-all duration-200 ${
                    streakData?.streakFreezes > 0 && !usingFreeze
                      ? 'bg-white text-black hover:bg-gray-200'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {usingFreeze ? 'Using...' : 'Use Freeze'}
                </button>
                
                <p className="text-xs text-gray-500 mt-2">
                  Maintain streak when missing a day
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Calendar and Weekly View */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Calendar Component */}
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Calendar</h2>
                <CalendarIcon className="w-5 h-5 text-gray-400" />
              </div>
              
              <Calendar className="mb-4" />
               
               <div className="text-center pt-3 border-t border-gray-800">
                 <p className="text-sm text-gray-400 mb-2">
                   {formatDate(date)}
                 </p>
                 
                 {getDayStatus(date) === 'solved' && (
                   <div className="flex items-center justify-center space-x-2 text-white">
                     <CheckCircle className="w-4 h-4" />
                     <span className="text-sm">Problems solved</span>
                   </div>
                 )}
                 
                 {getDayStatus(date) === 'freeze' && (
                   <div className="flex items-center justify-center space-x-2 text-gray-400">
                     <Zap className="w-4 h-4" />
                     <span className="text-sm">Freeze used</span>
                   </div>
                 )}
                 
                 {getDayStatus(date) === 'empty' && (
                   <div className="flex items-center justify-center space-x-2 text-gray-500">
                     <AlertCircle className="w-4 h-4" />
                     <span className="text-sm">No activity</span>
                   </div>
                 )}
               </div>
            </div>

            {/* Weekly Activity */}
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Weekly Activity</h2>
              
              <div className="grid grid-cols-7 gap-1">
                {getWeekDays().map((day, index) => {
                  const status = getDayStatus(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className={`relative p-2 rounded text-center transition-all duration-200 ${
                        status === 'solved' 
                          ? 'bg-white text-black' 
                          : status === 'freeze'
                          ? 'bg-gray-700 text-white'
                          : isToday
                          ? 'bg-gray-800 text-white border border-gray-600'
                          : 'bg-gray-900 border border-gray-800 text-gray-400'
                      }`}
                    >
                      <div className="text-xs mb-1">
                        {getDayLabel(day)}
                      </div>
                      <div className="text-sm font-semibold">
                        {day.getDate()}
                      </div>
                      
                      {status === 'solved' && (
                        <div className="absolute -top-1 -right-1">
                          <Flame className="w-3 h-3 text-black" />
                        </div>
                      )}
                      
                      {status === 'freeze' && (
                        <div className="absolute -top-1 -right-1">
                          <Zap className="w-3 h-3 text-gray-300" />
                        </div>
                      )}
                      
                      {isToday && status === 'empty' && (
                        <div className="absolute -top-1 -right-1">
                          <Target className="w-3 h-3 text-gray-400" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              
              <div className="mt-3 flex justify-center space-x-3 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-white rounded"></div>
                  <span className="text-gray-400">Solved</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-700 rounded"></div>
                  <span className="text-gray-400">Freeze</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-800 border border-gray-600 rounded"></div>
                  <span className="text-gray-400">Today</span>
                </div>
              </div>
            </div>

            {/* Heatmap */}
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Year Overview</h2>
              <CalendarHeatmap dailyProgress={streakData?.dailyProgress || []} />
            </div>

            {/* Motivation Message */}
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <MotivationIcon className="w-6 h-6 text-white" />
                <h2 className="text-lg font-semibold text-white">{motivation.title}</h2>
              </div>
              
              <p className="text-sm text-gray-400 leading-relaxed">
                {motivation.message}
              </p>
              
              <div className="mt-4 pt-3 border-t border-gray-800">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Next milestone: {streakData?.currentStreak < 7 ? '7 days' : streakData?.currentStreak < 30 ? '30 days' : '100 days'}</span>
                  <Clock className="w-3 h-3" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default StreakDashboard;
