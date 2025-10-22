Chacole — Quick start

FastAPI backend (WebSocket) + React (Vite) frontend — แชทนิรนาม

Docker (แนะนำ)
1. คัดลอก env (ถ้าต้องการ):
   cp .env.example .env
2. สตาร์ททั้งโปรเจกต์:
```
docker compose up --build
```
เปิด: http://localhost:5173 (frontend)  |  http://localhost:8000 (backend)

Local (ไม่ใช้ Docker)
- Backend (venv):
```
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
- Frontend:
```
cd frontend
npm install
npm run dev
```

Note: frontend ใช้ `VITE_API_URL` เพื่อชี้ backend (default: http://localhost:8000)
