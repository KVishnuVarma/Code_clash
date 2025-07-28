import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await res.json();
      // eslint-disable-next-line no-unused-vars
      } catch (jsonError) {
        throw new Error("Invalid response from server");
      }

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      console.log("✅ Registered successfully:", data);
      setLoading(false);
      navigate("/login");
    } catch (error) {
      console.error("❌ Error registering:", error.message);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setLoading(true);
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
  };

  return (
    <div className={`flex min-h-screen items-center justify-center ${themeColors.bg}`}>
      <div className={`w-full max-w-md p-8 ${themeColors.bg} shadow-lg rounded-lg relative border ${themeColors.border}`}>
        {loading && (
          <div className={`absolute inset-0 flex items-center justify-center ${themeColors.bg} bg-opacity-80`}>
            <div className="flex space-x-2">
              <div className={`w-3 h-3 ${themeColors.text} rounded-full animate-bounce`}></div>
              <div className={`w-3 h-3 ${themeColors.text} rounded-full animate-bounce delay-200`}></div>
              <div className={`w-3 h-3 ${themeColors.text} rounded-full animate-bounce delay-400`}></div>
            </div>
          </div>
        )}
        <h2 className={`text-2xl font-bold text-center ${themeColors.text} mb-6`}>Register</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className={`w-full p-3 border ${themeColors.border} rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${themeColors.bg} ${themeColors.text}`}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className={`w-full p-3 border ${themeColors.border} rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${themeColors.bg} ${themeColors.text}`}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className={`w-full p-3 border ${themeColors.border} rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${themeColors.bg} ${themeColors.text}`}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-gray-600 text-white font-bold rounded-md hover:bg-gray-700 transition"
          >
            Register
          </button>
        </form>
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200 transition"
          >
          </button>
        </div>
        <p className={`text-center ${themeColors.textSecondary} mt-4`}>
          Already have an account? <a href="/login" className={`${themeColors.text} hover:underline`}>Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
