import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MonacoEditor from "@monaco-editor/react";
import Webcam from "react-webcam";

const ProblemSolver = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState("// Write your solution here...");
  const [language, setLanguage] = useState("javascript");
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes timer
  const [testResults, setTestResults] = useState(null);
  const webcamRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/problems/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch problem details.");
        }
        const data = await response.json();
        setProblem(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  // Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Request full-screen mode on mount
  useEffect(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error("Error enabling full-screen mode:", err);
      });
      setIsFullScreen(true);
    }
  }, []);

  const handleFullScreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err =>
        console.error("Error enabling full-screen mode:", err)
      );
      setIsFullScreen(true);
    } else {
      document.exitFullscreen().catch(err =>
        console.error("Error exiting full-screen mode:", err)
      );
      setIsFullScreen(false);
    }
  };

  const handleSubmit = () => {
    // Simulated test results; in production, you would send the code to your backend for evaluation
    const accuracy = Math.floor(Math.random() * 100);
    setTestResults({ accuracy, passed: accuracy > 70 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg m-8">
        <p className="font-medium">Error: {error}</p>
      </div>
    );
  }

  if (!problem) {
    return <div className="text-center py-12">No problem found.</div>;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="relative h-screen bg-gray-800 text-white">
      {/* Header Bar */}
      <div className="absolute top-0 left-0 w-full flex justify-between items-center p-4 bg-gray-900 z-10">
        <div>
          <span className="font-mono">
            Time Left: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </span>
        </div>
        <div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-black rounded p-1 mr-4"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c_cpp">C/C++</option>
          </select>
          <motion.button
            onClick={handleFullScreenToggle}
            className="bg-blue-600 px-3 py-1 rounded"
            whileHover={{ scale: 1.05 }}
          >
            {isFullScreen ? "Exit Full Screen" : "Full Screen"}
          </motion.button>
        </div>
      </div>

      <div className="h-full flex">
        {/* Coding Area */}
        <div className="flex-1 p-4 pt-16">
          <h2 className="text-2xl font-bold mb-4">{problem.title}</h2>
          <p className="mb-4">{problem.fullDescription}</p>

          <MonacoEditor
            height="60vh"
            language={language}
            value={code}
            onChange={(value) => setCode(value)}
            theme="vs-dark"
            options={{
              automaticLayout: true,
              minimap: { enabled: false },
            }}
          />

          <div className="mt-4 flex flex-wrap gap-4">
            <motion.button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Submit Code
            </motion.button>
            <motion.button
              onClick={() => navigate(`/problems/${problem.id}/view`)}
              className="px-4 py-2 bg-gray-600 text-white rounded"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Problem
            </motion.button>
          </div>

          {testResults && (
            <motion.div
              className="mt-4 p-4 bg-gray-700 rounded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="font-bold">Test Results</h3>
              <p>Accuracy: {testResults.accuracy}%</p>
              <p>Status: {testResults.passed ? "Passed" : "Failed"}</p>
            </motion.div>
          )}
        </div>

        {/* Webcam Panel */}
        <div className="w-1/3 p-4 pt-16 bg-gray-900">
          <h3 className="text-xl font-bold mb-4">Live Webcam Monitoring</h3>
          <div className="shadow-lg rounded overflow-hidden">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full"
              videoConstraints={{ facingMode: "user" }}
            />
          </div>
          {/* Additional security measures or anti-cheat logic can be added here */}
        </div>
      </div>
    </div>
  );
};

export default ProblemSolver;
