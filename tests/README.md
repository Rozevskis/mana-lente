# ManaLente News Portal Automated Tests

This directory contains automated tests for the ManaLente News Portal application.

## Running Tests

There are two ways to run the tests:

### Using Docker (Recommended)

The easiest way to run the tests is using Docker, which ensures all dependencies are properly installed:

```bash
# From the project root directory, start both backend and tests:
docker-compose up backend tests
```

The test script will automatically wait for the backend to be ready before running the tests. This is handled by the `wait-for-backend.sh` script which polls the backend until it's available.

For a one-time test run against an already running backend:

```bash
# Make sure the backend is already running
docker-compose up -d backend

# Then run the tests
docker-compose run --rm tests
```

The test container will exit automatically after the tests complete.

### Running Locally (Development)

If you prefer to run the tests locally during development:

```bash
cd tests
npm install
npm test
```

Make sure to set the `API_URL` environment variable if your backend is not running on the default `http://localhost:3000`:

```bash
API_URL=http://localhost:3000 npm test
```

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
