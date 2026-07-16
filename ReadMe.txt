JOBBRIDGE - HUONG DAN NOP VA CHAY DU AN
=======================================

1. THONG TIN DU AN
------------------
Ten du an: JobBridge - Tuyen dung va ung tuyen viec lam
Cong nghe chinh:
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: SQLite
- Kiem thu: Node test runner
- CI/CD: GitHub Actions
- Quality: SonarQube

2. CAU TRUC SOURCE CODE VA DATABASE
-----------------------------------
Thu muc source code chinh:
- html/index.html: trang chinh cua ung dung
- css/: giao dien cho candidate, company, admin
- js/: xu ly giao dien va logic frontend
- src/: xu ly xac thuc va ket noi database
- server.js: backend REST API
- database/schema.sql: cau truc bang CSDL
- data/jobbridge.db: file CSDL SQLite dung khi demo

Luu y:
- Khi nop bai dang file zip, can giu kem thu muc data/ de co file CSDL.
- Khong can nop node_modules/.
- Khong can nop .scannerwork/ vi day la thu muc tam cua SonarQube.

3. TAI KHOAN DEMO
-----------------
Mat khau chung: 123

Ung vien:
- Email: ungvien@test.com
- Mat khau: 123
- Chuc nang demo: tim viec, quan ly CV, ung tuyen, theo doi ho so.

Nha tuyen dung / Cong ty:
- Email: congty@test.com
- Mat khau: 123
- Chuc nang demo: dang tin, quan ly tin, xem CV ung vien, cap nhat ket qua tuyen dung.

Admin:
- Email: admin@test.com
- Mat khau: 123
- Chuc nang demo: quan ly nguoi dung, tin tuyen dung, doanh nghiep, bao cao vi pham, cau hinh he thong.

4. CACH CHAY DU AN LOCAL
------------------------
Mo CMD hoac Terminal tai thu muc source code:

cd C:\Users\ACER\Downloads\JobBridge-NhatDuy-clean
npm install
npm start

Sau khi terminal hien:
JobBridge: http://localhost:3000

Mo trinh duyet:
http://localhost:3000

Luu y:
- Khong mo truc tiep html/index.html bang Live Server de test dang nhap.
- Khi demo can giu terminal dang chay npm start.

5. CACH XEM DATABASE
--------------------
Database su dung SQLite.

File CSDL:
data/jobbridge.db

Co the mo bang DB Browser for SQLite:
1. Mo DB Browser for SQLite.
2. Chon Open Database.
3. Chon file data/jobbridge.db.
4. Vao tab Browse Data de xem cac bang.

Mot so bang quan trong:
- users: tai khoan nguoi dung
- jobs: tin tuyen dung
- applications: ho so ung tuyen
- cvs: CV cua ung vien
- saved_jobs: viec lam da luu
- reports: bao cao vi pham
- admin_logs: nhat ky admin

6. KIEM THU VA COVERAGE
-----------------------
Chay test:

npm test

Ket qua mong doi:
- Tat ca test pass.
- GitHub Actions tren repository co trang thai pass.
- Coverage dat yeu cau Level 1.

7. SONARQUBE QUALITY GATE
-------------------------
SonarQube duoc dung de kiem tra chat luong ma nguon:
- Bugs
- Vulnerabilities
- Security Hotspots
- Code Smells
- Duplications
- Coverage

Mo dashboard SonarQube local:
http://localhost:9000/dashboard?id=jobbridge

Anh minh chung can nop:
- Anh dashboard SonarQube co Quality Gate Passed.
- Anh terminal co dong ANALYSIS SUCCESSFUL / EXECUTION SUCCESS.

8. CAC MINH CHUNG CAN NOP THEO YEU CAU
--------------------------------------
1. Link GitHub repository.
2. Source code + database.
3. README.md day du.
4. ReadMe.txt chua tai khoan demo va thong tin CSDL.
5. Anh GitHub Actions pass.
6. Anh SonarQube dashboard.
7. Coverage report.
8. Bao cao SPQM.
9. Video demo du an va pipeline.

