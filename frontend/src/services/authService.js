const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const themeService = {
    // Get user's theme preferences
    async getThemePreferences(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/theme`, {
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
            const response = await fetch(`${API_BASE_URL}/api/auth/theme`, {
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
