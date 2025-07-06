// this component sets up all the pages and routes for our app

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import AddTransactionPage from "./pages/AddTransactionPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { useAuth } from "./context/AuthContext.jsx";
import Loader from "./components/Loader";

// this is a helper component to protect routes
function PrivateRoute({ children }) {
  const { user, loading } = useAuth(); // get loading state from auth context

  // if the app is still checking for a user, show a loader
  if (loading) {
    return <Loader />;
  }

  // if not loading and there's a user, show the page. Otherwise, go to login.
  return user ? children : <Navigate to="/login" />;
}

// this is the main app component
function App() {
  const { user, loading } = useAuth();

  // if we are still checking for a user, we can show a full-page loader
  // to prevent any part of the app from rendering incorrectly.
  if (loading) {
    return (
      <div className="auth-wrapper">
        <Loader />
      </div>
    );
  }

  return (
    <>
      {/* The header is now guaranteed to know if a user is logged in or not */}
      <Header />
      <main className="container">
        <Routes>
          {/* Public Routes: if logged in, redirect from login/register to dashboard */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
          
          {/* Private Routes */}
          <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/transactions" element={<PrivateRoute><TransactionsPage /></PrivateRoute>} />
          <Route path="/add" element={<PrivateRoute><AddTransactionPage /></PrivateRoute>} />
        </Routes>
      </main>
    </>
  );
}

export default App;
