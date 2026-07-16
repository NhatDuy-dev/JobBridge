import { jest } from "@jest/globals";
import {
  PostgresDatabase,
  mapJob,
  migrateAdminUserColumns,
  postgresSql,
  publicUser,
  returningId,
  seedDatabase,
} from "../src/database.js";

describe("PostgreSQL database layer", () => {
  test("đổi placeholder sang cú pháp PostgreSQL nhưng giữ dấu hỏi trong chuỗi", () => {
    expect(postgresSql("SELECT '?' AS literal WHERE id = ? AND role = ?"))
      .toBe("SELECT '?' AS literal WHERE id = $1 AND role = $2");
  });

  test("đổi INSERT OR IGNORE sang ON CONFLICT", () => {
    expect(postgresSql("INSERT OR IGNORE INTO skills(name) VALUES (?)"))
      .toBe("INSERT INTO skills(name) VALUES ($1) ON CONFLICT DO NOTHING");
  });

  test("chỉ thêm RETURNING id cho bảng có khóa id", () => {
    expect(returningId("INSERT INTO users(name) VALUES (?)"))
      .toMatch(/RETURNING id$/);
    expect(returningId("INSERT INTO saved_jobs(user_id, job_id) VALUES (?, ?)"))
      .not.toMatch(/RETURNING/);
  });

  test("adapter get, all và run trả kết quả tương thích API cũ", async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: 1 }, { id: 2 }], rowCount: 2 })
      .mockResolvedValueOnce({ rows: [{ id: 7 }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 3 });
    const db = new PostgresDatabase({ query });

    await expect(db.prepare("SELECT * FROM users WHERE id = ?").get(1))
      .resolves.toEqual({ id: 1 });
    await expect(db.prepare("SELECT * FROM users").all())
      .resolves.toHaveLength(2);
    await expect(db.prepare("INSERT INTO users(name) VALUES (?)").run("A"))
      .resolves.toEqual({ changes: 1, lastInsertRowid: 7 });
    await expect(db.prepare("UPDATE users SET name = ?").run("B"))
      .resolves.toEqual({ changes: 3, lastInsertRowid: undefined });
    expect(query).toHaveBeenNthCalledWith(1, "SELECT * FROM users WHERE id = $1", [1]);
  });

  test("transaction commit và giải phóng client", async () => {
    const client = { query: jest.fn().mockResolvedValue({}), release: jest.fn() };
    const db = new PostgresDatabase({ connect: jest.fn().mockResolvedValue(client) });
    await expect(db.transaction(async (tx) => {
      await tx.query("SELECT 1");
      return "ok";
    })).resolves.toBe("ok");
    expect(client.query.mock.calls.map(([sql]) => sql)).toEqual(["BEGIN", "SELECT 1", "COMMIT"]);
    expect(client.release).toHaveBeenCalled();
  });

  test("transaction rollback khi callback lỗi", async () => {
    const client = { query: jest.fn().mockResolvedValue({}), release: jest.fn() };
    const db = new PostgresDatabase({ connect: jest.fn().mockResolvedValue(client) });
    await expect(db.transaction(async () => {
      throw new Error("boom");
    })).rejects.toThrow("boom");
    expect(client.query).toHaveBeenLastCalledWith("ROLLBACK");
    expect(client.release).toHaveBeenCalled();
  });

  test("close đóng pool", async () => {
    const pool = { end: jest.fn().mockResolvedValue() };
    await new PostgresDatabase(pool).close();
    expect(pool.end).toHaveBeenCalled();
  });

  test("migration dùng ADD COLUMN IF NOT EXISTS", async () => {
    const db = { exec: jest.fn().mockResolvedValue() };
    await migrateAdminUserColumns(db);
    expect(db.exec.mock.calls[0][0]).toContain("ADD COLUMN IF NOT EXISTS status");
  });

  test("seed bỏ qua database đã có user", async () => {
    const db = {
      prepare: jest.fn(() => ({ get: jest.fn().mockResolvedValue({ count: 1 }) })),
      transaction: jest.fn(),
    };
    await seedDatabase(db);
    expect(db.transaction).not.toHaveBeenCalled();
  });

  test("seed tạo dữ liệu demo trong một transaction", async () => {
    let nextId = 1;
    const run = jest.fn(async () => ({ changes: 1, lastInsertRowid: nextId++ }));
    const tx = {
      prepare: jest.fn(() => ({ run })),
      query: jest.fn().mockResolvedValue({}),
    };
    const db = {
      prepare: jest.fn(() => ({ get: jest.fn().mockResolvedValue({ count: 0 }) })),
      transaction: jest.fn(async (callback) => callback(tx)),
    };
    await seedDatabase(db);
    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(run.mock.calls.length).toBeGreaterThan(10);
    expect(tx.query).toHaveBeenCalledWith(expect.stringContaining("setval"));
  });

  test("publicUser trả null hoặc ánh xạ đầy đủ dữ liệu liên quan", async () => {
    await expect(publicUser({}, null)).resolves.toBeNull();
    const db = {
      prepare: jest.fn((sql) => ({
        all: jest.fn().mockResolvedValue(
          sql.includes("skills") ? [{ name: "ReactJS" }]
            : sql.includes("saved_jobs") ? [{ job_id: 101 }]
              : [{ job_id: 102 }],
        ),
      })),
    };
    const result = await publicUser(db, {
      id: 1, name: "Minh Anh", email: "a@example.com", role: "candidate",
      phone: "0901", location: "TP.HCM", desired_title: "Frontend",
      date_of_birth: "2000-01-01", gender: "", experience_level: "Junior",
      education: "", portfolio: "", summary: "", created_at: "2026-07-01",
    });
    expect(result).toMatchObject({
      id: 1, desiredTitle: "Frontend", skills: ["ReactJS"],
      savedJobs: [101], appliedJobs: [102],
    });
  });

  test("mapJob chuyển snake_case sang camelCase", () => {
    expect(mapJob({
      id: 101, employer_id: 2, title: "Frontend", company: "BridgeTech",
      salary: "20-35", min_salary: 20, max_salary: 35, location: "TP.HCM",
      type: "Full-time", status: "Approved", description: "Xây dựng UI",
      category: "IT", experience: "1 năm", company_field: "Công nghệ",
      job_field: "Frontend", saturday: "off", created_at: "2026-07-01",
      updated_at: "2026-07-02",
    })).toMatchObject({
      id: 101, employerId: 2, minSalary: 20, maxSalary: 35,
      companyField: "Công nghệ", jobField: "Frontend",
    });
  });
});
