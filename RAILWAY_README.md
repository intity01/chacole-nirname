# Chacole Anonymous Chat - Railway Deployment

## Quick Start

โปรเจกต์นี้พร้อม deploy บน Railway แล้ว!

### ขั้นตอนสั้นๆ

1. **Push ขึ้น GitHub**
   ```bash
   git add .
   git commit -m "Ready for Railway deployment"
   git push
   ```

2. **Deploy Backend**
   - เข้า https://railway.app
   - New Project → Deploy from GitHub repo
   - เลือก repo นี้
   - Settings → Root Directory: `backend`
   - Variables → เพิ่ม: `ALLOWED_ORIGINS=*`
   - Settings → Networking → Generate Domain
   - บันทึก backend domain

3. **Deploy Frontend**
   - ใน project เดียวกัน → + New → GitHub Repo
   - เลือก repo เดียวกัน
   - Settings → Root Directory: `frontend`
   - Variables → เพิ่ม:
     ```
     VITE_BACKEND_URL = your-backend-domain.up.railway.app
     VITE_API_URL = https://your-backend-domain.up.railway.app
     VITE_WS_URL = wss://your-backend-domain.up.railway.app
     ```
   - Settings → Networking → Generate Domain

4. **ทดสอบ**
   - เปิด frontend URL
   - สร้างห้องและทดสอบแชท

## ไฟล์ Configuration

โปรเจกต์นี้มีไฟล์ configuration สำหรับ Railway:

- `backend/railway.json` - Backend deployment config
- `backend/nixpacks.toml` - Backend build config
- `frontend/railway.json` - Frontend deployment config
- `frontend/vite.config.js` - ปรับแล้วสำหรับ Railway

## คู่มือเต็ม

ดูคู่มือการ deploy แบบละเอียดใน `RAILWAY_DEPLOYMENT_GUIDE.md`

## ค่าใช้จ่าย

Railway ให้ **$5 free credit/month** ซึ่งเพียงพอสำหรับโปรเจกต์นี้

## Support

หากมีปัญหา:
1. ตรวจสอบ logs ใน Railway dashboard
2. ตรวจสอบ console logs ใน browser (F12)
3. อ่านคู่มือ `RAILWAY_DEPLOYMENT_GUIDE.md`

