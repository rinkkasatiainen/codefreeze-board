#!/bin/bash

# CodeFreeze Board Amplify Deployment Script

set -e

echo "🚀 Deploying CodeFreeze Board with AWS Amplify..."

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
if ! yarn cdk:run list --app "npx ts-node --prefer-ts-exts bin/cfb-amplify-cdk.ts" &> /dev/null; then
    echo "🔄 Bootstrapping CDK..."
    yarn cdk:run bootstrap --app "npx ts-node --prefer-ts-exts bin/cfb-amplify-cdk.ts" --profile PowerUserAccess-094009463545
fi

# Deploy the Amplify stack
echo "🚀 Deploying Amplify stack..."
yarn cdk:run deploy --app "npx ts-node --prefer-ts-exts bin/cfb-amplify-cdk.ts" --profile PowerUserAccess-094009463545

echo "✅ Amplify deployment complete!"
echo "🌐 Your site will be available at: https://demo.cfb.rinkkasatiainen.dev"
echo "📝 Note: You'll need to:"
echo "   1. Create a GitHub token in AWS Secrets Manager"
echo "   2. Update the githubRepo in the deployment"
echo "   3. Ensure your UI code is in the 'ui' folder of your repo" 