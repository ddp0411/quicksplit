# Prerequisites Installation Guide

## Current Status Check

Based on the system check, here's what needs to be installed:

### ✅ Installed
- **Python 3.14.2** - Ready to use

### ❌ Missing
- **PostgreSQL** - Database server
- **Redis** - Task queue broker
- **Node.js** - Frontend runtime

## Quick Installation (macOS with Homebrew)

### Option 1: Automated Installation Script

```bash
chmod +x scripts/install-prerequisites.sh
./scripts/install-prerequisites.sh
```

This script will:
1. Install Homebrew (if not installed)
2. Install PostgreSQL and create the database
3. Install Redis and start the service
4. Install Node.js
5. Install Tesseract OCR (for OCR functionality)

### Option 2: Manual Installation

#### 1. Install Homebrew (if not installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Add to your shell profile (`~/.zshrc` or `~/.bash_profile`):
```bash
eval "$(/opt/homebrew/bin/brew shellenv)"
```

#### 2. Install PostgreSQL
```bash
brew install postgresql@15
brew services start postgresql@15
createdb quicksplit
```

#### 3. Install Redis
```bash
brew install redis
brew services start redis
```

#### 4. Install Node.js
```bash
brew install node
```

#### 5. Install Tesseract OCR (Optional but Recommended)
```bash
brew install tesseract
```

## Verify Installation

After installation, verify everything is working:

```bash
# Check Python
python3 --version

# Check Node.js
node --version
npm --version

# Check PostgreSQL
psql --version
pg_isready

# Check Redis
redis-cli ping
# Should return: PONG

# Check Tesseract
tesseract --version
```

## Alternative: Using Docker

If you prefer not to install these services directly, you can use Docker:

```bash
# Install Docker Desktop from https://www.docker.com/products/docker-desktop
# Then use docker-compose
docker-compose up -d postgres redis
```

## Troubleshooting

### PostgreSQL Issues
- **Service not starting**: `brew services restart postgresql@15`
- **Database creation fails**: Check PostgreSQL is running with `pg_isready`
- **Connection refused**: Ensure PostgreSQL is listening on port 5432

### Redis Issues
- **Service not starting**: `brew services restart redis`
- **Connection refused**: Ensure Redis is listening on port 6379
- **Test connection**: `redis-cli ping` should return `PONG`

### Node.js Issues
- **Command not found**: Restart your terminal after installation
- **Version check**: `node --version` should show v18 or higher

### Homebrew Issues
- **Command not found**: Add Homebrew to PATH (see step 1)
- **Permission denied**: `sudo chown -R $(whoami) /opt/homebrew` (for Apple Silicon)

## Next Steps

Once all prerequisites are installed:

1. **Run setup script**:
   ```bash
   ./scripts/setup.sh
   ```

2. **Start the application**:
   ```bash
   ./scripts/start-dev.sh
   ```

3. **Access the app**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:9000
   - API Docs: http://localhost:9000/docs
