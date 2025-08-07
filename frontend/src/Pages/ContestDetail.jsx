import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import UserNavbar from '../Components/UserNavbar';
import { FaClock, FaUsers, FaTrophy, FaLock, FaCheckCircle, FaTimesCircle, FaCode, FaChartBar, FaUser, FaCheck } from 'react-icons/fa';
import { registerForContest } from '../services/contestService';

function ContestDetail() {
  const { contestId } = useParams();
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState('problems');
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

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

        // Check if user is registered
        if (isAuthenticated && user) {
          const isUserRegistered = data.participants && 
            data.participants.some(p => p.userId && p.userId._id === user._id);
          setIsRegistered(isUserRegistered);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch contest');
      } finally {
        setLoading(false);
      }
    };

    fetchContest();
  }, [contestId, isAuthenticated, user]);

  useEffect(() => {
    if (activeTab === 'leaderboard' && contest && contest.status !== 'Upcoming') {
      fetchLeaderboard();
    }
  }, [activeTab, contest]);

  const fetchLeaderboard = async () => {
    try {
      setLoadingLeaderboard(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contest/${contestId}/leaderboard`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const data = await response.json();
      setLeaderboard(data.leaderboard);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // Update time left every second and update contest status if needed
  useEffect(() => {
    if (!contest) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const endTime = new Date(contest.endTime);
      const startTime = new Date(contest.startTime);

      if (now < startTime) {
        // Contest hasn't started yet
        const diff = startTime - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(`Starts in: ${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else if (now < endTime) {
        // Contest is ongoing
        const diff = endTime - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(`Ends in: ${days}d ${hours}h ${minutes}m ${seconds}s`);
        
        // Update contest status to Ongoing if it's not already
        if (contest.status !== 'Ongoing') {
          updateContestStatus('Ongoing');
        }
      } else {
        // Contest has ended
        setTimeLeft('Contest has ended');
        
        // Update contest status to Completed if it's not already
        if (contest.status !== 'Completed') {
          updateContestStatus('Completed');
        }
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [contest]);

  // Function to update contest status
  const updateContestStatus = async (status) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contest/${contestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        // Update local contest state
        setContest(prev => ({ ...prev, status }));
      }
    } catch (err) {
      console.error('Error updating contest status:', err);
    }
  };

  const handleRegister = async () => {
    // Check if user is authenticated
    try {
      setRegistering(true);
      setRegisterError(null);
      
      const result = await registerForContest(contestId);
      
      // Update the contest object with the new participant
      setContest(prev => ({
        ...prev,
        participants: [
          ...(prev.participants || []),
          { userId: { _id: user._id, username: user.username, email: user.email }, joinedAt: new Date() }
        ],
        participantCount: (prev.participantCount || 0) + 1
      }));
      
      setIsRegistered(true);
      
      // Show success message
    } catch (err) {
      console.error('Registration error:', err);
      setRegisterError(err.message || 'Failed to register for contest');
    } finally {
      setRegistering(false);
    }
  };

  const handleProblemClick = (problemId) => {
    if (!problemId) {
      console.error('Problem ID is undefined');
      return;
    }
    navigate(`/contest/${contestId}/problem/${problemId}`);
  };

  const handleStartContest = () => {
    
    // Check if contest has MCQ problems
    if (contest.mcqProblems && contest.mcqProblems.length > 0) {
      // Navigate to MCQ problems page
      navigate(`/contest/${contestId}/mcq`);
    } else {
      // Navigate to the problems tab when user clicks Start Contest
      setActiveTab('problems');
      
      // Scroll to problems section
      const problemsSection = document.getElementById('problems-section');
      if (problemsSection) {
        problemsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Set default active tab on component mount
  useEffect(() => {
    setActiveTab('problems');
  }, []);

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
        </div>
      </div>
    );
  }

  const now = new Date();
  const startTime = new Date(contest.startTime);
  const endTime = new Date(contest.endTime);
  
  const isUpcoming = now < startTime;
  const isOngoing = now >= startTime && now < endTime;
  const isCompleted = now >= endTime;

  // Users can view problems if the contest is ongoing (regardless of registration), completed, or if they're registered for an upcoming contest
  const canViewProblems = isOngoing || isCompleted || (isUpcoming && isRegistered);

  return (
    <div className={`min-h-screen ${themeColors.bg}`}>
      <UserNavbar />
      <div className="p-6 transition-all duration-300 pt-20">
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
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-3 rounded-md">
              <div className="text-gray-400 text-sm">Difficulty</div>
              <div className={`font-bold ${contest.difficulty === 'Easy' ? 'text-green-400' : contest.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                {contest.difficulty}
              </div>
            </div>
            <div className="bg-gray-700 p-3 rounded-md">
              <div className="text-gray-400 text-sm">Start Time</div>
              <div className="font-bold text-white">
                {new Date(contest.startTime).toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-700 p-3 rounded-md">
              <div className="text-gray-400 text-sm">End Time</div>
              <div className="font-bold text-white">
                {new Date(contest.endTime).toLocaleString()}
              </div>
            </div>
          </div>
          
          {/* Register button for upcoming contests */}
          {isUpcoming && !isRegistered && (
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleRegister}
                disabled={registering}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center"
              >
                {registering ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Registering...
                  </>
                ) : (
                  'Register for Contest'
                )}
              </button>
            </div>
          )}
          
          {/* Registration confirmation for upcoming contests */}
          {isUpcoming && isRegistered && (
            <div className="mt-4 flex justify-between items-center">
              <div className="bg-green-800 text-white p-3 rounded-md flex items-center">
                <FaCheck className="mr-2" />
                You are registered for this contest.
              </div>
            </div>
          )}
          
          {/* Registration error message */}
          {registerError && (
            <div className="mt-4">
              <div className="bg-red-600 text-white p-3 rounded-md">
                {registerError}
              </div>
            </div>
          )}
          
          {/* Start button for ongoing contests */}
          {isOngoing && (
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleStartContest}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center"
              >
                Start Contest
              </button>
            </div>
          )}

          {/* Show completed status for ended contests */}
          {isCompleted && (
            <div className="mt-4 flex justify-between items-center">
              <div className="bg-gray-700 text-white p-3 rounded-md flex items-center">
                <FaCheckCircle className="mr-2 text-blue-400" />
                Contest Completed
              </div>
            </div>
          )}
        </div>
        
        {/* Problems Tab */}
        {activeTab === 'problems' && (
              <div id="problems-section">
                <h2 className="text-xl font-bold text-blue-400 mb-4">Contest Problems</h2>
                
                {!canViewProblems ? (
                  <div className="bg-gray-800 p-8 rounded-lg text-center">
                    {isUpcoming && !isRegistered ? (
                      <>
                        <div className="flex justify-center mb-4">
                          <FaLock className="text-4xl text-gray-500" />
                        </div>
                        <p className="text-xl text-gray-300 mb-4">You need to register for this contest to view problems</p>
                        <button 
                          onClick={handleRegister}
                          className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                          disabled={registering}
                        >
                          {registering ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                              <span>Registering...</span>
                            </>
                          ) : (
                            <>
                              <span>Register Now</span>
                            </>
                          )}
                        </button>
                        {registerError && <p className="mt-2 text-red-400">{registerError}</p>}
                      </>
                    ) : (
                      <>
                        <div className="flex justify-center mb-4">
                          <FaClock className="text-4xl text-gray-500" />
                        </div>
                        <p className="text-xl text-gray-300">Problems will be available when the contest starts</p>
                        <p className="text-gray-400 mt-2">Stay tuned for the contest to begin</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-gray-800">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">#</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Difficulty</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Points</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Success Rate</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {contest.problems?.map((problem, index) => {
                          // Find if the current user has solved this problem
                          const currentParticipant = contest.participants?.find(p => p.userId?._id === user?._id);
                          const isSolved = currentParticipant?.solvedProblems?.includes(problem?.problemId?._id);
                          
                          // Skip rendering if problemId is undefined
                          if (!problem?.problemId) {
                            return null;
                          }
                          
                          return (
                            <tr 
                              key={problem.problemId._id} 
                              className="hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                              onClick={() => handleProblemClick(problem.problemId._id)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{index + 1}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400">{problem.problemId?.title || 'Untitled Problem'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded text-xs ${problem.problemId?.difficulty === 'Easy' ? 'bg-green-700' : problem.problemId?.difficulty === 'Medium' ? 'bg-yellow-700' : 'bg-red-700'} text-white`}>
                                  {problem.problemId?.difficulty || 'Unknown'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{problem.points}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                {problem.problemId?.successRate ? `${problem.problemId.successRate.toFixed(1)}%` : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {isSolved ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <FaCheck className="mr-1" /> Solved
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Unsolved
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
        
            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <div>
                <h2 className="text-xl font-bold text-blue-400 mb-4">Contest Leaderboard</h2>
                {loadingLeaderboard ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : leaderboard.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-gray-800">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rank</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Username</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Score</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Problems Solved</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Submission</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {leaderboard.map((participant) => {
                          // Skip rendering if userId is undefined
                          if (!participant?.userId) {
                            return null;
                          }
                          
                          return (
                            <tr 
                              key={participant.userId._id} 
                              className={participant.userId?._id === (user?._id || '') ? 'bg-blue-900 bg-opacity-30' : ''}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{participant.rank}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{participant.userId?.username || 'Unknown User'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{participant.score}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{participant.solvedProblems?.length || 0}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                {participant.lastSubmission ? new Date(participant.lastSubmission).toLocaleString() : 'N/A'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-700 p-4 rounded-md text-gray-300 text-center">
                    No participants have submitted solutions yet.
                  </div>
                )}
              </div>
            )}
      </div>
    </div>
  );
}

export default ContestDetail;