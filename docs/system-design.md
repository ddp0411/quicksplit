# QuickSplit System Design

## Overview

QuickSplit is a receipt OCR and UPI collection app for India. The frontend performs fast OCR in the browser, the backend validates the extracted text and total, and split/payment records are stored for authenticated users.

## Architecture

Frontend:
- React 18, TypeScript, Vite
- Tesseract.js OCR in the client
- Canvas-based image resize, binarization, and SHA-256 hashing
- Zustand stores for user, OCR, and split state
- React Query for API mutations and cached reads
- PWA manifest for installable Android/iOS browser use

Backend:
- FastAPI with dependency-injected auth and async DB sessions
- Async SQLAlchemy against PostgreSQL
- JWT access tokens and passlib bcrypt password hashes
- Redis caching for OCR validation, split calculations, and session lookups
- Celery workers for OCR post-processing, dataset normalization/export, and cleanup
- Dataset storage under `dataset/raw`, `dataset/processed`, and `dataset/annotations`

## OCR Flow

1. User uploads a receipt or captures it with the camera.
2. Frontend resizes and preprocesses the image with Canvas.
3. Tesseract.js extracts OCR text and confidence.
4. Frontend detects a bill total using total keywords such as `Grand Total`, `Amount Due`, and `Total Amount`.
5. If no strong keyword match is found, frontend falls back to the largest detected amount.
6. Frontend sends OCR text, detected total, and image hash to `POST /api/v1/ocr/validate`.
7. Backend repeats detection, scores confidence, caches the validation result, and returns the suggested total.

## Split Flow

1. User confirms the detected total.
2. User adds participants and optional UPI IDs.
3. Frontend and backend both use paisa-based integer math.
4. Base paisa amount is assigned to everyone.
5. Remaining paisa are distributed to the first participants deterministically.
6. Backend creates participant records, UPI links, and QR code data URIs.

## Data Model

Users:
- `id`, `email`, `name`, `hashed_password`, `is_active`, timestamps

Splits:
- `id`, `user_id`, `total_amount`, `split_type`, `metadata`, timestamps

Participants:
- `id`, `split_id`, `name`, `upi_id`, `amount`, `payment_status`, timestamps

Dataset entries:
- `id`, `user_id`, `image_path`, `image_hash`, `ocr_text`, `detected_total`, `actual_total`, `confidence`, `metadata`, `annotations`, verification status

## API Endpoints

Authentication:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

OCR:
- `POST /api/v1/ocr/upload`
- `POST /api/v1/ocr/validate`

Splits:
- `POST /api/v1/splits/create`
- `GET /api/v1/splits/history`
- `GET /api/v1/splits/{split_id}`
- `POST /api/v1/splits/{split_id}/participants/{participant_id}/paid`

Dataset:
- `POST /api/v1/dataset/submit`
- `GET /api/v1/dataset/stats`

## Background Jobs

- `process_ocr_background`: placeholder hook for enhanced OCR post-processing
- `process_dataset_entry`: normalize OCR text and prepare labels
- `export_dataset_coco`: export dataset annotations to COCO-style JSON
- `cleanup_old_uploads`: remove stale uploaded files
- `cleanup_temp_files`: remove temporary processing files

## Deployment

`docker-compose.yml` starts PostgreSQL, Redis, FastAPI, Celery worker, Celery beat, and the frontend dev server. Production deployments should replace the default secret key, mount durable upload/dataset storage, and serve the frontend build through a static server or CDN.
