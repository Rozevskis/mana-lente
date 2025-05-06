import { useEffect, useState } from "react";
import { getArticles } from "../services/articleService";
import { getUserBiases } from "../services/userService";
import { sortArticlesByScore } from "../utils/articleSorting";
import { useAuth } from "../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import CategoryBiasEditor from "./CategoryBiasEditor";
import "../styles/ArticleList.css";

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [originalArticles, setOriginalArticles] = useState([]);
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
  const { currentUser, isAuthenticated } = useAuth();
  const isDebugMode = import.meta.env.VITE_DEBUG === "true";
  
  useEffect(() => {
    // Get pagination parameters from URL or use defaults
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "publishedAt";
    const sortOrder = searchParams.get("sortOrder") || "DESC";
    
    const fetchArticles = async () => {
      setLoading(true);
      try {
        // Get articles with pagination
        const response = await getArticles({
          page,
          limit,
          search,
          sortBy,
          sortOrder
        });
        
        // Extract data and pagination metadata
        const { data: articlesData, meta } = response;
        
        // Store original unsorted articles
        setOriginalArticles(articlesData);
        
        // Get user biases if user is authenticated
        let biases = null;
        if (isAuthenticated && currentUser) {
          biases = currentUser.categoryBiases;
        } else {
          biases = getUserBiases();
        }
        // Save biases for the editor
        setUserBiases(biases);
        
        // Sort articles by score if user biases are available
        const sortedArticles = biases 
          ? sortArticlesByScore(articlesData, biases)
          : articlesData;
          
        setArticles(sortedArticles);
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
  }, [currentUser, isAuthenticated, searchParams]);

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

  // Handle real-time bias changes in debug mode
  const handleBiasesUpdate = (newBiases) => {
    setUserBiases(newBiases);
    
    // Re-sort articles with new biases
    if (originalArticles.length > 0) {
      const resortedArticles = sortArticlesByScore(originalArticles, newBiases);
      setArticles(resortedArticles);
    }
  };

  if (loading) return <div className="loading">Loading articles...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className={`article-list-container ${isDebugMode ? 'with-debug-panel' : ''}`}>
      {/* Debug panel sidebar for real-time bias editing */}
      {isDebugMode && userBiases && (
        <div className="debug-panel">
          <h3>Debug Panel</h3>
          <div className="debug-section">
            <h4>Category Biases</h4>
            <p className="debug-hint">Adjust weights to see real-time changes in article sorting</p>
            <CategoryBiasEditor
              initialBiases={userBiases}
              onBiasesChange={handleBiasesUpdate}
              editable={true}
              showSaveButton={isAuthenticated}
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
            <div key={article.id} className="article-card">
              {article.image && (
                <div className="article-image">
                  <img src={article.image} alt={article.title} />
                </div>
              )}
              <div className="article-content">
                {article.categories && article.categories.length > 0 && (
                  <div className="article-categories">
                    {article.categories.map((category) => (
                      <span key={category} className="category-bubble">
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
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="article-link"
                  >
                    Lasīt vairāk
                  </a>
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
  );
}

export default ArticleList;
