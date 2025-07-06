// this is the main entry point for our React app

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./assets/styles.css";

// this is where the app actually starts and renders into the root div
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* setup routing and auth context for the whole app */}
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
