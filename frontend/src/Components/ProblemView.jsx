import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { 
  Clock, 
  Code2, 
  Users, 
  CheckCircle, 
  ArrowRight,
  BookOpen
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getUserProblemSubmissions, getProblemParticipants } from "../services/problemService";

const API_BASE_URL = 'https://code-clash-s9vq.onrender.com/api';

const ProblemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const [userSubmission, setUserSubmission] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [rank, setRank] = useState(null);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/problems/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setProblem(data && typeof data === 'object' ? data : null);
            } catch (err) {
                console.error("Error fetching problem:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch problem details");
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
    }, [id]);

    useEffect(() => {
        const fetchUserStats = async () => {
            if (!user?._id || !id) return;
            try {
                const subs = await getUserProblemSubmissions(user._id, id);
                // Find the best (Accepted) submission
                const accepted = subs.find(s => s.status === "Accepted");
                setUserSubmission(accepted || null);
            } catch {
                setUserSubmission(null);
            }
        };
        const fetchParticipantsList = async () => {
            try {
                const data = await getProblemParticipants(id);
                setParticipants(Array.isArray(data) ? data : (data.participants || []));
            } catch {
                setParticipants([]);
            }
        };
        fetchUserStats();
        fetchParticipantsList();
    }, [user, id]);

    useEffect(() => {
        if (!userSubmission || !participants.length) {
            setRank(null);
            return;
        }
        // Sort participants by score desc, then timeTaken asc
        const sorted = [...participants].sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return (a.timeTaken || 99999) - (b.timeTaken || 99999);
        });
        const userIdx = sorted.findIndex(p => String(p.userId) === String(user._id));
        setRank(userIdx !== -1 ? userIdx + 1 : null);
    }, [userSubmission, participants, user]);

    const handleStartSolving = () => {
        if (id) {
            navigate(`/problems/${id}/solve`);
        }
    };

    // Remove old calculateSuccessRate function and use problem.successRate directly
    // const successRate = calculateSuccessRate(problem);
    const successRate = typeof problem?.successRate === 'number' ? problem.successRate : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="bg-red-100 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                    <p className="font-medium">Error: {error}</p>
                    <button 
                        onClick={() => navigate('')}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Back to Problems
                    </button>
                </div>
            </div>
        );
    }
    // const successRate = calculateSuccessRate(problem);
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            {/* User Stats Section (if solved) */}
            {userSubmission ? (
                <motion.div
                    className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl shadow-lg p-8 mb-8 backdrop-blur-sm"
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                        <CheckCircle className="text-emerald-600" size={32} /> 
                        🎉 Problem Solved! Your Performance
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-white/70 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="text-slate-600 font-semibold mb-2 text-sm uppercase tracking-wide">Accuracy</div>
                            <div className="text-2xl font-bold text-emerald-700">{userSubmission.passedTests || userSubmission.metrics?.passedTests || 0} / {userSubmission.totalTests || userSubmission.metrics?.totalTests || problem.testCases.length}</div>
                        </div>
                        <div className="bg-white/70 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="text-slate-600 font-semibold mb-2 text-sm uppercase tracking-wide">Time Taken</div>
                            <div className="text-2xl font-bold text-blue-700">{userSubmission.timeTaken || userSubmission.metrics?.timeTaken || '-'} s</div>
                        </div>
                        <div className="bg-white/70 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="text-slate-600 font-semibold mb-2 text-sm uppercase tracking-wide">Score</div>
                            <div className="text-2xl font-bold text-purple-700">{userSubmission.score || userSubmission.metrics?.score || 0}</div>
                        </div>
                        <div className="bg-white/70 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="text-slate-600 font-semibold mb-2 text-sm uppercase tracking-wide">Rank</div>
                            <div className="text-2xl font-bold text-indigo-700">{rank ? `#${rank}` : '-'}</div>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <>
                    {/* Header Section */}
                    <motion.div 
                        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-8 border border-white/20"
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-4xl font-black bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-3">{problem.title}</h1>
                                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                            </div>
                            <motion.button
                                onClick={handleStartSolving}
                                className="relative px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative flex items-center gap-2">
                                    🚀 Start Challenge
                                </span>
                            </motion.button>
                        </div>
                        <p className="text-slate-600 text-xl leading-relaxed">{problem.description}</p>
                    </motion.div>

                    {/* Problem Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <motion.div 
                            className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 group"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                                    <Clock className="text-blue-600" size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-700">Time Limit</h2>
                            </div>
                            <p className="text-slate-600 text-lg font-medium">⏰ 30 minutes</p>
                        </motion.div>

                        <motion.div 
                            className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 group"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl group-hover:from-emerald-200 group-hover:to-emerald-300 transition-all duration-300">
                                    <Code2 className="text-emerald-600" size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-700">Languages</h2>
                            </div>
                            <p className="text-slate-600 text-lg font-medium">
                                💻 {problem.languages && problem.languages.length > 0 
                                    ? problem.languages.join(", ")
                                    : 'No languages specified'}
                            </p>
                        </motion.div>

                        <motion.div 
                            className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 group"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                                    <Users className="text-purple-600" size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-700">Participants</h2>
                            </div>
                            <p className="text-slate-600 text-lg font-medium">
                                👥 {problem.totalParticipants.toLocaleString()}
                            </p>
                        </motion.div>

                        <motion.div 
                            className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 group"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl group-hover:from-indigo-200 group-hover:to-indigo-300 transition-all duration-300">
                                    <CheckCircle className="text-indigo-600" size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-700">Success Rate</h2>
                            </div>
                            <p className="text-slate-600 text-lg font-medium">📊 {successRate}%</p>
                        </motion.div>
                    </div>

                    {/* Test Cases */}
                    <motion.div 
                        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-8 border border-white/20"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.7 }}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                                <BookOpen className="text-blue-600" size={28} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-slate-800">Example Test Cases</h2>
                                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-2"></div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            {problem.testCases && problem.testCases.length > 0 ? (
                                problem.testCases.map((testCase, index) => (
                                    <motion.div 
                                        key={index} 
                                        className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + index * 0.1 }}
                                        whileHover={{ scale: 1.01 }}
                                    >
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <span className="text-slate-700 font-semibold">Test Case {index + 1}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                    📥 Input:
                                                </h3>
                                                <pre className="bg-white/80 p-4 rounded-lg border border-slate-200 text-slate-800 font-mono text-sm overflow-x-auto shadow-sm">{testCase.input}</pre>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                    📤 Expected Output:
                                                </h3>
                                                <pre className="bg-white/80 p-4 rounded-lg border border-slate-200 text-slate-800 font-mono text-sm overflow-x-auto shadow-sm">{testCase.output}</pre>
                                            </div>
                                        </div>
                                        {testCase.explanation && (
                                            <div className="mt-6 p-4 bg-blue-50/50 rounded-lg border-l-4 border-blue-400">
                                                <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                                                    💡 Explanation:
                                                </h3>
                                                <p className="text-slate-600 leading-relaxed">{testCase.explanation}</p>
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📝</div>
                                    <div className="text-xl text-slate-500 font-medium">No test cases available</div>
                                    <div className="text-slate-400 mt-2">Test cases will be provided when you start the challenge</div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default ProblemDetails;