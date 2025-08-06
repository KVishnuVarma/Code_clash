export const themeService = {
    // Get user's theme preferences
    async getThemePreferences(token) {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/theme`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch theme preferences');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching theme preferences:', error);
            // Return default values if API fails
            return { theme: 'zinc', darkMode: true };
        }
    },

    // Update user's theme preferences
    async updateThemePreferences(token, theme, darkMode) {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/theme`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ theme, darkMode })
            });

            if (!response.ok) {
                throw new Error('Failed to update theme preferences');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating theme preferences:', error);
            throw error;
        }
    }
};

// Profile service functions
export const profileService = {
    // Get user profile data
    async getUserProfile(token) {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Error response:', errorText);
                throw new Error(`Failed to fetch user profile: ${response.status} ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },

    // Update user profile
    async updateUserProfile(token, profileData) {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    },

    // Update enhanced profile (LeetCode-style)
    async updateEnhancedProfile(token, profileData) {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile/enhanced`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update enhanced profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating enhanced profile:', error);
            throw error;
        }
    },

    // Get user statistics
    async getUserStatistics(token) {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/statistics`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch user statistics');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user statistics:', error);
            throw error;
        }
    },

    // Generate unique username
    async generateUsername(token, baseName) {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/generate-username`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ baseName })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate username');
            }

            return await response.json();
        } catch (error) {
            console.error('Error generating username:', error);
            throw error;
        }
    },

    // Update profile picture
    async updateProfilePicture(token, profilePicture) {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile-picture`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ profilePicture })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile picture');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating profile picture:', error);
            throw error;
        }
    },

    // Change password
    async changePassword(token, currentPassword, newPassword) {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to change password');
            }

            return await response.json();
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    },

    // Set username for current user
    async setUsername(token, username) {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/set-username`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ username })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to set username');
            }
            return await response.json();
        } catch (error) {
            console.error('Error setting username:', error);
            throw error;
        }
    }
};
