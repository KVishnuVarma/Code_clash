import React, { useState, useEffect } from 'react';
import { GoogleLogin as GoogleLoginButton } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const GoogleLogin = ({ onError }) => {
  const { googleLogin } = useAuth();
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const [isHovered, setIsHovered] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

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

  const handleClick = () => {
    console.log("🔘 Google button clicked");
    console.log("📊 Google OAuth loaded:", isGoogleLoaded);
    console.log("🔑 Client ID available:", !!import.meta.env.VITE_GOOGLE_CLIENT_ID);
  };

  return (
    <div className="w-full">
      {/* Debug Info */}
      <div className="text-xs text-gray-500 mb-2">
        Google OAuth Status: {isGoogleLoaded ? "✅ Loaded" : "⏳ Loading..."}
      </div>
      
      {/* Working Google OAuth Button */}
      <div className="relative w-full" onClick={handleClick}>
        <GoogleLoginButton
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={false}
          theme="filled_blue"
          size="large"
          text="continue_with"
          shape="rectangular"
          width="100%"
          type="standard"
          className="w-full"
        />
      </div>
      
      {/* Fallback button if Google OAuth fails */}
      {!isGoogleLoaded && (
        <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          ⚠️ Google OAuth is not loaded. Please refresh the page or check your internet connection.
        </div>
      )}
    </div>
  );
};

export default GoogleLogin; 