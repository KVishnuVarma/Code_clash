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
  Trophy,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { submitSolution, getUserProblemSubmissions, getProblemParticipants } from "../services/problemService";
import { useAuth } from "../context/AuthContext";
import Confetti from "react-confetti";
import Aihelp from "./Aihelp";

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
  // Add state for current test case tab
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [showAiHelp, setShowAiHelp] = useState(false);
  const [aiHelpSubmissionIdx, setAiHelpSubmissionIdx] = useState(null);

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
            `https://code-clash-s9vq.onrender.com/api/problems/${id}`
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

  // Timer persistence keys
  const timerKey = user && id ? `codeclash_timer_${user._id}_${id}` : null;

  // Timer: use localStorage for persistence
  const [startTime, setStartTime] = useState(() => {
    if (timerKey) {
      const saved = localStorage.getItem(timerKey);
      return saved ? parseInt(saved, 10) : Date.now();
    }
    return Date.now();
  });

  useEffect(() => {
    if (timerKey) {
      localStorage.setItem(timerKey, startTime.toString());
    }
  }, [startTime, timerKey]);

  useEffect(() => {
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
    setActiveTestCase(0);
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

  // Fixed handleSubmit with proper error handling
  const handleSubmit = async () => {
    setTestResults(null);
    setError(null); // Clear any previous errors
    const userId = user?._id;
    
    if (!userId) {
      setTestResults({
        passed: false,
        error: "User not logged in. Please log in to submit code.",
        isCompileError: false,
        details: []
      });
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

      if (result && result.results) {
        const allPassed = result.results.testCases.every(tc => tc.passed);
        setCanSubmit(allPassed);
        setTestResults({
          passed: allPassed,
          details: result.results.testCases,
          metrics: result.results.metrics,
          error: allPassed ? null : "Some test cases failed. Check details.",
          isCompileError: false
        });
        setActiveTestCase(0); // Reset to first test case
        
        if (allPassed) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000);
          setShowWebcam(false);
          setShowWarning(false);
          if (webcamRef.current && webcamRef.current.stream) {
            webcamRef.current.stream.getTracks().forEach((track) => track.stop());
          }
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
          setActiveTab("Submissions");
          if (timerInterval.current) {
            clearInterval(timerInterval.current);
            timerInterval.current = null;
          }
          setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
          if (user?._id && id) {
            getUserProblemSubmissions(user._id, id).then(setAllSubmissions);
          }
          // --- Refetch participants after successful submission ---
          if (id) {
            getProblemParticipants(id).then(data => setParticipants(Array.isArray(data) ? data.filter(p => p.status === 'Accepted') : []));
          }
        }
      } else {
        // Handle case where result structure is unexpected
        setTestResults({
          passed: false,
          error: "Unexpected response format. Please try again.",
          isCompileError: true,
          details: []
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      
      // Check if it's a compile error based on error message or structure
      const isCompileError = error.message && (
        error.message.includes("compile") || 
        error.message.includes("syntax") ||
        error.message.includes("Compile Error") ||
        error.message.toLowerCase().includes("illegal start")
      );
      
      setTestResults({
        passed: false,
        error: error.message || "Failed to submit code. Please try again.",
        isCompileError: isCompileError,
        details: [],
        compileErrorDetails: isCompileError ? {
          line: extractLineNumber(error.message),
          message: error.message
        } : null
      });
      setActiveTestCase(0);
    }
  };

  // Fixed runCode with proper error handling
  const runCode = async () => {
    setTestResults(null);
    setError(null); // Clear any previous errors
    const userId = user?._id;
    
    if (!userId) {
      setTestResults({
        passed: false,
        error: "User not logged in. Please log in to run code.",
        isCompileError: false,
        details: []
      });
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

      if (result && result.results && result.results.testCases && result.results.testCases.length > 0) {
        const firstTest = result.results.testCases[0];
        setCanSubmit(firstTest.passed);
        setTestResults({
          passed: firstTest.passed,
          details: [firstTest],
          metrics: result.results.metrics,
          error: firstTest.passed ? null : "First test case failed. Check details.",
          isCompileError: false
        });
        setActiveTestCase(0);
      } else {
        setTestResults({
          passed: false,
          error: "No test results received. Please try again.",
          isCompileError: true,
          details: []
        });
      }
    } catch (error) {
      console.error("Run code error:", error);
      
      // Check if it's a compile error
      const isCompileError = error.message && (
        error.message.includes("compile") || 
        error.message.includes("syntax") ||
        error.message.includes("Compile Error") ||
        error.message.toLowerCase().includes("illegal start")
      );

      setTestResults({
        passed: false,
        error: error.message || "Failed to run code. Please try again.",
        isCompileError: isCompileError,
        details: [],
        compileErrorDetails: isCompileError ? {
          line: extractLineNumber(error.message),
          message: error.message
        } : null
      });
      setActiveTestCase(0);
    }
  };

  // Helper function to extract line number from error message
  const extractLineNumber = (errorMessage) => {
    if (!errorMessage) return null;
    const lineMatch = errorMessage.match(/Line (\d+):/i);
    return lineMatch ? parseInt(lineMatch[1]) : null;
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

  // Refresh button handler: clear code and timer from localStorage, reset to template
  const handleRefreshCode = () => {
    if (window.confirm("Are you sure you want to refresh the code? This will reset your code and timer.")) {
      if (user && selectedLanguage && id) {
        localStorage.removeItem(`codeclash_code_${user._id}_${id}_${selectedLanguage.id}`);
        setCode(selectedLanguage.template || "");
        setIsDirty(true);
      }
      if (timerKey) {
        localStorage.removeItem(timerKey);
        const now = Date.now();
        setStartTime(now);
        setElapsedTime(0);
      }
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
        // Only show participants with status 'Accepted'
        setParticipants(Array.isArray(data) ? data.filter(p => p.status === 'Accepted') : []);
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
                  aria-label="Back to Problems"
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
                            <span className={`text-xs rounded px-2 py-0.5 ml-2 ${p.status === 'Accepted' ? 'bg-green-600 text-green-1000' : 'bg-red-100 text-red-700'}`}>{p.status}</span>
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
            <div className="flex items-center">
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
              <button
                className={`px-4 py-2 text-sm font-medium ${activeTab === "Participants" ? "text-gray-700 border-b-2 border-blue-500 bg-blue-50" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("Participants")}
              >
                Participants
                <span className="ml-2 bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs font-semibold">{participants.length}</span>
              </button>
              {/* AI Help Button in the tab bar */}
              <button
                onClick={() => { setShowAiHelp(true); setAiHelpSubmissionIdx(null); }}
                className="ml-4 flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                aria-label="AI Help"
              >
                <HelpCircle size={16} />
                AI Help
              </button>
            </div>
          </div>
          {/* AI Help Modal (global, not per submission) */}
          <Aihelp 
            open={showAiHelp} 
            onClose={() => { setShowAiHelp(false); setAiHelpSubmissionIdx(null); }} 
            code={code}
            language={selectedLanguage?.name || selectedLanguage?.id}
            problemId={id}
            userId={user?._id}
          />

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
                  {Array.isArray(problem?.testCases) && problem.testCases.map((testCase, index) => (
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
              <div className="w-full">
                {/* Test Results Panel (compile error or test cases) */}
                {testResults && (
                  <div className="border border-gray-200 bg-gray-50 rounded-lg p-4 mb-4">
                    {testResults.isCompileError ? (
                      <div className="text-red-700">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="text-red-500" />
                          <span className="font-bold">Compile Error</span>
                        </div>
                        <pre className="bg-red-100 border border-red-200 rounded p-3 text-sm text-red-800 whitespace-pre-wrap">
                          {testResults.error}
                        </pre>
                        {testResults.compileErrorDetails && testResults.compileErrorDetails.line && (
                          <div className="mt-2 text-xs text-gray-600">Line: {testResults.compileErrorDetails.line}</div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          {testResults.passed ? (
                            <CheckCircle className="text-green-600" />
                          ) : (
                            <AlertCircle className="text-red-500" />
                          )}
                          <span className={`font-bold ${testResults.passed ? 'text-green-700' : 'text-red-700'}`}>{testResults.passed ? 'All Test Cases Passed!' : 'Some Test Cases Failed'}</span>
                        </div>
                        <div className="flex gap-2 mb-2">
                          {testResults.details && testResults.details.map((tc, idx) => (
                            <button
                              key={idx}
                              className={`px-3 py-1 text-xs rounded border ${activeTestCase === idx ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-gray-100 border-gray-300 text-gray-600'}`}
                              onClick={() => setActiveTestCase(idx)}
                            >
                              Case {idx + 1}
                            </button>
                          ))}
                        </div>
                        {testResults.details && testResults.details[activeTestCase] && (
                          <div className="bg-white border border-gray-200 rounded p-3 mb-2">
                            <div className="font-mono text-xs text-gray-600 mb-1">Input:</div>
                            <div className="font-mono text-sm text-gray-800 mb-2">{testResults.details[activeTestCase].input}</div>
                            <div className="font-mono text-xs text-gray-600 mb-1">Expected Output:</div>
                            <div className="font-mono text-sm text-gray-800 mb-2">{testResults.details[activeTestCase].expectedOutput || testResults.details[activeTestCase].output}</div>
                            <div className="font-mono text-xs text-gray-600 mb-1">Actual Output:</div>
                            <div className="font-mono text-sm text-gray-800 mb-2">{testResults.details[activeTestCase].actualOutput || testResults.details[activeTestCase].output}</div>
                            {testResults.details[activeTestCase].explanation && (
                              <div className="mt-2">
                                <div className="font-mono text-xs text-gray-600 mb-1">Explanation:</div>
                                <div className="font-mono text-sm text-gray-700">{testResults.details[activeTestCase].explanation}</div>
                              </div>
                            )}
                            {testResults.details[activeTestCase].error && (
                              <div className="text-xs text-red-600 mt-1">Error: <span className="font-mono">{testResults.details[activeTestCase].error}</span></div>
                            )}
                            <div className={`mt-2 px-2 py-1 rounded text-xs ${testResults.details[activeTestCase].passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{testResults.details[activeTestCase].passed ? '✓ Passed' : '✗ Failed'}</div>
                          </div>
                        )}
                        <div className="text-xs text-gray-500">{testResults.details && testResults.details.filter(tc => tc.passed).length}/{testResults.details ? testResults.details.length : 0} testcases passed</div>
                        {testResults.error && !testResults.passed && (
                          <div className="text-xs text-red-600 mt-2">{testResults.error}</div>
                        )}
                      </>
                    )}
                  </div>
                )}
                {/* Show all previous submissions if any */}
                {allSubmissions.length > 0 ? (
                  <div className="mb-8">
                    {allSubmissions.map((sub, idx) => (
                      <div key={sub._id || idx} className="relative flex items-start mb-4">
                        {/* Submission Card */}
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 w-full">
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
                                  <div className="text-xs text-gray-600">Expected Output: <span className="font-mono">{tc.expectedOutput || tc.output}</span></div>
                                  <div className="text-xs text-gray-600">Actual Output: <span className="font-mono">{tc.actualOutput || tc.output}</span></div>
                                  {tc.explanation && (
                                    <div className="mt-1 text-xs text-gray-700">Explanation: <span className="font-mono">{tc.explanation}</span></div>
                                  )}
                                  {tc.error && (
                                    <div className="text-xs text-red-600 mt-1">Error: <span className="font-mono">{tc.error}</span></div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        {showAiHelp && aiHelpSubmissionIdx === idx && (
                          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                              <button
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl font-bold"
                                onClick={() => { setShowAiHelp(false); setAiHelpSubmissionIdx(null); }}
                                aria-label="Close AI Help"
                              >
                                ×
                              </button>
                              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700">
                                <HelpCircle size={28} /> AI Help
                              </h2>
                              <div className="space-y-4 text-gray-700">
                                <div>
                                  <h3 className="font-semibold text-lg mb-1">Code Completion Tips</h3>
                                  <ul className="list-disc list-inside text-sm space-y-1">
                                    <li>Break down the problem into smaller steps before coding.</li>
                                    <li>Write pseudocode or comments to outline your logic.</li>
                                    <li>Use the provided function signature and input/output format.</li>
                                  </ul>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg mb-1">Error Fixing Advice</h3>
                                  <ul className="list-disc list-inside text-sm space-y-1">
                                    <li>Check for syntax errors and missing brackets or semicolons.</li>
                                    <li>Review variable names and types for consistency.</li>
                                    <li>Use print/debug statements to trace your code execution.</li>
                                  </ul>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg mb-1">Code Review Checklist</h3>
                                  <ul className="list-disc list-inside text-sm space-y-1">
                                    <li>Did you handle all possible edge cases?</li>
                                    <li>Is your code readable and well-commented?</li>
                                    <li>Did you test your solution with different inputs?</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center mt-8">No submissions yet.</div>
                )}
              </div>
            )}
            {activeTab === "Participants" && (
              <div className="bg-slate-900 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-6">
                  <div className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-white/10 rounded-full">
                      <Users size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Participants</h2>
                      <p className="text-slate-200 text-sm">{participants.length} members joined</p>
                    </div>
                  </div>
                </div>
    {/* Content */}
    {participants.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
          <Users size={32} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">No participants yet</h3>
        <p className="text-slate-400 text-center">Participants will appear here once they join the session.</p>
      </div>
    ) : (
      <div className="divide-y divide-slate-600">
        {participants.map((participant, index) => (
          <div key={participant.userId} className="p-6 hover:bg-slate-700/50 transition-colors duration-200">
            <div className="flex items-center justify-between">
              {/* Left side - Name and Status */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {participant.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100 text-lg">
                    {participant.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      participant.status === 'Accepted' 
                        ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-700' 
                        : 'bg-red-900/30 text-red-300 border border-red-700'
                    }`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        participant.status === 'Accepted' ? 'bg-emerald-400' : 'bg-red-400'
                      }`}></span>
                      {participant.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side - Stats */}
              {participant.status === 'Accepted' && (
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-300 mb-1">
                      <Trophy size={18} strokeWidth={2.5} />
                    </div>
                    <div className="text-2xl font-bold text-slate-100">{participant.score}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-300 mb-1">
                      <Clock size={18} strokeWidth={2.5} />
                    </div>
                    <div className="text-2xl font-bold text-slate-100">{participant.timeTaken}s</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Time</div>
                  </div>
                </div>
              )}
            </div>

            {/* Ranking indicator for top performers */}
            {participant.status === 'Accepted' && index < 3 && (
              <div className="mt-3 pt-3 border-t border-slate-600">
                <div className="flex items-center gap-2">
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )}

    {/* Footer Stats */}
    {participants.length > 0 && (
      <div className="bg-slate-700 px-6 py-4 border-t border-slate-600">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            {participants.filter(p => p.status === 'Accepted').length} accepted • {participants.filter(p => p.status === 'Declined').length} declined
          </span>
          <span className="text-slate-400">
            Avg Score: {Math.round(participants.filter(p => p.status === 'Accepted').reduce((sum, p) => sum + p.score, 0) / participants.filter(p => p.status === 'Accepted').length) || 0}
          </span>
        </div>
      </div>
    )}
  </div>
)}
          </div>
        </div>
        {/* Right Panel: Code Editor and Results */}
        <div className="w-1/2 flex flex-col bg-white relative">
          {/* Code Editor Header */}
          <div className="border-b border-gray-200 p-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Code</span>
                {problem.languages && Array.isArray(problem.languages) && problem.languages.length > 0 && selectedLanguage ? (
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
          {/* Test Results Panel (compile error or test cases) */}
          {testResults && (
            <div className="border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Testcase</span>
                  <span className="text-sm text-gray-500">Test Result</span>
                </div>
              </div>
              <div className="p-4 max-h-48 overflow-auto">
                {testResults.isCompileError ? (
                  <div className="text-red-700">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="text-red-500" />
                      <span className="font-bold">Compile Error</span>
                    </div>
                    <pre className="bg-red-100 border border-red-200 rounded p-3 text-sm text-red-800 whitespace-pre-wrap">
                      {testResults.error}
                    </pre>
                    {testResults.compileErrorDetails && testResults.compileErrorDetails.line && (
                      <div className="mt-2 text-xs text-gray-600">Line: {testResults.compileErrorDetails.line}</div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2 mb-2">
                      {testResults.details && testResults.details.map((tc, idx) => (
                        <button
                          key={idx}
                          className={`px-3 py-1 text-xs rounded border ${activeTestCase === idx ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-gray-100 border-gray-300 text-gray-600'}`}
                          onClick={() => setActiveTestCase(idx)}
                        >
                          Case {idx + 1}
                        </button>
                      ))}
                    </div>
                    {testResults.details && testResults.details[activeTestCase] && (
                      <div className="bg-white border border-gray-200 rounded p-3 mb-2">
                        <div className="font-mono text-xs text-gray-600 mb-1">Input:</div>
                        <div className="font-mono text-sm text-gray-800 mb-2">{testResults.details[activeTestCase].input}</div>
                        <div className="font-mono text-xs text-gray-600 mb-1">Expected Output:</div>
                        <div className="font-mono text-sm text-gray-800 mb-2">{testResults.details[activeTestCase].expectedOutput || testResults.details[activeTestCase].output}</div>
                        <div className="font-mono text-xs text-gray-600 mb-1">Actual Output:</div>
                        <div className="font-mono text-sm text-gray-800 mb-2">{testResults.details[activeTestCase].actualOutput || testResults.details[activeTestCase].output}</div>
                        {testResults.details[activeTestCase].explanation && (
                          <div className="mt-2">
                            <div className="font-mono text-xs text-gray-600 mb-1">Explanation:</div>
                            <div className="font-mono text-sm text-gray-700">{testResults.details[activeTestCase].explanation}</div>
                          </div>
                        )}
                        {testResults.details[activeTestCase].error && (
                          <div className="text-xs text-red-600 mt-1">Error: <span className="font-mono">{testResults.details[activeTestCase].error}</span></div>
                        )}
                        <div className={`mt-2 px-2 py-1 rounded text-xs ${testResults.details[activeTestCase].passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{testResults.details[activeTestCase].passed ? '✓ Passed' : '✗ Failed'}</div>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">{testResults.details && testResults.details.filter(tc => tc.passed).length}/{testResults.details ? testResults.details.length : 0} testcases passed</div>
                    {testResults.error && !testResults.passed && (
                      <div className="text-xs text-red-600 mt-2">{testResults.error}</div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {showNavConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Unsaved Code Warning</h2>
            <p className="mb-6">You have unsaved code changes. If you leave this page, your code will be lost.<br/>Are you sure you want to exit?</p>
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
                Leave Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemSolve;