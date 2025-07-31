import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const CalendarHeatmap = ({ dailyProgress = [] }) => {
  const [hoveredDate, setHoveredDate] = useState(null);

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

  const getProblemsSolved = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const progress = dailyProgress.find(p => {
      const progressDate = new Date(p.date);
      return progressDate.toISOString().split('T')[0] === dateStr;
    });
    return progress ? progress.problemsSolved : Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0;
  };

  const getColorClass = (problemsSolved) => {
    if (problemsSolved === 0) return 'bg-gray-900';
    if (problemsSolved === 1) return 'bg-gray-700';
    if (problemsSolved === 2) return 'bg-gray-500';
    if (problemsSolved === 3) return 'bg-gray-300';
    return 'bg-white';
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

  const weeks = [];
  let currentWeek = [];
  
  dates.forEach((date) => {
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
      <div className="flex space-x-1 min-w-max">
        <div className="flex flex-col space-y-1 pt-4">
          {dayLabels.map((day, index) => (
            <div key={day} className="h-3 text-xs text-gray-500 text-right pr-2">
              {index % 2 === 0 ? day : ''}
            </div>
          ))}
        </div>

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
                      isToday ? 'ring-1 ring-gray-400' : ''
                    }`}
                    onMouseEnter={() => setHoveredDate({ date, problemsSolved })}
                    onMouseLeave={() => setHoveredDate(null)}
                  >
                    {hoveredDate && hoveredDate.date === date && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 border border-gray-800 text-white text-xs rounded shadow-lg z-10 whitespace-nowrap"
                      >
                        {getTooltipText(date, problemsSolved)}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-2 mt-3">
        <span className="text-gray-500 text-xs">Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-gray-900 rounded-sm"></div>
          <div className="w-3 h-3 bg-gray-700 rounded-sm"></div>
          <div className="w-3 h-3 bg-gray-500 rounded-sm"></div>
          <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
          <div className="w-3 h-3 bg-white rounded-sm"></div>
        </div>
        <span className="text-gray-500 text-xs">More</span>
      </div>
    </div>
  );
};

export default CalendarHeatmap; 