import React from 'react';

const CalendarHeatmap = ({ data }) => {
  const createHeatmapData = () => {
    const weeks = [];
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneYearAgo.setDate(today.getDate());
    
    // Find the Sunday of the week containing the start date
    const startDate = new Date(oneYearAgo);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // Generate exactly 53 weeks
    for (let weekIndex = 0; weekIndex < 53; weekIndex++) {
      const week = [];
      
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + weekIndex * 7 + dayIndex);
        
        const dateStr = currentDate.toISOString().split('T')[0];
        const submissionCount = data?.[dateStr] || 0;
        
        const isWithinYear = currentDate >= oneYearAgo && currentDate <= today;
        
        week.push({
          date: currentDate,
          count: isWithinYear ? submissionCount : -1,
          dateStr,
          isWithinYear
        });
      }
      
      weeks.push(week);
    }
    
    return weeks;
  };

  const getMonthLabels = (weeks) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = [];
    let currentMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      const firstValidDay = week.find(day => day.isWithinYear);
      
      if (firstValidDay) {
        const month = firstValidDay.date.getMonth();
        
        // Add label for new month if there's enough space
        if (month !== currentMonth) {
          // Only add if it's the first label or there's at least 3 weeks gap
          const shouldAdd = labels.length === 0 || 
                           (weekIndex - labels[labels.length - 1].weekIndex >= 3);
          
          if (shouldAdd) {
            labels.push({
              name: monthNames[month],
              weekIndex,
              month
            });
          }
          currentMonth = month;
        }
      }
    });
    
    return labels;
  };

  const weeks = createHeatmapData();
  const monthLabels = getMonthLabels(weeks);

  const getColorClass = (count) => {
    if (count === -1) return 'bg-transparent';
    if (count === 0) return 'bg-slate-600 hover:bg-slate-500';
    if (count <= 1) return 'bg-green-800 hover:bg-green-700';
    if (count <= 2) return 'bg-green-600 hover:bg-green-500';
    if (count <= 4) return 'bg-green-500 hover:bg-green-400';
    return 'bg-green-400 hover:bg-green-300';
  };

  // Calculate stats
  const calculateStats = () => {
    let totalSubmissions = 0;
    let activeDays = 0;
    let maxStreak = 0;
    
    const allDays = weeks.flat().filter(day => day?.isWithinYear);
    
    allDays.forEach(day => {
      if (day.count > 0) {
        totalSubmissions += day.count;
        activeDays++;
      }
    });
    
    // Calculate max streak
    let currentStreak = 0;
    allDays.forEach(day => {
      if (day.count > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    
    return { totalSubmissions, activeDays, maxStreak };
  };

  // eslint-disable-next-line no-unused-vars
  const stats = calculateStats();

  return (
    <div className="w-full">
      {/* Header stats */}
      <div className="flex justify-between items-center mb-3 text-sm">
        <div className="flex space-x-6 text-gray-400">
        </div>
      </div>

      <div className="flex items-start">
        {/* Day labels */}
        <div className="flex flex-col text-xs text-gray-500 mr-2 pt-1">
          <div className="h-2.5 mb-1"></div>
          <div className="h-2.5 mb-1 leading-none">Mon</div>
          <div className="h-2.5 mb-1"></div>
          <div className="h-2.5 mb-1 leading-none">Wed</div>
          <div className="h-2.5 mb-1"></div>
          <div className="h-2.5 mb-1 leading-none">Fri</div>
          <div className="h-2.5"></div>
        </div>

        {/* Main grid container */}
        <div className="flex-1">
          {/* Heatmap grid */}
          <div className="flex gap-0.5 mb-2">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-0.5">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`w-2.5 h-2.5 rounded-sm ${getColorClass(day?.count)} 
                              transition-colors duration-200 cursor-pointer`}
                    title={day?.isWithinYear ? 
                      `${day.dateStr}: ${day.count} submission${day.count !== 1 ? 's' : ''}` : 
                      ''
                    }
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Month labels - positioned below the grid */}
          <div className="relative">
            <div className="flex">
              {monthLabels.map((label, index) => (
                <div
                  key={index}
                  className="absolute text-xs text-gray-500"
                  style={{ 
                    left: `${label.weekIndex * 11}px`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {label.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end mt-4 text-xs text-gray-500">
        <span className="mr-2">Less</span>
        <div className="flex gap-1 mr-2">
          <div className="w-2.5 h-2.5 bg-slate-600 rounded-sm"></div>
          <div className="w-2.5 h-2.5 bg-green-800 rounded-sm"></div>
          <div className="w-2.5 h-2.5 bg-green-600 rounded-sm"></div>
          <div className="w-2.5 h-2.5 bg-green-500 rounded-sm"></div>
          <div className="w-2.5 h-2.5 bg-green-400 rounded-sm"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

// Demo component matching CodeClash styling
const App = () => {
  const sampleData = {
    '2024-07-15': 2,
    '2024-07-16': 1,
    '2024-07-30': 3,
    '2024-08-01': 1,
    '2024-08-02': 2,
    '2024-08-05': 1,
    '2024-06-10': 4,
    '2024-05-22': 2,
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      {/* Matching your CodeClash card style */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-lg font-medium">1 submissions in the past year</h2>
          <div className="flex space-x-6 text-sm text-gray-400">
            <span>Total active days: 1</span>
            <span>Max streak: 1</span>
          </div>
        </div>
        
        <div className="bg-slate-750 p-4 rounded-lg border border-slate-600">
          <h3 className="text-white text-base font-medium mb-4">Contribution Activity</h3>
          <CalendarHeatmap data={sampleData} />
        </div>
      </div>
    </div>
  );
};

export default CalendarHeatmap; 