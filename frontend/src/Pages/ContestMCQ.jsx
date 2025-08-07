import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaClock, FaUser } from 'react-icons/fa';
import UserNavbar from '../Components/UserNavbar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const ContestMCQ = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const { getThemeColors } = useTheme();
  const { user } = useAuth();
  
  // Get theme colors
  const themeColors = getThemeColors();
  
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contest/${contestId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch contest');
        }
        
        const data = await response.json();
        setContest(data);
        
        // Initialize selected options array with null values for each question
        if (data.mcqProblems && data.mcqProblems.length > 0) {
          setSelectedOptions(new Array(data.mcqProblems.length).fill(null));
        }
      } catch (err) {
        console.error('Error fetching contest:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContest();
  }, [contestId]);

  // Update time left
  useEffect(() => {
    if (!contest) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const endTime = new Date(contest.endTime);
      
      if (now >= endTime) {
        setTimeLeft('Contest Ended');
        return;
      }
      
      const diff = endTime - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, [contest]);

  // Handle option selection
  const handleOptionSelect = (optionIndex) => {
    if (submitted) return;
    
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestion] = optionIndex;
    setSelectedOptions(newSelectedOptions);
  };

  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (contest && contest.mcqProblems && currentQuestion < contest.mcqProblems.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Submit all answers
  const handleSubmit = async () => {
    if (!contest || !contest.mcqProblems) return;
    
    let totalScore = 0;
    contest.mcqProblems.forEach((problem, index) => {
      if (selectedOptions[index] === problem.correctOption) {
        totalScore += problem.points || 10; // Default to 10 points if not specified
      }
    });
    
    setScore(totalScore);
    setSubmitted(true);
    
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contest/${contestId}/mcq-submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          selectedOptions,
          score: totalScore
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error submitting MCQ answers:', errorData);
      } else {
        const result = await response.json();
      }
    } catch (err) {
      console.error('Error submitting MCQ answers:', err);
    }
  };

  // Go back to contest details
  const handleBackToContest = () => {
    navigate(`/contest/${contestId}`);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${themeColors.bg}`}>
        <UserNavbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${themeColors.bg}`}>
        <UserNavbar />
        <div className="p-6 transition-all duration-300 pt-20">
          <div className="bg-red-500 text-white p-4 rounded-md">
            {error}
          </div>
          <button 
            onClick={handleBackToContest}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
          >
            <FaChevronLeft className="mr-2" /> Back to Contest
          </button>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className={`min-h-screen ${themeColors.bg}`}>
        <UserNavbar />
        <div className="p-6 transition-all duration-300 pt-20">
          <div className="bg-gray-800 p-4 rounded-md text-white">
            Contest not found
          </div>
          <button 
            onClick={() => navigate('/userDashboard/user-contests')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
          >
            <FaChevronLeft className="mr-2" /> Back to Contests
          </button>
        </div>
      </div>
    );
  }

  // Check if contest has MCQ problems
  if (!contest.mcqProblems || contest.mcqProblems.length === 0) {
    return (
      <div className={`min-h-screen ${themeColors.bg}`}>
        <UserNavbar />
        <div className="p-6 transition-all duration-300 pt-20">
          <div className="bg-yellow-500 text-white p-4 rounded-md">
            This contest does not have any MCQ problems.
          </div>
          <button 
            onClick={handleBackToContest}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
          >
            <FaChevronLeft className="mr-2" /> Back to Contest
          </button>
        </div>
      </div>
    );
  }

  const currentMCQ = contest.mcqProblems[currentQuestion];

  return (
    <div className={`min-h-screen ${themeColors.bg}`}>
      <UserNavbar />
      <div className="p-6 transition-all duration-300 pt-20 max-w-4xl mx-auto">
        {/* Contest Header */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-blue-400">{contest.title}</h1>
              <p className="text-gray-400 mt-2">{contest.description}</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-yellow-400 font-mono font-bold flex items-center">
                <FaClock className="mr-2" />
                {timeLeft}
              </div>
              <div className="mt-2 flex items-center text-gray-400">
                <FaUser className="mr-2" />
                {contest.participantCount || 0} participants
              </div>
            </div>
          </div>
        </div>

        {/* MCQ Content */}
        {submitted ? (
          // Results view
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold text-blue-400 mb-4">Quiz Results</h2>
            <div className="text-center py-6">
              <div className="text-4xl font-bold text-green-400 mb-2">{score} points</div>
              <p className="text-gray-400">You answered {selectedOptions.filter((opt, idx) => opt === contest.mcqProblems[idx].correctOption).length} out of {contest.mcqProblems.length} questions correctly.</p>
            </div>
            
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-blue-400">Question Review:</h3>
              {contest.mcqProblems.map((problem, idx) => (
                <div key={idx} className={`p-4 rounded-lg ${selectedOptions[idx] === problem.correctOption ? 'bg-green-900 bg-opacity-20' : 'bg-red-900 bg-opacity-20'}`}>
                  <p className="font-medium text-white mb-2">Question {idx + 1}: {problem.question}</p>
                  <div className="ml-4">
                    {problem.options.map((option, optIdx) => (
                      <div key={optIdx} className="flex items-center mb-1">
                        <div className={`w-4 h-4 mr-2 rounded-full ${optIdx === problem.correctOption ? 'bg-green-500' : selectedOptions[idx] === optIdx ? 'bg-red-500' : 'bg-gray-600'}`}></div>
                        <span className={`${optIdx === problem.correctOption ? 'text-green-400' : selectedOptions[idx] === optIdx ? 'text-red-400' : 'text-gray-400'}`}>{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleBackToContest}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
            >
              <FaChevronLeft className="mr-2" /> Back to Contest
            </button>
          </div>
        ) : (
          // Quiz view
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-blue-400">MCQ Quiz</h2>
              <div className="text-sm text-gray-400">Question {currentQuestion + 1} of {contest.mcqProblems.length}</div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium text-white mb-4">{currentMCQ.question}</h3>
              <div className="space-y-3">
                {currentMCQ.options.map((option, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${selectedOptions[currentQuestion] === idx ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
                    onClick={() => handleOptionSelect(idx)}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center border ${selectedOptions[currentQuestion] === idx ? 'border-white' : 'border-gray-400'}`}>
                        {selectedOptions[currentQuestion] === idx && (
                          <div className="w-3 h-3 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={handlePrevQuestion}
                disabled={currentQuestion === 0}
                className={`px-4 py-2 rounded-md flex items-center ${currentQuestion === 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              >
                <FaChevronLeft className="mr-2" /> Previous
              </button>
              
              {currentQuestion < contest.mcqProblems.length - 1 ? (
                <button 
                  onClick={handleNextQuestion}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Next
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                >
                  Submit All Answers
                </button>
              )}
            </div>
            
            {/* Question navigation dots */}
            <div className="flex justify-center mt-6 space-x-2">
              {contest.mcqProblems.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentQuestion(idx)}
                  className={`w-3 h-3 rounded-full ${currentQuestion === idx ? 'bg-blue-500' : selectedOptions[idx] !== null ? 'bg-green-500' : 'bg-gray-500'}`}
                  aria-label={`Go to question ${idx + 1}`}
                ></button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestMCQ;