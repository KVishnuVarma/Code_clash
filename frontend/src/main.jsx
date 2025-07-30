import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Validate Google Client ID
if (!GOOGLE_CLIENT_ID) {
  console.error("❌ VITE_GOOGLE_CLIENT_ID is not set in environment variables!");
  console.error("Please set VITE_GOOGLE_CLIENT_ID in your deployment environment variables.");
} else {
  console.log("✅ Google OAuth Client ID configured");
}

// Check if we're in production and backend URL is set
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
if (!BACKEND_URL) {
  console.error("❌ VITE_BACKEND_URL is not set in environment variables!");
  console.error("Please set VITE_BACKEND_URL in your deployment environment variables.");
} else {
  console.log("✅ Backend URL configured:", BACKEND_URL);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider 
    clientId={GOOGLE_CLIENT_ID || ""}
    onScriptLoadError={(error) => {
      console.error("❌ Google OAuth script failed to load:", error);
    }}
  >
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);
