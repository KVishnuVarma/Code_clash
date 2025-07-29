import React from 'react';
import { GoogleLogin as GoogleLoginButton } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const GoogleLogin = ({ onError }) => {
  const { googleLogin } = useAuth();
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

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
    <div className="w-full flex justify-center">
      <GoogleLoginButton
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false} // Disable One Tap to reduce errors
        theme={themeColors.text === 'text-white' ? 'filled_black' : 'filled_blue'}
        size="large"
        text="continue_with"
        shape="rectangular"
        width={400} // Use numeric width instead of percentage
        type="standard" // Use standard button type
      />
    </div>
  );
};

export default GoogleLogin; 