import React from 'react';
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import ConfettiGenerator from "confetti-js";
import { formatDistanceStrict } from "date-fns";
import {
  Trophy,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Copy,
  ExternalLink,
  Smartphone,
} from "lucide-react";

// Utility function to setup violation listeners and reporting
const setupViolationListeners = (callback) => {
  let lastViolationTime = 0;
  const DEBOUNCE_TIME = 1000; // 1 second debounce

  // Function to handle violations with debounce
  const handleViolation = (violation) => {
    const currentTime = Date.now();
    if (currentTime - lastViolationTime < DEBOUNCE_TIME) {
      return; // Skip if too soon after last violation
    }
    lastViolationTime = currentTime;

    if (callback && typeof callback === "function") {
      callback(violation);
    }
  }

  // Listen for tab visibility changes
  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      handleViolation({
        type: "tab_change",
        timestamp: new Date().toISOString(),
        count: 1,
        description: "Tab change detected",
      });
    }
  };

  // Listen for copy/paste events
  const handleCopy = () => {
    handleViolation({
      type: "copy_paste",
      timestamp: new Date().toISOString(),
      description: "Content was copied",
    });
  };

  const handlePaste = () => {
    handleViolation({
      type: "copy_paste",
      timestamp: new Date().toISOString(),
      description: "Content was pasted",
    });
  };

  // Check for mobile devices
  const checkMobile = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      handleViolation({
        type: "mobile_detected",
        timestamp: new Date().toISOString(),
        description: "Mobile device detected",
      });
    }
  };

  // Add event listeners
  document.addEventListener("visibilitychange", handleVisibilityChange);
  document.addEventListener("copy", handleCopy);
  document.addEventListener("paste", handlePaste);

  // Check mobile on load
  checkMobile();

  // Cleanup function
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    document.removeEventListener("copy", handleCopy);
    document.removeEventListener("paste", handlePaste);
  };
};

// Helper function to calculate score
const calculateScore = (testCasesPassed) => {
  return testCasesPassed * 10; // 10 points per test case
};

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef(null);
  const [showViolations, setShowViolations] = useState(false);
  const [confettiEnabled, setConfettiEnabled] = useState(true);
  const [violationsState, setViolationsState] = useState(() => {
    const state = location.state || {};
    return {
      copyPaste: state.violations?.copyPaste || 0,
      tabChanges: state.violations?.tabChanges || 0,
      mobileDetected: state.violations?.mobileDetected || false,
      details: state.violations?.details || [],
    };
  });

  // Get data from location state with proper type checking
  const state = location.state || {};
  const testCases = Array.isArray(state.testCases) ? state.testCases : [];
  const startTime = state.startTime ? new Date(state.startTime) : new Date();
  const allPassed = testCases.length > 0 && testCases.every(tc => tc.passed);
  const failedCases = testCases.filter(tc => !tc.passed);

  // Handle violations coming from the console or other sources
  useEffect(() => {
    const processedViolations = new Set(); // Track processed violations

    // Custom event handler for violations
    const handleViolationEvent = (event) => {
      if (event.detail?.violation) {
        const newViolation = event.detail.violation;
        const violationKey = `${newViolation.type}-${newViolation.timestamp}`;

        // Skip if this violation has already been processed
        if (processedViolations.has(violationKey)) {
          return;
        }

        processedViolations.add(violationKey);

        setViolationsState((prevState) => {
          const updatedState = { ...prevState };
          
          // Update counts based on violation type
          if (newViolation.type === "tab_change" || newViolation.type === "tabChange") {
            updatedState.tabChanges += 1;
          } else if (newViolation.type === "copy_paste" || newViolation.type === "copyPaste") {
            updatedState.copyPaste += 1;
          } else if (newViolation.type === "mobile_detected" || newViolation.type === "mobileDetected") {
            updatedState.mobileDetected = true;
          }

          // Add to details if not already there
          const alreadyExists = updatedState.details.some(
            (v) => v.timestamp === newViolation.timestamp && v.type === newViolation.type
          );

          if (!alreadyExists) {
            updatedState.details = [
              ...updatedState.details,
              {
                type: newViolation.type,
                timestamp: newViolation.timestamp,
                description: newViolation.description || `${newViolation.type} violation detected`,
              },
            ];
          }

          return updatedState;
        });

        // Flash the violations modal briefly
        setShowViolations(true);
        setTimeout(() => setShowViolations(false), 1500);
      }
    };

    // Listen for custom events
    window.addEventListener("violation", handleViolationEvent);

    // Setup direct violation listeners
    const handleDirectViolation = (violation) => {
      const event = new CustomEvent("violation", {
        detail: { violation },
      });
      window.dispatchEvent(event);
    };

    // Setup the violation listeners with cleanup
    const cleanup = setupViolationListeners(handleDirectViolation);

    return () => {
      window.removeEventListener("violation", handleViolationEvent);
      cleanup();
    };
  }, []);

  // Calculate time spent using strict formatting (exact time)
  const timeSpent = formatDistanceStrict(startTime, new Date(), { addSuffix: false });
  const passedTests = testCases.filter((tc) => tc.passed).length;
  const score = calculateScore(passedTests);
  const totalViolations = 
    violationsState.copyPaste + 
    violationsState.tabChanges + 
    (violationsState.mobileDetected ? 1 : 0);

  // Confetti effect with toggle option
  useEffect(() => {
    let confetti = null;

    if (canvasRef.current && score >= 20 && confettiEnabled) {
      const confettiSettings = {
        target: canvasRef.current,
        max: 150,
        size: 1.2,
        animate: true,
        props: ["circle", "square", "triangle", "line"],
        colors: [
          [165, 104, 246],
          [230, 61, 135],
          [0, 199, 228],
          [253, 214, 126],
        ],
        clock: 25,
      };
      confetti = new ConfettiGenerator(confettiSettings);
      confetti.render();
    }

    return () => {
      if (confetti) confetti.clear();
    };
  }, [score, confettiEnabled]);

  // Function to toggle confetti
  const toggleConfetti = () => {
    setConfettiEnabled((prev) => !prev);
  };

  // Function to manually report a violation (for testing)
  const reportManualViolation = (type) => {
    const event = new CustomEvent("violation", {
      detail: {
        violation: {
          type,
          timestamp: new Date().toISOString(),
          description: `Manual ${type} violation reported`,
        },
      },
    });
    window.dispatchEvent(event);
  };

  const ViolationsModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={() => setShowViolations(false)}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Violation Details</h3>
          <button onClick={() => setShowViolations(false)} className="text-gray-500 hover:text-gray-700">
            <XCircle size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {violationsState.details && violationsState.details.length > 0 ? (
            violationsState.details.map((violation, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  {(violation.type === "copyPaste" || violation.type === "copy_paste") && (
                    <Copy className="text-orange-500" size={20} />
                  )}
                  {(violation.type === "tabChange" || violation.type === "tab_change") && (
                    <ExternalLink className="text-blue-500" size={20} />
                  )}
                  {(violation.type === "mobileDetected" || violation.type === "mobile_detected") && (
                    <Smartphone className="text-red-500" size={20} />
                  )}
                  <span className="font-medium text-gray-700">
                    {violation.timestamp
                      ? formatDistanceStrict(new Date(violation.timestamp), new Date(), { addSuffix: true })
                      : "Time not recorded"}
                  </span>
                </div>
                <p className="text-gray-600">{violation.description || `${violation.type} violation detected`}</p>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-600 py-4">No violations recorded</div>
          )}
        </div>

        {/* For testing - only visible in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Test Violations (Dev Only)</h4>
            <div className="flex gap-2">
              <button
                onClick={() => reportManualViolation("tab_change")}
                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm"
              >
                Test Tab Change
              </button>
              <button
                onClick={() => reportManualViolation("copy_paste")}
                className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-md text-sm"
              >
                Test Copy/Paste
              </button>
              <button
                onClick={() => reportManualViolation("mobile_detected")}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm"
              >
                Test Mobile
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 relative">
      {confettiEnabled && <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />}

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Coding Challenge Results</h1>
              <p className="text-indigo-200 mt-2">Here's how you performed on this challenge.</p>
            </div>
            {score >= 20 && (
              <button
                onClick={toggleConfetti}
                className="px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white text-sm transition-colors"
              >
                {confettiEnabled ? "Disable" : "Enable"} Celebration
              </button>
            )}
          </div>

          {/* Score Card */}
          <div className="p-8">
            {!allPassed && failedCases.length > 0 && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h2 className="text-lg font-bold text-red-700 mb-2">Some test cases failed</h2>
                <ul className="list-disc pl-6 text-red-700">
                  {failedCases.map((tc, idx) => (
                    <li key={idx}>
                      <span className="font-semibold">Input:</span> <span className="font-mono">{tc.input}</span> <span className="font-semibold">Expected:</span> <span className="font-mono">{tc.output}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-12"
            >
              <div
                className={`relative w-48 h-48 rounded-full flex items-center justify-center bg-gradient-to-br ${
                  score >= 20
                    ? "from-green-500 to-emerald-600"
                    : score >= 10
                      ? "from-yellow-500 to-orange-600"
                      : "from-red-500 to-rose-600"
                }`}
              >
                <div className="absolute inset-1 bg-white rounded-full" />
                <div className="relative flex flex-col items-center">
                  <span className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {score}
                  </span>
                  <span className="text-gray-600 font-medium">Points</span>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <StatsCard
                icon={<Trophy className="text-yellow-500" />}
                value={`${passedTests}/${testCases.length}`}
                label="Tests Passed"
                color="bg-yellow-50"
              />
              <StatsCard
                icon={<Clock className="text-blue-500" />}
                value={timeSpent}
                label="Time Taken"
                color="bg-blue-50"
              />
              <button onClick={() => setShowViolations(true)} className="text-left w-full">
                <StatsCard
                  icon={<AlertTriangle className="text-red-500" />}
                  value={totalViolations}
                  label={`Click to view violation${totalViolations === 1 ? "" : "s"}`}
                  color="bg-red-50"
                  highlight={totalViolations > 0}
                />
              </button>
            </div>

            {/* Test Cases */}
            <div className="space-y-4 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Test Cases Details</h2>
              {testCases.length > 0 ? (
                testCases.map((test, index) => <TestCaseCard key={index} index={index} test={test} />)
              ) : (
                <div className="text-center text-gray-600 py-4">No test cases available</div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t">
              <button
                onClick={() => navigate("/userDashboard/user-problems")}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors hover:bg-gray-50 rounded-lg"
              >
                <ArrowLeft size={20} />
                Problem List
              </button>
              <button
                onClick={() => navigate("/userDashboard/user-problems")}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Next Challenge
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>{showViolations && <ViolationsModal />}</AnimatePresence>
    </div>
  );
};

const StatsCard = ({ icon, value, label, color, highlight = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`${color} rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 w-full ${
      highlight ? "ring-2 ring-red-300 animate-pulse" : ""
    }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-gray-600">{label}</div>
      </div>
    </div>
  </motion.div>
);

const TestCaseCard = ({ index, test }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.1 * index }}
    className={`rounded-lg p-6 ${
      test.passed ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"
    }`}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-medium text-gray-800">Test Case {index + 1}</h3>
      <span
        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
          test.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {test.passed ? (
          <>
            <CheckCircle size={16} /> Passed
          </>
        ) : (
          <>
            <XCircle size={16} /> Failed
          </>
        )}
      </span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <div className="text-sm text-gray-600 mb-1">Input:</div>
        <pre className="bg-white bg-opacity-50 p-3 rounded text-sm font-mono overflow-x-auto">{test.input}</pre>
      </div>
      <div>
        <div className="text-sm text-gray-600 mb-1">Output:</div>
        <pre className="bg-white bg-opacity-50 p-3 rounded text-sm font-mono overflow-x-auto">{test.output}</pre>
      </div>
    </div>
  </motion.div>
);

export default ResultsPage;