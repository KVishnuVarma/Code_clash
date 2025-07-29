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
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { login } = useAuth();
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

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, text: "", color: "" };
    if (password.length < 6) return { strength: 25, text: "Weak", color: "bg-red-500" };
    if (password.length < 8) return { strength: 50, text: "Fair", color: "bg-yellow-500" };
    if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) 
      return { strength: 100, text: "Strong", color: "bg-green-500" };
    return { strength: 75, text: "Good", color: "bg-blue-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-8 ${themeColors.bg} relative overflow-hidden`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Login Card */}
      <div className={`relative z-10 ${themeColors.bg} backdrop-blur-xl bg-opacity-80 p-8 rounded-2xl shadow-2xl w-full max-w-lg border ${themeColors.border} transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl`}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4 shadow-lg transform transition-transform duration-300 hover:rotate-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className={`text-3xl font-bold ${themeColors.text} mb-2`}>Code Clash </h2>
          <p className={`${themeColors.textSecondary} text-sm`}>Sign in to your account to continue</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-shake">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 dark:text-red-400 text-sm">
                {error.includes("suspended") ? (
                  <>Your account is suspended. Please contact the administrator via the Contact page.</>
                ) : (
                  error
                )}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="relative">
            <label className={`block ${themeColors.text} font-medium mb-2 text-sm`}>
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                className={`w-full px-4 py-3 pl-12 border-2 ${
                  emailFocused 
                    ? themeColors.text === 'text-white' 
                      ? 'border-white shadow-lg shadow-white/20' 
                      : 'border-black shadow-lg shadow-black/20'
                    : themeColors.border
                } rounded-xl focus:ring-0 focus:outline-none ${
                  themeColors.text === 'text-white' ? 'bg-black text-white' : 'bg-white text-black'
                } transition-all duration-300 transform ${emailFocused ? 'scale-[1.02]' : 'scale-100'}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="Enter your email"
                required
              />
              <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                emailFocused 
                  ? themeColors.text === 'text-white' ? 'text-white' : 'text-black'
                  : themeColors.textSecondary
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>
          </div>

          {/* Password Input */}
          <div className="relative">
            <label className={`block ${themeColors.text} font-medium mb-2 text-sm`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`w-full px-4 py-3 pl-12 pr-12 border-2 ${
                  passwordFocused 
                    ? themeColors.text === 'text-white' 
                      ? 'border-white shadow-lg shadow-white/20' 
                      : 'border-black shadow-lg shadow-black/20'
                    : themeColors.border
                } rounded-xl focus:ring-0 focus:outline-none ${
                  themeColors.text === 'text-white' ? 'bg-black text-white' : 'bg-white text-black'
                } transition-all duration-300 transform ${passwordFocused ? 'scale-[1.02]' : 'scale-100'}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="Enter your password"
                required
              />
              <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                passwordFocused 
                  ? themeColors.text === 'text-white' ? 'text-white' : 'text-black'
                  : themeColors.textSecondary
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                  themeColors.text === 'text-white' 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2 animate-fadeIn">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs ${themeColors.textSecondary}`}>Password strength</span>
                  <span className={`text-xs font-medium ${passwordStrength.strength === 100 ? 'text-green-500' : passwordStrength.strength >= 75 ? 'text-blue-500' : passwordStrength.strength >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {passwordStrength.text}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.strength}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => {/* Will implement later */}}
              className="text-sm text-indigo-500 hover:text-indigo-600 transition-colors duration-200 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className={`w-full py-3 rounded-xl transition-all duration-300 flex items-center justify-center transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium ${
              themeColors.text === 'text-white' 
                ? 'bg-gray-800 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-800 text-white' 
                : 'bg-gray-200 hover:bg-gradient-to-r hover:from-purple-600 hover:to-purple-800 text-gray-800 hover:text-white'
            }`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <span>Sign In</span>
                <svg className="w-5 h-5 ml-2 transform transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className={`flex-1 border-t ${themeColors.border}`}></div>
          <span className={`px-4 ${themeColors.textSecondary} text-sm font-medium`}>or continue with</span>
          <div className={`flex-1 border-t ${themeColors.border}`}></div>
        </div>

        {/* Google Login */}
        <div className="mb-6">
          <GoogleLogin onError={handleGoogleError} />
        </div>

        {/* Register Link */}
        <div className="text-center">
          <p className={`${themeColors.textSecondary} text-sm`}>
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors duration-200 hover:underline"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default Login;