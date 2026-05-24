\# 🚀 QuickSplit – Full Project Generation Prompt

You are a \*\*senior full-stack engineer \+ AI systems architect\*\*.

Your task is to \*\*generate the ENTIRE QuickSplit project from scratch\*\*, including:  
\- Complete folder & file structure  
\- Production-ready code for frontend and backend  
\- Clear separation of concerns  
\- Best practices for scalability, security, and performance

This project must be \*\*fully functional\*\*, \*\*cleanly structured\*\*, and \*\*ready for deployment\*\*.

\---

\#\# 📌 PROJECT OVERVIEW

\*\*Project Name:\*\* QuickSplit    
\*\*Description:\*\*    
QuickSplit is an AI-powered bill scanning and instant expense splitting web application.    
It allows users to scan bills using OCR, automatically detect totals, split amounts among participants, and generate UPI deep links and QR codes for instant payment.

\*\*Target Platform:\*\*    
\- Web (PWA-ready for mobile)

\*\*Architecture:\*\*    
\- RESTful API  
\- Async/await everywhere  
\- Frontend-heavy OCR \+ backend validation  
\- Scalable, modular design

\---

\#\# 🧱 TECH STACK (STRICT – DO NOT CHANGE)

\#\#\# Frontend  
\- React 18.3+  
\- TypeScript 5+  
\- Vite 5+  
\- Zustand 4.5+ (local state)  
\- TanStack Query (React Query) 5+  
\- Tailwind CSS 3.4+  
\- Headless UI 2.0+  
\- Framer Motion 11+  
\- React Hook Form 7.50+  
\- Zod 3.22+  
\- Tesseract.js 5.0+  
\- React Webcam 7.2+  
\- Canvas API  
\- React Router DOM 6.20+  
\- qrcode.react 3.1+

\#\#\# Backend  
\- FastAPI 0.110+  
\- Python 3.12+  
\- Pydantic 2.6+  
\- SQLAlchemy 2.0 (async)  
\- PostgreSQL 16+  
\- Alembic 1.13+  
\- Redis 7.2+  
\- Celery 5.3+  
\- Uvicorn 0.27+  
\- python-jose (JWT)  
\- passlib  
\- python-multipart

\#\#\# DevOps  
\- Docker  
\- Docker Compose  
\- Environment-based config  
\- Production-ready settings

\---

\#\# 🎯 CORE FEATURES (MUST IMPLEMENT ALL)

\#\#\# 1\. OCR Bill Scanning  
\- Frontend OCR using Tesseract.js  
\- Image preprocessing via Canvas API  
\- Upload OCR results to backend for validation  
\- Support camera \+ image upload

\#\#\# 2\. Bill Total Detection  
\- Keyword-based detection (Total, Amount Due, Grand Total)  
\- Fallback to largest detected number  
\- Confidence scoring

\#\#\# 3\. Bill Splitting  
\- Equal split (MVP)  
\- Paisa-based rounding logic  
\- Deterministic distribution of remainder

\#\#\# 4\. UPI Payment Integration  
\- Generate UPI deep links  
\- Generate QR codes per participant  
\- Support all Indian UPI apps

\#\#\# 5\. Authentication  
\- JWT-based authentication  
\- Login / Register APIs  
\- Password hashing using passlib

\#\#\# 6\. Dataset Collection for AI Training  
\- Store raw receipt images  
\- Store OCR text output  
\- Store normalized totals  
\- Metadata & annotations for training  
\- Dataset export scripts

\#\#\# 7\. Background Processing  
\- Celery workers for:  
  \- OCR post-processing  
  \- Dataset normalization  
  \- Cleanup tasks

\#\#\# 8\. Caching  
\- Redis caching for:  
  \- OCR results  
  \- Split calculations  
  \- User sessions

\---

\#\# 📁 REQUIRED PROJECT STRUCTURE

You MUST generate \*\*this exact structure with full code inside every file\*\*:

quicksplit/  
├── frontend/  
│ ├── public/  
│ ├── src/  
│ │ ├── app/  
│ │ ├── components/  
│ │ ├── hooks/  
│ │ ├── pages/  
│ │ ├── routes/  
│ │ ├── services/  
│ │ ├── state/  
│ │ ├── utils/  
│ │ ├── styles/  
│ │ └── main.tsx  
│ ├── index.html  
│ ├── vite.config.ts  
│ ├── tsconfig.json  
│ └── package.json  
│  
├── backend/  
│ ├── app/  
│ │ ├── core/  
│ │ ├── api/  
│ │ ├── models/  
│ │ ├── schemas/  
│ │ ├── services/  
│ │ ├── tasks/  
│ │ ├── utils/  
│ │ └── main.py  
│ ├── migrations/  
│ ├── tests/  
│ ├── requirements.txt  
│ └── Dockerfile  
│  
├── dataset/  
│ ├── raw/  
│ ├── processed/  
│ ├── annotations/  
│ └── scripts/  
│  
├── docs/  
├── docker-compose.yml  
└── [README.md](http://README.md)

\---

\#\# 🧠 IMPLEMENTATION RULES

\- Use \*\*TypeScript everywhere on frontend\*\*  
\- Use \*\*async SQLAlchemy sessions\*\*  
\- Use \*\*dependency injection in FastAPI\*\*  
\- Use \*\*Zod schemas mirrored with Pydantic schemas\*\*  
\- Keep code \*\*modular and readable\*\*  
\- Add \*\*inline comments\*\* explaining complex logic  
\- Follow \*\*production-grade best practices\*\*  
\- Ensure \*\*API routes, services, and models are separated\*\*  
\- Frontend must be \*\*fully wired to backend APIs\*\*

\---

\#\# 📦 OUTPUT FORMAT (VERY IMPORTANT)

You MUST output:

1\. The \*\*complete folder tree\*\*  
2\. \*\*Every file name\*\*  
3\. \*\*Full code inside every file\*\*  
4\. Code blocks must be clearly labeled with file paths, for example:

\`\`\`ts  
// frontend/src/pages/Home.tsx  
\<full code here\>

\# backend/app/main.py  
\<full code here\>

Do NOT skip files.  
 Do NOT use placeholders.  
 Do NOT say “implementation omitted”.

---

## **🏁 FINAL GOAL**

At the end, the generated project should:

* Run locally with `docker-compose up`  
* Frontend should connect to backend  
* OCR → Split → UPI QR flow should work end-to-end  
* Dataset should be ready for AI training  
* Code should be clean, readable, and extensible

