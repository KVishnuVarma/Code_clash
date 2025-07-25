import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    // Initialize state from sessionStorage for security (session clears on browser close)
    const [user, setUser] = useState(() => JSON.parse(sessionStorage.getItem("user")) || null);
    const [token, setToken] = useState(() => sessionStorage.getItem("token") || null);
    const [role, setRole] = useState(() => sessionStorage.getItem("role") || null);
    const [loading, setLoading] = useState(true);

    // Auto-fetch user if token exists
    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // Fetch user details from backend
    const fetchUser = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/user`, {
                headers: { "x-auth-token": token },
            });

            if (!res.ok) throw new Error("Failed to fetch user");

            const data = await res.json();
            setUser(data);
            setRole(data.role);
            sessionStorage.setItem("user", JSON.stringify(data));
            sessionStorage.setItem("role", data.role);
        } catch (err) {
            console.error("Error fetching user:", err);
            logout();
        } finally {
            setLoading(false);
        }
    };

    // Login function
    const login = async (email, password) => {
        try {
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

            // Debug log for troubleshooting
            // console.log("[LOGIN DEBUG] status:", res.status, "text:", text, "data:", data);

            if (!res.ok) {
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
        } catch (err) {
            console.error("Login error:", err);
            throw err;
        }
    };

    // Logout function
    const logout = () => {
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
