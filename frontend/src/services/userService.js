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
