import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Clock,
  BarChart2,
  Eye,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
// eslint-disable-next-line no-unused-vars
import { submitSolution, getUserSubmissions } from "../services/problemService";
import UserNavbar from "../Components/UserNavbar";

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [userData, setUserData] = useState(null);
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  const getSubmissionStatus = (problemId) => {
    const submission = submissions.find(s => s.problemId === problemId);
    if (!submission) return null;
    return submission.status;
  };

  const getSubmissionTimeTaken = (problemId) => {
    // First try to get from user's problemScores (most reliable)
    if (userData?.problemScores) {
      const problemScore = userData.problemScores.find(ps => ps.problemId === problemId);
      if (problemScore && problemScore.timeTaken > 0) {
        return problemScore.timeTaken;
      }
    }
    
    // Fallback to submission data
    const submission = submissions.find(s => s.problemId === problemId && s.status === 'Accepted');
    if (!submission || !submission.timeTaken) return null;
    return submission.timeTaken;
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "all" || 
                             problem.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    
    // Debug logging
    if (selectedDifficulty !== "all") {
      console.log(`Problem: ${problem.title}, Difficulty: ${problem.difficulty}, Filter: ${selectedDifficulty}, Matches: ${matchesDifficulty}`);
    }
    
    return matchesSearch && matchesDifficulty;
  });

  // Debug logging for filter changes
  useEffect(() => {
    console.log("Filter changed - Search:", searchTerm, "Difficulty:", selectedDifficulty);
    console.log("Total problems:", problems.length);
    console.log("Filtered problems:", filteredProblems.length);
  }, [searchTerm, selectedDifficulty, problems.length, filteredProblems.length]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/problems/`);
        if (!response.ok) {
          throw new Error("Failed to fetch problems");
        }
        const data = await response.json();
        console.log("Fetched problems:", data);
        setProblems(data);
      } catch (err) {
        console.error("Error fetching problems:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    const fetchSubmissions = async () => {
      if (!user?._id) return;
      try {
        const res = await getUserSubmissions(user._id);
        setSubmissions(res);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        // ignore
      }
    };

    const fetchUserData = async () => {
      if (!user?._id) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/user`, {
          headers: {
            'x-auth-token': sessionStorage.getItem('token')
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchProblems();
    fetchSubmissions();
    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <div className={`min-h-screen ${themeColors.bg} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${themeColors.bg} flex items-center justify-center`}>
        <div className={`text-center ${themeColors.text}`}>
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeColors.bg}`}>
      <UserNavbar />
      <div className="p-6 transition-all duration-300 pt-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${themeColors.text} mb-2`}>Coding Problems</h1>
          <p className={`${themeColors.textSecondary}`}>
            Enhance your coding skills with our curated problems
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeColors.textSecondary} w-5 h-5`} />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${themeColors.border} ${themeColors.accentBg} ${themeColors.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className={`${themeColors.textSecondary} w-5 h-5`} />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${themeColors.border} ${themeColors.accentBg} ${themeColors.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            {(searchTerm || selectedDifficulty !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDifficulty("all");
                }}
                className={`px-3 py-2 text-sm rounded-lg border ${themeColors.border} ${themeColors.accentBg} ${themeColors.text} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary */}
        {(searchTerm || selectedDifficulty !== "all") && (
          <div className={`mb-4 p-3 rounded-lg ${themeColors.accentBg} border ${themeColors.border}`}>
            <div className={`text-sm ${themeColors.text}`}>
              <span className="font-medium">Active Filters:</span>
              {searchTerm && <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">Search: "{searchTerm}"</span>}
              {selectedDifficulty !== "all" && <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">Difficulty: {selectedDifficulty}</span>}
              <span className="ml-2 text-gray-500">({filteredProblems.length} of {problems.length} problems)</span>
            </div>
          </div>
        )}

        {/* Problems Table */}
        <div className={`${themeColors.accentBg} rounded-lg border ${themeColors.border} overflow-hidden`}>
          {/* Table Header */}
          <div className={`${themeColors.activeBg} px-6 py-4 border-b ${themeColors.border}`}>
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-white">
              <div className="col-span-3">Title</div>
              <div className="col-span-1">Difficulty</div>
              <div className="col-span-2">Success Rate</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Time Limit</div>
              <div className="col-span-2">Time Taken</div>
              <div className="col-span-2">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className={`divide-y ${themeColors.border}`}>
            {filteredProblems.map((problem) => {
              const submissionStatus = getSubmissionStatus(problem._id);
              const isSolved = submissionStatus === 'Accepted';
              return (
                <motion.div
                  key={problem._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`px-6 py-4 hover:${themeColors.accentHover} transition-colors`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Title and Description */}
                    <div className="col-span-3">
                      <h3 className={`font-semibold ${themeColors.text} mb-1`}>
                        {problem.title}
                      </h3>
                      <p className={`text-sm ${themeColors.textSecondary} line-clamp-1`}>
                        {problem.description}
                      </p>
                    </div>

                    {/* Difficulty */}
                    <div className="col-span-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        problem.difficulty.toLowerCase() === 'easy' ? 'bg-green-500 text-white' :
                        problem.difficulty.toLowerCase() === 'medium' ? 'bg-yellow-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {problem.difficulty}
                      </span>
                    </div>

                    {/* Success Rate */}
                    <div className="col-span-2 flex items-center gap-2">
                      <BarChart2 className={`w-4 h-4 ${themeColors.textSecondary}`} />
                      <span className={themeColors.text}>
                        {isSolved ? '100%' : '0%'}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-1 flex items-center gap-2">
                      {isSolved ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-green-500 text-sm">Solved</span>
                        </>
                      ) : (
                        <>
                          <XCircle className={`w-4 h-4 ${themeColors.textSecondary}`} />
                          <span className={`${themeColors.textSecondary} text-sm`}>Unsolved</span>
                        </>
                      )}
                    </div>

                    {/* Time Limit */}
                    <div className="col-span-1 flex items-center gap-2">
                      <Clock className={`w-4 h-4 ${themeColors.textSecondary}`} />
                      <span className={themeColors.text}>
                        {problem.timeLimit} min
                      </span>
                    </div>

                    {/* Time Taken */}
                    <div className="col-span-2 flex items-center gap-2">
                      <Clock className={`w-4 h-4 ${themeColors.textSecondary}`} />
                      <span className={themeColors.text}>
                        {(() => {
                          const timeTaken = getSubmissionTimeTaken(problem._id);
                          if (timeTaken === null) return '-';
                          if (timeTaken < 60) return `${timeTaken} s`;
                          const minutes = Math.floor(timeTaken / 60);
                          const seconds = timeTaken % 60;
                          return `${minutes}m ${seconds}s`;
                        })()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/problems/${problem._id}/view`)}
                        className={`p-2 ${themeColors.textSecondary} hover:${themeColors.text} transition-colors`}
                        title="View Problem"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/problems/${problem._id}/solve`)}
                        className={`p-2 ${themeColors.textSecondary} hover:${themeColors.text} transition-colors`}
                        title="Solve Problem"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        {filteredProblems.length === 0 && (
          <div className={`text-center py-12 ${themeColors.text}`}>
            <p className="text-lg">No problems found matching your criteria.</p>
            <p className={`text-sm ${themeColors.textSecondary} mt-2`}>
              {problems.length === 0 ? (
                "No problems available in the database."
              ) : (
                `Try adjusting your search terms or difficulty filter. (${problems.length} total problems available)`
              )}
            </p>
            {searchTerm && (
              <p className={`text-sm ${themeColors.textSecondary} mt-1`}>
                Search term: "{searchTerm}"
              </p>
            )}
            {selectedDifficulty !== "all" && (
              <p className={`text-sm ${themeColors.textSecondary} mt-1`}>
                Difficulty filter: {selectedDifficulty}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Problems;
