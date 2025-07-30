import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
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
import Contact from "./Pages/Contact";
import AdminDashboard from "./admin/AdminDashboard";
import Problems from "./admin/Problems";
import Users from "./admin/Users";
import ViolationMonitor from "./admin/ViolationMonitor";
import Contest from "./Pages/Contests";
import Leader from "./Pages/LeaderBoard";
import Problem from "./Pages/Problems";
import UserDashboard from "./Pages/UserDashboard";
import useAuth from "./hooks/useAuth";
import { ThemeProvider } from "./context/ThemeContext";

// Importing the new Problem pages
import ProblemView from "./Components/ProblemView";
import ProblemSolver from "./Components/ProblemSolver";
import ResultsPage from "./Components/ResultsPage";
import StreakTest from "./Pages/StreakTest";

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Hide Navbar & Footer when on the Problem Solver (full-screen) page (/problems/:id/solve)
  const isProblemSolver = /^\/problems\/.+\/solve$/.test(location.pathname);

  // Show loading while auth is being determined
  if (loading) {
    return <div>Loading...</div>;
  }

  // Global check for suspended users - redirect to login if suspended
  if (user?.isSuspended) {
    // Suspended users can only access contact and login pages
    if (location.pathname !== "/contact" && location.pathname !== "/login") {
      return <Navigate to="/contact" replace />;
    }
  }

  return (
    <ThemeProvider>
      {(!isProblemSolver && user?.role === "admin") && <Navbar />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />

        {/* Protected User Routes */}
        <Route 
          path="/userDashboard/user-dashboard" 
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/userDashboard/user-profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/userDashboard/user-contests" 
          element={
            <ProtectedRoute>
              <Contest />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/userDashboard/user-leaderboard" 
          element={
            <ProtectedRoute>
              <Leader />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/userDashboard/user-problems" 
          element={
            <ProtectedRoute>
              <Problem />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/problems/:id/view" 
          element={
            <ProtectedRoute>
              <ProblemView />
            </ProtectedRoute>
          } 
        />

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
        <Route path="/problems/:id/solve" element={<ProblemSolver />} />
        <Route path="/problems/:id/results" element={<ResultsPage />} />

        {/* Streak Test Route */}
        <Route 
          path="/streak-test" 
          element={
            <ProtectedRoute>
              <StreakTest />
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
          path="/admin-dashboard/violation-monitor" 
          element={
            <AdminRoute>
              <ViolationMonitor />
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
    </ThemeProvider>
  );
}
