#!/bin/bash

# Install Dependencies Script
# This script installs all project dependencies

set -e

echo "📦 Installing QuickSplit Dependencies"
echo "======================================"
echo ""

# Install Frontend Dependencies
echo "📦 Installing frontend dependencies..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi

cd ..

# Install Backend Dependencies
echo ""
echo "📦 Setting up Python virtual environment..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Upgrading pip..."
pip install --upgrade pip --quiet

echo "Installing Python packages..."
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    echo "✅ Backend dependencies installed"
else
    echo "❌ requirements.txt not found"
    exit 1
fi

cd ..

echo ""
echo "✅ All dependencies installed successfully!"
echo ""
echo "You can now start the application with:"
echo "  ./scripts/start-dev.sh"

