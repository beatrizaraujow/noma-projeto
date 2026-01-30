#!/bin/bash

# NUMA Health Check Script
# Checks if all services are running correctly

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_URL=${API_URL:-http://localhost:3001}
WEB_URL=${WEB_URL:-http://localhost:3000}

echo "🏥 Running health checks..."
echo ""

# Check API
echo -n "Checking API ($API_URL)... "
if curl -f -s "$API_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
    exit 1
fi

# Check Web
echo -n "Checking Web ($WEB_URL)... "
if curl -f -s "$WEB_URL" > /dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
    exit 1
fi

# Check PostgreSQL
echo -n "Checking PostgreSQL... "
if docker ps | grep -q postgres; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  Not running via Docker${NC}"
fi

# Check Redis
echo -n "Checking Redis... "
if docker ps | grep -q redis; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  Not running via Docker${NC}"
fi

# Check MongoDB
echo -n "Checking MongoDB... "
if docker ps | grep -q mongodb; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  Not running via Docker${NC}"
fi

echo ""
echo -e "${GREEN}🎉 All health checks passed!${NC}"
