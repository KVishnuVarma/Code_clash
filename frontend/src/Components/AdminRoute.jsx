import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { role } = useAuth();

  if (!role) {
    return <Navigate to="/login" />;
  }

  return role === "admin" ? children : <Navigate to="/" />;
};

export default AdminRoute;
