# QuickSplit System Design

## Overview
QuickSplit is a bill splitting application that uses OCR technology to extract receipt information and split costs among participants.

## Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Data Fetching**: React Query
- **UI Components**: Tailwind CSS + HeadlessUI
- **Routing**: React Router

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL (async with SQLAlchemy)
- **Task Queue**: Celery with Redis
- **OCR**: Tesseract OCR
- **Authentication**: JWT tokens

## Key Features

1. **OCR Receipt Scanning**
   - Upload receipt images
   - Extract items and totals using OCR
   - Process asynchronously with Celery

2. **Bill Splitting**
   - Create splits with multiple participants
   - Assign items to participants
   - Calculate individual amounts

3. **Payment Integration**
   - Generate UPI payment links
   - Create QR codes for payments

4. **Dataset Management**
   - Upload training datasets
   - Process and annotate images
   - Export in various formats

## Database Schema

### Users
- id (UUID)
- email (String)
- hashed_password (String)
- name (String)
- is_active (Boolean)
- created_at (DateTime)

### Splits
- id (UUID)
- user_id (UUID, FK)
- title (String)
- total_amount (Decimal)
- participants (JSON)
- items (JSON)
- status (String)
- created_at (DateTime)

### Datasets
- id (UUID)
- user_id (UUID, FK)
- name (String)
- file_path (String)
- status (String)
- total_images (Integer)
- processed_images (Integer)

## API Endpoints

### Authentication
- POST `/api/v1/auth/register` - Register new user
- POST `/api/v1/auth/login` - Login user
- GET `/api/v1/auth/me` - Get current user

### OCR
- POST `/api/v1/ocr/upload` - Upload receipt image
- POST `/api/v1/ocr/scan` - Scan receipt from base64
- GET `/api/v1/ocr/result/{task_id}` - Get OCR result

### Split
- POST `/api/v1/split/create` - Create split
- GET `/api/v1/split/{split_id}` - Get split
- GET `/api/v1/split/all` - Get all splits
- PUT `/api/v1/split/{split_id}` - Update split
- DELETE `/api/v1/split/{split_id}` - Delete split

### Dataset
- POST `/api/v1/dataset/upload` - Upload dataset
- GET `/api/v1/dataset/status/{dataset_id}` - Get dataset status

## Deployment

### Docker Compose
The application can be deployed using Docker Compose with:
- Frontend container
- Backend container
- PostgreSQL database
- Redis for Celery
- Celery worker

### Environment Variables
- Database connection strings
- JWT secret keys
- CORS origins
- File upload directories

