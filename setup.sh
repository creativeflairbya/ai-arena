#!/bin/bash

# AI Studio - Automated Setup Script
# This script sets up everything you need to run the application

set -e  # Exit on error

echo "================================"
echo "AI Studio - Automated Setup"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    
    echo "Please enter your database connection string:"
    echo "(Example: postgresql://user:password@host:5432/database)"
    read -p "DATABASE_URL: " db_url
    
    echo "Creating JWT secret (random 32 characters)..."
    jwt_secret=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    
    cat > .env << EOF
# Database
DATABASE_URL=${db_url}

# JWT Secret (auto-generated)
JWT_SECRET=${jwt_secret}

# Optional AI Providers
REPLICATE_API_TOKEN=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    
    echo -e "${GREEN}✓ Created .env file${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Check if database is accessible
echo ""
echo "Checking database connection..."
if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
    
    # Push schema
    echo ""
    echo "Setting up database schema..."
    npx drizzle-kit push
    echo -e "${GREEN}✓ Database schema created${NC}"
    
    # Seed database
    echo ""
    echo "Creating master account..."
    npx tsx scripts/seed.ts
    echo -e "${GREEN}✓ Master account created${NC}"
else
    echo -e "${RED}✗ Could not connect to database${NC}"
    echo "Please check your DATABASE_URL in .env file"
    exit 1
fi

# Build application
echo ""
echo "Building application..."
npm run build
echo -e "${GREEN}✓ Application built successfully${NC}"

echo ""
echo "================================"
echo -e "${GREEN}Setup Complete! 🎉${NC}"
echo "================================"
echo ""
echo "Master Account Credentials:"
echo "  Email:    master@aistudio.com"
echo "  Password: Master@123456"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "Then open:"
echo "  http://localhost:3000/login"
echo ""
