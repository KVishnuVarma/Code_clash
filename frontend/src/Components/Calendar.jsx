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

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
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
      <div className={`bg-zinc-900 border border-zinc-800 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-zinc-800 rounded mb-4"></div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="h-10 bg-zinc-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-zinc-400" />
          </button>
          <h3 className="text-lg font-medium text-white min-w-[140px] text-center">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-zinc-800 rounded-md">
          <Clock className="w-4 h-4 text-zinc-500" />
          <span className="text-zinc-300 text-sm font-mono">
            {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
          </span>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="text-center text-zinc-500 text-sm py-2 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1 mb-6">
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
                    h-10 rounded-md flex items-center justify-center relative cursor-pointer text-sm font-medium
                    transition-all duration-200 group hover:scale-105
                    ${day.solved 
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                    }
                    ${day.date && new Date(day.date).getDate() === new Date().getDate() &&
                      new Date(day.date).getMonth() === new Date().getMonth() &&
                      new Date(day.date).getFullYear() === new Date().getFullYear()
                      ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-zinc-900' 
                      : ''
                    }
                  `}
                >
                  <span>{day.day}</span>
                  
                  {day.solved && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-zinc-900" />
                  )}
                </motion.div>
              ) : (
                <div className="h-10"></div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom stats */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-zinc-400 text-sm">Solved</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-zinc-700 rounded-full"></div>
            <span className="text-zinc-400 text-sm">Pending</span>
          </div>
        </div>
        <button className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors font-medium">
          Rules
        </button>
      </div>
    </div>
  );
};

export default Calendar;