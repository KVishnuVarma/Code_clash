import React, { useState } from 'react';
import { GoogleLogin as GoogleLoginButton } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const GoogleLogin = ({ onError }) => {
  const { googleLogin } = useAuth();
  const { getThemeColors } = useTheme();
  // eslint-disable-next-line no-unused-vars
  const themeColors = getThemeColors();
  const [isHovered, setIsHovered] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    try {
      console.log('✅ Google OAuth successful, processing credential...');
      await googleLogin(credentialResponse.credential);
    } catch (error) {
      console.error('❌ Google login error:', error);
      if (onError) {
        onError(error.message || 'Google login failed. Please try again.');
      }
    }
  };

  const handleError = (error) => {
    console.error('❌ Google OAuth error:', error);
    if (onError) {
      onError('Google login failed. Please try again.');
    }
  };

  return (
    <div className="w-full">
      {/* Custom Animated Google Button */}
      <div 
        className="relative w-full h-10 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Google Icon Container - Centered initially */}
        <div className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
          isHovered ? 'left-4 scale-110' : 'left-1/2 -translate-x-1/2 scale-125'
        }`}>
          <div className="w-6 h-6 relative">
            {/* Google "G" Icon */}
            <svg 
              className={`w-6 h-6 transition-all duration-300 ${isHovered ? 'rotate-12' : ''}`}
              viewBox="0 0 24 24"
            >
              <path 
                fill="#4285F4" 
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path 
                fill="#34A853" 
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path 
                fill="#FBBC05" 
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path 
                fill="#EA4335" 
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </div>
        </div>

        {/* Text Container - Only visible on hover */}
        <div className={`flex items-center justify-center h-full transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Sign up with Google
          </span>
        </div>

        {/* Hover Background Effect */}
        <div className={`absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}></div>

        {/* Border Animation */}
        <div className={`absolute inset-0 border-2 border-transparent rounded-xl transition-all duration-300 ${
          isHovered ? 'border-blue-300 dark:border-blue-600' : 'border-transparent'
        }`}></div>

        {/* Hidden Google OAuth Button */}
        <div className="absolute inset-0 opacity-0">
          <GoogleLoginButton
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap={false}
            theme="filled_blue"
            size="large"
            text="continue_with"
            shape="rectangular"
            width={400}
            type="standard"
          />
        </div>
      </div>

      {/* Alternative: Standard Google Button (fallback) */}
      <div className="mt-4 opacity-0 pointer-events-none">
        <GoogleLoginButton
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={false}
          theme="filled_blue"
          size="large"
          text="continue_with"
          shape="rectangular"
          width={400}
          type="standard"
        />
      </div>
    </div>
  );
};

export default GoogleLogin; 