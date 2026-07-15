import { jest } from "@jest/globals";
import { DatabaseSync } from "node:sqlite";

import {
  openDatabase,
  publicUser,
  mapJob,
  migrateAdminUserColumns,
  seedDatabase,
} from "../src/database.js";

describe("Kiểm tra database JobBridge", () => {
  describe("mapJob", () => {
    test("chuyển dữ liệu job từ database sang object dùng trong ứng dụng", () => {
      const databaseJob = {
        id: 101,
        employer_id: 2,
        title: "Frontend Developer",
        company: "BridgeTech",
        salary: "20 - 35 trieu",
        min_salary: 20,
        max_salary: 35,
        location: "TP.HCM",
        type: "Full-time",
        status: "Approved",
        description: "Xây dựng giao diện",
        category: "IT",
        experience: "1 năm",
        company_field: "Công nghệ",
        job_field: "Frontend",
        saturday: "off",
        created_at: "2026-07-01",
        updated_at: "2026-07-02",
      };

      const result = mapJob(databaseJob);

      expect(result).toEqual({
        id: 101,
        employerId: 2,
        title: "Frontend Developer",
        company: "BridgeTech",
        salary: "20 - 35 trieu",
        minSalary: 20,
        maxSalary: 35,
        location: "TP.HCM",
        type: "Full-time",
        status: "Approved",
        description: "Xây dựng giao diện",
        category: "IT",
        experience: "1 năm",
        companyField: "Công nghệ",
        jobField: "Frontend",
        saturday: "off",
        createdAt: "2026-07-01",
        updatedAt: "2026-07-02",
      });
    });

    test("mapJob giữ nguyên trạng thái Pending", () => {
      const result = mapJob({
        id: 1,
        employer_id: 2,
        title: "Backend Developer",
        company: "Test Company",
        salary: null,
        min_salary: null,
        max_salary: null,
        location: "Remote",
        type: "Remote",
        status: "Pending",
        description: "",
        category: "",
        experience: "",
        company_field: "",
        job_field: "",
        saturday: "",
        created_at: null,
        updated_at: null,
      });

      expect(result.status).toBe("Pending");
      expect(result.employerId).toBe(2);
    });
  });

  describe("publicUser", () => {
    test("trả về null khi user không tồn tại", () => {
      expect(publicUser({}, null)).toBeNull();
    });

    test("chuyển user database thành dữ liệu public", () => {
      const fakeDb = {
        prepare: jest.fn((sql) => {
          if (sql.includes("FROM skills")) {
            return {
              all: jest.fn(() => [
                { name: "JavaScript" },
                { name: "ReactJS" },
              ]),
            };
          }

          if (sql.includes("FROM saved_jobs")) {
            return {
              all: jest.fn(() => [
                { job_id: 101 },
                { job_id: 102 },
              ]),
            };
          }

          if (sql.includes("FROM applications")) {
            return {
              all: jest.fn(() => [
                { job_id: 103 },
              ]),
            };
          }

          throw new Error(`SQL chưa được mock: ${sql}`);
        }),
      };

      const user = {
        id: 1,
        name: "Nguyen Minh Anh",
        email: "ungvien@test.com",
        role: "candidate",
        phone: "0901234567",
        location: "TP.HCM",
        desired_title: "Frontend Developer",
        date_of_birth: "2003-01-01",
        gender: "Nam",
        experience_level: "Junior",
        education: "Đại học",
        portfolio: "https://example.com",
        summary: "Ứng viên frontend",
        created_at: "2026-07-01",
      };

      const result = publicUser(fakeDb, user);

      expect(result.id).toBe(1);
      expect(result.name).toBe("Nguyen Minh Anh");
      expect(result.email).toBe("ungvien@test.com");
      expect(result.skills).toEqual([
        "JavaScript",
        "ReactJS",
      ]);
      expect(result.savedJobs).toEqual([101, 102]);
      expect(result.appliedJobs).toEqual([103]);
      expect(result.desiredTitle).toBe(
        "Frontend Developer",
      );
      expect(result.createdAt).toBe("2026-07-01");
    });
  });

  describe("openDatabase", () => {
    let db;

    afterEach(() => {
      db?.close();
      db = undefined;
    });

    test("mở database trong bộ nhớ thành công", () => {
      db = openDatabase(":memory:");

      expect(db).toBeDefined();
    });

    test("database được seed sẵn người dùng", () => {
      db = openDatabase(":memory:");

      const result = db
        .prepare("SELECT COUNT(*) AS count FROM users")
        .get();

      expect(result.count).toBeGreaterThan(0);
    });

    test("database được seed sẵn tin tuyển dụng", () => {
      db = openDatabase(":memory:");

      const result = db
        .prepare("SELECT COUNT(*) AS count FROM jobs")
        .get();

      expect(result.count).toBeGreaterThan(0);
    });

    test("database có tài khoản admin", () => {
      db = openDatabase(":memory:");

      const admin = db
        .prepare(
          "SELECT email, role FROM users WHERE role = ?",
        )
        .get("admin");

      expect(admin.email).toBe("admin@test.com");
      expect(admin.role).toBe("admin");
    });

    test("database có đầy đủ các cột quản trị của bảng users", () => {
      db = openDatabase(":memory:");

      const columns = db
        .prepare("PRAGMA table_info(users)")
        .all()
        .map((column) => column.name);

      expect(columns).toContain("status");
      expect(columns).toContain("locked_reason");
      expect(columns).toContain("locked_at");
      expect(columns).toContain("last_login_at");
    });
  });

  describe("migrateAdminUserColumns", () => {
    test("không lỗi khi bảng users chưa tồn tại", () => {
      const memoryDb = new DatabaseSync(":memory:");

      expect(() => {
        migrateAdminUserColumns(memoryDb);
      }).not.toThrow();

      memoryDb.close();
    });

    test("thêm các cột quản trị khi bảng users chưa có các cột đó", () => {
      const memoryDb = new DatabaseSync(":memory:");

      memoryDb.exec(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY,
          name TEXT
        );
      `);

      migrateAdminUserColumns(memoryDb);

      const columns = memoryDb
        .prepare("PRAGMA table_info(users)")
        .all()
        .map((column) => column.name);

      expect(columns).toContain("status");
      expect(columns).toContain("locked_reason");
      expect(columns).toContain("locked_at");
      expect(columns).toContain("last_login_at");

      memoryDb.close();
    });

    test("không thêm trùng cột khi chạy migration lần thứ hai", () => {
      const memoryDb = new DatabaseSync(":memory:");

      memoryDb.exec(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY,
          name TEXT
        );
      `);

      migrateAdminUserColumns(memoryDb);
      migrateAdminUserColumns(memoryDb);

      const columns = memoryDb
        .prepare("PRAGMA table_info(users)")
        .all()
        .map((column) => column.name);

      expect(
        columns.filter((name) => name === "status"),
      ).toHaveLength(1);

      expect(
        columns.filter(
          (name) => name === "locked_reason",
        ),
      ).toHaveLength(1);

      memoryDb.close();
    });
  });

  describe("seedDatabase", () => {
    test("không seed thêm khi database đã có dữ liệu", () => {
      const memoryDb = openDatabase(":memory:");

      const usersBefore = memoryDb
        .prepare("SELECT COUNT(*) AS count FROM users")
        .get().count;

      const jobsBefore = memoryDb
        .prepare("SELECT COUNT(*) AS count FROM jobs")
        .get().count;

      seedDatabase(memoryDb);

      const usersAfter = memoryDb
        .prepare("SELECT COUNT(*) AS count FROM users")
        .get().count;

      const jobsAfter = memoryDb
        .prepare("SELECT COUNT(*) AS count FROM jobs")
        .get().count;

      expect(usersAfter).toBe(usersBefore);
      expect(jobsAfter).toBe(jobsBefore);

      memoryDb.close();
    });
  });
});