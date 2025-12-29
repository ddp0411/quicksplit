# QuickSplit

A modern bill splitting application that uses OCR technology to extract receipt information and split costs among participants.

## Features

- 📸 **OCR Receipt Scanning** - Upload or scan receipts to extract items and totals
- 💰 **Bill Splitting** - Split bills among multiple participants
- 📱 **UPI Integration** - Generate UPI payment links and QR codes
- 📊 **Dataset Management** - Upload and process training datasets
- 🔐 **Authentication** - Secure user authentication with JWT

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Zustand (State Management)
- React Query (Data Fetching)
- Tailwind CSS + HeadlessUI
- React Router

### Backend
- FastAPI
- PostgreSQL (async)
- Celery + Redis
- Tesseract OCR
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL
- Redis
- Docker & Docker Compose (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd quicksplit
```

2. Backend Setup:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Frontend Setup:
```bash
cd frontend
npm install
```

4. Environment Variables:
Create `.env` files in both `backend/` and `frontend/` directories with required configuration.

### Running the Application

#### Using Docker Compose (Recommended)
```bash
docker-compose up
```

#### Manual Setup

1. Start PostgreSQL and Redis
2. Run database migrations:
```bash
cd backend
alembic upgrade head
```

3. Start backend:
```bash
cd backend
uvicorn app.main:app --reload
```

4. Start Celery worker:
```bash
cd backend
celery -A app.core.celery_app worker --loglevel=info
```

5. Start frontend:
```bash
cd frontend
npm run dev
```

## Project Structure

```
quicksplit/
├── frontend/          # React frontend application
├── backend/           # FastAPI backend application
├── dataset/           # AI training dataset
├── docs/              # Documentation
└── docker-compose.yml # Docker configuration
```

## API Documentation

API documentation is available at `/docs` when the backend is running (Swagger UI).

## License

MIT

