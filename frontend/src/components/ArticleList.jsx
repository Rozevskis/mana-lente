import { useEffect, useState } from "react";
import { getArticles } from "../services/articleService";
import { getUserBiases } from "../services/userService";
import { sortArticlesByScore } from "../utils/articleSorting";
import { useAuth } from "../contexts/AuthContext";
import "../styles/ArticleList.css";

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, isAuthenticated } = useAuth();
  
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const articlesData = await getArticles();
        
        // Get user biases if user is authenticated
        let biases = null;
        if (isAuthenticated && currentUser) {
          // Try to get biases directly from currentUser
          biases = currentUser.categoryBiases;
        } else {
          // Fallback to getting biases from localStorage
          biases = getUserBiases();
        }
        
        // Sort articles by score if user biases are available
        const sortedArticles = biases 
          ? sortArticlesByScore(articlesData, biases)
          : articlesData;
          
        setArticles(sortedArticles);
        setLoading(false);
      } catch (err) {
        console.error("Error in data fetching:", err);
        setError("Failed to load articles");
        setLoading(false);
      }
    };

    fetchArticles();
  }, [currentUser, isAuthenticated]);

  if (loading) return <div className="loading">Loading articles...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="article-list">
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
            {article.score !== undefined && import.meta.env.VITE_DEBUG === "true" && (
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
  );
};

export default ArticleList;
