// this is the main navigation header for the app

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Header() {
  const { user, logout } = useAuth(); // from our AuthContext
  const navigate = useNavigate();

  // logout and go to login page
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header">
      {/* app title on the left */}
      <NavLink to="/" className="header-logo">
        Personal Finance Assistant
      </NavLink>

      {/* navigation links on the right */}
      <nav className="header-nav">
        {user ? (
          <>
            {/* only show these if user is logged in */}
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "nav-active" : "")}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/transactions"
              className={({ isActive }) => (isActive ? "nav-active" : "")}
            >
              Transactions
            </NavLink>
            <NavLink
              to="/add"
              className={({ isActive }) => (isActive ? "nav-active" : "")}
            >
              Add New
            </NavLink>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            {/* if not logged in, show login/register */}
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
