export const categoryWeights = (categories: string[]): number[] => {
  // Decay of 0.5 felt right after testing
  const decay = 0.5;
  const rawWeights = categories.map((_, i) => Math.pow(decay, i));
  const sum = rawWeights.reduce((a, b) => a + b, 0);
  return rawWeights.map(w => w / sum); // normalize to sum=1
};

export const scoreArticle = (article: any, userBiases: Record<string, number>): number => {
  // No categories or biases? Just use middle value (0.5)
  if (
    !article.categories || 
    article.categories.length === 0 || 
    !userBiases
  ) {
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
    const bias = userBiases[cat] || 0.5; // Default bias of 0.5 if not specified
    return score + bias * weights[i];
  }, 0);
};

export const sortArticlesByScore = (articles: any[], userBiases: Record<string, number>) => {
  if (!userBiases) {
    return articles;
  }

  // Add scores to each article based on user's bias preferences
  const articlesWithScores = articles.map(article => ({
    ...article,
    score: scoreArticle(article, userBiases)
  }));

  // Sort by score (highest first)
  return articlesWithScores.sort((a, b) => b.score - a.score);
};
