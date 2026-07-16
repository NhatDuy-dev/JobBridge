# JobBridge - Hệ thống tuyển dụng và ứng tuyển việc làm

## Link dự án

- GitHub repository: https://github.com/NhatDuy-dev/JobBridge
- Trello board: https://trello.com/invite/b/6a49aa49287145e742d18c30/ATTI0006c8239a2d395639b405e8bf0fefc336B2BB24/jobbridge-tuy%E1%BB%83n-d%E1%BB%A5ng-%E1%BB%A9ng-tuy%E1%BB%83n-vi%E1%BB%87c-lam

JobBridge là mini project môn Software Process and Quality Management. Dự án mô phỏng một nền tảng tuyển dụng có 3 vai trò chính:

- Ứng viên: tìm việc, quản lý hồ sơ/CV, ứng tuyển, lưu việc làm và theo dõi trạng thái hồ sơ.
- Nhà tuyển dụng: đăng tin tuyển dụng, quản lý tin, xem hồ sơ ứng viên và cập nhật kết quả tuyển dụng.
- Admin: quản lý người dùng, tin tuyển dụng, doanh nghiệp, báo cáo vi phạm, nhật ký hoạt động và cấu hình hệ thống.

Dự án chạy theo mô hình SPA, dùng Node.js + Express cho backend REST API và PostgreSQL cho cơ sở dữ liệu.

## 1. Chức năng chính

### Ứng viên

- Đăng nhập, đăng ký tài khoản ứng viên.
- Xem danh sách việc làm.
- Tìm kiếm và lọc việc làm.
- Xem chi tiết việc làm.
- Cập nhật hồ sơ cá nhân.
- Tạo CV từ hồ sơ hoặc tải CV PDF.
- Ứng tuyển việc làm.
- Theo dõi lịch sử ứng tuyển.
- Lưu việc làm yêu thích.
- Nhận thông báo khi nhà tuyển dụng cập nhật trạng thái hồ sơ.
- Dùng ChatBox hỗ trợ các câu hỏi cơ bản.

### Nhà tuyển dụng

- Đăng nhập tài khoản công ty.
- Xem dashboard tuyển dụng.
- Quản lý hồ sơ doanh nghiệp.
- Tạo tin tuyển dụng mới.
- Quản lý danh sách tin tuyển dụng.
- Xem danh sách ứng viên đã nộp hồ sơ.
- Xem thông tin ứng viên và CV.
- Cập nhật trạng thái hồ sơ:
  - `Da nop`: ứng viên đã nộp hồ sơ.
  - `Len lich phong van`: hẹn phỏng vấn.
  - `Da tuyen`: tuyển ứng viên.
  - `Tu choi`: từ chối ứng viên.

### Admin

- Xem dashboard quản trị.
- Quản lý người dùng.
- Quản lý tin tuyển dụng.
- Quản lý doanh nghiệp.
- Xem hồ sơ ứng tuyển.
- Quản lý báo cáo vi phạm.
- Xem nhật ký hoạt động Admin.
- Cấu hình hệ thống.

## 2. Công nghệ sử dụng

| Hạng mục | Công nghệ |
| --- | --- |
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| Database | PostgreSQL 14+ |
| Xác thực | Token session, hash mật khẩu |
| Service mở rộng | Python FastAPI |
| Kiểm thử | Node test runner |
| CI/CD | GitHub Actions |
| Container | Docker Compose |

## 3. Cấu trúc thư mục

```text
JobBridge
├── assets/                 # Logo, hình ảnh
├── auth_service/           # Service FastAPI hỗ trợ OAuth/OTP
├── css/
│   ├── admin/              # Giao diện Admin
│   ├── candidate/          # Giao diện ứng viên
│   └── company/            # Giao diện công ty
├── database/
│   └── schema.sql          # Cấu trúc database PostgreSQL
├── docker/                 # Dockerfile và Docker Compose
├── html/
│   └── index.html          # Trang chính của SPA
├── js/
│   ├── admin/              # Xử lý phía Admin
│   ├── candidate/          # Xử lý phía ứng viên
│   ├── company/            # Xử lý phía công ty
│   └── shared/             # State, storage, UI dùng chung
├── src/
│   ├── auth.js             # Hash mật khẩu, tạo token
│   └── database.js         # Kết nối, migration, dữ liệu mẫu
├── test/                   # Test tự động
├── package.json
├── server.js               # Express server và REST API
└── README.md
```

## 4. Yêu cầu trước khi chạy

Cần cài:

- Node.js `22.5.0` trở lên.
- npm.
- PostgreSQL 14 trở lên (hoặc Docker Desktop).
- Trình duyệt Chrome, Edge hoặc Firefox.

Kiểm tra phiên bản Node.js:

```powershell
node -v
```

Nếu máy chưa có Node.js hoặc Node quá cũ thì cần cài Node.js bản 22.

## 5. Cách chạy local

Mở Terminal trong VS Code hoặc PowerShell tại thư mục dự án:

```powershell
cd C:\Users\ACER\Downloads\JobBridge-NhatDuy-clean
npm install
npm run db:start
npm start
```

Sau đó mở trình duyệt:

```text
http://localhost:3000
```

Lưu ý:

- Không mở trực tiếp file `html/index.html` bằng Live Server để test đăng nhập.
- Khi test app, luôn chạy `npm start` rồi mở `http://localhost:3000`.
- Schema và dữ liệu demo được tự khởi tạo trong PostgreSQL khi chạy lần đầu.
- Kết nối mặc định là `postgresql://jobbridge:jobbridge@localhost:5432/jobbridge`; có thể ghi đè bằng biến `DATABASE_URL`.

Nếu cổng `3000` bị trùng, chạy bằng cổng khác:

```powershell
$env:PORT=3001
npm start
```

Sau đó mở:

```text
http://localhost:3001
```

## 6. Tài khoản demo

Mật khẩu chung cho các tài khoản demo:

```text
123
```

| Vai trò | Email | Dùng để demo |
| --- | --- | --- |
| Ứng viên | `ungvien@test.com` | Tìm việc, quản lý CV, ứng tuyển |
| Nhà tuyển dụng | `congty@test.com` | Đăng tin, xem hồ sơ ứng viên |
| Admin | `admin@test.com` | Quản lý hệ thống |

Các tài khoản này được tạo tự động khi database đang trống.

## 7. Kịch bản demo dễ hiểu

### Bước 1: Chạy dự án

```powershell
npm start
```

Mở:

```text
http://localhost:3000
```

### Bước 2: Demo ứng viên

1. Đăng nhập bằng `ungvien@test.com`.
2. Vào danh sách việc làm.
3. Tìm kiếm hoặc lọc việc làm.
4. Mở chi tiết một việc làm.
5. Lưu việc làm.
6. Cập nhật hồ sơ hoặc CV.
7. Ứng tuyển vào một việc làm.
8. Xem lịch sử ứng tuyển.
9. Kiểm tra thông báo khi công ty cập nhật kết quả.

### Bước 3: Demo nhà tuyển dụng

1. Đăng nhập bằng `congty@test.com`.
2. Vào dashboard công ty.
3. Tạo tin tuyển dụng mới.
4. Vào trang quản lý hồ sơ ứng tuyển.
5. Xem thông tin ứng viên và CV.
6. Chọn trạng thái:
   - Hẹn phỏng vấn.
   - Tuyển ứng viên.
   - Từ chối ứng viên.
7. Quay lại tài khoản ứng viên để kiểm tra thông báo.

### Bước 4: Demo Admin

1. Đăng nhập bằng `admin@test.com`.
2. Xem dashboard Admin.
3. Kiểm tra danh sách người dùng.
4. Kiểm tra danh sách tin tuyển dụng.
5. Duyệt hoặc từ chối tin tuyển dụng.
6. Xem báo cáo vi phạm và nhật ký hoạt động.
7. Kiểm tra cấu hình hệ thống.

## 8. Quy trình nghiệp vụ chính

```mermaid
flowchart TD
  A["Công ty tạo tin tuyển dụng"] --> B["Tin ở trạng thái Pending"]
  B --> C["Admin kiểm tra tin"]
  C --> D{"Kết quả duyệt"}
  D -->|Duyệt| E["Tin chuyển sang Approved"]
  D -->|Từ chối| F["Tin chuyển sang Rejected"]
  E --> G["Ứng viên xem tin và ứng tuyển"]
  G --> H["Hồ sơ ở trạng thái Da nop"]
  H --> I["Công ty xem hồ sơ và CV"]
  I --> J{"Công ty xử lý"}
  J -->|Hẹn phỏng vấn| K["Len lich phong van"]
  J -->|Từ chối| L["Tu choi"]
  K --> M{"Sau phỏng vấn"}
  M -->|Tuyển| N["Da tuyen"]
  M -->|Không đạt| L
  K --> O["Ứng viên nhận thông báo"]
  L --> O
  N --> O
```

## 9. Database

Schema database nằm tại:

```text
database/schema.sql
```

Chuỗi kết nối local mặc định:

```text
postgresql://jobbridge:jobbridge@localhost:5432/jobbridge
```

Các bảng chính:

| Bảng | Ý nghĩa |
| --- | --- |
| `users` | Tài khoản ứng viên, công ty, admin |
| `jobs` | Tin tuyển dụng |
| `applications` | Hồ sơ ứng tuyển |
| `saved_jobs` | Việc làm đã lưu |
| `notifications` | Thông báo cho ứng viên |
| `sessions` | Phiên đăng nhập |
| `reports` | Báo cáo vi phạm |
| `admin_logs` | Nhật ký hoạt động Admin |
| `system_settings` | Cấu hình hệ thống |

Có thể xem dữ liệu bằng `psql`, pgAdmin hoặc bất kỳ PostgreSQL client nào.

Cách reset dữ liệu demo:

1. Tắt stack Docker.
2. Xóa volume PostgreSQL và khởi động lại:

```powershell
docker compose -f docker/compose.yaml down -v
docker compose -f docker/compose.yaml up --build -d
```

### Chuyển dữ liệu SQLite cũ

Tạo một PostgreSQL trống, đặt chuỗi kết nối rồi chạy:

```powershell
$env:DATABASE_URL="postgresql://jobbridge:jobbridge@localhost:5432/jobbridge"
npm run db:migrate -- data/jobbridge.db
```

Lệnh này tạo schema, sao chép dữ liệu theo đúng thứ tự khóa ngoại, giữ nguyên ID và cập nhật lại các sequence. Vì an toàn, lệnh sẽ dừng nếu PostgreSQL đích đã có user.

## 10. API chính

Base URL:

```text
http://localhost:3000/api
```

API cần đăng nhập phải gửi token:

```http
Authorization: Bearer <token>
```

Dạng lỗi chung:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Nội dung lỗi"
  }
}
```

### API xác thực

| Method | Endpoint | Ý nghĩa |
| --- | --- | --- |
| `POST` | `/auth/register` | Đăng ký ứng viên hoặc công ty |
| `POST` | `/auth/login` | Đăng nhập |
| `POST` | `/auth/logout` | Đăng xuất |
| `GET` | `/auth/me` | Lấy thông tin người dùng hiện tại |
| `GET` | `/auth/oauth/google` | Đăng nhập Google |
| `GET` | `/auth/oauth/zalo` | Đăng nhập Zalo |
| `POST` | `/auth/phone/send-otp` | Gửi OTP số điện thoại |
| `POST` | `/auth/phone/verify-otp` | Xác thực OTP |

### API việc làm

| Method | Endpoint | Vai trò | Ý nghĩa |
| --- | --- | --- | --- |
| `GET` | `/jobs` | Mọi người dùng | Lấy danh sách việc làm |
| `GET` | `/jobs/:id` | Mọi người dùng | Xem chi tiết việc làm |
| `POST` | `/jobs` | Công ty/Admin | Tạo tin tuyển dụng |
| `PATCH` | `/jobs/:id/status` | Admin | Duyệt/từ chối/đóng tin |
| `DELETE` | `/jobs/:id` | Admin | Xóa tin tuyển dụng |

### API hồ sơ ứng tuyển

| Method | Endpoint | Vai trò | Ý nghĩa |
| --- | --- | --- | --- |
| `POST` | `/applications` | Ứng viên | Nộp hồ sơ ứng tuyển |
| `GET` | `/applications` | Ứng viên/Công ty/Admin | Xem danh sách hồ sơ theo vai trò |
| `PATCH` | `/applications/:id/status` | Công ty/Admin | Cập nhật trạng thái hồ sơ |

### API thông báo

| Method | Endpoint | Vai trò | Ý nghĩa |
| --- | --- | --- | --- |
| `GET` | `/notifications` | Ứng viên | Lấy danh sách thông báo |
| `PATCH` | `/notifications/:id/read` | Ứng viên | Đánh dấu một thông báo đã đọc |
| `PATCH` | `/notifications/read-all` | Ứng viên | Đánh dấu tất cả thông báo đã đọc |

### API ứng viên

| Method | Endpoint | Vai trò | Ý nghĩa |
| --- | --- | --- | --- |
| `GET` | `/saved-jobs` | Ứng viên | Lấy danh sách việc đã lưu |
| `POST` | `/saved-jobs/:jobId` | Ứng viên | Lưu việc làm |
| `DELETE` | `/saved-jobs/:jobId` | Ứng viên | Bỏ lưu việc làm |
| `PATCH` | `/profile` | Người dùng đã đăng nhập | Cập nhật hồ sơ |

### API Admin

| Method | Endpoint | Ý nghĩa |
| --- | --- | --- |
| `GET` | `/admin/dashboard` | Thống kê dashboard |
| `GET` | `/admin/users` | Danh sách người dùng |
| `GET` | `/admin/users/:id` | Chi tiết người dùng |
| `PATCH` | `/admin/users/:id/status` | Khóa/mở khóa tài khoản |
| `PATCH` | `/admin/users/:id/role` | Đổi vai trò người dùng |
| `DELETE` | `/admin/users/:id` | Xóa người dùng |
| `GET` | `/admin/companies` | Danh sách doanh nghiệp |
| `GET` | `/admin/applications` | Danh sách hồ sơ ứng tuyển |
| `GET` | `/admin/reports` | Danh sách báo cáo vi phạm |
| `GET` | `/admin/logs` | Nhật ký hoạt động Admin |
| `GET` | `/admin/settings` | Xem cấu hình hệ thống |
| `PUT` | `/admin/settings` | Cập nhật cấu hình hệ thống |

## 11. Ví dụ test API bằng PowerShell

Kiểm tra server:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/health"
```

Đăng nhập tài khoản công ty:

```powershell
$login = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/api/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"congty@test.com","password":"123"}'

$token = $login.token
```

Xem hồ sơ ứng tuyển của công ty:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/api/applications" `
  -Headers @{ Authorization = "Bearer $token" }
```

Tạo tin tuyển dụng:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/api/jobs" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{
    "title":"Frontend Intern",
    "company":"BridgeTech",
    "salary":"8 - 12 trieu",
    "minSalary":8,
    "maxSalary":12,
    "location":"TP.HCM",
    "type":"Internship",
    "description":"Ho tro phat trien giao dien JobBridge."
  }'
```

## 12. Chạy test

Chạy toàn bộ test:

```powershell
npm test
```

Các phần test hiện có:

- Kiểm tra logic Admin.
- Kiểm tra thông báo khi công ty đổi trạng thái hồ sơ.
- Kiểm tra ChatBox chuẩn hóa câu hỏi và chống lỗi HTML/script.

## 13. GitHub Actions

Workflow CI nằm tại:

```text
.github/workflows/ci.yml
```

Pipeline chạy khi push hoặc tạo Pull Request:

1. Checkout source code.
2. Cài Node.js.
3. Cài thư viện bằng `npm ci`.
4. Chạy test bằng `npm test`.

Nếu CI hiện dấu xanh nghĩa là pipeline chạy thành công.

## 14. Chạy bằng Docker Compose

Chạy app:

```powershell
docker compose -f docker/compose.yaml up --build -d
```

Mở:

```text
http://localhost:3000
```

Xem trạng thái và log:

```powershell
docker compose -f docker/compose.yaml ps
docker compose -f docker/compose.yaml logs -f app
```

Dừng app:

```powershell
docker compose -f docker/compose.yaml down
```

Chạy bằng cổng khác:

```powershell
$env:APP_PORT=8080
docker compose -f docker/compose.yaml up --build -d
```

Sau đó mở:

```text
http://localhost:8080
```

## 15. Service FastAPI mở rộng

Thư mục `auth_service` là service phụ cho Google OAuth, Zalo OAuth và đăng nhập bằng số điện thoại.

Chạy backend Express trước:

```powershell
npm start
```

Mở terminal khác:

```powershell
cd C:\Users\ACER\Downloads\JobBridge-NhatDuy-clean\auth_service
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
$env:FRONTEND_URL="http://localhost:3000"
$env:DATABASE_URL="postgresql://jobbridge:jobbridge@localhost:5432/jobbridge"
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

Mở tài liệu API FastAPI:

```text
http://localhost:8000/docs
```

OTP demo:

```text
123456
```

Callback OAuth:

```text
http://localhost:8000/auth/oauth/google/callback
http://localhost:8000/auth/oauth/zalo/callback
```

## 16. Quy trình làm việc nhóm

Quy trình đề xuất:

1. Pull code mới nhất từ `main`.
2. Tạo hoặc chuyển sang nhánh riêng.
3. Code đúng phần được phân công.
4. Commit rõ nội dung:
   - `feat: ...` khi thêm chức năng.
   - `fix: ...` khi sửa lỗi.
   - `test: ...` khi thêm/sửa test.
   - `docs: ...` khi sửa tài liệu.
5. Push nhánh lên GitHub.
6. Tạo Pull Request vào `main`.
7. Kiểm tra CI và review trước khi merge.

Definition of Done:

- Chức năng chạy được local.
- Giao diện và API đã kiểm thử bằng dữ liệu demo.
- `npm test` chạy thành công.
- Không commit `node_modules`, database local hoặc file log tạm.
- Nếu thay đổi API hoặc cách chạy thì cập nhật README.

