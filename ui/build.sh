#!/bin/bash

# CodeFreeze Board UI Build Script

set -e

echo "🔨 Building CodeFreeze Board UI..."

# Create build directory
rm -rf build/dist
mkdir -p build/dist

# Copy all UI files to build/dist
echo "📁 Copying UI files..."
cp -r assets build/dist/ 2>/dev/null || true
cp -r node_modules/@rinkkasatiainen build/dist/ 2>/dev/null || true
cp -r *.js build/dist/ 2>/dev/null || true
cp -r *.css build/dist/ 2>/dev/null || true
cp -r *.html build/dist/ 2>/dev/null || true
# Replace node_modules/@rinkkasatiainen/ with @rinkkasatiainen in HTML files
echo "🔄 Updating import paths in HTML files..."
find build/dist -name "*.html" -exec sed -i '' 's|./node_modules/@rinkkasatiainen/|./@rinkkasatiainen/|g' {} \;

# Copy node_modules for ES modules
echo "📦 Copying node_modules..."
cp -r node_modules/@rinkkasatiainen build/dist/ 2>/dev/null || true

# Copy _public directory
echo "📁 Copying _public directory..."
cp -r _public build/dist/ 2>/dev/null || true

# Ensure mockServiceWorker.js is in the root of build/dist
echo "🔧 Ensuring mockServiceWorker.js is accessible..."
if [ -f "mockServiceWorker.js" ]; then
    cp mockServiceWorker.js build/dist/
    echo "✅ mockServiceWorker.js copied to build/dist/"
else
    echo "⚠️  mockServiceWorker.js not found in ui directory"
fi

echo "✅ UI build complete! Files are in build/dist/"
echo "🚀 Ready for CDK deployment"