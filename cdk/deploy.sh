#!/bin/bash

# CodeFreeze Board CDK Deployment Script

set -e

echo "🚀 Deploying CodeFreeze Board to AWS..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity --profile PowerUserAccess-094009463545 &> /dev/null; then
    echo "❌ AWS CLI not configured. Please run 'aws configure sso' first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    yarn install
fi

# Build the project
echo "🔨 Building CDK project..."
yarn build

# Bootstrap CDK (if needed)
echo "🔧 Checking CDK bootstrap..."
if ! yarn cdk:run list &> /dev/null; then
    echo "🔄 Bootstrapping CDK..."
    yarn cdk:run bootstrap --profile PowerUserAccess-094009463545
fi

# Deploy the stack
echo "🚀 Deploying stack..."
yarn cdk:run deploy --profile PowerUserAccess-094009463545  # --require-approval never

echo "✅ Deployment complete!"
echo "🌐 Your website will be available at the URL shown above." 