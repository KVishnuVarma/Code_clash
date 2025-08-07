import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import UserNavbar from '../Components/UserNavbar';
import { FaClock, FaCode, FaCheck, FaTimes, FaChevronLeft } from 'react-icons/fa';
import Editor from '@monaco-editor/react';

function ContestProblem() {
  const { contestId, problemId } = useParams();
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [contest, setContest] = useState(null);
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch contest details
        const contestResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contest/${contestId}`);
        if (!contestResponse.ok) {
          throw new Error('Failed to fetch contest');
        }
        const contestData = await contestResponse.json();
        setContest(contestData);
        
        // Find the problem in the contest
        const contestProblem = contestData.problems.find(p => p.problemId._id === problemId);
        if (!contestProblem) {
          throw new Error('Problem not found in this contest');
        }
        
        setProblem({
          ...contestProblem.problemId,
          points: contestProblem.points
        });
        
        // Set default code template based on selected language
        setDefaultCode(language);
      } catch (err) {
        setError(err.message || 'Failed to fetch problem');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contestId, problemId]);

  // Update time left every second
  useEffect(() => {
    if (!contest) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const endTime = new Date(contest.endTime);

      if (now < endTime) {
        // Contest is ongoing
        const diff = endTime - now;
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        // Contest has ended
        setTimeLeft('Contest has ended');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [contest]);

  const setDefaultCode = (lang) => {
    let defaultCode = '';
    
    switch (lang) {
      case 'javascript':
        defaultCode = `/**
 * @param {*} input - The input for this problem
 * @return {*} - Your solution
 */
function solution(input) {
  // Your code here
  
  return;
}
`;
        break;
      case 'python':
        defaultCode = `# Your solution function
def solution(input):
    # Your code here
    
    return
`;
        break;
      case 'java':
        defaultCode = `class Solution {
    public static void main(String[] args) {
        // Test your solution here
    }
    
    public static Object solution(Object input) {
        // Your code here
        
        return null;
    }
}
`;
        break;
      case 'cpp':
        defaultCode = `#include <iostream>
#include <vector>
#include <string>

// Your solution function
std::string solution(std::string input) {
    // Your code here
    
    return "";
}

int main() {
    // Test your solution here
    return 0;
}
`;
        break;
      default:
        defaultCode = '// Write your solution here';
    }
    
    setCode(defaultCode);
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    setDefaultCode(newLanguage);
  };

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/contest/${contestId}/problem/${problemId}` } });
      return;
    }

    try {
      setSubmitting(true);
      setResult(null);
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contest/${contestId}/problems/${problemId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ code, language })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit solution');
      }

      const data = await response.json();
      setResult(data.submission);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
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
            onClick={() => navigate(`/contest/${contestId}`)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
          >
            <FaChevronLeft className="mr-2" /> Back to Contest
          </button>
        </div>
      </div>
    );
  }

  if (!problem || !contest) {
    return (
      <div className={`min-h-screen ${themeColors.bg}`}>
        <UserNavbar />
        <div className="p-6 transition-all duration-300 pt-20">
          <div className="bg-gray-800 p-4 rounded-md text-white">
            Problem not found
          </div>
          <button 
            onClick={() => navigate(`/contest/${contestId}`)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
          >
            <FaChevronLeft className="mr-2" /> Back to Contest
          </button>
        </div>
      </div>
    );
  }

  const now = new Date();
  const endTime = new Date(contest.endTime);
  const isContestEnded = now > endTime;

  return (
    <div className={`min-h-screen ${themeColors.bg}`}>
      <UserNavbar />
      <div className="p-6 transition-all duration-300 pt-20">
        {/* Problem Header */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4 shadow-lg flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(`/contest/${contestId}`)}
              className="mr-4 text-gray-400 hover:text-white"
            >
              <FaChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-blue-400">{problem.title}</h1>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`px-2 py-1 rounded text-xs ${problem.difficulty === 'Easy' ? 'bg-green-700' : problem.difficulty === 'Medium' ? 'bg-yellow-700' : 'bg-red-700'} text-white`}>
                  {problem.difficulty}
                </span>
                <span className="text-gray-400 text-sm">{problem.points} points</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-yellow-400 font-mono font-bold flex items-center">
              <FaClock className="mr-2" />
              {timeLeft}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Problem Description */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <h2 className="text-xl font-bold text-blue-400 mb-4">Problem Description</h2>
            <div className="text-gray-300 whitespace-pre-line mb-6">
              {problem.description}
            </div>
            
            <h3 className="text-lg font-bold text-blue-400 mb-2">Examples</h3>
            {problem.testCases && problem.testCases.map((testCase, index) => (
              <div key={index} className="mb-4 bg-gray-700 p-4 rounded-md">
                <div className="mb-2">
                  <span className="text-gray-400 font-bold">Input:</span>
                  <pre className="mt-1 bg-gray-900 p-2 rounded text-gray-300 overflow-x-auto">{testCase.input}</pre>
                </div>
                <div className="mb-2">
                  <span className="text-gray-400 font-bold">Output:</span>
                  <pre className="mt-1 bg-gray-900 p-2 rounded text-gray-300 overflow-x-auto">{testCase.output}</pre>
                </div>
                {testCase.explanation && (
                  <div>
                    <span className="text-gray-400 font-bold">Explanation:</span>
                    <p className="mt-1 text-gray-300">{testCase.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Code Editor */}
          <div className="bg-gray-800 rounded-lg shadow-lg flex flex-col">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <select 
                value={language}
                onChange={handleLanguageChange}
                className="bg-gray-700 text-white px-3 py-1 rounded-md"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
              
              <button 
                onClick={handleSubmit}
                disabled={submitting || isContestEnded}
                className={`px-4 py-1 rounded-md flex items-center ${isContestEnded ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaCode className="mr-2" /> Submit
                  </>
                )}
              </button>
            </div>
            
            <div className="flex-grow" style={{ minHeight: '400px' }}>
              <Editor
                height="100%"
                language={language}
                value={code}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
              />
            </div>
            
            {/* Results */}
            {result && (
              <div className="p-4 border-t border-gray-700">
                <h3 className="text-lg font-bold mb-2 flex items-center">
                  {result.status === 'Accepted' ? (
                    <span className="text-green-500 flex items-center">
                      <FaCheck className="mr-2" /> Accepted
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center">
                      <FaTimes className="mr-2" /> {result.status}
                    </span>
                  )}
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-700 p-2 rounded-md">
                    <span className="text-gray-400">Runtime:</span>
                    <span className="ml-2 text-white">{result.metrics?.executionTime?.toFixed(2) || 0} ms</span>
                  </div>
                  <div className="bg-gray-700 p-2 rounded-md">
                    <span className="text-gray-400">Score:</span>
                    <span className="ml-2 text-white">{result.metrics?.score || 0} points</span>
                  </div>
                  <div className="bg-gray-700 p-2 rounded-md">
                    <span className="text-gray-400">Test Cases:</span>
                    <span className="ml-2 text-white">{result.metrics?.passedTests || 0}/{result.metrics?.totalTests || 0}</span>
                  </div>
                  <div className="bg-gray-700 p-2 rounded-md">
                    <span className="text-gray-400">Time Taken:</span>
                    <span className="ml-2 text-white">{result.metrics?.timeTaken?.toFixed(2) || 0} s</span>
                  </div>
                </div>
                
                {result.testResults && result.testResults.some(test => !test.passed) && (
                  <div className="mt-4">
                    <h4 className="text-red-500 font-bold mb-2">Failed Test Cases:</h4>
                    {result.testResults.filter(test => !test.passed).map((test, index) => (
                      <div key={index} className="mb-3 bg-gray-700 p-3 rounded-md">
                        <div className="mb-1">
                          <span className="text-gray-400">Input:</span>
                          <pre className="mt-1 bg-gray-900 p-2 rounded text-gray-300 overflow-x-auto">{test.input}</pre>
                        </div>
                        <div className="mb-1">
                          <span className="text-gray-400">Expected:</span>
                          <pre className="mt-1 bg-gray-900 p-2 rounded text-gray-300 overflow-x-auto">{test.expectedOutput}</pre>
                        </div>
                        <div>
                          <span className="text-gray-400">Your Output:</span>
                          <pre className="mt-1 bg-gray-900 p-2 rounded text-gray-300 overflow-x-auto">{test.actualOutput}</pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContestProblem;