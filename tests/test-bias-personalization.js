#!/usr/bin/env node

/**
 * Bias Personalization Test Suite for ManaLente News Portal
 * 
 * This script tests the news article personalization algorithm by:
 * 1. Registering a test user
 * 2. Setting Sports bias to a high value (0.8)
 * 3. Fetching personalized articles via /articles/sorted endpoint
 * 4. Verifying that sports articles are ranked higher than expected by random chance
 * 
 * The test passes if sports articles appear earlier in the results when the
 * sports bias value is set higher, confirming the bias algorithm works correctly.
 */

const axios = require('axios');
const chalk = require('chalk');
const readline = require('readline');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_USER = {
  email: `test-user-${Date.now()}@example.com`,
  password: 'Test123!',
  username: `testuser${Date.now().toString().substring(6)}`
};


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function printSectionHeader(step, title) {
  console.log(chalk.yellow(`\nSTEP ${step}: ${title}`));
}

function printSuccess(message) {
  console.log(chalk.green(`✓ ${message}`));
}


function printWarning(message) {
  console.log(chalk.yellow(`! ${message}`));
}

function printTestResult(passed, message, details = {}) {
  if (passed) {
    console.log(chalk.green(`\nTEST PASSED: ${message}`));
  } else {
    console.log(chalk.red(`\nTEST FAILED: ${message}`));
  }
  
  Object.entries(details).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
}

async function registerTestUser() {
  printSectionHeader(1, 'Registering new test user...');
  
  const response = await axios.post(`${API_URL}/auth/register`, TEST_USER);
  
  if (response.data && response.data.token) {
    printSuccess('User registration successful');
    console.log(`  User: ${TEST_USER.email}`);
    console.log(`  User ID: ${response.data.user.id}`);
    return {
      token: response.data.token,
      userId: response.data.user.id
    };
  } else {
    throw new Error('Registration failed: ' + JSON.stringify(response.data));
  }
}

async function fetchUserBiases(authToken) {
  printSectionHeader(2, 'Fetching current user biases...');
  
  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data && response.data.categoryBiases) {
      printSuccess('Current biases retrieved');
      console.log('  Current biases:', JSON.stringify(response.data.categoryBiases, null, 2));
      return response.data.categoryBiases;
    }
    return {};
  } catch (error) {
    printWarning('No existing biases found, will create new ones');
    return {};
  }
}
async function updateUserBiases(authToken, currentBiases) {
  printSectionHeader(3, 'Updating user biases (setting Sport=0.8)...');
  
  const updatedBiases = { ...currentBiases };
  
  updatedBiases.Sport = 0.8;
  
  Object.keys(updatedBiases).forEach(cat => {
    if (cat !== 'Sport') {
      updatedBiases[cat] = Math.max(0.3, updatedBiases[cat] - 0.1);
    }
  });
  
  const response = await axios.post(
    `${API_URL}/users/preferences`,
    { categoryBiases: updatedBiases },
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
  
  printSuccess('Biases updated successfully');
  console.log('  New biases:', JSON.stringify(updatedBiases, null, 2));
  
  return updatedBiases;
}

/**
 * Fetches personalized articles for the test user.
 * 
 * @param {string} authToken - The authentication token for the test user.
 * @param {object} biases - The updated biases for the test user.
 * @returns {Promise<object[]>} A promise that resolves to an array of article objects.
 */
async function fetchPersonalizedArticles(authToken, biases) {
  printSectionHeader(4, 'Fetching articles with updated biases...');
  
  const response = await axios.get(`${API_URL}/articles/sorted`, {
    params: { 
      page: 1, 
      limit: 10, 
      debug: true,
      biases: JSON.stringify(biases)
    },
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  let articles = [];
  
  if (response.data && response.data.data && Array.isArray(response.data.data)) {
    articles = response.data.data;
  } else if (response.data && Array.isArray(response.data)) {
    articles = response.data;
  } else if (response.data && response.data.data && Array.isArray(response.data.data.articles)) {
    articles = response.data.data.articles;
  } else if (response.data && response.data.articles && Array.isArray(response.data.articles)) {
    articles = response.data.articles;
  } else {
    printWarning('Unknown API response format');
    return [];
  }
  
  printSuccess(`Retrieved ${articles.length} articles`);
  return articles;
}

function analyzeArticlePositions(articles) {
  printSectionHeader(5, 'Analyzing article positions...');
  
  const hasScores = articles.length > 0 && articles[0].score !== undefined;
  
  const sportsArticles = [];
  const otherArticles = [];
  const sportsPositions = [];
  
  articles.forEach((article, index) => {
    const isSportsArticle = article.categories && article.categories.includes('Sport');
    
    if (isSportsArticle) {
      sportsArticles.push(article);
      sportsPositions.push(index);
    } else {
      otherArticles.push(article);
    }
  });
  
  printSuccess('Analysis complete');
  console.log(`  Sports articles found: ${sportsArticles.length}`);
  console.log(`  Other articles found: ${otherArticles.length}`);
  
  if (sportsPositions.length === 0) {
    printWarning('No sports articles found, cannot evaluate positions');
    return { passed: false, reason: 'No sports articles found' };
  }
  
  const avgPosition = sportsPositions.reduce((sum, pos) => sum + pos, 0) / sportsPositions.length;
  console.log(`  Average position of sports articles: ${avgPosition.toFixed(2)} (lower is better)`);
  
  const firstSportsPosition = sportsPositions[0];
  console.log(`  Position of first sports article: ${firstSportsPosition + 1}`);
  
  const expectedRandomPosition = articles.length / 2;
  
  const passed = avgPosition < expectedRandomPosition;
  
  const details = {
    'Expected random position': expectedRandomPosition.toFixed(2),
    'Actual average position': avgPosition.toFixed(2)
  };
  
  if (passed) {
    details['Improvement'] = `${(expectedRandomPosition - avgPosition).toFixed(2)} positions earlier`;
  }
  
  return { 
    passed, 
    details,
    articles,
    hasScores,
    sportsArticles,
    otherArticles 
  };
}

function displayArticleDetails(articles, hasScores) {
  console.log(chalk.blue('\nDetailed Article Information:'));
  
  articles.forEach(article => {
    const isSportsArticle = article.categories && article.categories.includes('Sport');
    const color = isSportsArticle ? chalk.green : chalk.gray;
    
    const scoreDisplay = hasScores ? 
      `[${(article.score || 0).toFixed(4)}]` : 
      '[no score]';
    const categoryDisplay = isSportsArticle ? '[SPORT]' : '       ';
    
    console.log(color(`  ${scoreDisplay} ${categoryDisplay} ${article.title}`));
    console.log(color(`    Categories: ${article.categories ? article.categories.join(', ') : 'none'}`));
  });
}



async function runTests() {
  console.log(chalk.blue('=================================='));
  console.log(chalk.blue('  BIAS PERSONALIZATION TEST SUITE  '));
  console.log(chalk.blue('=================================='));
  console.log();

  try {
    const auth = await registerTestUser();
    
    const currentBiases = await fetchUserBiases(auth.token);
    
    const updatedBiases = await updateUserBiases(auth.token, currentBiases);
    
    const articles = await fetchPersonalizedArticles(auth.token, updatedBiases);
    
    const analysis = analyzeArticlePositions(articles);
    
    printTestResult(
      analysis.passed,
      analysis.passed ? 
        'Sports articles appear earlier than expected' : 
        'Sports articles do not appear earlier than expected',
      analysis.details
    );
    
    displayArticleDetails(analysis.articles, analysis.hasScores);
    
    console.log(chalk.blue('\n=================================='));
    console.log(chalk.blue('          TEST COMPLETED           '));
    console.log(chalk.blue('=================================='));
  } catch (error) {
    console.error(chalk.red('\nTEST FAILED'));
    console.error(chalk.red(`Error: ${error.message}`));
    
    if (error.response) {
      console.error(chalk.red('API Response:'), error.response.data);
    }
  } finally {
    rl.close();
  }
}

runTests();
