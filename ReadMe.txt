JOBBRIDGE - THONG TIN CHAY DEMO VA CSDL
=======================================

1. LINK DU AN
-------------
GitHub repository:
https://github.com/NhatDuy-dev/JobBridge

Trello board:
https://trello.com/invite/b/6a49aa49287145e742d18c30/ATTI0006c8239a2d395639b405e8bf0fefc336B2BB24/jobbridge-tuyen-dung-ung-tuyen-viec-lam

2. CACH CHAY LOCAL
------------------
Yeu cau:
- Da cai Node.js 22 tro len.
- Da cai Docker Desktop de chay PostgreSQL local, hoac da co PostgreSQL 14+.
- Da giai nen source code JobBridge.

Mo CMD/Terminal, di chuyen vao dung thu muc source code cua du an roi chay:

cd <duong_dan_thu_muc_du_an_JobBridge>
npm install
npm run db:start
npm start

Vi du:
cd D:\Nhom5\JobBridge

Sau khi hien dong:
JobBridge: http://localhost:3000

Mo trinh duyet:
http://localhost:3000

Luu y:
- Khong mo truc tiep html/index.html bang Live Server de test dang nhap.
- Khi demo phai giu terminal dang chay npm start.
- Lenh npm run db:start dung Docker Compose de mo PostgreSQL local.
- Neu khong dung Docker, dat bien DATABASE_URL tro den PostgreSQL co san.

3. TAI KHOAN DEMO
-----------------
Mat khau chung cho tat ca tai khoan demo: 123

Ung vien:
- Email: ungvien@test.com
- Mat khau: 123
- Chuc nang: tim viec, quan ly ho so/CV, ung tuyen, theo doi ho so.

Nha tuyen dung / Cong ty:
- Email: congty@test.com
- Mat khau: 123
- Chuc nang: dang tin, quan ly tin tuyen dung, xem CV ung vien, cap nhat ket qua tuyen dung.

Admin:
- Email: admin@test.com
- Mat khau: 123
- Chuc nang: quan ly nguoi dung, tin tuyen dung, doanh nghiep, bao cao vi pham, nhat ky va cau hinh he thong.

4. THONG TIN CSDL
-----------------
CSDL chinh cua du an: PostgreSQL

Chuoi ket noi mac dinh khi chay bang Docker:
postgresql://jobbridge:jobbridge@localhost:5432/jobbridge

File cau truc CSDL chinh:
database/schema.sql

File CSDL SQLite demo nop kem source code:
data/jobbridge.db

File migrate du lieu SQLite sang PostgreSQL:
database/migrate-sqlite-to-postgres.js

Luu y:
- PostgreSQL la CSDL chinh khi chay ung dung bang npm start.
- File data/jobbridge.db duoc nop kem de thay co the mo truc tiep xem du lieu mau.
- Neu PostgreSQL trong, he thong se tu tao schema va du lieu mau khi chay npm start.
- File README.md la tai lieu chinh cua du an, co mo ta chuc nang, cach chay, API va quy trinh.

Cac bang chinh trong schema PostgreSQL:
- users: tai khoan nguoi dung
- jobs: tin tuyen dung
- applications: don ung tuyen
- cvs: CV cua ung vien
- saved_jobs: viec lam da luu
- notifications: thong bao trong he thong
- job_reports: bao cao tin tuyen dung cua ung vien
- reports: bao cao vi pham
- admin_logs: nhat ky quan tri
- system_settings: cau hinh he thong

Du lieu demo hien co:
- 3 tai khoan nguoi dung
- 4 tin tuyen dung
- 3 don ung tuyen
- 1 CV ung vien

5. CACH MO CSDL
---------------
Mo CSDL chinh PostgreSQL:

1. Chay npm run db:start de mo PostgreSQL.
2. Mo pgAdmin hoac MySQL Workbench khong dung duoc voi PostgreSQL.
3. Neu dung pgAdmin/psql, ket noi:
   - Host: localhost
   - Port: 5432
   - Database: jobbridge
   - User: jobbridge
   - Password: jobbridge

Mo file SQLite demo nop kem bang DB Browser for SQLite:

1. Mo DB Browser for SQLite.
2. Chon Open Database.
3. Chon file data/jobbridge.db.
4. Vao tab Browse Data de xem bang users, jobs, applications, cvs.

6. KIEM THU
-----------
Chay test:

npm test

Chay coverage report:

npm run test:coverage

Ket qua coverage hien tai theo cau hinh Jest:
- Statements: 91.5%
- Branches: 77.27%
- Functions: 88%
- Lines: 91.83%

Anh minh chung coverage da dinh kem trong README.md:
- docs/images/coverage-report.png

7. SONARQUBE
------------
SonarQube dung de kiem tra chat luong source code: bugs, bao mat, code smells, trung lap code va Quality Gate.

Neu may da co container SonarQube:

docker start jobbridge-sonarqube

Mo dashboard SonarQube local:
http://localhost:9000/dashboard?id=jobbridge

Neu can quet lai source code:
1. Mo SonarQube tai http://localhost:9000.
2. Tao token trong My Account > Security.
3. Chay scanner trong thu muc du an.

Ket qua minh chung da chay:
- Analysis successful.
- Quality Gate Passed.
- 0 Bugs.
- 0 Vulnerabilities.

Anh can chup de nop:
- Dashboard SonarQube co Quality Gate Passed.
- Terminal co dong ANALYSIS SUCCESSFUL va EXECUTION SUCCESS.

Anh minh chung da dinh kem trong README.md:
- docs/images/sonarqube-dashboard-passed.png
- docs/images/sonarqube-execution-success.png
- docs/images/sonarqube-quality-gate-rules.png
