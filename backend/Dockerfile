FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/uploads /app/dataset /app/logs

# The app listens on $PORT (injected by Railway/Render at runtime; falls back to
# 9000 locally). We intentionally do NOT hardcode `EXPOSE <port>`: the platform
# derives the public target port, and a fixed EXPOSE that differs from $PORT makes
# it route to the wrong port (the app boots fine but every request 502s).

# Run application: migrate, collect static for WhiteNoise, serve via gunicorn
CMD ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn quicksplit.wsgi:application --bind 0.0.0.0:${PORT:-9000} --workers 3 --timeout 120"]
