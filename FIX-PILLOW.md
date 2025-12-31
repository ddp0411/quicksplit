# Fixing Pillow Installation Error

## Problem
Pillow is failing to build with Python 3.14 due to compatibility issues.

## Solution Options

### Option 1: Install System Dependencies First (Recommended)

On macOS, install Pillow's system dependencies:

```bash
brew install libjpeg zlib libpng libtiff freetype
```

Then install Python packages:

```bash
cd backend
source venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

### Option 2: Use Pre-built Wheel

Try installing Pillow from a pre-built wheel:

```bash
cd backend
source venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install --only-binary :all: Pillow
pip install -r requirements.txt
```

### Option 3: Install Pillow Separately

Install Pillow first with build flags:

```bash
cd backend
source venv/bin/activate
pip install --upgrade pip setuptools wheel

# Set build flags (macOS)
export CFLAGS="-I$(brew --prefix)/include"
export LDFLAGS="-L$(brew --prefix)/lib"

# Install Pillow
pip install Pillow

# Then install other requirements
pip install -r requirements.txt
```

### Option 4: Use Python 3.11 or 3.12 (Most Reliable)

If Python 3.14 continues to cause issues, use Python 3.11 or 3.12:

```bash
# Install Python 3.11 via Homebrew
brew install python@3.11

# Create venv with Python 3.11
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

### Option 5: Use the Installation Script

Run the provided script:

```bash
cd backend
chmod +x install-requirements.sh
./install-requirements.sh
```

## Quick Fix Command

Run this single command:

```bash
cd backend && \
brew install libjpeg zlib libpng libtiff freetype 2>/dev/null; \
source venv/bin/activate && \
pip install --upgrade pip setuptools wheel && \
pip install -r requirements.txt
```

## Verify Installation

After installation, verify:

```bash
cd backend
source venv/bin/activate
python -c "from PIL import Image; print('Pillow installed successfully!')"
```

If this works, you're good to go!

