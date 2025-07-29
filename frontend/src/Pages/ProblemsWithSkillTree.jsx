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
  X,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getUserSubmissions } from "../services/problemService";
import UserNavbar from "../Components/UserNavbar";
import SkillTree from "../Components/SkillTree";

const ProblemsWithSkillTree = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  const getSubmissionStatus = (problemId) => {
    const submission = submissions.find(s => s.problemId === problemId);
    if (!submission) return null;
    return submission.status;
  };

  const getSubmissionTimeTaken = (problemId) => {
    const acceptedSubmissions = submissions
      .filter(s => s.problemId === problemId && s.status === 'Accepted')
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    if (acceptedSubmissions.length > 0 && acceptedSubmissions[0].timeTaken > 0) {
      return acceptedSubmissions[0].timeTaken;
    }
    return null;
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "all" || 
                             problem.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    const matchesSkills = selectedSkills.length === 0 || 
                         (problem.topics && problem.topics.some(topic => selectedSkills.includes(topic.toLowerCase().replace(/\s+/g, '-'))));
    
    return matchesSearch && matchesDifficulty && matchesSkills;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    hover: {
      y: -2,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/problems/`);
        if (!response.ok) {
          throw new Error("Failed to fetch problems");
        }
        const data = await response.json();
        setProblems(data);
      } catch (err) {
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
      } catch {
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
          // const data = await response.json(); // No longer needed
        }
      } catch {
        // ignore
      }
    };

    fetchProblems();
    fetchSubmissions();
    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <div className={`min-h-screen ${themeColors.bg} flex items-center justify-center`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`${themeColors.text} text-lg font-medium`}
          >
            Loading problems...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${themeColors.bg} flex items-center justify-center`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-center p-8 rounded-xl ${themeColors.accentBg} border ${themeColors.border} max-w-md mx-4`}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <XCircle className="w-8 h-8 text-red-600" />
          </motion.div>
          <h2 className={`text-2xl font-bold mb-4 ${themeColors.text}`}>Oops! Something went wrong</h2>
          <p className={themeColors.textSecondary}>{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeColors.bg}`}>
      <UserNavbar />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="p-4 sm:p-8 transition-all duration-300 pt-24 max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8 text-center sm:text-left px-2">
          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={`text-3xl sm:text-4xl font-bold ${themeColors.text} mb-2`}
          >
            Coding Problems
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`${themeColors.textSecondary} text-base sm:text-lg`}
          >
            Enhance your coding skills with our curated problems
          </motion.p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
            {/* Search Bar - First */}
            <motion.div
              whileFocus={{ scale: 1.02 }}
              className="flex-1 min-w-0 lg:max-w-md"
            >
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                </motion.div>
                <input
                  type="text"
                  placeholder="search problems..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md text-base`}
                />
              </div>
            </motion.div>

            {/* All Difficulties Filter - Second */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-500 bg-gray-700 dark:bg-gray-800 text-gray-300 dark:text-gray-300 hover:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-200 lg:w-auto`}
            >
              <Filter className={`text-gray-400 w-5 h-5`} />
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className={`bg-transparent text-gray-300 dark:text-gray-300 focus:outline-none cursor-pointer text-base`}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </motion.div>

            {/* Skill Tree Filter - Third (NEW) */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="lg:w-auto"
            >
              <SkillTree
                selectedSkills={selectedSkills}
                onSkillsChange={setSelectedSkills}
                className="w-full lg:w-64"
              />
            </motion.div>
            
            {/* Clear Filters Button */}
            <AnimatePresence>
              {(searchTerm || selectedDifficulty !== "all" || selectedSkills.length > 0) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedDifficulty("all");
                    setSelectedSkills([]);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 text-sm rounded-xl border border-red-300 dark:border-red-600 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 lg:w-auto`}
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Filter Summary */}
        <AnimatePresence>
          {(searchTerm || selectedDifficulty !== "all" || selectedSkills.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-6 p-4 rounded-xl ${themeColors.accentBg} border ${themeColors.border} shadow-sm`}
            >
              <div className={`text-sm ${themeColors.text} flex flex-wrap items-center gap-2`}>
                <span className="font-medium flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Active Filters:
                </span>
                {searchTerm && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
                  >
                    Search: "{searchTerm}"
                  </motion.span>
                )}
                {selectedDifficulty !== "all" && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium"
                  >
                    Difficulty: {selectedDifficulty}
                  </motion.span>
                )}
                {selectedSkills.length > 0 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium"
                  >
                    Skills: {selectedSkills.length} selected
                  </motion.span>
                )}
                <span className="text-gray-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  ({filteredProblems.length} of {problems.length} problems)
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Problems Container */}
        <motion.div variants={itemVariants} className="mt-2">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <motion.div
              variants={cardVariants}
              className={`${themeColors.accentBg} rounded-xl border ${themeColors.border} overflow-hidden shadow-lg`}
            >
              {/* Table Header */}
              <div className={`${themeColors.accentBg} px-8 py-4`}>
                <div className={`grid grid-cols-12 gap-4 text-sm font-medium ${themeColors.text} items-center`}>
                  <div className="col-span-3 truncate">Title</div>
                  <div className="col-span-1 text-center">Difficulty</div>
                  <div className="col-span-1 text-center">Topics</div>
                  <div className="col-span-1 text-center">Success Rate</div>
                  <div className="col-span-1 text-center">Status</div>
                  <div className="col-span-1 text-center">Time Limit</div>
                  <div className="col-span-2 text-center">Time Taken</div>
                  <div className="col-span-2 text-center">Actions</div>
                </div>
              </div>
              {/* Table Body */}
              <div className={`divide-y ${themeColors.border}`}> 
                <AnimatePresence>
                  {filteredProblems.map((problem, index) => {
                    const submissionStatus = getSubmissionStatus(problem._id);
                    const isSolved = submissionStatus === 'Accepted';
                    return (
                      <motion.div
                        key={problem._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ backgroundColor: themeColors.accentHover, scale: 1.005 }}
                        className={`px-8 py-4 transition-all duration-200 cursor-pointer`}
                      >
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* Title and Description */}
                          <div className="col-span-3 min-w-0">
                            <motion.h3
                              whileHover={{ color: "#3B82F6" }}
                              className={`font-semibold ${themeColors.text} mb-1 transition-colors duration-200 truncate`}
                            >
                              {problem.title}
                            </motion.h3>
                            <p className={`text-sm ${themeColors.textSecondary} line-clamp-1`}>{problem.description}</p>
                          </div>
                          {/* Difficulty */}
                          <div className="col-span-1 flex justify-center">
                            <motion.span
                              whileHover={{ scale: 1.1 }}
                              className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm whitespace-nowrap ${
                                problem.difficulty.toLowerCase() === 'easy' ? 'bg-green-500 text-white' :
                                problem.difficulty.toLowerCase() === 'medium' ? 'bg-yellow-500 text-white' :
                                'bg-red-500 text-white'
                              }`}
                            >
                              {problem.difficulty}
                            </motion.span>
                          </div>
                          {/* Topics */}
                          <div className="col-span-1 flex justify-center">
                            <motion.span
                              whileHover={{ color: "#3B82F6" }}
                              className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm whitespace-nowrap ${
                                problem.topics && problem.topics.length > 0 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
                              }`}
                            >
                              {problem.topics && problem.topics.length > 0 ? problem.topics.map(topic => topic).join(', ') : 'N/A'}
                            </motion.span>
                          </div>
                          {/* Success Rate */}
                          <div className="col-span-1 flex items-center justify-center gap-2">
                            <BarChart2 className={`w-4 h-4 ${themeColors.textSecondary}`} />
                            <span className={themeColors.text}>
                              {isSolved ? '100%' : '0%'}
                            </span>
                          </div>
                          {/* Status */}
                          <div className="col-span-1 flex items-center justify-center gap-2">
                            {isSolved ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-green-500 text-sm font-medium">Solved</span>
                              </motion.div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <XCircle className={`w-4 h-4 ${themeColors.textSecondary}`} />
                                <span className={`${themeColors.textSecondary} text-sm`}>Unsolved</span>
                              </div>
                            )}
                          </div>
                          {/* Time Limit */}
                          <div className="col-span-1 flex items-center justify-center gap-2">
                            <Clock className={`w-4 h-4 ${themeColors.textSecondary}`} />
                            <span className={themeColors.text}>
                              {problem.timeLimit} min
                            </span>
                          </div>
                          {/* Time Taken */}
                          <div className="col-span-2 flex items-center justify-center gap-2">
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
                          <div className="col-span-2 flex items-center justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1, backgroundColor: "#3B82F6", color: "white" }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => navigate(`/problems/${problem._id}/view`)}
                              className={`p-2 rounded-lg ${themeColors.textSecondary} hover:${themeColors.text} transition-all duration-200`}
                              title="View Problem"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1, backgroundColor: "#10B981", color: "white" }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => navigate(`/problems/${problem._id}/solve`)}
                              className={`p-2 rounded-lg ${themeColors.textSecondary} hover:${themeColors.text} transition-all duration-200`}
                              title="Solve Problem"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
          
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            <AnimatePresence>
              {filteredProblems.map((problem, index) => {
                const submissionStatus = getSubmissionStatus(problem._id);
                const isSolved = submissionStatus === 'Accepted';
                return (
                  <motion.div
                    key={problem._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    variants={cardVariants}
                    whileHover="hover"
                    className={`${themeColors.accentBg} rounded-xl border ${themeColors.border} p-4 shadow-lg flex flex-col gap-2`}
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold ${themeColors.text} text-lg mb-1 truncate`}>
                            {problem.title}
                          </h3>
                          <p className={`text-sm ${themeColors.textSecondary} line-clamp-2`}>{problem.description}</p>
                        </div>
                        <motion.span
                          whileHover={{ scale: 1.1 }}
                          className={`ml-3 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            problem.difficulty.toLowerCase() === 'easy' ? 'bg-green-500 text-white' :
                            problem.difficulty.toLowerCase() === 'medium' ? 'bg-yellow-500 text-white' :
                            'bg-red-500 text-white'
                          }`}
                        >
                          {problem.difficulty}
                        </motion.span>
                      </div>

                      {/* Topics */}
                      {problem.topics && problem.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {problem.topics.slice(0, 3).map((topic) => (
                            <span
                              key={topic}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
                            >
                              {topic}
                            </span>
                          ))}
                          {problem.topics.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
                              +{problem.topics.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <BarChart2 className={`w-4 h-4 ${themeColors.textSecondary}`} />
                          <span className={`${themeColors.text} text-sm`}>
                            Success: {isSolved ? '100%' : '0%'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className={`w-4 h-4 ${themeColors.textSecondary}`} />
                          <span className={`${themeColors.text} text-sm`}>
                            Limit: {problem.timeLimit} min
                          </span>
                        </div>
                      </div>

                      {/* Status and Time */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {isSolved ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <span className="text-green-500 text-sm font-medium">Solved</span>
                              <span className={`${themeColors.textSecondary} text-sm ml-2`}>
                                in {(() => {
                                  const timeTaken = getSubmissionTimeTaken(problem._id);
                                  if (timeTaken === null) return '-';
                                  if (timeTaken < 60) return `${timeTaken}s`;
                                  const minutes = Math.floor(timeTaken / 60);
                                  const seconds = timeTaken % 60;
                                  return `${minutes}m ${seconds}s`;
                                })()}
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className={`w-4 h-4 ${themeColors.textSecondary}`} />
                              <span className={`${themeColors.textSecondary} text-sm`}>Unsolved</span>
                            </>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: "#3B82F6" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/problems/${problem._id}/view`)}
                            className={`p-2 rounded-lg ${themeColors.textSecondary} hover:text-white transition-all duration-200`}
                            title="View Problem"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: "#10B981" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/problems/${problem._id}/solve`)}
                            className={`p-2 rounded-lg ${themeColors.textSecondary} hover:text-white transition-all duration-200`}
                            title="Solve Problem"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Empty State */}
        <AnimatePresence>
          {filteredProblems.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`text-center py-16 ${themeColors.text}`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Search className="w-12 h-12 text-gray-400" />
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold mb-4"
              >
                No problems found
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`${themeColors.textSecondary} mb-4 max-w-md mx-auto`}
              >
                {problems.length === 0 ? (
                  "No problems available in the database."
                ) : (
                  `Try adjusting your search terms or filters. (${problems.length} total problems available)`
                )}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ProblemsWithSkillTree;