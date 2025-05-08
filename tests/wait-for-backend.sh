#!/bin/bash

echo "Waiting for backend to be ready..."
until curl -s http://backend:3000 > /dev/null; do
  echo -n "."
  sleep 1
done

echo -e "\nBackend is ready! Running tests..."
npm test
