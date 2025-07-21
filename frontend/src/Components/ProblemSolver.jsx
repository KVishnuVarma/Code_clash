import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import Editor from "@monaco-editor/react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Play,
  AlertCircle,
  Camera,
  Send,
  Code,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  Languages,
  Timer,
} from "lucide-react";
import { submitSolution } from "../services/problemService";
import { useAuth } from "../context/AuthContext";

const ProblemSolve = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [isCameraMinimized, setIsCameraMinimized] = useState(false);
  const [violations, setViolations] = useState({
    tabChanges: 0,
    copyPaste: 0,
    mobileDetected: false,
  });
  const [isExamTerminated, setIsExamTerminated] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [code, setCode] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const { user } = useAuth();

  const webcamRef = useRef(null);
  const socketRef = useRef(null);
  const tabChangeTimeout = useRef(null);
  const mobileCheckInterval = useRef(null);
  const timerInterval = useRef(null);
  const [showNavConfirm, setShowNavConfirm] = useState(false);
  const [pendingNav, setPendingNav] = useState(null);

  // Remove mockRunCode and related logic

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        // Mock problem data since API might not be available
        const mockProblem = {
          id: id,
          title: "Two Sum",
          description:
            "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
          difficulty: "Easy",
          participants: 1250,
          successRate: 67.5,
          testCases: [
            {
              input: "nums = [2,7,11,15], target = 9",
              output: "[0,1]",
              explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
            },
            {
              input: "nums = [3,2,4], target = 6",
              output: "[1,2]",
              explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
            },
          ],
          languages: [
            {
              id: "python",
              name: "Python",
              template:
                "def two_sum(nums, target):\n    # Write your solution here\n    pass",
            },
            {
              id: "javascript",
              name: "JavaScript",
              template:
                "function twoSum(nums, target) {\n    // Write your solution here\n    \n}",
            },
            {
              id: "java",
              name: "Java",
              template:
                "public int[] twoSum(int[] nums, int target) {\n    // Write your solution here\n    \n}",
            },
            {
              id: "cpp",
              name: "C++",
              template:
                "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        \n    }\n};",
            },
          ],
        };

        let data;
        try {
          const response = await fetch(
            `http://localhost:5000/api/problems/${id}`
          );
          if (!response.ok) {
            throw new Error("API not available");
          }
          data = await response.json();
        } catch (apiError) {
          console.log("API not available, using mock data");
          data = mockProblem;
        }
        setProblem(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  // Helper: map language string to object with id, name, and template
  const languageDefaults = {
    python: {
      id: "python",
      name: "Python",
      template: "def solution():\n    # Write your code here\n    pass",
    },
    javascript: {
      id: "javascript",
      name: "JavaScript",
      template: "function solution() {\n  // Write your code here\n}\n",
    },
    java: {
      id: "java",
      name: "Java",
      template: "public class Solution {\n    public void solution() {\n        // Write your code here\n    }\n}\n",
    },
    cpp: {
      id: "cpp",
      name: "C++",
      template: "#include <iostream>\nusing namespace std;\n\nvoid solution() {\n    // Write your code here\n}\n",
    },
  };

  // Initialize language and code when problem loads
  useEffect(() => {
    if (problem?.languages && problem.languages.length > 0) {
      let langs = problem.languages;
      // If backend returns array of strings, convert to objects
      if (typeof langs[0] === "string") {
        langs = langs.map((langStr) => {
          const key = langStr.toLowerCase();
          return languageDefaults[key] || { id: key, name: langStr, template: "" };
        });
        setProblem((prev) => ({ ...prev, languages: langs }));
      }
      const defaultLanguage = langs[0];
      setSelectedLanguage(defaultLanguage);
      setCode(defaultLanguage.template || "");
    }
  }, [problem]);

  useEffect(() => {
    // Timer for elapsed time
    timerInterval.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Simulate socket connection
    socketRef.current = {
      emit: (event, data) => {
        console.log("Admin notification:", event, data);
      },
    };

    return () => {
      if (socketRef.current) {
        socketRef.current = null;
      }
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [startTime]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "Are you sure you want to leave? Your code will be lost.";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setCode(language.template || "");
    setTestResults(null);
    setCanSubmit(false);
  };

  const notifyAdmin = (violation) => {
    if (socketRef.current) {
      socketRef.current.emit("violation", {
        userId: user?._id,
        examId: id,
        violation,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const checkMobileDevice = () => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      window.matchMedia("(max-width: 768px)").matches ||
      window.screen.width <= 768;

    if (isMobile && !violations.mobileDetected) {
      setViolations((prev) => ({ ...prev, mobileDetected: true }));
      terminateExam("mobile_device_detected");
    }
  };

  const terminateExam = (reason) => {
    setIsExamTerminated(true);
    notifyAdmin({
      type: "exam_terminated",
      reason,
      violations: violations,
    });

    // Stop webcam and screen recording
    if (webcamRef.current && webcamRef.current.stream) {
      webcamRef.current.stream.getTracks().forEach((track) => track.stop());
    }

    setTimeout(() => {
      navigate("/");
    }, 5000);
  };

  useEffect(() => {
    // Mobile detection with continuous checking
    checkMobileDevice();
    mobileCheckInterval.current = setInterval(checkMobileDevice, 5000);

    // Tab change detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations((prev) => ({
          ...prev,
          tabChanges: prev.tabChanges + 1,
        }));
        setShowWarning(true);

        if (tabChangeTimeout.current) {
          clearTimeout(tabChangeTimeout.current);
        }

        tabChangeTimeout.current = setTimeout(() => {
          setShowWarning(false);
        }, 3000);

        if (violations.tabChanges >= 2) {
          terminateExam("excessive_tab_changes");
        }

        notifyAdmin({
          type: "tab_change",
          count: violations.tabChanges + 1,
        });
      }
    };

    // Copy/Paste prevention
    const preventCopyPaste = (e) => {
      e.preventDefault();
      setViolations((prev) => ({
        ...prev,
        copyPaste: prev.copyPaste + 1,
      }));
      setShowWarning(true);

      setTimeout(() => setShowWarning(false), 3000);

      if (violations.copyPaste >= 2) {
        terminateExam("excessive_copy_paste");
      }

      notifyAdmin({
        type: "copy_paste_attempt",
        count: violations.copyPaste + 1,
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", preventCopyPaste);
    document.addEventListener("paste", preventCopyPaste);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", preventCopyPaste);
      document.removeEventListener("paste", preventCopyPaste);
      if (tabChangeTimeout.current) {
        clearTimeout(tabChangeTimeout.current);
      }
      if (mobileCheckInterval.current) {
        clearInterval(mobileCheckInterval.current);
      }
    };
  }, [id, violations]);

  const runCode = async () => {
    setTestResults(null);
    const userId = user?._id;
    if (!userId) {
      setTestResults({
        passed: false,
        error: "User not logged in. Please log in to run code.",
      });
      setError("User not logged in. Please log in to run code.");
      return;
    }
    try {
      const result = await submitSolution({
        userId,
        problemId: id,
        code,
        language: selectedLanguage?.name || selectedLanguage?.id,
        violations,
        mode: 'run', // Only check the first test case
      });
      // Only show the first test case result for run
      const firstTest = result.results.testCases[0];
      setCanSubmit(false); // Only allow submit after all pass
      setTestResults({
        passed: firstTest.passed,
        details: [firstTest],
        metrics: result.results.metrics,
        error: firstTest.passed ? null : "First test case failed. Check details.",
      });
    } catch (error) {
      setTestResults({
        passed: false,
        error: error.message || "Failed to run code. Please try again.",
      });
    }
  };

  const handleSubmit = async () => {
    setTestResults(null);
    const userId = user?._id;
    if (!userId) {
      setTestResults({
        passed: false,
        error: "User not logged in. Please log in to submit code.",
      });
      setError("User not logged in. Please log in to submit code.");
      return;
    }
    try {
      const result = await submitSolution({
        userId,
        problemId: id,
        code,
        language: selectedLanguage?.name || selectedLanguage?.id,
        violations,
        mode: 'submit', // Check all test cases
      });
      const allPassed = result.results.testCases.every(tc => tc.passed);
      setCanSubmit(allPassed);
      setTestResults({
        passed: allPassed,
        details: result.results.testCases,
        metrics: result.results.metrics,
        error: allPassed ? null : "Some test cases failed. Check details.",
      });
      if (allPassed) {
        // Stop webcam and screen recording
        if (webcamRef.current && webcamRef.current.stream) {
          webcamRef.current.stream.getTracks().forEach((track) => track.stop());
        }
        navigate(`/problems/${id}/results`, {
          state: {
            testCases: result.results.testCases,
            metrics: result.results.metrics,
            violations,
            startTime,
          },
        });
      }
    } catch (error) {
      setTestResults({
        passed: false,
        error: error.message || "Failed to submit code. Please try again.",
      });
      setError("Failed to submit code. Please try again.");
    }
  };

  // Mark as dirty if code changes
  const handleCodeChange = (value) => {
    setCode(value || "");
    setIsDirty(true);
  };

  // Custom back button handler
  const handleBack = () => {
    if (isDirty) {
      setShowNavConfirm(true);
    } else {
      navigate("/userDashboard/user-problems");
    }
  };

  if (isExamTerminated) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-4">
              Exam Terminated
            </h2>
            <p className="text-gray-600 mb-4">
              Your exam has been terminated due to multiple violations of our
              exam policy. This incident has been reported to the administrator.
            </p>
            <p className="text-sm text-gray-500">
              You will be redirected to the home page in a few seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

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
            onClick={() => navigate("/userDashboard/user-problems")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Problems
          </button>
        </div>
      </div>
    );
  }

  // Add null check for problem
  if (!problem) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading problem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Back to Problems</span>
              </button>
              <div className="flex items-center gap-2 text-gray-600">
                <Timer size={18} />
                <span className="font-mono">{formatTime(elapsedTime)}</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  <span>
                    {problem.participants !== undefined &&
                    problem.participants !== null
                      ? problem.participants.toLocaleString()
                      : 0}{" "}
                    Participants
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} />
                  <span>{problem.successRate}% Success Rate</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={runCode}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Play size={18} />
                  Run Code
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  disabled={!testResults || !testResults.passed}
                  style={{ opacity: !testResults || !testResults.passed ? 0.5 : 1 }}
                >
                  <Send size={18} />
                  Submit Solution
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-12 gap-6">
        {/* Problem Description */}
        <div className="col-span-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {problem.title}
              </h1>
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                <Code size={16} />
                <span>Problem #{id}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    problem.difficulty === "Easy"
                      ? "bg-green-100 text-green-700"
                      : problem.difficulty === "Medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {problem.difficulty}
                </span>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-600">{problem.description}</p>
              </div>
            </div>

            {/* Test Cases */}
            <div className="border-t">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Example Test Cases
                </h2>
                <div className="space-y-4">
                  {problem.testCases.map((testCase, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">
                            Input:
                          </h3>
                          <pre className="bg-white p-3 rounded text-sm">
                            {testCase.input}
                          </pre>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">
                            Output:
                          </h3>
                          <pre className="bg-white p-3 rounded text-sm">
                            {testCase.output}
                          </pre>
                        </div>
                      </div>
                      {testCase.explanation && (
                        <div className="mt-3 text-sm text-gray-600">
                          <strong>Explanation:</strong> {testCase.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="col-span-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[calc(100vh-8rem)]">
            <div className="border-b px-4 py-3 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Languages size={18} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Language:</span>
                  {problem.languages && problem.languages.length > 0 && selectedLanguage ? (
                    <select
                      value={selectedLanguage.id}
                      onChange={(e) => {
                        const newLanguage = problem.languages.find(
                          (lang) => lang.id === e.target.value
                        );
                        if (newLanguage) {
                          handleLanguageChange(newLanguage);
                        }
                      }}
                      className="min-w-[120px] text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm hover:border-gray-400 transition-colors"
                      style={{ appearance: 'menulist' }}
                    >
                      {problem.languages.map((lang) => (
                        <option key={lang.id} value={lang.id}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-red-600 text-sm">
                      Loading languages...
                    </span>
                  )}
                </div>
              </div>
              {testResults?.passed && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle size={16} />
                  <span className="text-sm font-medium">All tests passed</span>
                </div>
              )}
            </div>
            {selectedLanguage && (
              <Editor
                height="calc(100% - 41px)"
                defaultLanguage={selectedLanguage.id}
                language={selectedLanguage.id}
                theme="vs-dark"
                value={code}
                onChange={handleCodeChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  readOnly: false,
                  wordWrap: "on",
                  padding: { top: 20 },
                  suggestOnTriggerCharacters: false,
                  quickSuggestions: false,
                  parameterHints: { enabled: false },
                  suggestSelection: "never",
                  acceptSuggestionOnCommitCharacter: false,
                  acceptSuggestionOnEnter: "off",
                  tabCompletion: "off",
                  wordBasedSuggestions: false,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Webcam */}
      <div
        className={`fixed ${
          isCameraMinimized ? "bottom-4 right-4 w-48" : "bottom-4 right-4 w-64"
        } transition-all duration-300`}
      >
        <div className="relative rounded-xl overflow-hidden shadow-lg">
          <Webcam ref={webcamRef} mirrored className="w-full" />
          <button
            onClick={() => setIsCameraMinimized(!isCameraMinimized)}
            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-lg hover:bg-opacity-70 transition-colors"
          >
            <Camera size={16} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            className="fixed top-4 right-4 bg-red-100 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-lg z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-500" />
              <p className="font-medium">
                Warning: Suspicious activity detected!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Results Modal */}
      <AnimatePresence>
        {testResults && (
          <motion.div
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 ${
              testResults.passed
                ? "bg-green-100 border-green-200 text-green-700"
                : "bg-red-100 border-red-200 text-red-700"
            } px-6 py-4 rounded-xl shadow-lg z-50 border`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {testResults.passed ? (
                  <>
                    <CheckCircle size={16} />
                    <p className="font-medium">
                      All test cases passed! You can now submit your solution.
                    </p>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} />
                    <p className="font-medium">{testResults.error}</p>
                  </>
                )}
              </div>
              {testResults.details && (
                <div className="mt-2">
                  <div className="font-semibold mb-1">Test Case Results:</div>
                  <ul className="text-xs">
                    {testResults.details.map((tc, idx) => (
                      <li key={idx}>
                        <span className={tc.passed ? "text-green-600" : "text-red-600"}>
                          [{tc.passed ? "PASS" : "FAIL"}]
                        </span>{" "}
                        <span>Input: {tc.input} | Output: {tc.output}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Confirmation Modal for navigation */}
      {showNavConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Are you sure you want to exit?</h2>
            <p className="mb-6">You have unsaved code. If you leave, your code will be lost.</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowNavConfirm(false)}
              >
                Continue Coding
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => {
                  setShowNavConfirm(false);
                  setIsDirty(false);
                  navigate("/userDashboard/user-problems");
                }}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemSolve;