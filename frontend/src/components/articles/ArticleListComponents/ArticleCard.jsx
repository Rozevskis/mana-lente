import React from 'react';

const ArticleCard = ({ 
  article, 
  isDebugMode, 
  onCategorySelect, 
  adjustBiasesFromArticleClick 
}) => {
  const handleArticleClick = () => {
    // Adjust biases based on article categories when clicked
    if (isDebugMode && article.categories) {
      adjustBiasesFromArticleClick(article.categories);
    }
    // Open the article in a new tab
    window.open(article.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="article-card" onClick={handleArticleClick}>
      {article.image && (
        <div className="article-image">
          <img src={article.image} alt={article.title} />
          {article.categories && article.categories.length > 0 && (
            <div className="article-categories">
              {article.categories.map((category) => (
                <span 
                  key={category} 
                  className="category-bubble"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent opening the article
                    onCategorySelect(category);
                  }}
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="article-content">
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
  );
};

export default ArticleCard;
