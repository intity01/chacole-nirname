from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api_router import router as api_router
import os

app = FastAPI(title="Anonymous Chat API", version="1.0.0")

# Get allowed origins from environment variable
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# CORS middleware สำหรับให้ Frontend เชื่อมต่อได้
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# รวม API router จากไฟล์ api_router.py
app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "Anonymous Chat API is running", "version": "1.0.0", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Health check endpoint สำหรับ monitoring"""
    return {
        "status": "healthy",
        "service": "chacole-backend",
        "websocket_support": True
    }

if __name__ == "__main__":
    import uvicorn
    # ใช้สำหรับทดสอบรันไฟล์นี้โดยตรง
    # เพิ่ม ws_ping_interval และ ws_ping_timeout สำหรับ WebSocket
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        ws_ping_interval=20,
        ws_ping_timeout=20
    )

