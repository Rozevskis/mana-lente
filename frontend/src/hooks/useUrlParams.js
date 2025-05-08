import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook for managing URL search parameters
 * @returns {Object} URL params state and handler functions
 */
export const useUrlParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  
  // Get the current page from URL or default to 1
  const getCurrentPage = () => parseInt(searchParams.get("page") || "1");
  
  // Get limit from URL or default to 20
  const getLimit = () => parseInt(searchParams.get("limit") || "20");
  
  // Get search term from URL
  const getSearchTerm = () => searchParams.get("search") || "";
  
  // Get category from URL
  const getCategory = () => searchParams.get("category") || null;
  
  // Handle page change
  const handlePageChange = (newPage, totalPages) => {
    if (newPage < 1 || (totalPages && newPage > totalPages)) return;
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };
  
  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput) {
      newParams.set("search", searchInput);
    } else {
      newParams.delete("search");
    }
    newParams.set("page", "1"); // Reset to page 1 on new search
    setSearchParams(newParams);
  };
  
  // Handle category selection
  const handleCategorySelect = (category) => {
    // If clicking the already selected category, deselect it
    const currentCategory = getCategory();
    const newCategory = category === currentCategory ? null : category;
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (newCategory) {
      newParams.set("category", newCategory);
    } else {
      newParams.delete("category");
    }
    newParams.set("page", "1"); // Reset to page 1 on category change
    setSearchParams(newParams);
  };
  
  return {
    searchParams,
    searchInput,
    setSearchInput,
    getCurrentPage,
    getLimit,
    getSearchTerm,
    getCategory,
    handlePageChange,
    handleSearch,
    handleCategorySelect
  };
};
