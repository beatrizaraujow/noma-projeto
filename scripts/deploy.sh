#!/bin/bash

# NUMA Deploy Script
# Usage: ./scripts/deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-production}

echo "🚀 Starting deployment to $ENVIRONMENT..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Run this script from project root.${NC}"
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}Warning: You have uncommitted changes${NC}"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🧪 Running tests..."
pnpm test || {
    echo -e "${RED}Tests failed! Aborting deployment.${NC}"
    exit 1
}

echo "🔍 Running linter..."
pnpm lint || {
    echo -e "${YELLOW}Linting issues found. Consider fixing them.${NC}"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}

echo "🏗️  Building applications..."
pnpm build || {
    echo -e "${RED}Build failed! Aborting deployment.${NC}"
    exit 1
}

if [ "$ENVIRONMENT" == "production" ]; then
    echo "🚀 Deploying to PRODUCTION..."
    
    # Git tag
    VERSION=$(node -p "require('./package.json').version")
    git tag -a "v$VERSION" -m "Production release v$VERSION"
    git push origin "v$VERSION"
    
    # Deploy commands here
    echo -e "${GREEN}✅ Production deployment complete!${NC}"
    
elif [ "$ENVIRONMENT" == "staging" ]; then
    echo "🚀 Deploying to STAGING..."
    
    # Deploy commands here
    echo -e "${GREEN}✅ Staging deployment complete!${NC}"
    
else
    echo -e "${RED}Invalid environment: $ENVIRONMENT${NC}"
    echo "Usage: ./scripts/deploy.sh [staging|production]"
    exit 1
fi

echo -e "${GREEN}🎉 Deployment successful!${NC}"
