#!/bin/bash

# Complete Installation and Setup Script for QuickSplit
# Run this script to install all prerequisites and set up the project

set -e  # Exit on error

echo "🚀 QuickSplit - Complete Installation Script"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}This script is designed for macOS. Please install prerequisites manually.${NC}"
    exit 1
fi

# Check for Homebrew
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}Homebrew not found. Installing Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH
    if [ -f "/opt/homebrew/bin/brew" ]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
else
    echo -e "${GREEN}✅ Homebrew is installed${NC}"
fi

# Function to check and install package
check_and_install() {
    local package=$1
    local service_name=$2
    
    if command -v $package &> /dev/null; then
        echo -e "${GREEN}✅ $service_name is already installed${NC}"
        return 0
    else
        echo -e "${YELLOW}📦 Installing $service_name...${NC}"
        brew install $package
        echo -e "${GREEN}✅ $service_name installed${NC}"
        return 1
    fi
}

# Install PostgreSQL
if check_and_install "postgresql@15" "PostgreSQL"; then
    # Check if running
    if pg_isready -h localhost -p 5432 &> /dev/null; then
        echo -e "${GREEN}✅ PostgreSQL is running${NC}"
    else
        echo -e "${YELLOW}🚀 Starting PostgreSQL...${NC}"
        brew services start postgresql@15 || brew services start postgresql
    fi
else
    echo -e "${YELLOW}🚀 Starting PostgreSQL...${NC}"
    brew services start postgresql@15 || brew services start postgresql
fi

# Create database
echo -e "${YELLOW}📦 Creating database 'quicksplit'...${NC}"
if psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw quicksplit; then
    echo -e "${GREEN}✅ Database 'quicksplit' already exists${NC}"
else
    createdb quicksplit 2>/dev/null || psql postgres -c "CREATE DATABASE quicksplit;" 2>/dev/null || {
        echo -e "${RED}❌ Failed to create database. Please create manually:${NC}"
        echo "   createdb quicksplit"
    }
    echo -e "${GREEN}✅ Database 'quicksplit' created${NC}"
fi

# Install Redis
if check_and_install "redis" "Redis"; then
    # Check if running
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✅ Redis is running${NC}"
    else
        echo -e "${YELLOW}🚀 Starting Redis...${NC}"
        brew services start redis
    fi
else
    echo -e "${YELLOW}🚀 Starting Redis...${NC}"
    brew services start redis
fi

# Install Node.js
check_and_install "node" "Node.js"

# Install Tesseract OCR
check_and_install "tesseract" "Tesseract OCR"

# Verify Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ $PYTHON_VERSION is installed${NC}"
else
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    check_and_install "python@3.11" "Python 3.11"
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ Prerequisites Installation Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

# Now set up the project
echo -e "${YELLOW}📦 Setting up project dependencies...${NC}"
echo ""

# Frontend setup
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Frontend dependencies already installed${NC}"
fi
cd ..

# Backend setup
echo -e "${YELLOW}📦 Setting up Python virtual environment...${NC}"
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
else
    echo -e "${GREEN}✅ Virtual environment already exists${NC}"
fi

source venv/bin/activate
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
cd ..

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Next steps:"
echo "1. Start the application:"
echo "   ./scripts/start-dev.sh"
echo ""
echo "2. Or start manually:"
echo "   Terminal 1: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "   Terminal 2: cd backend && source venv/bin/activate && celery -A app.core.celery_app worker --loglevel=info"
echo "   Terminal 3: cd frontend && npm run dev"
echo ""
echo "3. Access the app:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"

