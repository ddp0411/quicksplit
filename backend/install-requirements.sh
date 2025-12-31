#!/bin/bash

# Install backend requirements with proper build tools
# This script handles Pillow installation issues with Python 3.14

set -e

echo "📦 Installing backend requirements..."
echo ""

# Activate virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

echo "Upgrading pip, setuptools, and wheel..."
pip install --upgrade pip setuptools wheel

echo ""
echo "Installing system dependencies for Pillow (if on macOS)..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # Check if Homebrew is available
    if command -v brew &> /dev/null; then
        echo "Installing Pillow dependencies via Homebrew..."
        brew install libjpeg zlib libpng libtiff freetype 2>/dev/null || echo "Some dependencies may already be installed"
    fi
fi

echo ""
echo "Installing Python packages..."

# Try installing Pillow first with pre-built wheels
pip install --only-binary :all: Pillow 2>/dev/null || {
    echo "Pre-built wheel not available, building from source..."
    # Install build dependencies
    pip install --upgrade pip setuptools wheel
    # Try installing with specific flags
    export CFLAGS="-I$(brew --prefix)/include" 2>/dev/null || true
    export LDFLAGS="-L$(brew --prefix)/lib" 2>/dev/null || true
    pip install Pillow
}

# Install other requirements
echo "Installing other requirements..."
pip install -r requirements.txt

echo ""
echo "✅ Backend requirements installed successfully!"

