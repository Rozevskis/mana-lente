# ManaLente News Portal Automated Tests

This directory contains automated tests for the ManaLente News Portal application.

## Bias Personalization Test

The main test script `test-bias-personalization.js` verifies the core functionality of the personalization algorithm by:

1. Registering a new test user
2. Logging in with that user
3. Setting the user's sports bias to 0.8 (high interest)
4. Lowering other category biases slightly
5. Fetching articles with these bias settings
6. Analyzing whether sports articles receive higher scores

### Prerequisites

- Node.js installed
- Running backend API server
- Articles already loaded in the database with proper categorization

### Installation

```bash
cd tests
npm install
```

### Running the Test

```bash
# With default API URL (http://localhost:3000/api)
npm test

# With custom API URL
API_URL=http://your-api-url/api npm test
```

### Test Output

The test will provide detailed output about:
- Registration and login status
- Current and updated bias values
- Article scores breakdown by category
- Average scores for sports articles vs. other articles
- Individual article scores with highlighting for sports articles

### Expected Results

If the bias personalization is working correctly, sports articles should have a higher average score than other articles when the sports bias is set to 0.8.
