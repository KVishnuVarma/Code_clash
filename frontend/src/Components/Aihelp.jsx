import React, { useState } from "react";
import { HelpCircle, Bug, FileText, MessageCircle } from "lucide-react";
import { getErrorFix, getReview, getDiscussion } from "../services/aiHelpService";

const Aihelp = ({ open, onClose, code, language, problemId, userId }) => {
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [discussion, setDiscussion] = useState([]);
  const [userMessage, setUserMessage] = useState("");

  // Error Fix Tab
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

  // Review Tab
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

  // Discussion Tab
  const handleDiscussion = () => {
    setLoading(true);
    setError(null);
    getDiscussion({ userId })
      .then(data => setDiscussion([{ from: "ai", text: data.message }]))
      .catch(err => {
        console.error("AI Help error (discussion):", err);
        setError("Failed to start discussion.");
      })
      .finally(() => setLoading(false));
  };

  // Simulate user sending a message in discussion
  const handleSendMessage = () => {
    if (!userMessage.trim()) return;
    setDiscussion((prev) => [
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
    if (tab === "discussion") handleDiscussion();
  };

  const renderSection = () => {
    if (activeTab === "findError") {
      if (loading) return <div className="mt-6 text-blue-600">Checking for errors...</div>;
      if (error) return <div className="mt-6 text-red-600">{error}</div>;
      if (result) {
        return (
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2 text-red-700 flex items-center gap-2"><Bug size={20}/> Error Analysis</h3>
            {result.mistake ? (
              <>
                {result.mistake.input && <div className="mb-1 text-sm"><span className="font-semibold">Input:</span> <span className="font-mono">{result.mistake.input}</span></div>}
                {result.mistake.expected && <div className="mb-1 text-sm"><span className="font-semibold">Expected:</span> <span className="font-mono">{result.mistake.expected}</span></div>}
                {result.mistake.actual && <div className="mb-1 text-sm"><span className="font-semibold">Actual:</span> <span className="font-mono">{result.mistake.actual}</span></div>}
                {result.mistake.error && <div className="mb-2 text-red-700 text-xs">Error: {result.mistake.error}</div>}
              </>
            ) : <div className="mb-2 text-green-700">No specific mistake found.</div>}
            <div className="mb-2 text-blue-700 font-semibold">Prompt: {result.prompt}</div>
            {result.correctCode && (
              <div className="mt-2">
                <div className="font-semibold text-green-700 mb-1">Sample Correct Code:</div>
                <pre className="bg-green-50 border border-green-200 rounded p-3 text-xs text-green-900 whitespace-pre-wrap">{result.correctCode}</pre>
              </div>
            )}
          </div>
        );
      }
      return <div className="mt-6 text-gray-500 text-sm">Click the button to check for errors in your code.</div>;
    }
    if (activeTab === "reviewCode") {
      if (loading) return <div className="mt-6 text-blue-600">Reviewing your code...</div>;
      if (error) return <div className="mt-6 text-red-600">{error}</div>;
      if (result) {
        return (
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><FileText size={20}/> Code Review</h3>
            <div className="mb-2 text-sm">Test Cases: {result.review ? `${result.review.passed}/${result.review.total} passed` : "-"}</div>
            {result.review && result.review.lastFailed && (
              <div className="mb-2 text-red-700 text-xs">Last Failed: {result.review.lastFailed.error || "Wrong output"}</div>
            )}
            <div className="mb-2 text-blue-700 font-semibold">Prompt: {result.prompt}</div>
            {result.correctCode && (
              <div className="mt-2">
                <div className="font-semibold text-green-700 mb-1">Sample Correct Code:</div>
                <pre className="bg-green-50 border border-green-200 rounded p-3 text-xs text-green-900 whitespace-pre-wrap">{result.correctCode}</pre>
              </div>
            )}
          </div>
        );
      }
      return <div className="mt-6 text-gray-500 text-sm">Click the button to review your code against a sample test case.</div>;
    }
    if (activeTab === "discussion") {
      return (
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><MessageCircle size={20}/> Discussion</h3>
          <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-2 min-h-[60px] max-h-40 overflow-y-auto">
            {discussion.length === 0 && <div className="text-gray-500 text-sm">No messages yet.</div>}
            {discussion.map((msg, idx) => (
              <div key={idx} className={`mb-1 text-sm ${msg.from === "ai" ? "text-blue-700" : "text-gray-800"}`}>
                <span className="font-semibold">{msg.from === "ai" ? "AI" : "You"}:</span> {msg.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              className="flex-1 border rounded px-2 py-1 text-sm"
              placeholder="Type your message..."
              value={userMessage}
              onChange={e => setUserMessage(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSendMessage(); }}
            />
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
              onClick={handleSendMessage}
            >Send</button>
          </div>
        </div>
      );
    }
    return (
      <div className="mt-6 text-center text-gray-500 text-sm">
        Please select a mode above to get AI help.
      </div>
    );
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl font-bold"
          onClick={onClose}
          aria-label="Close AI Help"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700">
          <HelpCircle size={28} /> AI Help
        </h2>
        <div className="flex justify-center gap-4 mb-2">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded font-semibold text-sm border transition-colors ${activeTab === "findError" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"}`}
            onClick={() => handleTabClick("findError")}
          >
            <Bug size={18}/> Find Error
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded font-semibold text-sm border transition-colors ${activeTab === "reviewCode" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"}`}
            onClick={() => handleTabClick("reviewCode")}
          >
            <FileText size={18}/> Review Code
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded font-semibold text-sm border transition-colors ${activeTab === "discussion" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"}`}
            onClick={() => handleTabClick("discussion")}
          >
            <MessageCircle size={18}/> Discussion
          </button>
        </div>
        {renderSection()}
      </div>
    </div>
  );
};

export default Aihelp;
