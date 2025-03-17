import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ProblemDetails = () => {
    const { id } = useParams(); // Get the problem ID from the URL
    const [problem, setProblem] = useState(null); // Store the problem data
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    // Fetch problem details from the backend
    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/problems/${id}`); // Replace with your backend URL
                if (!response.ok) {
                    throw new Error("Failed to fetch problem details.");
                }
                const data = await response.json();
                setProblem(data); // Update the state with fetched data
            } catch (err) {
                setError(err.message || "Something went wrong while fetching data.");
            } finally {
                setLoading(false); // Stop loading after fetch completes
            }
        };

        fetchProblem();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-600 bg-red-100 border-red-200 border p-4 rounded">
                <p>{error}</p>
            </div>
        );
    }

    if (!problem) {
        return <div className="text-center py-12">Problem not found.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Problem Title and Description */}
            <div className="bg-white p-6 rounded shadow-lg mb-6">
                <h1 className="text-3xl font-bold text-indigo-600 mb-4">{problem.title}</h1>
                <p className="text-gray-700 text-lg">{problem.description}</p>
            </div>

            {/* Difficulty */}
            <div className="bg-white p-6 rounded shadow-lg mb-6">
                <h2 className="text-2xl font-semibold text-indigo-500 mb-2">Difficulty:</h2>
                <p className="text-gray-600">{problem.difficulty}</p>
            </div>

            {/* Languages */}
            <div className="bg-white p-6 rounded shadow-lg mb-6">
                <h2 className="text-2xl font-semibold text-indigo-500 mb-2">Languages Supported:</h2>
                <p className="text-gray-600">
                    {problem.languages && problem.languages.length > 0
                        ? problem.languages.join(", ")
                        : "No languages specified"}
                </p>
            </div>

            {/* Test Cases */}
            <div className="bg-white p-6 rounded shadow-lg mb-6">
                <h2 className="text-2xl font-semibold text-indigo-500 mb-4">Test Cases:</h2>
                {problem.testCases && problem.testCases.length > 0 ? (
                    <ul className="space-y-4">
                        {problem.testCases.map((testCase, index) => (
                            <li key={index} className="bg-gray-100 p-4 rounded shadow">
                                <p><strong>Input:</strong> {testCase.input}</p>
                                <p><strong>Output:</strong> {testCase.output}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No test cases available.</p>
                )}
            </div>

            {/* Total Participants */}
            <div className="bg-white p-6 rounded shadow-lg">
                <h2 className="text-2xl font-semibold text-indigo-500 mb-2">Total Participants:</h2>
                <p className="text-gray-600">{problem.totalParticipants || 0}</p>
            </div>
        </div>
    );
};

export default ProblemDetails;
