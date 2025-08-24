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

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [showTopicsFilter, setShowTopicsFilter] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  // Available topics for filtering
  const availableTopics = [
    "Array", "String", "Hash Table", "Dynamic Programming", "Math", "Sorting",
    "Greedy", "Depth-First Search", "Binary Search", "Database", "Matrix", "Tree",
    "Breadth-First Search", "Bit Manipulation", "Two Pointers", "Prefix Sum",
    "Heap (Priority Queue)", "Simulation", "Binary Tree", "Graph", "Stack", "Counting",
    "Sliding Window", "Design", "Enumeration", "Backtracking", "Union Find", "Linked List",
    "Number Theory", "Ordered Set", "Monotonic Stack", "Segment Tree", "Trie", "Combinatorics",
    "Bitmask", "Queue", "Recursion", "Divide and Conquer", "Geometry", "Binary Indexed Tree",
    "Memoization", "Hash Function", "Binary Search Tree", "Shortest Path", "String Matching",
    "Topological Sort", "Rolling Hash", "Game Theory", "Interactive", "Data Stream",
    "Monotonic Queue", "Brainteaser", "Doubly-Linked List", "Randomized", "Merge Sort",
    "Counting Sort", "Iterator", "Concurrency", "Probability and Statistics", "Quickselect",
    "Suffix Array", "Line Sweep", "Minimum Spanning Tree", "Bucket Sort", "Shell",
    "Reservoir Sampling", "Strongly Connected Component", "Eulerian Circuit", "Radix Sort",
    "Rejection Sampling", "Biconnected Component"
  ];

  const getSubmissionStatus = (problemId) => {
    const submission = submissions.find(s => s.problemId === problemId);
    if (!submission) return null;
    return submission.status;
  };

  const getSubmissionTimeTaken = (problemId) => {
    // Find the latest accepted submission for this problem
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
    
    // Fix topic filtering - topics are stored as simple strings in database
    const matchesTopics = selectedTopics.length === 0 || 
                         (problem.topics && problem.topics.some(problemTopic => 
                           selectedTopics.includes(problemTopic)
                         ));
    
    return matchesSearch && matchesDifficulty && matchesTopics;
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

  // Close topics dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTopicsFilter && !event.target.closest('.topics-filter-container')) {
        setShowTopicsFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTopicsFilter]);

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
        <motion.div 
          variants={itemVariants} 
          className="mb-12 mt-16 px-4 sm:px-6 max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="flex flex-col items-start"
          >
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={`text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 dark:from-orange-300 dark:via-amber-200 dark:to-yellow-200 bg-clip-text text-transparent animate-pulse tracking-tight`}
            >
              Coding Problems
            </motion.h1>
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ 
                duration: 0.5,
                delay: 0.3,
                ease: "easeOut"
              }}
              className={`w-24 h-1 bg-gradient-to-r from-orange-200 via-amber-200 to-yellow-200 dark:from-orange-100 dark:via-amber-50 dark:to-yellow-100 rounded-full origin-left`}
            />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4,
                delay: 0.5,
                ease: "easeOut"
              }}
              className={`mt-4 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed`}
            >
              Enhance your coding skills with our curated problems
            </motion.p>
          </motion.div>
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

            {/* Skill Tree Filter - Third */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative topics-filter-container lg:w-auto"
            >
              <button
                onClick={() => setShowTopicsFilter(!showTopicsFilter)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-500 bg-gray-700 dark:bg-gray-800 text-gray-300 dark:text-gray-300 hover:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-200 w-full lg:w-auto`}
              >
                <Filter className={`text-gray-400 w-5 h-5`} />
                <span className="text-base">
                  {selectedTopics.length === 0 ? "Skill Tree" : `${selectedTopics.length} Topics`}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${showTopicsFilter ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Topics Dropdown */}
              <AnimatePresence>
                {showTopicsFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className={`absolute top-full left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg z-50 p-4`}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      {availableTopics.map((topic) => (
                        <label key={topic} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTopics.includes(topic)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTopics([...selectedTopics, topic]);
                              } else {
                                setSelectedTopics(selectedTopics.filter(t => t !== topic));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className={`text-sm text-gray-900 dark:text-white`}>{topic}</span>
                        </label>
                      ))}
                    </div>
                    {selectedTopics.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <button
                          onClick={() => setSelectedTopics([])}
                          className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          Clear Skill Tree
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* Clear Filters Button */}
            <AnimatePresence>
              {(searchTerm || selectedDifficulty !== "all" || selectedTopics.length > 0) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedDifficulty("all");
                    setSelectedTopics([]);
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
          {(searchTerm || selectedDifficulty !== "all" || selectedTopics.length > 0) && (
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
                {selectedTopics.length > 0 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium"
                  >
                    Skill Tree: {selectedTopics.map(topic => topic).join(', ')}
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
              <div className={`${themeColors.accentBg} px-8 py-4`}> {/* px-8 for more space, theme-based bg */}
                <div className={`grid grid-cols-11 gap-4 text-sm font-medium ${themeColors.text} items-center`}>
                  <div className="col-span-3 truncate">Title</div>
                  <div className="col-span-1 text-center">Difficulty</div>
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
                        <div className="grid grid-cols-11 gap-4 items-center">
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
                  `Try adjusting your search terms or difficulty filter. (${problems.length} total problems available)`
                )}
              </motion.p>
              {searchTerm && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`text-sm ${themeColors.textSecondary} mb-2`}
                >
                  Search term: <span className="font-medium">"{searchTerm}"</span>
                </motion.p>
              )}
              {selectedDifficulty !== "all" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className={`text-sm ${themeColors.textSecondary}`}
                >
                  Difficulty filter: <span className="font-medium">{selectedDifficulty}</span>
                </motion.p>
              )}
              {selectedTopics.length > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className={`text-sm ${themeColors.textSecondary}`}
                >
                  Skill Tree filter: <span className="font-medium">{selectedTopics.map(topic => topic).join(', ')}</span>
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Problems;