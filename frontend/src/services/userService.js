import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
// use a specific key for storing category biases
const BIASES_STORAGE_KEY = "category_biases";

/**
 * Get user biases from local storage for non-authenticated users
 * @returns {Object|null} User category biases or null if not found
 */
export const getUserBiases = () => {
  try {
    // check if we have category biases in localStorage
    const biasesData = localStorage.getItem(BIASES_STORAGE_KEY);
    if (!biasesData) {
      return null;
    }
    
    // Parse and return the category biases
    const parsedBiases = JSON.parse(biasesData);
    console.log("Retrieved biases from localStorage:", parsedBiases);
    return parsedBiases;
  } catch (error) {
    console.error("Error accessing category biases:", error);
    return null;
  }
};

/**
 * Save user biases to local storage for non-authenticated users
 * @param {Object} biases - Category biases to save
 */
export const saveUserBiases = (biases) => {
  try {
    if (!biases) {
      console.error("Cannot save empty biases");
      return false;
    }
    
    const biasesString = JSON.stringify(biases);
    localStorage.setItem(BIASES_STORAGE_KEY, biasesString);
    console.log("Saved biases to localStorage:", biases);
    
    const savedData = localStorage.getItem(BIASES_STORAGE_KEY);
    if (savedData !== biasesString) {
      console.error("Verification failed: Saved data doesn't match what was intended to save");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error saving category biases:", error);
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
