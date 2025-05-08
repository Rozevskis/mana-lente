import { useEffect, useState } from "react";
import { getSortedArticles } from "../services/articleService";
import { getUserBiases, saveUserBiases, updateUserBiases } from "../services/userService";
import { adjustBiasesFromInteraction } from "../services/biasService";
import { useAuth } from "../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import CategoryBiasEditor from "../components/articles/CategoryBiasEditor";
import "./ArticleList.css";

// parse default biases from environment variable
let parsedDefaultBiases = null;
try {
  if (import.meta.env.VITE_DEBUG_BIASES) {
    parsedDefaultBiases = JSON.parse(import.meta.env.VITE_DEBUG_BIASES);
  }
} catch (error) {
  console.error("Error parsing VITE_DEBUG_BIASES:", error);
}

let articleCategories = [];

if (import.meta.env.VITE_ARTICLE_CATEGORIES) {
  try {
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

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [userBiases, setUserBiases] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { currentUser, isAuthenticated } = useAuth();
  const isDebugMode = import.meta.env.VITE_DEBUG === "true";
  // use the pre-parsed default biases to avoid parsing on every render
  const defaultBiases = parsedDefaultBiases;
  
  useEffect(() => {
    // Get pagination parameters from URL or use defaults
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    
    const fetchArticles = async () => {
      setLoading(true);
      try {
        // Get user biases for the debug editor panel only
        // The backend will handle determining which biases to use
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
          // only save default biases to localStorage if they're not already there to prevent unnecessary localStorage operations
          if (!getUserBiases()) {
            saveUserBiases(defaultBiases);
          }
        } else {
          console.log("No biases available to set");
        }
        
        // check if there's a category in the URL params
        const categoryParam = searchParams.get("category");
        if (categoryParam && !selectedCategory) {
          setSelectedCategory(categoryParam);
        }
        
        // Get sorted articles from backend
        const response = await getSortedArticles({
          page,
          limit,
          search,
          sortBy: 'publishedAt',  // Always sort by date initially
          sortOrder: 'DESC',      // Always newest first initially
          biases: biases, // Always send biases regardless of authentication status
          category: selectedCategory, // Send selected category if any
          debug: isDebugMode // Always pass debug flag if in debug mode
        });
        
        // Extract data and pagination metadata
        const { data: articlesData, meta } = response;
        
        // Just display the sorted articles returned by the backend
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
    };

    fetchArticles();
  }, [currentUser, isAuthenticated, searchParams, isDebugMode, defaultBiases, selectedCategory]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };
  
  // Handle search input
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
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
  
  // handle category selection
  const handleCategorySelect = (category) => {
    // if clicking the already selected category, deselect it
    const newCategory = category === selectedCategory ? null : category;
    setSelectedCategory(newCategory);
    
    // update URL params
    const newParams = new URLSearchParams(searchParams);
    if (newCategory) {
      newParams.set("category", newCategory);
    } else {
      newParams.delete("category");
    }
    newParams.set("page", "1"); // Reset to page 1 on category change
    setSearchParams(newParams);
  };

  // Handle real-time bias changes in debug mode
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
        page: pagination.page,
        limit: pagination.limit,
        search: searchParams.get("search") || "",
        sortBy: 'publishedAt',
        sortOrder: 'DESC',
        biases: newBiases, // Send biases to backend
        category: selectedCategory, // Include the selected category to maintain filtering
        debug: isDebugMode // Pass debug flag
      });
      
      // Update articles with sorted data from backend
      const { data: sortedArticles } = response;
      setArticles(sortedArticles);
    } catch (err) {
      console.error("Error updating articles with new biases:", err);
    }
  };
  
  // The algo that acctually adjusts the biases based on the clicked article
  const adjustBiasesFromArticleClick = (articleCategories) => {
    if (!articleCategories || articleCategories.length === 0) return;
    
    // Use the bias service to calculate updated biases
    const updatedBiases = adjustBiasesFromInteraction(articleCategories, userBiases);
    console.log("Adjusting biases from article click:", updatedBiases);
    
    // Update biases and refresh articles
    handleBiasesUpdate(updatedBiases);
  };

  if (loading) return <div className="loading">Loading articles...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className={`article-list-container ${isDebugMode ? 'with-debug-panel' : ''}`}>
      {/* Category filter buttons */}
      <div className="category-filter">
        <div className="category-buttons">
          <button 
            className={`category-button ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => handleCategorySelect(null)}
          >
            All Categories
          </button>
          {articleCategories.map((category) => (
            <button
              key={category}
              className={`category-button ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategorySelect(category)}
            >
              {category.length > 20 ? category.substring(0, 18) + '...' : category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="content-area">
        {isDebugMode && userBiases && (
          <div className="debug-panel">
            <div className="debug-section">
              <h4>Category Biases</h4>
              <p className="debug-hint">Adjust weights to see real-time changes in article sorting</p>
              <CategoryBiasEditor
                initialBiases={userBiases}
                onBiasesChange={handleBiasesUpdate}
                editable={true}
                className="sidebar-editor"
              />
            </div>
          </div>
        )}

        <div className="article-list">
          <div className="article-header">
            <h1>Jaunākās ziņas</h1>
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Meklēt rakstus..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">Meklēt</button>
            </form>
          </div>
          {articles.length === 0 ? (
            <div className="no-articles">Nav atrasts neviens raksts. Mēģiniet pielietot citus meklēšanas parametrus.</div>
          ) : (
            <div className="articles-grid">
              {articles.map((article) => (
                <div 
                  key={article.id} 
                  className="article-card"
                  onClick={() => {
                    // adjust biases based on article categories when clicked
                    if (isDebugMode && article.categories) {
                      adjustBiasesFromArticleClick(article.categories);
                    }
                    // open the article in a new tab
                    window.open(article.link, '_blank', 'noopener,noreferrer');
                  }}
                >
                  {article.image && (
                    <div className="article-image">
                      <img src={article.image} alt={article.title} />
                    </div>
                  )}
                  <div className="article-content">
                    {article.categories && article.categories.length > 0 && (
                      <div className="article-categories">
                        {article.categories.map((category) => (
                          <span 
                            key={category} 
                            className="category-bubble"
                            onClick={(e) => {
                              e.stopPropagation(); // prevent opening the article
                              handleCategorySelect(category);
                            }}
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                    <h2 className="article-title">{article.title}</h2>
                    <p className="article-description">{article.description}</p>
                {/* Display score only when debug mode is enabled */}
                    {article.score !== undefined && isDebugMode && (
                      <div className="article-score">
                        Score: {article.score.toFixed(3)}
                      </div>
                    )}
                    <div className="article-meta">
                      <span className="article-date">
                        {new Date(article.publishedAt).toLocaleDateString("lv-LV", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <button
                        className="article-link"
                        onClick={(e) => {
                          e.stopPropagation(); // prevent duplicate opening
                          window.open(article.link, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        Lasīt vairāk
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* Pagination controls */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-button" 
                onClick={() => handlePageChange(1)} 
                disabled={pagination.page === 1}
              >
                &laquo;
              </button>
              
              <button 
                className="pagination-button" 
                onClick={() => handlePageChange(pagination.page - 1)} 
                disabled={pagination.page === 1}
              >
                &lsaquo;
              </button>
              
              <div className="pagination-info">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              
              <button 
                className="pagination-button" 
                onClick={() => handlePageChange(pagination.page + 1)} 
                disabled={pagination.page === pagination.totalPages}
              >
                &rsaquo;
              </button>
              
              <button 
                className="pagination-button" 
                onClick={() => handlePageChange(pagination.totalPages)} 
                disabled={pagination.page === pagination.totalPages}
              >
                &raquo;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleList;
