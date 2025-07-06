// this "context" provides user authentication info to all components

import React, { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext();

// a simple custom hook to easily use this context
export const useAuth = () => useContext(AuthContext);

// the provider component that will wrap our entire app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // --- !! NEW LOADING STATE !! ---
  // this state will be true while we are checking for a user token
  const [loading, setLoading] = useState(true);

  // when the app first loads, check if user info is already in local storage
  useEffect(() => {
    try {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
    } catch (error) {
        console.error("Failed to parse user info from local storage", error);
        setUser(null);
    }
    // after we have checked, we set loading to false
    setLoading(false);
  }, []);

  // function to handle user login
  const login = (userData) => {
    localStorage.setItem("userInfo", JSON.stringify(userData));
    setUser(userData);
  };

  // function to handle user logout
  const logout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
  };

  // we provide the user, loading state, and functions to the rest of the app
  const value = { user, loading, login, logout };

  return (
    // only render children if we are not loading. This prevents UI flashes.
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};