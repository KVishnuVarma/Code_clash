import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import StreakModal from './StreakModal';

const StreakFlameIcon = ({ streakCount = 0, todaySolved = false, className = "" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  // Determine flame style based on today's status
  const getFlameStyle = () => {
    if (todaySolved) {
      // Thick, bright flame for solved days
      return {
        color: '#f59e0b', // amber-500
        strokeWidth: 2.5,
        filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))'
      };
    } else {
      // Light, dim flame for unsolved days
      return {
        color: '#6b7280', // gray-500
        strokeWidth: 1.5,
        filter: 'none'
      };
    }
  };

  const flameStyle = getFlameStyle();

  return (
    <>
      <motion.button
        onClick={handleClick}
        className={`relative group ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <Flame 
            className="w-6 h-6 transition-all duration-300" 
            style={flameStyle}
          />
          
          {/* Streak count badge */}
          {streakCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {streakCount}
            </motion.div>
          )}
          
          {/* Pulse animation for unsolved days */}
          {!todaySolved && streakCount > 0 && (
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-red-500/20 rounded-full"
            />
          )}
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
          {todaySolved ? 'Streak maintained!' : 'Solve a problem to maintain your streak!'}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </motion.button>

      <StreakModal isOpen={isModalOpen} onClose={handleClose} />
    </>
  );
};

export default StreakFlameIcon; 