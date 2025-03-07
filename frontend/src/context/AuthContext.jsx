import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [role, setRole] = useState(localStorage.getItem("role"));
    const navigate = useNavigate();

    useEffect(() => {
        if (token) fetchUser();
    }, [token]);

    const fetchUser = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/auth/user", {
                headers: { "x-auth-token": token },
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data);
                setRole(data.role);
                localStorage.setItem("role", data.role);
            } else {
                logout();
            }
        } catch (err) {
            console.error("Error fetching user:", err);
            logout();
        }
    };

    const login = async (email, password) => {
        try {
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message);
                return false;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.user.role);
            setToken(data.token);
            setUser(data.user);
            setRole(data.user.role);

            if (data.user.role === "admin") {
                navigate("/admin-dashboard");
            } else {
                navigate("/");
            }

            return true;
        } catch (err) {
            console.error("Login error:", err);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setUser(null);
        setToken(null);
        setRole(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, token, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
