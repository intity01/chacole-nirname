import uuid
import random

# รายชื่อสำหรับสุ่มชื่อผู้ใช้นิรนาม
ANONYMOUS_NAMES = [
    "นกเงือก", "เสือดาว", "ช้างป่า", "กิ้งก่า", "ปลาโลมา",
    "นกแก้ว", "หมีแพนด้า", "กบเขียว", "ผีเสื้อ", "แมวป่า",
    "นกฮูก", "กวางป่า", "ปลาวาฬ", "จิงโจ้", "หมาป่า",
    "นกกระรอก", "เต่าทะเล", "ลิงลม", "กบน้ำ", "นกเพนกวิน"
]

def generate_anonymous_name() -> str:
    """สร้างชื่อนิรนามแบบสุ่ม"""
    return f"{random.choice(ANONYMOUS_NAMES)}{random.randint(100, 999)}"

def generate_room_id() -> str:
    """สร้าง Room ID แบบสุ่ม"""
    return str(uuid.uuid4())[:8].upper()
