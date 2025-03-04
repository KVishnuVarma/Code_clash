import React, { createContext, useContext, useState, useEffect } from "react";

// ✅ Export AuthContext properly
export const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check for logged-in user on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login function
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // Ensure token is removed on logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Correctly export useAuth hook
export const useAuth = () => {
  return useContext(AuthContext);
};
