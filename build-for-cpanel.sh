#!/bin/bash

# SolNet CPanel Deployment Build Script
# This script builds and prepares the application for CPanel deployment

set -e  # Exit on any error

echo "🚀 Starting SolNet CPanel Build Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Step 1: Clean previous builds
echo -e "${YELLOW}📦 Cleaning previous builds...${NC}"
rm -rf dist/
echo -e "${GREEN}✓ Build directory cleaned${NC}"

# Step 2: Install dependencies
echo -e "${YELLOW}📥 Installing dependencies...${NC}"
npm ci
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 3: Build client
echo -e "${YELLOW}🏗️  Building client (React + Vite)...${NC}"
npm run build:client
echo -e "${GREEN}✓ Client built successfully${NC}"

# Step 4: Build server
echo -e "${YELLOW}🏗️  Building server (Express + Node.js)...${NC}"
npm run build:server
echo -e "${GREEN}✓ Server built successfully${NC}"

# Step 5: Verify build
echo -e "${YELLOW}🔍 Verifying build...${NC}"
if [ ! -d "dist/public" ]; then
    echo -e "${RED}❌ Error: dist/public directory not found${NC}"
    exit 1
fi

if [ ! -f "dist/server/index.js" ]; then
    echo -e "${RED}❌ Error: dist/server/index.js not found${NC}"
    exit 1
fi

if [ ! -f "dist/public/index.html" ]; then
    echo -e "${RED}❌ Error: dist/public/index.html not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build verification passed${NC}"

# Step 6: Copy .htaccess for CPanel
echo -e "${YELLOW}📝 Copying .htaccess for CPanel...${NC}"
if [ -f "public/.htaccess" ]; then
    cp public/.htaccess dist/public/.htaccess
    echo -e "${GREEN}✓ .htaccess copied${NC}"
else
    echo -e "${YELLOW}⚠ Warning: public/.htaccess not found, skipping...${NC}"
fi

# Step 7: Create deployment archive
echo -e "${YELLOW}📦 Creating deployment archive...${NC}"
tar -czf solnet-cpanel-deploy.tar.gz \
    dist/ \
    package.json \
    package-lock.json \
    public/.htaccess \
    CPANEL_DEPLOYMENT.md \
    server-cpanel.js 2>/dev/null || echo -e "${YELLOW}⚠ Some optional files not found, continuing...${NC}"

echo -e "${GREEN}✓ Archive created: solnet-cpanel-deploy.tar.gz${NC}"

# Step 8: Display build summary
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Build Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "\n${YELLOW}Build Summary:${NC}"
echo -e "  - Client build: ${GREEN}✓${NC}"
echo -e "  - Server build: ${GREEN}✓${NC}"
echo -e "  - Archive: ${GREEN}solnet-cpanel-deploy.tar.gz${NC}"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "  1. Upload solnet-cpanel-deploy.tar.gz to your CPanel hosting"
echo -e "  2. Extract the archive in your public_html directory"
echo -e "  3. Configure your .env file with production settings"
echo -e "  4. Run 'npm install --production' on the server"
echo -e "  5. Start the application with 'npm run start:cpanel'"
echo -e "  6. See CPANEL_DEPLOYMENT.md for detailed instructions"
echo -e "\n${GREEN}Build directory ready for deployment!${NC}\n"


