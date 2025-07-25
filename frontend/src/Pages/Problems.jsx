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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
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
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        // ignore
      }
    };
    fetchProblems();
    fetchSubmissions();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by filteredProblems below
  };

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty =
      selectedDifficulty === "all" ||
      problem.difficulty.toLowerCase() === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-500 bg-green-100";
      case "medium":
        return "text-yellow-500 bg-yellow-100";
      case "hard":
        return "text-red-500 bg-red-100";
      default:
        return "text-gray-500 bg-gray-100";
    }
  };

  const isSolved = (problem) => {
    return submissions.some(
      (sub) => String(sub.problemId) === String(problem._id || problem.id) && sub.status === "Accepted"
    );
  };

  const tableHeaders = [
    { label: "Title", width: "20%" },
    { label: "Difficulty", width: "12%" },
    { label: "Success Rate", width: "13%" },
    { label: "Status", width: "12%" },
    { label: "Time Limit", width: "13%" },
    { label: "Time Taken", width: "13%" },
    { label: "Actions", width: "17%" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      <div className="p-8 transition-all duration-300 pt-20">
        {/* Header Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-800">Coding Problems</h1>
          <p className="text-gray-600 mt-2">
            Enhance your coding skills with our curated problems
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          className="flex flex-wrap gap-4 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form
            onSubmit={handleSearch}
            className="flex-1 min-w-[300px] flex gap-2"
          >
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search problems..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Search
            </button>
          </form>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {/* Problems Table */}
        <AnimatePresence>
          {!loading && !error && (
            <motion.div
              className="bg-white rounded-xl shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {tableHeaders.map((header) => (
                        <th
                          key={header.label}
                          className="px-6 py-4 text-left text-sm font-semibold text-gray-600"
                          style={{ width: header.width }}
                        >
                          {header.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProblems.map((problem) => (
                      <motion.tr
                        key={problem._id || problem.id} // Use _id if available
                        className="hover:bg-gray-50 transition-colors duration-150"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div>
                              <div className="font-medium text-gray-900">
                                {problem.title}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-md">
                                {problem.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                              problem.difficulty
                            )}`}
                          >
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <BarChart2 size={16} className="text-blue-400" />
                            <span className="text-gray-600">{typeof problem.successRate === 'number' ? `${problem.successRate}%` : '0%'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {isSolved(problem) ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 size={16} />
                              <span>Solved</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-gray-400">
                              <XCircle size={16} />
                              <span>Unsolved</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-400" />
                            <span className="text-gray-600">
                              {problem.timeLimit ? `${problem.timeLimit} min` : "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-400" />
                            <span className="text-gray-600">
                              {isSolved(problem)
                                ? (() => {
                                    const sub = submissions.find(
                                      (s) => String(s.problemId) === String(problem._id || problem.id) && s.status === "Accepted"
                                    );
                                    return sub && sub.metrics && (sub.metrics.timeTaken || sub.metrics.executionTime)
                                      ? `${sub.metrics.timeTaken || sub.metrics.executionTime} s`
                                      : "-";
                                  })()
                                : "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                              onClick={() =>
                                navigate(
                                  `/problems/${problem._id || problem.id}/view`
                                )
                              }
                            >
                              <Eye size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors duration-200"
                              onClick={() =>
                                navigate(
                                  `/problems/${problem._id || problem.id}/solve`
                                )
                              }
                            >
                              <ArrowUpRight size={18} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!loading && !error && filteredProblems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              No problems found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Problems;
