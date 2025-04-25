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
      } catch {
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
