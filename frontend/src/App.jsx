import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import ProtectedRoute from "./Components/ProtectedRoute";
import AdminRoute from "./Components/AdminRoute"; 

const Home = lazy(() => import("./Pages/Home"));
const Contest = lazy(() => import("./Pages/Contests"));
const Leader = lazy(() => import("./Pages/LeaderBoard"));
const Problem = lazy(() => import("./Pages/Problems"));
const Profile = lazy(() => import("./Pages/Profile"));
const Login = lazy(() => import("./Pages/Login"));
const Register = lazy(() => import("./Pages/Register"));
const UserDashboard = lazy(() => import("./Pages/UserDashboard"));

const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
const Contests = lazy(() => import("./admin/Contests"));
const Leaderboard = lazy(() => import("./admin/Leaderboard"));
const Problems = lazy(() => import("./admin/Problems"));
const Users = lazy(() => import("./admin/Users"));

export default function App() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
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
      </Suspense>
      <Footer />
    </>
  );
}
