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
Mo CMD/Terminal tai thu muc source code va chay:

cd C:\Users\ACER\Downloads\JobBridge-NhatDuy-clean
npm install
npm start

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

File CSDL demo:
data/jobbridge.db

File cau truc CSDL:
database/schema.sql

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

7. SONARQUBE
------------
Dashboard SonarQube local:
http://localhost:9000/dashboard?id=jobbridge

Ket qua da chay:
- Analysis successful.
- Quality Gate Passed.
- 0 Bugs.
- 0 Vulnerabilities.
