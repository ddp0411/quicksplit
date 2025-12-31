#!/bin/bash

# QuickSplit Prerequisites Installation Script
# This script installs all required prerequisites for QuickSplit

echo "🔍 Checking prerequisites for QuickSplit..."
echo ""

# Check for Homebrew
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew is not installed."
    echo "   Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH
    if [ -f "/opt/homebrew/bin/brew" ]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
        eval "$(/opt/homebrew/bin/brew shellenv)"
    elif [ -f "/usr/local/bin/brew" ]; then
        echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zshrc
        eval "$(/usr/local/bin/brew shellenv)"
    fi
else
    echo "✅ Homebrew is installed"
fi

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | awk '{print $2}')
    echo "✅ Python $PYTHON_VERSION is installed"
else
    echo "❌ Python 3 is not installed"
    echo "   Installing Python..."
    brew install python@3.11
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js $NODE_VERSION is installed"
else
    echo "❌ Node.js is not installed"
    echo "   Installing Node.js..."
    brew install node
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL is installed"
    # Check if PostgreSQL is running
    if pg_isready -h localhost -p 5432 &> /dev/null; then
        echo "✅ PostgreSQL is running"
    else
        echo "⚠️  PostgreSQL is installed but not running"
        echo "   Starting PostgreSQL..."
        brew services start postgresql@15 || brew services start postgresql
    fi
    
    # Create database if it doesn't exist
    if psql -lqt | cut -d \| -f 1 | grep -qw quicksplit; then
        echo "✅ Database 'quicksplit' already exists"
    else
        echo "📦 Creating database 'quicksplit'..."
        createdb quicksplit || psql -U postgres -c "CREATE DATABASE quicksplit;"
        echo "✅ Database 'quicksplit' created"
    fi
else
    echo "❌ PostgreSQL is not installed"
    echo "   Installing PostgreSQL..."
    brew install postgresql@15
    brew services start postgresql@15
    
    # Create database
    echo "📦 Creating database 'quicksplit'..."
    createdb quicksplit
    echo "✅ Database 'quicksplit' created"
fi

# Check Redis
if command -v redis-server &> /dev/null; then
    echo "✅ Redis is installed"
    # Check if Redis is running
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis is running"
    else
        echo "⚠️  Redis is installed but not running"
        echo "   Starting Redis..."
        brew services start redis
    fi
else
    echo "❌ Redis is not installed"
    echo "   Installing Redis..."
    brew install redis
    brew services start redis
    echo "✅ Redis installed and started"
fi

# Check Tesseract OCR
if command -v tesseract &> /dev/null; then
    echo "✅ Tesseract OCR is installed"
else
    echo "⚠️  Tesseract OCR is not installed (optional but recommended)"
    echo "   Installing Tesseract OCR..."
    brew install tesseract
    echo "✅ Tesseract OCR installed"
fi

echo ""
echo "✅ All prerequisites check complete!"
echo ""
echo "Summary:"
echo "  - Python: $(python3 --version 2>/dev/null || echo 'Not installed')"
echo "  - Node.js: $(node --version 2>/dev/null || echo 'Not installed')"
echo "  - PostgreSQL: $(psql --version 2>/dev/null | head -1 || echo 'Not installed')"
echo "  - Redis: $(redis-server --version 2>/dev/null | head -1 || echo 'Not installed')"
echo "  - Tesseract: $(tesseract --version 2>/dev/null | head -1 || echo 'Not installed')"
echo ""
echo "Next steps:"
echo "  1. Run: ./scripts/setup.sh"
echo "  2. Run: ./scripts/start-dev.sh"

