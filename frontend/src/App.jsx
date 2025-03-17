import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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

// Importing the new Problem pages
import ProblemView from "./Components/ProblemView";
import ProblemSolver from "./Components/ProblemSolver";

export default function App() {
  const { user } = useAuth();
  const location = useLocation();

  // Hide Navbar & Footer when on the Problem Solver (full-screen) page (/problems/:id/solve)
  const isProblemSolver = /^\/problems\/.+\/solve$/.test(location.pathname);

  return (
    <>
      {(!isProblemSolver && user?.role === "admin") && <Navbar />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/userDashboard/user-dashboard" element={<UserDashboard />} />
        <Route path="/userDashboard/user-profile" element={<Profile />} />
        <Route path="/userDashboard/user-contests" element={<Contest />} />
        <Route path="/userDashboard/user-leaderboard" element={<Leader />} />
        <Route path="/userDashboard/user-problems" element={<Problem />} />
        <Route path="/problems/:id/view" element={<ProblemView />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route 
          path="/user-profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* Protected Problem Solver Route */}
        <Route 
          path="/problems/:id/solve" 
          element={
            <ProtectedRoute>
              <ProblemSolver />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin-dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin-dashboard/users" 
          element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin-dashboard/contests" 
          element={
            <AdminRoute>
              <Contests />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin-dashboard/problems" 
          element={
            <AdminRoute>
              <Problems />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin-dashboard/leaderboard" 
          element={
            <AdminRoute>
              <Leaderboard />
            </AdminRoute>
          } 
        />
      </Routes>
      
      {!isProblemSolver && <Footer />}
    </>
  );
}
