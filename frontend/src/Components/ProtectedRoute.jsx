import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is suspended - redirect to login if suspended
  if (user.isSuspended) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
