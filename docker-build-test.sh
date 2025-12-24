#!/bin/bash
# Docker build test script for Railway deployment

set -e

echo "🐳 Building Docker image..."
docker build -t uv-app:test .

echo "✅ Docker build successful!"

echo "🚀 Testing container startup..."
docker run --rm -d --name uv-app-test -p 8080:8080 uv-app:test

echo "⏳ Waiting for container to start..."
sleep 5

echo "🔍 Checking if container is running..."
if docker ps | grep -q uv-app-test; then
    echo "✅ Container is running!"

    echo "🛑 Stopping test container..."
    docker stop uv-app-test

    echo "✨ All tests passed! Docker build is ready for Railway deployment."
else
    echo "❌ Container failed to start"
    docker logs uv-app-test
    exit 1
fi
