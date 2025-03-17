import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import ProtectedRoute from "./Components/ProtectedRoute";
import AdminRoute from "./Components/AdminRoute";
import Home from "./Pages/Home";
import Contests from "./admin/Contests";
import Leaderboard from "./admin/Leaderboard";
import Profile from "./Pages/Profile";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import AdminDashboard from "./admin/AdminDashboard";
import Problems from "./admin/Problems";
import Users from "./admin/Users";
import Contest from "./Pages/Contests";
import Leader from "./Pages/LeaderBoard";
import Problem from "./Pages/Problems";
import UserDashboard from "./Pages/UserDashboard";
import useAuth from "./hooks/useAuth"; 

export default function App() {
  const { user } = useAuth(); // Get user info
  
  return (
    <>
      {user?.role === "admin" && <Navbar />} {/* Show Navbar only for admin */}
      <Routes>
        {/* Public Routes */}
        <Route path="/userDashboard" element={<UserDashboard />} />
        <Route path="/contest" element={<Contest />} />
        <Route path="/leader" element={<Leader />} />
        <Route path="/problem" element={<Problem />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes (Only Logged-in Users) */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Admin Routes (Only Admins) */}
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin-dashboard/users" element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="/admin-dashboard/contests" element={<AdminRoute><Contests /></AdminRoute>} />
        <Route path="/admin-dashboard/problems" element={<AdminRoute><Problems /></AdminRoute>} />
        <Route path="/admin-dashboard/leaderboard" element={<AdminRoute><Leaderboard /></AdminRoute>} />
      </Routes>
      <Footer />
    </>
  );
}
