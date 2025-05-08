/**
 * Bias adjustment service for handling user preference learning
 * This service provides functions to adjust user biases based on their interactions with articles
 */

// Constants for bias adjustments
const BIAS_INCREASE = 0.01;
const BIAS_DECREASE = 0.001;
const MIN_BIAS = 0;
const MAX_BIAS = 1;

/**
 * Adjusts user biases based on article categories they interacted with
 * @param {Array} articleCategories - Categories of the article the user interacted with
 * @param {Object} currentBiases - Current user bias values
 * @returns {Object} Updated bias values
 */
export const adjustBiasesFromInteraction = (articleCategories, currentBiases) => {
  if (!articleCategories || articleCategories.length === 0 || !currentBiases) {
    return currentBiases;
  }
  
  // Create a copy of current biases
  const updatedBiases = { ...currentBiases };
  
  // For each category in the article, increase its bias
  articleCategories.forEach(category => {
    if (updatedBiases[category] !== undefined) {
      updatedBiases[category] = Math.min(MAX_BIAS, updatedBiases[category] + BIAS_INCREASE);
    }
  });
  
  // For all other categories, slightly decrease their bias
  Object.keys(updatedBiases).forEach(category => {
    if (!articleCategories.includes(category)) {
      updatedBiases[category] = Math.max(MIN_BIAS, updatedBiases[category] - BIAS_DECREASE);
    }
  });
  
  return updatedBiases;
};

/**
 * Normalizes bias values to ensure they sum to a specific total
 * This can be used to keep the overall influence of biases constant
 * @param {Object} biases - Bias values to normalize
 * @param {number} targetSum - Desired sum of all bias values (default: 1)
 * @returns {Object} Normalized bias values
 */
export const normalizeBiases = (biases, targetSum = 1) => {
  if (!biases) return biases;
  
  const values = Object.values(biases);
  const sum = values.reduce((acc, val) => acc + val, 0);
  
  // If sum is 0 or very close to 0, return equal distribution
  if (sum < 0.0001) {
    const equalValue = targetSum / Object.keys(biases).length;
    return Object.keys(biases).reduce((acc, key) => {
      acc[key] = equalValue;
      return acc;
    }, {});
  }
  
  // Otherwise normalize proportionally
  const factor = targetSum / sum;
  return Object.keys(biases).reduce((acc, key) => {
    acc[key] = biases[key] * factor;
    return acc;
  }, {});
};
