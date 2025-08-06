import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import GoogleLogin from "../Components/GoogleLogin";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", username: "" });
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

  const handleGoogleError = (errorMessage) => {
    setError(errorMessage);
  };

  return (
    <div className={`flex min-h-screen items-center justify-center ${themeColors.bg}`}>
      <div className={`w-full max-w-lg p-8 ${themeColors.bg} shadow-lg rounded-lg relative border ${themeColors.border}`}>
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
            className={`w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-0 focus:outline-none transition-all duration-300 ${
              themeColors.text === 'text-white' ? 'bg-black text-white border-gray-600 focus:border-white' : 'bg-white text-black border-gray-300 focus:border-black'
            }`}
          />
          <input
            type="text"
            name="username"
            placeholder="Username (unique)"
            value={formData.username}
            onChange={handleChange}
            required
            className={`w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-0 focus:outline-none transition-all duration-300 ${
              themeColors.text === 'text-white' ? 'bg-black text-white border-gray-600 focus:border-white' : 'bg-white text-black border-gray-300 focus:border-black'
            }`}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className={`w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-0 focus:outline-none transition-all duration-300 ${
              themeColors.text === 'text-white' ? 'bg-black text-white border-gray-600 focus:border-white' : 'bg-white text-black border-gray-300 focus:border-black'
            }`}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className={`w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-0 focus:outline-none transition-all duration-300 ${
              themeColors.text === 'text-white' ? 'bg-black text-white border-gray-600 focus:border-white' : 'bg-white text-black border-gray-300 focus:border-black'
            }`}
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
              themeColors.text === 'text-white' 
                ? 'bg-gray-800 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-800 text-white' 
                : 'bg-gray-200 hover:bg-gradient-to-r hover:from-purple-600 hover:to-purple-800 text-gray-800 hover:text-white'
            }`}
          >
            Register
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className={`flex-1 border-t ${themeColors.border}`}></div>
          <span className={`px-3 ${themeColors.textSecondary}`}>or</span>
          <div className={`flex-1 border-t ${themeColors.border}`}></div>
        </div>

        {/* Google Login */}
        <div className="mb-4">
          <GoogleLogin onError={handleGoogleError} />
        </div>

        <p className={`text-center ${themeColors.textSecondary} mt-4`}>
          Already have an account? <a href="/login" className={`${themeColors.text} hover:underline`}>Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
