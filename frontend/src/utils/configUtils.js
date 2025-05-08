/**
 * Utility functions for parsing configuration from environment variables
 */

/**
 * Parse default biases from environment variable
 * @returns {Object|null} Parsed biases or null if not available
 */
export const getDefaultBiases = () => {
  let parsedDefaultBiases = null;
  try {
    if (import.meta.env.VITE_DEBUG_BIASES) {
      parsedDefaultBiases = JSON.parse(import.meta.env.VITE_DEBUG_BIASES);
    }
  } catch (error) {
    console.error("Error parsing VITE_DEBUG_BIASES:", error);
  }
  return parsedDefaultBiases;
};

/**
 * Parse article categories from environment variable
 * @returns {Array} Array of article categories
 */
export const getArticleCategories = () => {
  let articleCategories = [];

  if (import.meta.env.VITE_ARTICLE_CATEGORIES) {
    try {
      // Clean up potential trailing commas in JSON array
      const cleanedJson = import.meta.env.VITE_ARTICLE_CATEGORIES.replace(/,\s*]/g, ']');
      articleCategories = JSON.parse(cleanedJson);
      console.log("Categories loaded from environment:", articleCategories);
    } catch (error) {
      console.error("Error parsing VITE_ARTICLE_CATEGORIES:", error);
      throw new Error("Failed to parse VITE_ARTICLE_CATEGORIES. Please fix the environment variable format.");
    }
  } else {
    console.error("VITE_ARTICLE_CATEGORIES is not defined in environment");
    throw new Error("VITE_ARTICLE_CATEGORIES is not defined in environment. Please add it to your .env file.");
  }

  return articleCategories;
};

/**
 * Check if debug mode is enabled
 * @returns {boolean} True if debug mode is enabled
 */
export const isDebugModeEnabled = () => {
  return import.meta.env.VITE_DEBUG === "true";
};
