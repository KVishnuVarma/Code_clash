import React, { useState } from "react";
import googleIcon from "../assets/google-icon.png";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        throw new Error("Invalid response from server");
      }

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      console.log("✅ Registered successfully:", data);
      setLoading(false);
      navigate("/login");
    } catch (error) {
      console.error("❌ Error registering:", error.message);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setLoading(true);
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-gray-700 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-gray-700 rounded-full animate-bounce delay-200"></div>
              <div className="w-3 h-3 bg-gray-700 rounded-full animate-bounce delay-400"></div>
            </div>
          </div>
        )}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Register</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-gray-600 text-white font-bold rounded-md hover:bg-gray-700 transition"
          >
            Register
          </button>
        </form>
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200 transition"
          >
            <img src={googleIcon} alt="Google" className="w-5 h-5" />
            <span></span>
          </button>
        </div>
        <p className="text-center text-gray-400 mt-4">
          Already have an account? <a href="/login" className="text-gray-600 hover:text-black">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
