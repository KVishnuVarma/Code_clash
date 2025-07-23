import React, { useState } from "react";
import { HelpCircle, Bug, FileText, MessageCircle, X, Sparkles, Send, Loader2 } from "lucide-react";
import { getErrorFix, getReview, getGuideLines } from "../services/aiHelpService";

const Aihelp = ({ open, onClose, code, language, problemId, userId }) => {
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [GuideLines, setGuideLines] = useState([]);
  const [userMessage, setUserMessage] = useState("");

  // Error Fix Tab - Your original functionality
  const handleErrorFix = () => {
    setLoading(true);
    setResult(null);
    setError(null);
    getErrorFix({ userId, problemId, code, language })
      .then(data => setResult(data))
      .catch(err => {
        console.error("AI Help error (error-fix):", err);
        setError("Failed to get error fix.");
      })
      .finally(() => setLoading(false));
  };

  // Review Tab - Your original functionality
  const handleReview = () => {
    setLoading(true);
    setResult(null);
    setError(null);
    getReview({ userId, problemId, code, language })
      .then(data => setResult(data))
      .catch(err => {
        console.error("AI Help error (review):", err);
        setError("Failed to get review.");
      })
      .finally(() => setLoading(false));
  };

  // GuideLines Tab - Your original functionality
  const handleGuideLines = () => {
    setLoading(true);
    setError(null);
    getGuideLines({ userId })
      .then(data => setGuideLines([{ from: "ai", text: data.message }]))
      .catch(err => {
        console.error("AI Help error (GuideLines):", err);
        setError("Failed to start GuideLines.");
      })
      .finally(() => setLoading(false));
  };

  // Your original message handling
  const handleSendMessage = () => {
    if (!userMessage.trim()) return;
    setGuideLines((prev) => [
      ...prev,
      { from: "user", text: userMessage },
      { from: "ai", text: "Thank you for your message! Our team will get back to you soon." },
    ]);
    setUserMessage("");
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setResult(null);
    setError(null);
    if (tab === "findError") handleErrorFix();
    if (tab === "reviewCode") handleReview();
    if (tab === "GuideLines") handleGuideLines();
  };

  const renderSection = () => {
    if (activeTab === "findError") {
      if (loading) return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600 animate-pulse">Checking for errors...</p>
        </div>
      );
      if (error) return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mt-6">
          <div className="text-red-700 flex items-center gap-2">
            <Bug className="w-5 h-5" />
            {error}
          </div>
        </div>
      );
      if (result) {
        return (
          <div className="mt-6 space-y-6">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
              <h3 className="font-bold text-xl mb-4 text-red-700 flex items-center gap-3">
                <Bug className="w-6 h-6"/>
                Error Analysis
              </h3>
              
              {result.userFriendlyError && (
                <div className="mb-4 p-4 bg-red-100 rounded-lg border border-red-200">
                  <p className="text-red-800 font-semibold">{result.userFriendlyError}</p>
                </div>
              )}
              
              {result.mistake && (
                <div className="space-y-3">
                  {result.mistake.input && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <span className="font-semibold text-gray-700 min-w-[80px]">Input:</span>
                      <code className="bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono flex-1">{result.mistake.input}</code>
                    </div>
                  )}
                  {result.mistake.expected && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <span className="font-semibold text-gray-700 min-w-[80px]">Expected:</span>
                      <code className="bg-green-100 px-3 py-2 rounded-lg text-sm font-mono flex-1">{result.mistake.expected}</code>
                    </div>
                  )}
                  {result.mistake.actual && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <span className="font-semibold text-gray-700 min-w-[80px]">Actual:</span>
                      <code className="bg-red-100 px-3 py-2 rounded-lg text-sm font-mono flex-1">{result.mistake.actual}</code>
                    </div>
                  )}
                  {result.mistake.error && (
                    <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm font-medium">Error: {result.mistake.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="mb-4 p-4 bg-blue-100 rounded-lg border border-blue-200">
                <p className="text-blue-700 font-semibold">Prompt: {result.prompt}</p>
              </div>
              
              {result.correctCode && (
                <div>
                  <p className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4"/>
                    Sample Correct Code:
                  </p>
                  <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto font-mono shadow-inner whitespace-pre-wrap">
{result.correctCode}
                  </pre>
                </div>
              )}
            </div>
          </div>
        );
      }
      return (
        <div className="text-center py-12">
          <Bug className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Click the button to check for errors in your code.</p>
        </div>
      );
    }

    if (activeTab === "reviewCode") {
      if (loading) return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
          <p className="text-gray-600 animate-pulse">Reviewing your code...</p>
        </div>
      );
      if (error) return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mt-6">
          <div className="text-red-700 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {error}
          </div>
        </div>
      );
      if (result) {
        return (
          <div className="mt-6 space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
              <h3 className="font-bold text-xl mb-4 text-purple-700 flex items-center gap-3">
                <FileText className="w-6 h-6"/>
                Code Review
              </h3>
              
              <div className="bg-white rounded-lg p-4 border mb-4">
                <div className="text-sm text-gray-600 mb-1">Test Cases</div>
                <div className="text-2xl font-bold text-purple-600">
                  {result.review ? `${result.review.passed}/${result.review.total} passed` : "-"}
                </div>
              </div>

              {result.review && result.review.lastFailed && (
                <div className="bg-orange-100 border border-orange-200 rounded-lg p-4 mb-4">
                  <p className="text-orange-800 font-medium text-sm">Last Failed: {result.review.lastFailed.error || "Wrong output"}</p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl p-6">
              <div className="mb-4 p-4 bg-blue-100 rounded-lg border border-blue-200">
                <p className="text-blue-700 font-semibold">Prompt: {result.prompt}</p>
              </div>
              
              {result.correctCode && (
                <div>
                  <p className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4"/>
                    Sample Correct Code:
                  </p>
                  <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto font-mono shadow-inner whitespace-pre-wrap">
{result.correctCode}
                  </pre>
                </div>
              )}
            </div>
          </div>
        );
      }
      return (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Click the button to review your code against a sample test case.</p>
        </div>
      );
    }

    if (activeTab === "GuideLines") {
      return (
        <div className="mt-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
            <h3 className="font-bold text-xl mb-4 text-green-700 flex items-center gap-3">
              <MessageCircle className="w-6 h-6"/>
              GuideLines
            </h3>
            
            <div className="bg-white rounded-lg border shadow-inner min-h-[200px] max-h-80 overflow-y-auto p-4 mb-4">
              {GuideLines.length === 0 && !loading && (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No messages yet.</p>
                </div>
              )}
              {loading && (
                <div className="flex items-center gap-3 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading GuideLines...</span>
                </div>
              )}
              {GuideLines.map((msg, idx) => (
                <div key={idx} className={`mb-4 flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    msg.from === "ai" 
                      ? "bg-blue-100 text-blue-900 border border-blue-200" 
                      : "bg-green-100 text-green-900 border border-green-200"
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${msg.from === "ai" ? "bg-blue-500" : "bg-green-500"}`}></div>
                      <span className="font-semibold text-xs uppercase tracking-wide">
                        {msg.from === "ai" ? "AI" : "You"}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Type your message..."
                value={userMessage}
                onChange={e => setUserMessage(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSendMessage(); }}
              />
              <button
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg"
                onClick={handleSendMessage}
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-16">
        <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-12 h-12 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Choose Your AI Assistant</h3>
        <p className="text-gray-500 max-w-sm mx-auto">Please select a mode above to get AI help.</p>
      </div>
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative z-10">
            <button
              className="absolute top-0 right-0 text-white hover:text-red-300 transition-colors p-2"
              onClick={onClose}
              aria-label="Close AI Help"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="bg-white bg-opacity-20 rounded-full p-2">
                <HelpCircle className="w-8 h-8" />
              </div>
              AI Help
            </h2>
            <p className="text-blue-100 mt-2">Get intelligent help with your coding challenges</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex justify-center gap-2 flex-wrap">
            <button
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 ${
                activeTab === "findError" 
                  ? "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg" 
                  : "bg-white text-gray-700 border border-gray-200 hover:border-red-300 hover:text-red-600"
              }`}
              onClick={() => handleTabClick("findError")}
            >
              <Bug className="w-5 h-5"/>
              Find Error
            </button>
            <button
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 ${
                activeTab === "reviewCode" 
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg" 
                  : "bg-white text-gray-700 border border-gray-200 hover:border-purple-300 hover:text-purple-600"
              }`}
              onClick={() => handleTabClick("reviewCode")}
            >
              <FileText className="w-5 h-5"/>
              Review Code
            </button>
            <button
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 ${
                activeTab === "GuideLines" 
                  ? "bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg" 
                  : "bg-white text-gray-700 border border-gray-200 hover:border-green-300 hover:text-green-600"
              }`}
              onClick={() => handleTabClick("GuideLines")}
            >
              <MessageCircle className="w-5 h-5"/>
              GuideLines
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default Aihelp;