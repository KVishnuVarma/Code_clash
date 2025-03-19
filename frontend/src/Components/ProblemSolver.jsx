import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';
import { 
  ArrowLeft,
  Play,
  AlertCircle,
  Camera,
  Send
} from 'lucide-react';

// Mock problem data
const mockProblem = {
  id: '1',
  title: 'Two Sum',
  description: 'Given an array of integers nums and an integer target, return indices of the two numbers in the array that add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
  testCases: [
    {
      input: '[2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
    },
    {
      input: '[3,2,4], target = 6',
      output: '[1,2]',
      explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
    }
  ]
};

// Mock API response for code submission
const mockRunCode = async (code, testCase) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simple test to check if the code contains key elements
      const isValid = code.includes('def two_sum') && 
                     code.includes('return') && 
                     code.includes('for') &&
                     code.includes('in');
      
      resolve({
        success: isValid,
        output: isValid ? '[0, 1]' : null,
        error: isValid ? null : 'Your solution is incorrect. Please try again.'
      });
    }, 1000);
  });
};

const ProblemSolve = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState('def two_sum(nums, target):\n    # Write your solution here\n    pass');
  const [showWarning, setShowWarning] = useState(false);
  const [isCameraMinimized, setIsCameraMinimized] = useState(false);
  const [violations, setViolations] = useState({
    tabChanges: 0,
    copyPaste: 0,
    mobileDetected: false
  });
  const [isExamTerminated, setIsExamTerminated] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [startTime] = useState(Date.now());

  const webcamRef = useRef(null);
  const socketRef = useRef(null);
  const tabChangeTimeout = useRef(null);
  const mobileCheckInterval = useRef(null);

  useEffect(() => {
    // Simulate socket connection
    socketRef.current = {
      emit: (event, data) => {
        console.log('Admin notification:', event, data);
      }
    };
    
    // Set mock problem data
    setProblem(mockProblem);
    setLoading(false);

    return () => {
      if (socketRef.current) {
        socketRef.current = null;
      }
    };
  }, []);

  const notifyAdmin = (violation) => {
    if (socketRef.current) {
      socketRef.current.emit('violation', {
        userId: 'user123',
        examId: id,
        violation,
        timestamp: new Date().toISOString()
      });
    }
  };

  const checkMobileDevice = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                    window.matchMedia("(max-width: 768px)").matches ||
                    (window.screen.width <= 768);
    
    if (isMobile && !violations.mobileDetected) {
      setViolations(prev => ({ ...prev, mobileDetected: true }));
      terminateExam('mobile_device_detected');
    }
  };

  const terminateExam = (reason) => {
    setIsExamTerminated(true);
    notifyAdmin({
      type: 'exam_terminated',
      reason,
      violations: violations
    });
    setTimeout(() => {
      navigate('/');
    }, 5000);
  };

  useEffect(() => {
    // Mobile detection with continuous checking
    checkMobileDevice();
    mobileCheckInterval.current = setInterval(checkMobileDevice, 5000);

    // Tab change detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(prev => ({
          ...prev,
          tabChanges: prev.tabChanges + 1
        }));
        setShowWarning(true);
        
        if (tabChangeTimeout.current) {
          clearTimeout(tabChangeTimeout.current);
        }
        
        tabChangeTimeout.current = setTimeout(() => {
          setShowWarning(false);
        }, 3000);

        if (violations.tabChanges >= 2) {
          terminateExam('excessive_tab_changes');
        }

        notifyAdmin({
          type: 'tab_change',
          count: violations.tabChanges + 1
        });
      }
    };

    // Copy/Paste prevention
    const preventCopyPaste = (e) => {
      e.preventDefault();
      setViolations(prev => ({
        ...prev,
        copyPaste: prev.copyPaste + 1
      }));
      setShowWarning(true);
      
      setTimeout(() => setShowWarning(false), 3000);

      if (violations.copyPaste >= 2) {
        terminateExam('excessive_copy_paste');
      }

      notifyAdmin({
        type: 'copy_paste_attempt',
        count: violations.copyPaste + 1
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', preventCopyPaste);
    document.addEventListener('paste', preventCopyPaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', preventCopyPaste);
      document.removeEventListener('paste', preventCopyPaste);
      if (tabChangeTimeout.current) {
        clearTimeout(tabChangeTimeout.current);
      }
      if (mobileCheckInterval.current) {
        clearInterval(mobileCheckInterval.current);
      }
    };
  }, [id, violations]);

  const handleBack = () => {
    navigate(`/problems/${id}/view`);
  };

  const runCode = async () => {
    try {
      const result = await mockRunCode(code, problem.testCases[0]);
      
      if (result.success) {
        setCanSubmit(true);
        setTestResults({
          passed: true,
          output: result.output,
        });
      } else {
        setTestResults({
          passed: false,
          error: result.error,
        });
      }
    } catch (error) {
      setTestResults({
        passed: false,
        error: 'Failed to run code. Please try again.',
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const results = {
        testCases: problem.testCases.map(testCase => ({
          ...testCase,
          passed: true
        }))
      };
      
      navigate(`/problems/${id}/results`, {
        state: {
          testCases: results.testCases,
          timeSpent: Date.now() - startTime,
          violations: violations,
        },
      });
    } catch (error) {
      setError('Failed to submit code. Please try again.');
    }
  };

  const toggleCamera = () => {
    setIsCameraMinimized(!isCameraMinimized);
  };

  if (isExamTerminated) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-4">Exam Terminated</h2>
            <p className="text-gray-600 mb-4">
              Your exam has been terminated due to multiple violations of our exam policy.
              This incident has been reported to the administrator.
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
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Problem
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div 
            className="fixed top-4 right-4 bg-red-100 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-lg z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-500" />
              <p className="font-medium">Warning: Suspicious activity detected!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Results Modal */}
      <AnimatePresence>
        {testResults && (
          <motion.div 
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 ${
              testResults.passed ? 'bg-green-100 border-green-200 text-green-700' : 'bg-red-100 border-red-200 text-red-700'
            } px-6 py-4 rounded-lg shadow-lg z-50 border`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center gap-2">
              {testResults.passed ? (
                <>
                  <div className="text-green-500">✓</div>
                  <p className="font-medium">Test case passed! You can now submit your solution.</p>
                </>
              ) : (
                <>
                  <AlertCircle className="text-red-500" />
                  <p className="font-medium">Test failed: {testResults.error}</p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
            Back to Problem
          </button>
          <div className="flex gap-4">
            <button
              onClick={runCode}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play size={20} />
              Run Code
            </button>
            {canSubmit && (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send size={20} />
                Submit Solution
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-12 gap-4">
        {/* Problem Details */}
        <div className="col-span-4 bg-white rounded-lg shadow-sm p-6 h-[calc(100vh-12rem)] overflow-y-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{problem.title}</h1>
          <div className="prose max-w-none">
            <p className="text-gray-600">{problem.description}</p>
          </div>
          
          {/* Test Cases */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Example Test Cases</h2>
            <div className="space-y-4">
              {problem.testCases && problem.testCases.map((testCase, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
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
              ))}
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="col-span-8 bg-white rounded-lg shadow-sm">
          <Editor
            height="calc(100vh - 12rem)"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={setCode}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              readOnly: false,
              wordWrap: 'on',
              suggestOnTriggerCharacters: false,
              quickSuggestions: false,
              parameterHints: {
                enabled: false
              },
              suggestSelection: 'never',
              acceptSuggestionOnCommitCharacter: false,
              acceptSuggestionOnEnter: 'off',
              tabCompletion: 'off',
              wordBasedSuggestions: false
            }}
          />
        </div>
      </div>

      {/* Webcam */}
      <div 
        className={`fixed ${isCameraMinimized ? 'bottom-4 right-4 w-48' : 'bottom-4 right-4 w-64'} transition-all duration-300`}
      >
        <div className="relative">
          <Webcam
            ref={webcamRef}
            mirrored
            className="rounded-lg shadow-lg w-full"
          />
          <button
            onClick={toggleCamera}
            className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-colors"
          >
            <Camera size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProblemSolve;