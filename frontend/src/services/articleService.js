import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const getArticles = async () => {
  try {
    const response = await axios.get(`${API_URL}/articles`);
    return response.data;
  } catch (error) {
    console.error("Error fetching articles:", error);
    throw error;
  }
};
