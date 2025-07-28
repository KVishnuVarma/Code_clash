import React, { createContext, useContext, useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { themeService } from '../services/authService';

const themes = {
  zinc: {
    name: "Zinc",
    primary: "zinc",
    colors: {
      bg: "bg-zinc-50",
      navBg: "bg-white/80 backdrop-blur-lg border-zinc-200/50",
      text: "text-zinc-700",
      textSecondary: "text-zinc-500",
      accent: "text-zinc-600",
      accentBg: "bg-zinc-100",
      accentHover: "hover:bg-zinc-200",
      activeBg: "bg-zinc-100",
      activeText: "text-zinc-800",
      border: "border-zinc-200",
      shadow: "shadow-zinc-200/50",
      gradient: "from-zinc-600 to-zinc-800"
    },
    darkColors: {
      bg: "bg-zinc-900",
      navBg: "bg-zinc-800/90 backdrop-blur-lg border-zinc-700/50",
      text: "text-zinc-200",
      textSecondary: "text-zinc-400",
      accent: "text-zinc-300",
      accentBg: "bg-zinc-800",
      accentHover: "hover:bg-zinc-700",
      activeBg: "bg-zinc-700",
      activeText: "text-zinc-100",
      border: "border-zinc-700",
      shadow: "shadow-zinc-900/50",
      gradient: "from-zinc-400 to-zinc-600"
    }
  },
  slate: {
    name: "Slate",
    primary: "slate",
    colors: {
      bg: "bg-slate-50",
      navBg: "bg-white/80 backdrop-blur-lg border-slate-200/50",
      text: "text-slate-700",
      textSecondary: "text-slate-500",
      accent: "text-slate-600",
      accentBg: "bg-slate-100",
      accentHover: "hover:bg-slate-200",
      activeBg: "bg-slate-100",
      activeText: "text-slate-800",
      border: "border-slate-200",
      shadow: "shadow-slate-200/50",
      gradient: "from-slate-600 to-slate-800"
    },
    darkColors: {
      bg: "bg-slate-900",
      navBg: "bg-slate-800/90 backdrop-blur-lg border-slate-700/50",
      text: "text-slate-200",
      textSecondary: "text-slate-400",
      accent: "text-slate-300",
      accentBg: "bg-slate-800",
      accentHover: "hover:bg-slate-700",
      activeBg: "bg-slate-700",
      activeText: "text-slate-100",
      border: "border-slate-700",
      shadow: "shadow-slate-900/50",
      gradient: "from-slate-400 to-slate-600"
    }
  },
  stone: {
    name: "Stone",
    primary: "stone",
    colors: {
      bg: "bg-stone-50",
      navBg: "bg-white/80 backdrop-blur-lg border-stone-200/50",
      text: "text-stone-700",
      textSecondary: "text-stone-500",
      accent: "text-stone-600",
      accentBg: "bg-stone-100",
      accentHover: "hover:bg-stone-200",
      activeBg: "bg-stone-100",
      activeText: "text-stone-800",
      border: "border-stone-200",
      shadow: "shadow-stone-200/50",
      gradient: "from-stone-600 to-stone-800"
    },
    darkColors: {
      bg: "bg-stone-900",
      navBg: "bg-stone-800/90 backdrop-blur-lg border-stone-700/50",
      text: "text-stone-200",
      textSecondary: "text-stone-400",
      accent: "text-stone-300",
      accentBg: "bg-stone-800",
      accentHover: "hover:bg-stone-700",
      activeBg: "bg-stone-700",
      activeText: "text-stone-100",
      border: "border-stone-700",
      shadow: "shadow-stone-900/50",
      gradient: "from-stone-400 to-stone-600"
    }
  },
  blue: {
    name: "Ocean",
    primary: "blue",
    colors: {
      bg: "bg-blue-50",
      navBg: "bg-white/80 backdrop-blur-lg border-blue-200/50",
      text: "text-blue-700",
      textSecondary: "text-blue-500",
      accent: "text-blue-600",
      accentBg: "bg-blue-100",
      accentHover: "hover:bg-blue-200",
      activeBg: "bg-blue-100",
      activeText: "text-blue-800",
      border: "border-blue-200",
      shadow: "shadow-blue-200/50",
      gradient: "from-blue-600 to-blue-800"
    },
    darkColors: {
      bg: "bg-blue-900",
      navBg: "bg-blue-800/90 backdrop-blur-lg border-blue-700/50",
      text: "text-blue-200",
      textSecondary: "text-blue-400",
      accent: "text-blue-300",
      accentBg: "bg-blue-800",
      accentHover: "hover:bg-blue-700",
      activeBg: "bg-blue-700",
      activeText: "text-blue-100",
      border: "border-blue-700",
      shadow: "shadow-blue-900/50",
      gradient: "from-blue-400 to-blue-600"
    }
  },
  emerald: {
    name: "Forest",
    primary: "emerald",
    colors: {
      bg: "bg-emerald-50",
      navBg: "bg-white/80 backdrop-blur-lg border-emerald-200/50",
      text: "text-emerald-700",
      textSecondary: "text-emerald-500",
      accent: "text-emerald-600",
      accentBg: "bg-emerald-100",
      accentHover: "hover:bg-emerald-200",
      activeBg: "bg-emerald-100",
      activeText: "text-emerald-800",
      border: "border-emerald-200",
      shadow: "shadow-emerald-200/50",
      gradient: "from-emerald-600 to-emerald-800"
    },
    darkColors: {
      bg: "bg-emerald-900",
      navBg: "bg-emerald-800/90 backdrop-blur-lg border-emerald-700/50",
      text: "text-emerald-200",
      textSecondary: "text-emerald-400",
      accent: "text-emerald-300",
      accentBg: "bg-emerald-800",
      accentHover: "hover:bg-emerald-700",
      activeBg: "bg-emerald-700",
      activeText: "text-emerald-100",
      border: "border-emerald-700",
      shadow: "shadow-emerald-900/50",
      gradient: "from-emerald-400 to-emerald-600"
    }
  },
  purple: {
    name: "Cosmic",
    primary: "purple",
    colors: {
      bg: "bg-purple-50",
      navBg: "bg-white/80 backdrop-blur-lg border-purple-200/50",
      text: "text-purple-700",
      textSecondary: "text-purple-500",
      accent: "text-purple-600",
      accentBg: "bg-purple-100",
      accentHover: "hover:bg-purple-200",
      activeBg: "bg-purple-100",
      activeText: "text-purple-800",
      border: "border-purple-200",
      shadow: "shadow-purple-200/50",
      gradient: "from-purple-600 to-purple-800"
    },
    darkColors: {
      bg: "bg-purple-900",
      navBg: "bg-purple-800/90 backdrop-blur-lg border-purple-700/50",
      text: "text-purple-200",
      textSecondary: "text-purple-400",
      accent: "text-purple-300",
      accentBg: "bg-purple-800",
      accentHover: "hover:bg-purple-700",
      activeBg: "bg-purple-700",
      activeText: "text-purple-100",
      border: "border-purple-700",
      shadow: "shadow-purple-900/50",
      gradient: "from-purple-400 to-purple-600"
    }
  }
};

const ThemeContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [currentTheme, setCurrentTheme] = useState('zinc');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const theme = themes[currentTheme];

  // Load user's theme preferences when user logs in
  useEffect(() => {
    const loadUserThemePreferences = async () => {
      if (user && token) {
        try {
          setIsLoading(true);
          const preferences = await themeService.getThemePreferences(token);
          setCurrentTheme(preferences.theme || 'zinc');
          setIsDarkMode(preferences.darkMode !== undefined ? preferences.darkMode : true);
        } catch (error) {
          console.error('Failed to load theme preferences:', error);
          // Use defaults if API fails
          setCurrentTheme('zinc');
          setIsDarkMode(true);
        } finally {
          setIsLoading(false);
        }
      } else {
        // No user logged in, use defaults
        setCurrentTheme('zinc');
        setIsDarkMode(true);
        setIsLoading(false);
      }
    };

    loadUserThemePreferences();
  }, [user, token]);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const getThemeColors = () => {
    return isDarkMode ? theme.darkColors : theme.colors;
  };

  const toggleDarkMode = async () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Save to backend if user is logged in
    if (user && token) {
      try {
        await themeService.updateThemePreferences(token, currentTheme, newDarkMode);
      } catch (error) {
        console.error('Failed to save dark mode preference:', error);
      }
    }
  };

  const changeTheme = async (themeKey) => {
    setCurrentTheme(themeKey);
    
    // Save to backend if user is logged in
    if (user && token) {
      try {
        await themeService.updateThemePreferences(token, themeKey, isDarkMode);
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    }
  };

  const value = {
    currentTheme,
    isDarkMode,
    theme,
    themes,
    getThemeColors,
    toggleDarkMode,
    changeTheme,
    isLoading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 