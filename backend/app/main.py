# FastAPI app instance
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import routes_auth, routes_ocr, routes_split, routes_dataset
from app.core.config import settings

app = FastAPI(
    title="QuickSplit API",
    description="API for QuickSplit bill splitting application",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(routes_auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(routes_ocr.router, prefix="/api/v1/ocr", tags=["ocr"])
app.include_router(routes_split.router, prefix="/api/v1/split", tags=["split"])
app.include_router(routes_dataset.router, prefix="/api/v1/dataset", tags=["dataset"])


@app.get("/")
async def root():
    return {"message": "QuickSplit API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

