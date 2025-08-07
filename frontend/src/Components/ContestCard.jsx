import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const ContestCard = ({ contest, onRegister, isRegistered, user }) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const startTime = new Date(contest.startTime);
      const diff = startTime - now;

      if (diff <= 0) {
        setTimeLeft('Started');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [contest.startTime]);

  const handleCardClick = () => {
  navigate(`/contest/${contest._id}`);
};

  return (
    <div 
      className={`${themeColors.cardBg} rounded-lg shadow-md p-6 transition-all duration-300 cursor-pointer relative overflow-hidden mb-4`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className={`text-2xl font-semibold ${themeColors.text} mb-2`}>
            {contest.title}
          </h2>
          <p className={`${themeColors.textSecondary} mb-4`}>
            {new Date(contest.startTime).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex items-center text-blue-400 mb-2">
        <FaClock className="mr-2" />
        <span>Starts in: {timeLeft}</span>
      </div>

      {isRegistered && (
        <div className="mt-2 text-green-500 font-medium">
          Registered
        </div>
      )}
    </div>
  );
};

export default ContestCard;