import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Show loading while auth is being determined
  if (loading) {
    return <div>Loading...</div>;
  }

  // If no user, redirect to login
  if (!user) {
    navigate("/login", { replace: true });
    return <div>Redirecting to login...</div>;
  }

  // If user is not suspended, redirect to dashboard
  if (!user.isSuspended) {
    navigate("/userDashboard/user-dashboard", { replace: true });
    return <div>Redirecting to dashboard...</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitted(false);
    setIsSubmitting(true);
    
    if (!user?.id) {
      setError("User information not available. Please try logging in again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/contact-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('token')
        },
        body: JSON.stringify({
          userId: user.id,
          message: message
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setMessage("");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to send message. Please try again later.");
      }
    } catch {
      setError("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Contact Admin</h2>
        <p className="text-red-600 text-center mb-4 font-semibold">
          Your account is suspended. Please contact the administrator below for help.
        </p>
        {submitted ? (
          <div className="text-green-600 text-center mb-4">Message sent! The admin will review your case soon.</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <textarea
              className="w-full p-2 border rounded-lg mb-4"
              rows={5}
              placeholder="Describe your issue or request..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white py-2 rounded-lg transition duration-200"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
            {error && <div className="text-red-500 text-center mt-2">{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
};

export default Contact; 