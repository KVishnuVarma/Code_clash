import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CalendarHeatmap = ({ dailyProgress = [] }) => {
  const [hoveredDate, setHoveredDate] = useState(null);

  // Generate last 365 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    
    return dates;
  };

  const dates = generateDates();

  const getDayOfWeek = (date) => {
    return date.getDay();
  };

  const getWeekOfYear = (date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  };

  const getProblemsSolved = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const progress = dailyProgress.find(p => {
      const progressDate = new Date(p.date);
      return progressDate.toISOString().split('T')[0] === dateStr;
    });
    return progress ? progress.problemsSolved : 0;
  };

  const getColorClass = (problemsSolved) => {
    if (problemsSolved === 0) return 'bg-gray-700';
    if (problemsSolved === 1) return 'bg-green-600';
    if (problemsSolved === 2) return 'bg-green-500';
    if (problemsSolved === 3) return 'bg-yellow-500';
    return 'bg-orange-500'; // 4+ problems
  };

  const getTooltipText = (date, problemsSolved) => {
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
    
    if (problemsSolved === 0) {
      return `No problems solved on ${dateStr}`;
    }
    return `Solved ${problemsSolved} problem${problemsSolved !== 1 ? 's' : ''} on ${dateStr}`;
  };

  // Group dates by week
  const weeks = [];
  let currentWeek = [];
  
  dates.forEach((date, index) => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(date);
  });
  
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex space-x-2 min-w-max">
        {/* Day labels */}
        <div className="flex flex-col space-y-1 pt-6">
          {dayLabels.map((day, index) => (
            <div key={day} className="h-3 text-xs text-gray-400 text-right pr-2">
              {index % 2 === 0 ? day : ''}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex space-x-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col space-y-1">
              {week.map((date, dayIndex) => {
                const problemsSolved = getProblemsSolved(date);
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <motion.div
                    key={`${weekIndex}-${dayIndex}`}
                    whileHover={{ scale: 1.2 }}
                    className={`relative w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 ${getColorClass(problemsSolved)} ${
                      isToday ? 'ring-2 ring-white ring-opacity-50' : ''
                    }`}
                    onMouseEnter={() => setHoveredDate({ date, problemsSolved })}
                    onMouseLeave={() => setHoveredDate(null)}
                  >
                    {/* Tooltip */}
                    {hoveredDate && hoveredDate.date === date && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-10 whitespace-nowrap"
                      >
                        {getTooltipText(date, problemsSolved)}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end space-x-2 mt-4">
        <span className="text-gray-400 text-sm">Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-gray-700 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
          <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
        </div>
        <span className="text-gray-400 text-sm">More</span>
      </div>
    </div>
  );
};

export default CalendarHeatmap; 