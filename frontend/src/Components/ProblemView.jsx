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
        <div className="min-h-screen bg-slate-50 p-6">
            {/* User Stats Section (if solved) */}
            {userSubmission ? (
                <motion.div
                    className="bg-white border border-emerald-200 rounded-xl shadow-sm p-6 mb-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h2 className="text-2xl font-semibold text-emerald-600 mb-4 flex items-center gap-2">
                        <CheckCircle /> Solved! Your Performance
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <div className="text-slate-600 font-medium mb-1">Accuracy</div>
                            <div className="text-lg font-bold text-slate-800">{userSubmission.passedTests || userSubmission.metrics?.passedTests || 0} / {userSubmission.totalTests || userSubmission.metrics?.totalTests || problem.testCases.length}</div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <div className="text-slate-600 font-medium mb-1">Time Taken</div>
                            <div className="text-lg font-bold text-slate-800">{userSubmission.timeTaken || userSubmission.metrics?.timeTaken || '-'} s</div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <div className="text-slate-600 font-medium mb-1">Score</div>
                            <div className="text-lg font-bold text-slate-800">{userSubmission.score || userSubmission.metrics?.score || 0}</div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <div className="text-slate-600 font-medium mb-1">Rank</div>
                            <div className="text-lg font-bold text-slate-800">{rank ? `#${rank}` : '-'}</div>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <>
                    {/* Header Section */}
                    <motion.div 
                        className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-slate-200"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h1 className="text-3xl font-bold text-slate-800">{problem.title}</h1>
                            <motion.button
                                onClick={handleStartSolving}
                                aria-label="Start solving this problem"
                                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Start
                            </motion.button>
                        </div>
                        <p className="text-slate-600 text-lg">{problem.description}</p>
                    </motion.div>

                    {/* Problem Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <motion.div 
                            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <Clock className="text-emerald-600" size={20} />
                                </div>
                                <h2 className="text-lg font-semibold text-slate-700">Time Limit</h2>
                            </div>
                            <p className="text-slate-600">
                                {problem.timeLimit ? `${problem.timeLimit} minutes` : "-"}
                            </p>
                        </motion.div>

                        <motion.div 
                            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <Code2 className="text-emerald-600" size={20} />
                                </div>
                                <h2 className="text-lg font-semibold text-slate-700">Languages</h2>
                            </div>
                            <p className="text-slate-600">
                                {problem.languages && problem.languages.length > 0 
                                    ? problem.languages.map(l => l.name || l).join(", ")
                                    : 'No languages specified'}
                            </p>
                        </motion.div>

                        <motion.div 
                            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <Users className="text-emerald-600" size={20} />
                                </div>
                                <h2 className="text-lg font-semibold text-slate-700">Participants</h2>
                            </div>
                            <p className="text-slate-600">
                                {problem.totalParticipants
                                    ? problem.totalParticipants.toLocaleString()
                                    : participants.length}
                            </p>
                        </motion.div>

                        <motion.div 
                            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <CheckCircle className="text-emerald-600" size={20} />
                                </div>
                                <h2 className="text-lg font-semibold text-slate-700">Success Rate</h2>
                            </div>
                            <p className="text-slate-600">{successRate}%</p>
                        </motion.div>
                    </div>

                    {/* Test Cases */}
                    <motion.div 
                        className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-slate-200"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <BookOpen className="text-emerald-600" size={24} />
                            </div>
                            <h2 className="text-2xl font-semibold text-slate-700">Example Test Cases</h2>
                        </div>
                        <div className="space-y-4">
                            {problem.testCases && problem.testCases.length > 0 ? (
                                problem.testCases.map((testCase, index) => (
                                    <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h3 className="font-medium text-slate-700 mb-2">Input:</h3>
                                                <pre className="bg-white p-3 rounded border border-slate-200 text-slate-800">{testCase.input}</pre>
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-slate-700 mb-2">Output:</h3>
                                                <pre className="bg-white p-3 rounded border border-slate-200 text-slate-800">{testCase.output}</pre>
                                            </div>
                                        </div>
                                        {testCase.explanation && (
                                            <div className="mt-3">
                                                <h3 className="font-medium text-slate-700 mb-2">Explanation:</h3>
                                                <p className="text-slate-600">{testCase.explanation}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-slate-500">
                                    No test cases available
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