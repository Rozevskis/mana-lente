FROM node:18-alpine

WORKDIR /app

# Install curl for health checking
RUN apk --no-cache add curl bash

# Copy package.json files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy wait script and make it executable
COPY wait-for-backend.sh /app/
RUN chmod +x /app/wait-for-backend.sh

# Copy test source files
COPY . .

# Set the API_URL environment variable to point to the backend service
ENV API_URL=http://backend:3000

# Run wait script instead of directly running tests
CMD ["/bin/bash", "/app/wait-for-backend.sh"]
