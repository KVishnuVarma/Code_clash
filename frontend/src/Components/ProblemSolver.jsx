/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import Editor from "@monaco-editor/react";
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
import { submitSolution, getUserProblemSubmissions, getProblemParticipants } from "../services/problemService";
import { useAuth } from "../context/AuthContext";
import Confetti from "react-confetti";

const ProblemSolve = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
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
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);

  const webcamRef = useRef(null);
  const socketRef = useRef(null);
  const tabChangeTimeout = useRef(null);
  const mobileCheckInterval = useRef(null);
  const timerInterval = useRef(null);
  const [showNavConfirm, setShowNavConfirm] = useState(false);
  // Add state for showing webcam modal
  const [showWebcam, setShowWebcam] = useState(false);
  // Add state for celebration
  const [showCelebration, setShowCelebration] = useState(false);
  // Add state for submission summary and score
  const [submissionSummary, setSubmissionSummary] = useState(null);
  // Add tab state for Description/Submissions
  const [activeTab, setActiveTab] = useState("Description");

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
        } catch {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, violations]);

  // On successful submit, show celebration and hide camera/warning
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
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const result = await submitSolution({
        userId,
        problemId: id,
        code,
        language: selectedLanguage?.name || selectedLanguage?.id,
        violations,
        mode: 'submit',
        elapsedTime: elapsed
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
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
        setShowWebcam(false);
        setShowWarning(false);
        // Stop webcam and screen recording
        if (webcamRef.current && webcamRef.current.stream) {
          webcamRef.current.stream.getTracks().forEach((track) => track.stop());
        }
        // Set submission summary and score for left panel
        setSubmissionSummary({
          testCases: result.results.testCases,
          metrics: {
            ...result.results.metrics,
            timeTaken: result.results.timeTaken,
            score: result.results.metrics.score,
          },
          violations,
          startTime,
        });
        setActiveTab("Submissions"); // Switch to Submissions tab
        // Stop the timer and freeze elapsedTime
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
          timerInterval.current = null;
        }
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        // Fetch updated submissions
        if (user?._id && id) {
          getUserProblemSubmissions(user._id, id).then(setAllSubmissions);
        }
      }
    } catch (error) {
      setTestResults({
        passed: false,
        error: error.message || "Failed to submit code. Please try again.",
      });
      setError("Failed to submit code. Please try again.");
    }
  };

  // On Run Code, show only first test case result and enable submit if it passes
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
        mode: 'run',
      });
      const firstTest = result.results.testCases[0];
      setCanSubmit(firstTest.passed);
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

  // Mark as dirty if code changes
  const handleCodeChange = (value) => {
    setCode(value || "");
    setIsDirty(true);
    // Save code to localStorage per user/problem/language
    if (user && selectedLanguage && id) {
      localStorage.setItem(
        `codeclash_code_${user._id}_${id}_${selectedLanguage.id}`,
        value || ""
      );
    }
  };
 
  // Load code from localStorage or template on language/problem change
  useEffect(() => {
    if (user && selectedLanguage && id) {
      const saved = localStorage.getItem(
        `codeclash_code_${user._id}_${id}_${selectedLanguage.id}`
      );
      if (saved !== null) {
        setCode(saved);
      } else {
        setCode(selectedLanguage.template || "");
      }
    }
  }, [user, selectedLanguage, id]);

  // Refresh button handler: clear code and localStorage, reset to template
  const handleRefreshCode = () => {
    if (user && selectedLanguage && id) {
      localStorage.removeItem(`codeclash_code_${user._id}_${id}_${selectedLanguage.id}`);
      setCode(selectedLanguage.template || "");
      setIsDirty(true);
    }
  };

  // Custom back button handler
  const handleBack = () => {
    if (isDirty) {
      setShowNavConfirm(true);
    } else {
      navigate("/userDashboard/user-problems");
    }
  };

  // Get window size for confetti (for left panel only)
  const [windowSize, setWindowSize] = useState({ width: 400, height: 600 });
  const leftPanelRef = useRef(null);
  useEffect(() => {
    if (leftPanelRef.current) {
      const rect = leftPanelRef.current.getBoundingClientRect();
      setWindowSize({ width: rect.width, height: rect.height });
    }
  }, [showCelebration]);

  // Fetch all submissions for this user/problem on mount and after submit
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user?._id || !id) return;
      try {
        const subs = await getUserProblemSubmissions(user._id, id);
        setAllSubmissions(subs);
      } catch {
        setAllSubmissions([]);
      }
    };
    fetchSubmissions();
  }, [user, id]);

  // Fetch participants for this problem
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!id) return;
      try {
        const data = await getProblemParticipants(id);
        setParticipants(data);
      } catch {
        setParticipants([]);
      }
    };
    fetchParticipants();
  }, [id]);

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

  // Only show camera/warning while solving and before successful submit
  const showProctoring = !showCelebration && (!testResults || !testResults.passed || (testResults.details && testResults.details.length === 1));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="flex justify-start">
                <button
                 onClick={handleBack}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                <ArrowLeft size={20} />
              <span className="font-medium ">Back to Problems</span>
            </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Timer size={18} />
              <span className="font-mono">{formatTime(elapsedTime)}</span>
            </div>
            {/* Participants Button */}
            <div className="relative flex items-center">
              <button
                className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs font-semibold border border-blue-200"
                onClick={() => setShowParticipants((v) => !v)}
                title="View Participants"
              >
                <Users size={16} />
                <span>{participants.length}</span>
              </button>
              {/* Dropdown/modal for participants */}
              {showParticipants && (
                <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded shadow-lg z-50 max-h-72 overflow-auto">
                  <div className="p-2 border-b font-semibold text-gray-700 flex items-center gap-2">
                    <Users size={16} /> Participants ({participants.length})
                    <button className="ml-auto text-gray-400 hover:text-red-500" onClick={() => setShowParticipants(false)}>✕</button>
                  </div>
                  {participants.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">No participants yet.</div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {participants.map((p) => (
                        <li key={p.userId} className="p-2 flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{p.name}</span>
                            <span className={`text-xs rounded px-2 py-0.5 ml-2 ${p.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.status}</span>
                          </div>
                          <div className="flex gap-4 text-xs text-gray-600 mt-1">
                            <span>Score: <span className="font-semibold text-gray-800">{p.score}</span></span>
                            <span>Time: <span className="font-semibold text-gray-800">{p.timeTaken}s</span></span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            {showProctoring && (
              <div className="flex items-center gap-2">
                <button
                  className="relative group"
                  onClick={() => setShowWebcam(true)}
                  aria-label="Show Camera"
                >
                  <Camera size={28} className="text-gray-700 hover:text-indigo-600 transition-colors" />
                </button>
                <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded shadow-sm">
                  Your motion is being detected. Please avoid any disqualifying actions.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
  
      {/* Main Content: LeetCode-style layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel: Problem Description */}
        <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
          {/* Problem Header */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-semibold text-gray-800">{problem.title}</h1>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                problem.difficulty === "Easy"
                  ? "bg-green-100 text-green-800"
                  : problem.difficulty === "Medium"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {problem.difficulty}
              </span>
            </div>
          </div>
  
          {/* Tabbed Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                className={`px-4 py-2 text-sm font-medium ${activeTab === "Description" ? "text-gray-700 border-b-2 border-blue-500 bg-blue-50" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("Description")}
              >
                Description
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${activeTab === "Submissions" ? "text-gray-700 border-b-2 border-blue-500 bg-blue-50" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("Submissions")}
              >
                Submissions
              </button>
            </div>
          </div>
  
          {/* Scrollable Content */}
          <div ref={leftPanelRef} className="flex-1 overflow-auto p-4">
            {activeTab === "Description" && (
              <>
                {/* Problem Description */}
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-6">{problem.description}</p>
                </div>
                {/* Example Test Cases */}
                <div className="space-y-4">
                  {problem.testCases.map((testCase, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg border border-gray-200">
                      <div className="p-4">
                        <div className="font-semibold text-gray-800 mb-3">Example {index + 1}:</div>
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm font-medium text-gray-600 mb-1">Input:</div>
                            <div className="bg-white border border-gray-200 rounded p-3 font-mono text-sm text-gray-800">
                              {testCase.input}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-600 mb-1">Output:</div>
                            <div className="bg-white border border-gray-200 rounded p-3 font-mono text-sm text-gray-800">
                              {testCase.output}
                            </div>
                          </div>
                          {testCase.explanation && (
                            <div>
                              <div className="text-sm font-medium text-gray-600 mb-1">Explanation:</div>
                              <div className="text-sm text-gray-700">{testCase.explanation}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {activeTab === "Submissions" && (
              <>
                {/* Celebration Confetti/Badge and Submission Summary */}
                {showCelebration && (
                  <>
                    <Confetti
                      width={windowSize.width}
                      height={windowSize.height}
                      numberOfPieces={120}
                      recycle={false}
                      colors={["#7C3AED", "#22D3EE", "#F59E42", "#10B981", "#F43F5E"]}
                      style={{ position: "absolute", left: 0, top: 0, zIndex: 10 }}
                    />
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="bg-gradient-to-r from-purple-500 via-pink-400 to-yellow-400 text-white px-8 py-4 rounded-2xl shadow-xl text-2xl font-bold flex items-center gap-3 animate-bounce border-4 border-white">
                        🎉 Congratulations! 🎉
                      </div>
                    </div>
                  </>
                )}
                {allSubmissions.length > 0 ? (
                  <div className="mb-8">
                    {allSubmissions.map((sub, idx) => (
                      <div key={sub._id || idx} className="bg-green-50 border border-green-200 rounded-xl p-6 mb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className={sub.status === "Accepted" ? "text-green-600" : "text-red-600"} size={28} />
                          <span className={`text-2xl font-bold ${sub.status === "Accepted" ? "text-green-800" : "text-red-800"}`}>{sub.status === "Accepted" ? "All Test Cases Passed!" : "Wrong Answer"}</span>
                        </div>
                        <div className="flex gap-8 mt-4">
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-semibold text-gray-700">Score</span>
                            <span className="text-3xl font-bold text-green-700">{sub.score}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-semibold text-gray-700">Time</span>
                            <span className="text-3xl font-bold text-blue-700">{sub.timeTaken}s</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-semibold text-gray-700">Submitted</span>
                            <span className="text-md text-gray-600">{new Date(sub.submittedAt).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="mb-4 mt-4">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Test Cases</h3>
                          <ul className="space-y-2">
                            {sub.testResults && sub.testResults.map((tc, tcidx) => (
                              <li key={tcidx} className="bg-white border border-gray-200 rounded p-3 flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-700">Case {tcidx + 1}:</span>
                                  {tc.passed ? (
                                    <span className="text-green-600 font-bold">Passed</span>
                                  ) : (
                                    <span className="text-red-600 font-bold">Failed</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-600">Input: <span className="font-mono">{tc.input}</span></div>
                                <div className="text-xs text-gray-600">Output: <span className="font-mono">{tc.actualOutput || tc.output}</span></div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center mt-8">No submissions yet.</div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Panel: Code Editor and Results */}
        <div className="w-1/2 flex flex-col bg-white">
          {/* Code Editor Header */}
          <div className="border-b border-gray-200 p-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Code</span>
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
                    className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:border-gray-400 transition-colors"
                  >
                    {problem.languages.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-red-600 text-sm">Loading languages...</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={runCode}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                >
                  <Play size={16} />
                  Run
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  disabled={!canSubmit || !!submissionSummary}
                  style={{ opacity: !canSubmit || !!submissionSummary ? 0.5 : 1 }}
                >
                  <Send size={16} />
                  Submit
                </button>
                <button
                  onClick={handleRefreshCode}
                  className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition-colors"
                  title="Reset code to default template"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4v5h.582M20 20v-5h-.581M5.077 19A9 9 0 1 1 19 5.077"/></svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>
  
          {/* Code Editor */}
          <div className="flex-1 min-h-0">
            {selectedLanguage && (
              <Editor
                height="100%"
                defaultLanguage={selectedLanguage.id}
                language={selectedLanguage.id}
                theme="vs-light"
                value={code}
                onChange={handleCodeChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  readOnly: false,
                  wordWrap: "on",
                  padding: { top: 16, bottom: 16 },
                  suggestOnTriggerCharacters: false,
                  quickSuggestions: false,
                  parameterHints: { enabled: false },
                  suggestSelection: "never",
                  acceptSuggestionOnCommitCharacter: false,
                  acceptSuggestionOnEnter: "off",
                  tabCompletion: "off",
                  wordBasedSuggestions: false,
                  scrollBeyondLastLine: false,
                }}
              />
            )}
          </div>
  
          {/* Test Results Panel */}
          {testResults && (
            <div className="border-t border-gray-200 bg-gray-50">
              {/* Test Results Header */}
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Testcase</span>
                  <span className="text-sm text-gray-500">Test Result</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
  
              {/* Test Results Content */}
              <div className="p-4 max-h-48 overflow-auto">
                {/* Test Case Tabs */}
                <div className="flex gap-2 mb-4">
                  {testResults.details.map((_, index) => (
                    <button
                      key={index}
                      className={`px-3 py-1 text-sm rounded ${
                        index === 0
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Case {index + 1}
                    </button>
                  ))}
                </div>
  
                {/* Result Status */}
                <div className={`p-3 rounded-lg border ${
                  testResults.passed
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {testResults.passed ? (
                      <>
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="font-medium">Accepted</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} className="text-red-600" />
                        <span className="font-medium">Wrong Answer</span>
                      </>
                    )}
                  </div>
  
                  {/* Test Case Details */}
                  <div className="space-y-3">
                    {testResults.details.map((tc, idx) => (
                      <div key={idx} className="text-sm">
                        <div className="font-mono bg-white p-2 rounded border">
                          <div className="text-gray-600">Input:</div>
                          <div className="text-gray-800">{tc.input}</div>
                        </div>
                        <div className="font-mono bg-white p-2 rounded border mt-1">
                          <div className="text-gray-600">Output:</div>
                          <div className="text-gray-800">{tc.output}</div>
                        </div>
                        <div className={`mt-1 px-2 py-1 rounded text-xs ${
                          tc.passed ? "text-green-700" : "text-red-700"
                        }`}>
                          {tc.passed ? "✓ Passed" : "✗ Failed"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  
      {/* Webcam Modal */}
      {showWebcam && showProctoring && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 relative w-80">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
              onClick={() => setShowWebcam(false)}
              aria-label="Close Camera"
            >
              ✕
            </button>
            <Webcam ref={webcamRef} mirrored className="w-full rounded-xl" />
            <div className="mt-2 text-xs text-gray-600 text-center">
              Camera is active for proctoring
            </div>
          </div>
        </div>
      )}
  
      {/* Notifications */}
      <AnimatePresence>
        {showWarning && showProctoring && (
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