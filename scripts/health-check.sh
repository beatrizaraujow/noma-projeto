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
SQLITE_DB_PATH=${SQLITE_DB_PATH:-packages/database/prisma/dev.db}

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

# Check SQLite
echo -n "Checking SQLite DB ($SQLITE_DB_PATH)... "
if [ -f "$SQLITE_DB_PATH" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 All health checks passed!${NC}"
