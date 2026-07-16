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
- Da giai nen source code JobBridge.

Mo CMD/Terminal, di chuyen vao dung thu muc source code cua du an roi chay:

cd <duong_dan_thu_muc_du_an_JobBridge>
npm install
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
He quan tri CSDL: SQLite

File CSDL demo nop kem source code:
data/jobbridge.db

File cau truc CSDL:
database/schema.sql

Luu y:
- File data/jobbridge.db da co san du lieu demo de thay/cham bai co the chay ngay.
- Neu xoa file data/jobbridge.db, he thong se tu tao lai CSDL theo schema va du lieu mau khi chay npm start.
- File README.md la tai lieu chinh cua du an, co mo ta chuc nang, cach chay, API va quy trinh.

Cac bang chinh:
- users: tai khoan nguoi dung
- jobs: tin tuyen dung
- applications: don ung tuyen
- cvs: CV cua ung vien
- saved_jobs: viec lam da luu
- reports: bao cao vi pham
- admin_logs: nhat ky quan tri
- notifications: thong bao trong he thong

Du lieu demo hien co:
- 3 tai khoan nguoi dung
- 4 tin tuyen dung
- 3 don ung tuyen
- 1 CV ung vien

5. CACH MO CSDL
---------------
Dung DB Browser for SQLite:

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

Ket qua coverage hien tai cho core backend src/**/*.js:
- Lines: 85.58%
- Branches: 71.43%
- Functions: 85.71%

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
