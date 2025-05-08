import { useState, useEffect, useCallback } from 'react';
import { getSortedArticles } from '../services/articleService';
import { getUserBiases, saveUserBiases, updateUserBiases } from '../services/userService';
import { adjustBiasesFromInteraction } from '../services/biasService';
import { useAuth } from '../contexts/AuthContext';
import { isDebugModeEnabled } from '../utils/configUtils';

/**
 * Custom hook for article management
 * @param {Object} params Search parameters
 * @returns {Object} Article state and methods
 */
export const useArticles = (params) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [userBiases, setUserBiases] = useState(null);
  const { currentUser, isAuthenticated } = useAuth();
  const isDebugMode = isDebugModeEnabled();
  
  const { page, limit, search, category, defaultBiases } = params;

  // Fetch articles based on current parameters
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      // Get user biases for the debug editor panel only
      let biases = null;
      
      // If authenticated user has biases, use those
      if (isAuthenticated && currentUser && currentUser.categoryBiases) {
        console.log("Using authenticated user biases:", currentUser.categoryBiases);
        biases = currentUser.categoryBiases;
      } else {
        // Otherwise use biases from localStorage
        const localBiases = getUserBiases();
        console.log("Using local storage biases:", localBiases);
        biases = localBiases;
      }
      
      // Save biases for the debug editor panel - only if we have biases to save
      if (biases) {
        console.log("Setting user biases for debug panel:", biases);
        setUserBiases(biases);
      } else if (defaultBiases && isDebugMode) {
        // if no biases are available but we have default ones from env, use those
        console.log("Using default biases from environment variable:", defaultBiases);
        setUserBiases(defaultBiases);
        biases = defaultBiases;
        // only save default biases to localStorage if they're not already there
        if (!getUserBiases()) {
          saveUserBiases(defaultBiases);
        }
      } else {
        console.log("No biases available to set");
      }
      
      // Get sorted articles from backend
      const response = await getSortedArticles({
        page,
        limit,
        search,
        sortBy: 'publishedAt',
        sortOrder: 'DESC',
        biases: biases,
        category: category,
        debug: isDebugMode
      });
      
      // Extract data and pagination metadata
      const { data: articlesData, meta } = response;
      
      // Update state with articles and pagination
      setArticles(articlesData);
      setPagination({
        page: meta.currentPage,
        limit: meta.itemsPerPage,
        total: meta.totalItems,
        totalPages: meta.totalPages
      });
      
      setLoading(false);
    } catch (err) {
      console.error("Error in data fetching:", err);
      setError("Failed to load articles");
      setLoading(false);
    }
  }, [page, limit, search, category, isAuthenticated, currentUser, defaultBiases, isDebugMode]);

  // Update biases and refetch articles
  const handleBiasesUpdate = async (newBiases) => {
    console.log("Updating biases to:", newBiases);
    setUserBiases(newBiases);
    
    // If authenticated, save to backend database
    if (isAuthenticated) {
      try {
        console.log("Saving biases to backend for authenticated user");
        const updatedUser = await updateUserBiases(newBiases);
        console.log("Successfully updated user biases in backend:", updatedUser);
      } catch (error) {
        console.error("Failed to update user biases in backend:", error);
      }
    } 
    // If not authenticated, save to local storage
    else {
      const saveSuccess = saveUserBiases(newBiases);
      console.log("Saved biases to local storage:", saveSuccess ? "success" : "failed");
      
      // Verify the biases were saved correctly
      const savedBiases = getUserBiases();
      console.log("Verification - Retrieved biases from storage:", savedBiases);
    }
    
    // Re-fetch articles with new biases from backend
    try {
      // Re-fetch articles with the new biases
      const response = await getSortedArticles({
        page,
        limit,
        search,
        sortBy: 'publishedAt',
        sortOrder: 'DESC',
        biases: newBiases,
        category: category,
        debug: isDebugMode
      });
      
      // Update articles with sorted data from backend
      const { data: sortedArticles } = response;
      setArticles(sortedArticles);
    } catch (err) {
      console.error("Error updating articles with new biases:", err);
    }
  };
  
  // Adjust biases from article interaction
  const adjustBiasesFromArticleClick = (articleCategories) => {
    if (!articleCategories || articleCategories.length === 0) return;
    
    // Use the bias service to calculate updated biases
    const updatedBiases = adjustBiasesFromInteraction(articleCategories, userBiases);
    console.log("Adjusting biases from article click:", updatedBiases);
    
    // Update biases and refresh articles
    handleBiasesUpdate(updatedBiases);
  };

  // Effect to fetch articles when parameters change
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return {
    articles,
    loading,
    error,
    pagination,
    userBiases,
    isDebugMode,
    handleBiasesUpdate,
    adjustBiasesFromArticleClick
  };
};
