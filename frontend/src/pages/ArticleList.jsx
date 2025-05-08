import { 
  ArticleCard, 
  CategoryFilter, 
  DebugPanel, 
  Pagination, 
  SearchBar 
} from "../components/articles/ArticleListComponents";
import { useArticles } from "../hooks/useArticles";
import { useUrlParams } from "../hooks/useUrlParams";
import { getArticleCategories, getDefaultBiases } from "../utils/configUtils";
import "./ArticleList.css";

// Get categories and default biases from environment
const articleCategories = getArticleCategories();
const defaultBiases = getDefaultBiases();

const ArticleList = () => {
  // Use custom hook for URL parameters
  const { 
    searchInput, 
    setSearchInput, 
    getCurrentPage, 
    getLimit, 
    getSearchTerm, 
    getCategory, 
    handlePageChange, 
    handleSearch, 
    handleCategorySelect 
  } = useUrlParams();
  
  const selectedCategory = getCategory();
  
  // Use custom hook for article data and management
  const { 
    articles, 
    loading, 
    error, 
    pagination, 
    userBiases, 
    isDebugMode, 
    handleBiasesUpdate, 
    adjustBiasesFromArticleClick 
  } = useArticles({
    page: getCurrentPage(),
    limit: getLimit(),
    search: getSearchTerm(),
    category: selectedCategory,
    defaultBiases
  });
  
  if (loading) return <div className="loading">Loading articles...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className={`article-list-container ${isDebugMode ? 'with-debug-panel' : ''}`}>
      {/* Category Filter Component */}
      <CategoryFilter 
        categories={articleCategories} 
        selectedCategory={selectedCategory} 
        onCategorySelect={handleCategorySelect} 
      />
      
      <div className="content-area">
        {/* Debug Panel Component */}
        {isDebugMode && userBiases && (
          <DebugPanel 
            userBiases={userBiases} 
            onBiasesChange={handleBiasesUpdate} 
          />
        )}

        <div className="article-list">
          <div className="article-header">
            <h1>Jaunākās ziņas</h1>
            {/* Search Bar Component */}
            <SearchBar 
              searchInput={searchInput} 
              setSearchInput={setSearchInput} 
              handleSearch={handleSearch} 
            />
          </div>
          
          {articles.length === 0 ? (
            <div className="no-articles">Nav atrasts neviens raksts. Mēģiniet pielietot citus meklēšanas parametrus.</div>
          ) : (
            <div className="articles-grid">
              {articles.map((article) => (
                <ArticleCard 
                  key={article.id}
                  article={article}
                  isDebugMode={isDebugMode}
                  onCategorySelect={handleCategorySelect}
                  adjustBiasesFromArticleClick={adjustBiasesFromArticleClick}
                />
              ))}
            </div>
          )}

          {/* Pagination Component */}
          <Pagination 
            pagination={pagination} 
            onPageChange={handlePageChange} 
          />
        </div>
      </div>
    </div>
  );
};

export default ArticleList;
