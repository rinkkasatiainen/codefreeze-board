#!/bin/bash

# Build the Lambda function
echo "Building Lambda function..."
npm run build

# Run tests
echo "Running tests..."
npm test

# Run linting
echo "Running linting..."
npm run lint

echo "Lambda function is ready for deployment!"
echo "The function will be deployed when you run 'cdk deploy' from the cdk directory."
