import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Clock } from 'lucide-react';
import { getCalendarData } from '../services/streakService';
import useAuth from '../hooks/useAuth';

const Calendar = ({ className = "" }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const { token } = useAuth();

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fetch calendar data
  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const data = await getCalendarData(token, currentDate.getFullYear(), currentDate.getMonth());
      setCalendarData(data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update countdown timer
  const updateCountdown = () => {
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const timeLeft = endOfDay.getTime() - now.getTime();
    
    if (timeLeft > 0) {
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    } else {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
    }
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // Format time with leading zeros
  const formatTime = (num) => num.toString().padStart(2, '0');

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate, token]);

  useEffect(() => {
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 ${className}`}>
      {/* Header with countdown and navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-green-500" />
            <span className="text-white font-semibold">
              Day {currentDate.getDate()}
            </span>
          </div>
          <div className="text-gray-300 text-sm">
            {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)} left
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Current date badge */}
      <div className="flex justify-center mb-6">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full font-semibold">
          {currentDate.getDate()} {months[currentDate.getMonth()].toUpperCase()}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="space-y-2">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="text-center text-gray-400 text-sm font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarData.map((week, weekIndex) =>
            week.map((day, dayIndex) => (
              <div key={`${weekIndex}-${dayIndex}`} className="relative">
                {day ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                    className={`
                      aspect-square rounded-lg border-2 flex items-center justify-center relative
                      ${day.solved 
                        ? 'bg-green-500/20 border-green-500 text-green-300' 
                        : 'bg-gray-700/50 border-gray-600 text-gray-400'
                      }
                      ${day.date && new Date(day.date).getDate() === new Date().getDate() &&
                        new Date(day.date).getMonth() === new Date().getMonth() &&
                        new Date(day.date).getFullYear() === new Date().getFullYear()
                        ? 'ring-2 ring-blue-500 ring-opacity-50' 
                        : ''
                      }
                    `}
                  >
                    <span className="text-sm font-medium">{day.day}</span>
                    
                    {/* Solved indicator */}
                    {day.solved ? (
                      <CheckCircle className="absolute -bottom-1 -right-1 w-4 h-4 text-green-500 bg-gray-800 rounded-full" />
                    ) : (
                      <Circle className="absolute -bottom-1 -right-1 w-4 h-4 text-red-500 bg-gray-800 rounded-full" />
                    )}
                  </motion.div>
                ) : (
                  <div className="aspect-square"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Weekly premium section */}
      <div className="mt-6 bg-gray-700/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold">Weekly Premium</span>
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white">?</span>
            </div>
          </div>
          <span className="text-gray-300 text-sm">Less than a day</span>
        </div>
        
        <div className="flex space-x-2">
          {['W1', 'W2', 'W3', 'W4', 'W5'].map((week, index) => (
            <div
              key={week}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                ${index === 4 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
                  : 'bg-gray-600 text-gray-300'
                }
              `}
            >
              {week}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom section */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-green-500 rounded-lg"></div>
          <span className="text-gray-300 text-sm">0 Redeem</span>
        </div>
        <button className="text-blue-400 hover:text-blue-300 text-sm">
          Rules
        </button>
      </div>
    </div>
  );
};

export default Calendar; 