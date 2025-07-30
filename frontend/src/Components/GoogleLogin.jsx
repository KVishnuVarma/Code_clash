import React, { useState, useEffect, useRef } from 'react';
import { GoogleLogin as GoogleLoginButton } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const GoogleLogin = ({ onError }) => {
  const { googleLogin } = useAuth();
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const [isHovered, setIsHovered] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const googleButtonRef = useRef(null);

  useEffect(() => {
    // Check if Google OAuth is loaded
    const checkGoogleOAuth = () => {
      if (window.google && window.google.accounts) {
        console.log("✅ Google OAuth is loaded and available");
        setIsGoogleLoaded(true);
      } else {
        console.log("⏳ Google OAuth not yet loaded, retrying...");
        setTimeout(checkGoogleOAuth, 1000);
      }
    };
    
    checkGoogleOAuth();
  }, []);

  const handleSuccess = async (credentialResponse) => {
    try {
      console.log('✅ Google OAuth successful, processing credential...');
      console.log('📋 Credential response:', credentialResponse);
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
    console.error('❌ Error details:', {
      error: error.error,
      error_description: error.error_description,
      error_uri: error.error_uri
    });
    if (onError) {
      onError('Google login failed. Please try again.');
    }
  };

  const handleCustomClick = () => {
    console.log("🔘 Custom Google button clicked - triggering OAuth");
    // Find and click the actual Google OAuth button
    if (googleButtonRef.current) {
      const googleButton = googleButtonRef.current.querySelector('[role="button"]');
      if (googleButton) {
        googleButton.click();
      } else {
        // Fallback: try to find any clickable element
        const clickableElement = googleButtonRef.current.querySelector('div');
        if (clickableElement) {
          clickableElement.click();
        }
      }
    }
  };

  return (
    <div className="w-full">
      {/* New Animated Google Button Container */}
      <div className="relative w-full">
        {/* Custom Animated Button */}
        <div 
          className="relative w-full h-12 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleCustomClick}
        >
          {/* Google Icon */}
          <div className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
            isHovered ? 'left-4 scale-110' : 'left-1/2 -translate-x-1/2 scale-125'
          }`}>
            <div className="w-6 h-6 relative">
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

          {/* Text */}
          <div className={`flex items-center justify-center h-full transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Sign up with Google
            </span>
          </div>

          {/* Hover Effects */}
          <div className={`absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}></div>

          <div className={`absolute inset-0 border-2 border-transparent rounded-xl transition-all duration-300 ${
            isHovered ? 'border-blue-300 dark:border-blue-600' : 'border-transparent'
          }`}></div>

          {/* Pulse Animation on Hover */}
          <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
            isHovered ? 'animate-pulse bg-blue-100 dark:bg-blue-900/30' : ''
          }`}></div>
        </div>

        {/* Hidden Google OAuth Button - Positioned to be clickable */}
        <div 
          ref={googleButtonRef} 
          className="absolute inset-0 opacity-0 pointer-events-auto"
          style={{ zIndex: 10 }}
        >
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

      {/* Status indicator */}
      <div className="text-xs text-gray-500 mt-2 text-center">
        Google OAuth Status: {isGoogleLoaded ? "✅ Loaded" : "⏳ Loading..."}
      </div>

      {/* Fallback message if Google OAuth fails */}
      {!isGoogleLoaded && (
        <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          ⚠️ Google OAuth is not loaded. Please refresh the page or check your internet connection.
        </div>
      )}
    </div>
  );
};

export default GoogleLogin; 