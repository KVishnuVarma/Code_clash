import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock, Zap } from 'lucide-react';
import { getCalendarData } from '../services/streakService';
import useAuth from '../hooks/useAuth';

const Calendar = ({ className = "" }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const { token } = useAuth();

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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

  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const formatTime = (num) => num.toString().padStart(2, '0');

  useEffect(() => {
    fetchCalendarData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, token]);

  useEffect(() => {
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={`bg-gray-950 border border-gray-800 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-800 rounded mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-950 border border-gray-800 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-sm font-medium text-white">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex items-center space-x-1 px-2 py-1 bg-gray-900 rounded border border-gray-800">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-gray-400 text-xs">
              {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={goToPreviousMonth}
            className="p-1 rounded hover:bg-gray-900 transition-colors border border-gray-800"
          >
            <ChevronLeft className="w-3 h-3 text-gray-400" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-1 rounded hover:bg-gray-900 transition-colors border border-gray-800"
          >
            <ChevronRight className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="text-center text-gray-500 text-xs py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {calendarData.map((week, weekIndex) =>
          week.map((day, dayIndex) => (
            <div key={`${weekIndex}-${dayIndex}`} className="relative">
              {day ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: (weekIndex * 7 + dayIndex) * 0.01,
                    type: "spring",
                    stiffness: 300
                  }}
                  className={`
                    aspect-square rounded flex items-center justify-center relative cursor-pointer text-xs
                    transition-all duration-200 group hover:scale-105
                    ${day.solved 
                      ? 'bg-white text-black font-medium' 
                      : 'bg-gray-900 border border-gray-800 text-gray-400 hover:border-gray-700'
                    }
                    ${day.date && new Date(day.date).getDate() === new Date().getDate() &&
                      new Date(day.date).getMonth() === new Date().getMonth() &&
                      new Date(day.date).getFullYear() === new Date().getFullYear()
                      ? 'ring-1 ring-gray-600' 
                      : ''
                    }
                  `}
                >
                  <span>{day.day}</span>
                  
                  {day.solved ? (
                    <CheckCircle2 className="absolute -top-1 -right-1 w-3 h-3 text-black bg-white rounded-full" />
                  ) : (
                    <Circle className="absolute -top-1 -right-1 w-3 h-3 text-gray-600 bg-gray-950 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </motion.div>
              ) : (
                <div className="aspect-square"></div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom stats */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span className="text-gray-400 text-xs">Active</span>
        </div>
        <button className="text-gray-500 hover:text-gray-400 text-xs transition-colors">
          Rules
        </button>
      </div>
    </div>
  );
};

export default Calendar;