# JobBridge

Ứng dụng tuyển dụng với SPA, REST API Express và SQLite.

## Chạy dự án

Yêu cầu Node.js 22.5 trở lên.

```bash
npm install
npm start
```

Mở `http://localhost:3000`. Database được tạo tự động tại `data/jobbridge.db`.

Tài khoản mẫu (mật khẩu `123`):

- Ứng viên: `ungvien@test.com`
- Nhà tuyển dụng: `congty@test.com`
- Admin: `admin@test.com`

> Tài khoản mẫu giữ mật khẩu ngắn để tương thích giao diện demo. Tài khoản đăng ký mới yêu cầu tối thiểu 6 ký tự.

## API chính

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/jobs`, `GET /api/jobs/:id`, `POST /api/jobs`, `PATCH /api/jobs/:id/status`
- `GET /api/applications`, `POST /api/applications`, `PATCH /api/applications/:id/status`
- `GET /api/saved-jobs`, `POST /api/saved-jobs/:jobId`, `DELETE /api/saved-jobs/:jobId`
- `PATCH /api/profile`
- `GET /api/health`

Gửi token qua header `Authorization: Bearer <token>`. Lỗi có cấu trúc `{ "error": { "code", "message" } }`.

Schema đầy đủ nằm trong `database/schema.sql`.

## Kiểm tra Admin

Đăng nhập bằng tài khoản:

- Email: admin@test.com
- Mật khẩu: 123
