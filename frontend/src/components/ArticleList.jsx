import { useEffect, useState } from "react";
import { getArticles } from "../services/articleService";
import "../styles/ArticleList.css";

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await getArticles();
        setArticles(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load articles");
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) return <div className="loading">Loading articles...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="article-list">
      {articles.map((article) => (
        <div key={article.id} className="article-card">
          <h2 className="article-title">{article.title}</h2>
          <p className="article-description">{article.description}</p>
          <div className="article-meta">
            <span className="article-date">
              {new Date(article.publishedAt).toLocaleDateString()}
            </span>
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="article-link"
            >
              Read more
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArticleList;
