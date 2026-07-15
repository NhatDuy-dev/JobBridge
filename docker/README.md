# Chạy JobBridge bằng Docker Compose

Các lệnh dưới đây được chạy từ thư mục gốc của dự án.

Khởi động ứng dụng:

```bash
docker compose -f docker/compose.yaml up --build -d
```

Mở `http://localhost:3000`. Kiểm tra trạng thái và log:

```bash
docker compose -f docker/compose.yaml ps
docker compose -f docker/compose.yaml logs -f app
```

Dừng ứng dụng:

```bash
docker compose -f docker/compose.yaml down
```

Dữ liệu SQLite vẫn được giữ trong volume `jobbridge_data`. Chỉ xóa dữ liệu khi chủ động thêm tùy chọn `-v` vào lệnh `down`.

Kiểm tra cấu hình Compose trước khi chạy:

```bash
docker compose -f docker/compose.yaml config --quiet
```

Để đổi cổng trên máy host, đặt biến `APP_PORT`. Ví dụ trên PowerShell:

```powershell
$env:APP_PORT=8080
docker compose -f docker/compose.yaml up --build -d
```

Sau đó mở `http://localhost:8080`.
