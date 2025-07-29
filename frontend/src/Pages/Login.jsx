import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import GoogleLogin from "../Components/GoogleLogin";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth(); // Ensure AuthContext is correctly implemented
  const navigate = useNavigate();
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      if (user && user.role) {
        navigate(user.role === "admin" ? "/admin-dashboard" : "/userDashboard/user-dashboard");
      } else {
        throw new Error("Invalid credentials. Please check your email and password.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (errorMessage) => {
    setError(errorMessage);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${themeColors.bg}`}>
      <div className={`${themeColors.bg} p-8 rounded-lg shadow-lg w-96 border ${themeColors.border}`}>
        <h2 className={`text-2xl font-bold text-center ${themeColors.text}`}>Login</h2>

        {error && (
          <p className="text-red-500 text-center mt-2">
            {error.includes("suspended") ? (
              <>Your account is suspended. Please contact the administrator via the Contact page.</>
            ) : (
              error
            )}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4">
          {/* Email Input */}
          <div className="mb-4">
            <label className={`block ${themeColors.text} font-medium`}>Email</label>
            <input
              type="email"
              className={`w-full p-2 mt-1 border ${themeColors.border} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none ${themeColors.bg} ${themeColors.text}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className={`block ${themeColors.text} font-medium`}>Password</label>
            <input
              type="password"
              className={`w-full p-2 mt-1 border ${themeColors.border} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none ${themeColors.bg} ${themeColors.text}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg transition duration-200 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Login"
            )}
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

        {/* Register Link */}
        <p className={`text-center ${themeColors.textSecondary} mt-4`}>
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-indigo-500 hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
