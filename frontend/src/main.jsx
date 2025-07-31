import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Environment variables validation removed
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider 
    clientId={GOOGLE_CLIENT_ID || ""}
    // eslint-disable-next-line no-unused-vars
    onScriptLoadError={(error) => {
      // Error handling removed
    }}
    onScriptLoadSuccess={() => {
    }}
  >
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);
