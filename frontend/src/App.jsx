import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import ProtectedRoute from "./Components/ProtectedRoute";
import AdminRoute from "./Components/AdminRoute"; 
import Home from "./Pages/Home";
import Contests from "./Pages/Contests";
import Leaderboard from "./Pages/Leaderboard";
import Profile from "./Pages/Profile";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import AdminDashboard from "./admin/AdminDashboard";
import Users from "./admin/Users";
export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contests" element={<Contests />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin-dashboard/users" element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="/admin-dashboard/contests" element={<AdminRoute><Contests /></AdminRoute>} />
        <Route path="/admin-dashboard/problems" element={<AdminRoute><Contests /></AdminRoute>} />
        <Route path="/admin-dashboard/leaderboard" element={<AdminRoute><Leaderboard /></AdminRoute>} />
      </Routes>
      <Footer />
    </>
  );
}
