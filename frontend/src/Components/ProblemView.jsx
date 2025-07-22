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

const API_BASE_URL = 'https://code-clash-s9vq.onrender.com/api';

const ProblemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/problems/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setProblem(Array.isArray(data) && data.length > 0 ? data[0] : null);
            } catch (err) {
                console.error("Error fetching problem:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch problem details");
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
    }, [id]);

    const handleStartSolving = () => {
        if (id) {
            navigate(`/problems/${id}/solve`);
        }
    };

    // Remove old calculateSuccessRate function and use problem.successRate directly
    // const successRate = calculateSuccessRate(problem);
    const successRate = typeof problem.successRate === 'number' ? problem.successRate : 0;

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
                        onClick={() => navigate('/problems')}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Back to Problems
                    </button>
                </div>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="text-center py-12">
                    <p className="text-xl text-gray-600 mb-4">Problem not found</p>
                    <button 
                        onClick={() => navigate('/problems')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Problems
                    </button>
                </div>
            </div>
        );
    }

    // const successRate = calculateSuccessRate(problem);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header Section */}
            <motion.div 
                className="bg-white rounded-xl shadow-sm p-6 mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex justify-between items-start mb-4">
                    <h1 className="text-3xl font-bold text-gray-800">{problem.title}</h1>
                    <motion.button
                        onClick={handleStartSolving}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Start
                    </motion.button>
                </div>
                <p className="text-gray-600 text-lg">{problem.description}</p>
            </motion.div>

            {/* Problem Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <motion.div 
                    className="bg-white p-6 rounded-xl shadow-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="text-blue-500" />
                        <h2 className="text-lg font-semibold text-gray-700">Time Limit</h2>
                    </div>
                    <p className="text-gray-600">30 minutes</p>
                </motion.div>

                <motion.div 
                    className="bg-white p-6 rounded-xl shadow-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Code2 className="text-green-500" />
                        <h2 className="text-lg font-semibold text-gray-700">Languages</h2>
                    </div>
                    <p className="text-gray-600">
                        {problem.languages && problem.languages.length > 0 
                            ? problem.languages.join(", ")
                            : 'No languages specified'}
                    </p>
                </motion.div>

                <motion.div 
                    className="bg-white p-6 rounded-xl shadow-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="text-purple-500" />
                        <h2 className="text-lg font-semibold text-gray-700">Participants</h2>
                    </div>
                    <p className="text-gray-600">
                        {problem.totalParticipants.toLocaleString()}
                    </p>
                </motion.div>

                <motion.div 
                    className="bg-white p-6 rounded-xl shadow-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="text-indigo-500" />
                        <h2 className="text-lg font-semibold text-gray-700">Success Rate</h2>
                    </div>
                    <p className="text-gray-600">{successRate}%</p>
                </motion.div>
            </div>

            {/* Test Cases */}
            <motion.div 
                className="bg-white rounded-xl shadow-sm p-6 mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="text-blue-500" />
                    <h2 className="text-2xl font-semibold text-gray-700">Example Test Cases</h2>
                </div>
                <div className="space-y-4">
                    {problem.testCases && problem.testCases.length > 0 ? (
                        problem.testCases.map((testCase, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium text-gray-700 mb-2">Input:</h3>
                                        <pre className="bg-gray-100 p-3 rounded">{testCase.input}</pre>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-700 mb-2">Output:</h3>
                                        <pre className="bg-gray-100 p-3 rounded">{testCase.output}</pre>
                                    </div>
                                </div>
                                {testCase.explanation && (
                                    <div className="mt-3">
                                        <h3 className="font-medium text-gray-700 mb-2">Explanation:</h3>
                                        <p className="text-gray-600">{testCase.explanation}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 text-gray-500">
                            No test cases available
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ProblemDetails;