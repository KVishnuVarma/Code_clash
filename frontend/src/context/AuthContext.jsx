import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Initialize state from sessionStorage for security (session clears on browser close)
    const [user, setUser] = useState(() => JSON.parse(sessionStorage.getItem("user")) || null);
    const [token, setToken] = useState(() => sessionStorage.getItem("token") || null);
    const [role, setRole] = useState(() => sessionStorage.getItem("role") || null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const statusCheckInterval = useRef(null);

    // Auto-fetch user if token exists
    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // Helper to normalize user object
    const normalizeUser = (data) => ({
        ...data,
        id: data.id || data._id,
    });

    // Real-time status checking for suspended users
    useEffect(() => {
        if (token && user) {
            // Check status every 5 seconds
            statusCheckInterval.current = setInterval(async () => {
                try {
                    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/user`, {
                        headers: { "x-auth-token": token },
                    });

                    if (res.ok) {
                        const data = await res.json();
                        const normalized = normalizeUser(data);
                        
                        // If user is now suspended, handle based on current location
                        if (normalized.isSuspended && !user.isSuspended) {
                            if (location.pathname === '/contact') {
                                setUser(normalized);
                                sessionStorage.setItem("user", JSON.stringify(normalized));
                            } else {
                                setUser(normalized);
                                sessionStorage.setItem("user", JSON.stringify(normalized));
                                navigate('/contact', { replace: true });
                            }
                            return;
                        }
                        // Update user data if changed
                        if (JSON.stringify(normalized) !== JSON.stringify(user)) {
                            setUser(normalized);
                            sessionStorage.setItem("user", JSON.stringify(normalized));
                        }
                    } else {
                        // If token is invalid, logout
                        logout();
                    }
                } catch {
                    // Don't logout on network errors, just log
                }
            }, 5000); // Check every 5 seconds

            return () => {
                if (statusCheckInterval.current) {
                    clearInterval(statusCheckInterval.current);
                }
            };
        }
    }, [token, user, navigate, location.pathname]);

    // Fetch user details from backend
    const fetchUser = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/user`, {
                headers: { "x-auth-token": token },
            });

            if (!res.ok) throw new Error("Failed to fetch user");

            const data = await res.json();
            const normalized = normalizeUser(data);
            setUser(normalized);
            setRole(normalized.role);
            sessionStorage.setItem("user", JSON.stringify(normalized));
            sessionStorage.setItem("role", normalized.role);
        } catch (err) {
            logout();
        } finally {
            setLoading(false);
        }
    };

    // Login function
    const login = async (email, password) => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        let data = null;
        const text = await res.text();
        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                throw new Error("Invalid server response. Please try again later.");
            }
        }

        if (!res.ok) {
            // Pass backend error message to caller
            throw new Error((data && data.message) || "Login failed. Please try again.");
        }

        if (!data || !data.token || !data.user) {
            throw new Error("Invalid server response. Please try again later.");
        }

        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("role", data.user.role);
        sessionStorage.setItem("user", JSON.stringify(data.user));

        setToken(data.token);
        setUser(data.user);
        setRole(data.user.role);

        navigate(data.user.role === "admin" ? "/admin-dashboard" : "/userDashboard/user-dashboard");

        return data.user;
    };

    // Logout function
    const logout = () => {
        // Clear interval if running
        if (statusCheckInterval.current) {
            clearInterval(statusCheckInterval.current);
        }
        
        sessionStorage.clear(); // Clear session storage
        setUser(null);
        setToken(null);
        setRole(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, token, role, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom hook for accessing AuthContext
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
