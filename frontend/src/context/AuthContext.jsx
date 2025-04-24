import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Verify token with backend
      axios
        .get("http://localhost:3000/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setIsAuthenticated(true);
          setUser(response.data.user);
        })
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post("http://localhost:3000/auth/login", {
        email,
        password,
      });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post("http://localhost:3000/auth/register", {
        username,
        email,
        password,
      });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
