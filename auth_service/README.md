# JobBridge FastAPI Authentication Service

Service độc lập cho Google OAuth, Zalo OAuth và OTP số điện thoại. Service dùng chung PostgreSQL và bảng `sessions` với backend Express. Cấu hình kết nối qua `DATABASE_URL`.

```powershell
cd auth_service
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

Frontend/Express vẫn chạy tại `http://localhost:3000`. Tài liệu API tại `http://localhost:8000/docs`.

Callback cần khai báo:

- Google: `http://localhost:8000/auth/oauth/google/callback`
- Zalo: `http://localhost:8000/auth/oauth/zalo/callback`

OTP `123456` chỉ dùng phát triển. Khi production, thay phần tạo OTP trong `send_otp` bằng tích hợp SMS và không trả `demoOtp`.
