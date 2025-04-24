import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Checking authentication status...");
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token);

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Fetch user data
      axios
        .get("http://localhost:3000/auth/me")
        .then((response) => {
          console.log("User data received:", response.data);
          setCurrentUser(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      console.log("No token found");
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    console.log("Attempting login...");
    try {
      const response = await axios.post("http://localhost:3000/auth/login", {
        email,
        password,
      });
      console.log("Login response:", response.data);
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const register = async (email, password, username) => {
    console.log("Attempting registration...");
    try {
      const response = await axios.post("http://localhost:3000/auth/register", {
        email,
        password,
        username,
      });
      console.log("Registration response:", response.data);
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout,
  };

  console.log("Current auth state:", {
    isAuthenticated: value.isAuthenticated,
    currentUser: value.currentUser,
  });

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
