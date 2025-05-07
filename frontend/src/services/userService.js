import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Get user biases from local storage for non-authenticated users
 * @returns {Object|null} User category biases or null if not found
 */
export const getUserBiases = () => {
  try {
    // Check if we have user data in localStorage
    const userData = localStorage.getItem("user");
    if (!userData) {
      return null;
    }
    
    // Parse the user data and return category biases if available
    const user = JSON.parse(userData);
    return user.categoryBiases || null;
  } catch (error) {
    console.error("Error accessing user biases:", error);
    return null;
  }
};

/**
 * Save user biases to local storage for non-authenticated users
 * @param {Object} biases - Category biases to save
 */
export const saveUserBiases = (biases) => {
  try {
    // Get existing user data or create new object
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : {};
    
    // Update biases
    user.categoryBiases = biases;
    
    // Save back to localStorage
    localStorage.setItem("user", JSON.stringify(user));
    
    return true;
  } catch (error) {
    console.error("Error saving user biases:", error);
    return false;
  }
};

/**
 * Update user category biases via API for authenticated users
 * @param {Object} biases - Category biases to update
 * @returns {Promise<Object>} Updated user data
 */
export const updateUserBiases = async (biases) => {
  try {
    // Use the correct endpoint that matches the backend implementation
    const response = await axios.post(
      `${API_URL}/users/preferences`,
      { categoryBiases: biases },
      { 
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user biases:", error);
    throw error;
  }
};
