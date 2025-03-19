import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ConfettiGenerator from 'confetti-js';
import { Trophy, Clock, AlertTriangle } from 'lucide-react';

const calculateScore = (timeSpent, testCasesPassed, totalTestCases, violations) => {
  let score = (testCasesPassed / totalTestCases) * 100; // Base score from test cases
  
  // Time penalty (lose points for taking longer)
  const timePenalty = Math.min(20, timeSpent / 60); // Max 20% penalty for time
  score -= timePenalty;
  
  // Violation penalties
  if (violations.copyPaste > 0) score -= violations.copyPaste * 10;
  if (violations.tabChanges > 0) score -= violations.tabChanges * 5;
  if (violations.mobileDetected) score -= 30;
  
  return Math.max(0, Math.round(score)); // Ensure score doesn't go below 0
};

const ResultsPage = ({ testCases = [], timeSpent = 0, violations = { copyPaste: 0, tabChanges: 0, mobileDetected: false } }) => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const passedTests = testCases.filter(tc => tc.passed).length;
  const score = calculateScore(timeSpent, passedTests, testCases.length, violations);

  useEffect(() => {
    if (canvasRef.current && score > 70) {
      const confettiSettings = {
        target: canvasRef.current,
        max: 200,
        size: 1.5,
        animate: true,
        props: ['circle', 'square', 'triangle', 'line'],
        colors: [[165, 104, 246], [230, 61, 135], [0, 199, 228], [253, 214, 126]],
        clock: 25,
      };
      const confetti = new ConfettiGenerator(confettiSettings);
      confetti.render();

      return () => confetti.clear();
    }
  }, [score]);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50"></canvas>
      
      <div className="max-w-4xl mx-auto pt-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 text-white">
            <h1 className="text-3xl font-bold">Results Summary</h1>
          </div>

          <div className="p-8">
            {/* Score Section */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <div className="bg-gray-50 rounded-full p-8 border-4 border-blue-500">
                <div className="text-5xl font-bold text-blue-600">{score}</div>
                <div className="text-gray-600">Score</div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 p-4 rounded-lg"
              >
                <Trophy className="text-yellow-500 mb-2" size={24} />
                <div className="text-lg font-semibold">{passedTests}/{testCases.length}</div>
                <div className="text-gray-600">Tests Passed</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-50 p-4 rounded-lg"
              >
                <Clock className="text-blue-500 mb-2" size={24} />
                <div className="text-lg font-semibold">{Math.round(timeSpent / 60)} minutes</div>
                <div className="text-gray-600">Time Taken</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gray-50 p-4 rounded-lg"
              >
                <AlertTriangle className="text-red-500 mb-2" size={24} />
                <div className="text-lg font-semibold">
                  {violations.tabChanges + violations.copyPaste}
                </div>
                <div className="text-gray-600">Violations</div>
              </motion.div>
            </div>

            {/* Test Cases Results */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Test Cases Details</h2>
              {testCases.map((testCase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className={`p-4 rounded-lg ${
                    testCase.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Test Case {index + 1}</div>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      testCase.passed ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}>
                      {testCase.passed ? 'Passed' : 'Failed'}
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Input:</div>
                      <pre className="mt-1 text-sm bg-white p-2 rounded">{testCase.input}</pre>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Output:</div>
                      <pre className="mt-1 text-sm bg-white p-2 rounded">{testCase.output}</pre>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => navigate('/problems')}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to Problems
              </button>
              <button
                onClick={() => navigate(`/problems/${testCases.length}/view`)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next Problem
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsPage;