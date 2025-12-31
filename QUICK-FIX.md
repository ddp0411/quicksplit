# Quick Fix for Pillow Installation Error

## The Problem
Pillow is failing to build with Python 3.14 due to compatibility issues.

## Quick Solution

Run these commands in order:

```bash
# 1. Install system dependencies for Pillow (macOS)
brew install libjpeg zlib libpng libtiff freetype

# 2. Go to backend directory
cd backend

# 3. Activate virtual environment (or create if needed)
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

# 4. Upgrade build tools
pip install --upgrade pip setuptools wheel

# 5. Try installing Pillow with pre-built wheel first
pip install --only-binary :all: Pillow || pip install Pillow

# 6. Install all other requirements
pip install -r requirements.txt
```

## Alternative: Use the Installation Script

```bash
cd backend
chmod +x install-requirements.sh
./install-requirements.sh
```

## If Still Failing: Use Python 3.11

If Python 3.14 continues to cause issues, use Python 3.11:

```bash
# Install Python 3.11
brew install python@3.11

# Remove old venv and create new one
cd backend
rm -rf venv
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

