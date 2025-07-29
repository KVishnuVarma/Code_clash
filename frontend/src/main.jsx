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
  console.error("Please create a .env file in the frontend directory with:");
  console.error("VITE_GOOGLE_CLIENT_ID=your_google_client_id_here");
} else {
  console.log("✅ Google OAuth Client ID configured");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider 
    clientId={GOOGLE_CLIENT_ID}
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
