import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import ProtectedRoute from "./Components/ProtectedRoute";
import Home from "./Pages/Home";
import Contests from "./Pages/Contests";
import Leaderboard from "./Pages/Leaderboard";
import Profile from "./Pages/Profile";
import Login from "./Pages/Login";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contests" element={<Contests />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Route */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
      <Footer />
    </>
  );
}
