export const categoryWeights = (categories) => {
  const decay = 0.5;
  const rawWeights = categories.map((_, i) => Math.pow(decay, i));
  const sum = rawWeights.reduce((a, b) => a + b, 0);
  return rawWeights.map(w => w / sum); // normalized weights
};

export const scoreArticle = (article, userBiases) => {
  // Check if article has no categories or empty categories array
  if (!article.categories || 
      article.categories.length === 0 || 
      (Array.isArray(article.categories) && article.categories.length === 0) || 
      !userBiases) {
    return 0.5; // Default value of 0.5 for articles without categories
  }

  const categories = Array.isArray(article.categories) 
    ? article.categories 
    : Array.from(article.categories);
  
  // If categories array is empty after conversion, return default value
  if (categories.length === 0) {
    return 0.5;
  }
  
  const weights = categoryWeights(categories);

  return categories.reduce((score, cat, i) => {
    const bias = userBiases[cat] || 0;
    return score + bias * weights[i];
  }, 0);
};

export const sortArticlesByScore = (articles, userBiases) => {
  if (!userBiases) {
    return articles;
  }

  // Calculate scores for all articles
  const articlesWithScores = articles.map(article => ({
    ...article,
    score: scoreArticle(article, userBiases)
  }));

  // Sort by score (highest first)
  return articlesWithScores.sort((a, b) => b.score - a.score);
};
