import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/auth`;

export const authService = {
  async login(username, password) {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });
      if (response.data.access_token) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Login failed" };
    }
  },

  async register(username, password) {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Registration failed" };
    }
  },

  logout() {
    localStorage.removeItem("user");
  },

  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getAuthHeader() {
    const user = this.getCurrentUser();
    if (user && user.access_token) {
      return { Authorization: `Bearer ${user.access_token}` };
    }
    return {};
  },
};
