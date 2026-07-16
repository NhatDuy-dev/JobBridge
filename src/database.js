import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { hashPassword } from "./auth.js";

const { Pool, types } = pg;
types.setTypeParser(20, (value) => Number(value));

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DEFAULT_DATABASE_URL =
  "postgresql://jobbridge:jobbridge@localhost:5432/jobbridge";
const INSERT_ID_TABLES = new Set([
  "users",
  "skills",
  "cvs",
  "jobs",
  "applications",
  "job_reports",
  "notifications",
  "reports",
  "admin_logs",
]);

export function postgresSql(sql) {
  const ignoresConflict = /^\s*INSERT\s+OR\s+IGNORE\s+INTO\b/i.test(sql);
  if (ignoresConflict) {
    sql = sql.replace(/^(\s*)INSERT\s+OR\s+IGNORE\s+INTO\b/i, "$1INSERT INTO");
    sql = `${sql.trim().replace(/;$/, "")} ON CONFLICT DO NOTHING`;
  }

  let index = 0;
  let quoted = null;
  let result = "";

  for (let position = 0; position < sql.length; position += 1) {
    const character = sql[position];

    if ((character === "'" || character === '"') && sql[position - 1] !== "\\") {
      if (!quoted) quoted = character;
      else if (quoted === character) quoted = null;
      result += character;
    } else if (character === "?" && !quoted) {
      index += 1;
      result += `$${index}`;
    } else {
      result += character;
    }
  }

  return result;
}

export function returningId(sql) {
  const match = sql.match(/^\s*INSERT\s+INTO\s+([a-z_]+)/i);
  if (
    match &&
    INSERT_ID_TABLES.has(match[1].toLowerCase()) &&
    !/\bRETURNING\b/i.test(sql)
  ) {
    return `${sql.trim().replace(/;$/, "")} RETURNING id`;
  }
  return sql;
}

export class PostgresDatabase {
  constructor(pool, client = null) {
    this.pool = pool;
    this.client = client;
  }

  async query(sql, values = []) {
    return (this.client || this.pool).query(postgresSql(sql), values);
  }

  prepare(sql) {
    return {
      get: async (...values) => {
        const result = await this.query(sql, values);
        return result.rows[0];
      },
      all: async (...values) => {
        const result = await this.query(sql, values);
        return result.rows;
      },
      run: async (...values) => {
        const result = await this.query(returningId(sql), values);
        return {
          changes: result.rowCount,
          lastInsertRowid: result.rows[0]?.id,
        };
      },
    };
  }

  async exec(sql) {
    return (this.client || this.pool).query(sql);
  }

  async transaction(callback) {
    const client = await this.pool.connect();
    const transaction = new PostgresDatabase(this.pool, client);
    try {
      await client.query("BEGIN");
      const result = await callback(transaction);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async close() {
    await this.pool.end();
  }
}

export async function openDatabase(
  databaseUrl = process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
) {
  const pool = new Pool({
    connectionString: databaseUrl,
    max: Number(process.env.DB_POOL_MAX || 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl:
      process.env.POSTGRES_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined,
  });
  const db = new PostgresDatabase(pool);

  await db.query("SELECT 1");
  await db.exec(
    fs.readFileSync(path.join(root, "database", "schema.sql"), "utf8"),
  );
  await migrateAdminUserColumns(db);
  await seedDatabase(db);
  return db;
}

export async function migrateAdminUserColumns(db) {
  await db.exec(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Active';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_reason TEXT NOT NULL DEFAULT '';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
  `);
}

export async function seedDatabase(db) {
  const { count } = await db
    .prepare("SELECT COUNT(*)::integer AS count FROM users")
    .get();
  if (count > 0) return;

  await db.transaction(async (tx) => {
    const insertUser = tx.prepare(`
      INSERT INTO users
        (name, email, password_hash, role, desired_title, phone, location, summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const candidate = (
      await insertUser.run(
        "Nguyen Minh Anh", "ungvien@test.com", hashPassword("123"),
        "candidate", "Frontend Developer", "0901234567", "TP.HCM",
        "Ứng viên frontend yêu thích xây dựng giao diện rõ ràng, dễ dùng.",
      )
    ).lastInsertRowid;
    const employer = (
      await insertUser.run(
        "Cong ty BridgeTech", "congty@test.com", hashPassword("123"),
        "employer", "", "", "TP.HCM", "",
      )
    ).lastInsertRowid;
    const admin = (
      await insertUser.run(
        "Quan tri vien", "admin@test.com", hashPassword("123"),
        "admin", "", "", "", "",
      )
    ).lastInsertRowid;
    await tx.prepare(`
      INSERT INTO admin_logs(admin_id, action, entity_type, entity_id, note)
      VALUES (?, 'LOGIN', 'Admin', ?, ?)
    `).run(admin, admin, "Khởi tạo nhật ký quản trị hệ thống");

    const insertJob = tx.prepare(`
      INSERT INTO jobs
        (id, employer_id, title, company, salary, min_salary, max_salary,
         location, type, status, description, category, experience,
         company_field, job_field, saturday)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const jobs = [
      [101, employer, "Frontend Developer", "BridgeTech", "20 - 35 trieu", 20, 35, "TP.HCM", "Full-time", "Approved", "Xay dung giao dien dashboard tuyen dung bang HTML, CSS va JavaScript.", "IT - Cong nghe thong tin", "1 nam", "Cong nghe", "IT - Cong nghe thong tin", "off"],
      [102, employer, "UI UX Designer", "Nova Studio", "18 - 30 trieu", 18, 30, "Ha Noi", "Full-time", "Approved", "Thiet ke flow ung tuyen, prototype va design system.", "Thiet ke va Kien truc", "2 nam", "Sang tao", "Marketing sang tao", "unknown"],
      [103, employer, "Backend Node.js Engineer", "CloudNest", "30 - 45 trieu", 30, 45, "Remote", "Remote", "Pending", "Phat trien API va quan ly co so du lieu viec lam.", "IT - Cong nghe thong tin", "3 nam", "Cong nghe", "IT - Cong nghe thong tin", "work"],
      [104, employer, "Data Analyst", "FinSight", "16 - 28 trieu", 16, 28, "Da Nang", "Remote", "Approved", "Phan tich du lieu ung vien va tao bao cao.", "Ke toan", "Duoi 1 nam", "Tai chinh", "Ke toan/Kiem toan", "off"],
    ];
    for (const job of jobs) await insertJob.run(...job);

    const candidateCv = (await tx.prepare(`
      INSERT INTO cvs
        (candidate_id, name, source, profile_snapshot, original_file_name, mime_type, file_size)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      candidate,
      "CV Nguyen Minh Anh",
      "profile",
      JSON.stringify({
        desiredTitle: "Frontend Developer",
        education: "Dai hoc Cong nghe - Cong nghe thong tin",
        skills: ["ReactJS", "Figma", "JavaScript"],
        experience: "1 nam",
      }),
      "",
      "",
      0,
    )).lastInsertRowid;

    const insertApplication = tx.prepare(`
      INSERT INTO applications(candidate_id, job_id, status, cv_id, cv_name, applied_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    await insertApplication.run(candidate, 101, "Da nop", candidateCv, "CV Nguyen Minh Anh", "2026-07-01");
    await insertApplication.run(candidate, 102, "Len lich phong van", candidateCv, "CV Nguyen Minh Anh", "2026-07-03");
    await insertApplication.run(candidate, 104, "Tu choi", candidateCv, "CV Nguyen Minh Anh", "2026-07-05");
    await tx.prepare("INSERT INTO saved_jobs(user_id, job_id) VALUES (?, ?)").run(candidate, 102);

    for (const skill of ["ReactJS", "Figma", "JavaScript"]) {
      const skillId = (await tx.prepare("INSERT INTO skills(name) VALUES (?)").run(skill)).lastInsertRowid;
      await tx.prepare("INSERT INTO user_skills(user_id, skill_id) VALUES (?, ?)").run(candidate, skillId);
    }

    await tx.query(
      "SELECT setval(pg_get_serial_sequence('jobs', 'id'), (SELECT MAX(id) FROM jobs))",
    );
  });
}

export async function publicUser(db, user) {
  if (!user) return null;
  const skills = (
    await db.prepare(`
      SELECT s.name FROM skills s
      JOIN user_skills us ON us.skill_id = s.id
      WHERE us.user_id = ? ORDER BY s.name
    `).all(user.id)
  ).map((item) => item.name);
  const savedJobs = (
    await db.prepare("SELECT job_id FROM saved_jobs WHERE user_id = ?").all(user.id)
  ).map((item) => item.job_id);
  const appliedJobs = (
    await db.prepare("SELECT job_id FROM applications WHERE candidate_id = ?").all(user.id)
  ).map((item) => item.job_id);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    location: user.location,
    desiredTitle: user.desired_title,
    dateOfBirth: user.date_of_birth,
    gender: user.gender,
    experienceLevel: user.experience_level,
    education: user.education,
    portfolio: user.portfolio,
    summary: user.summary,
    skills,
    savedJobs,
    appliedJobs,
    createdAt: user.created_at,
  };
}

export function mapJob(job) {
  return {
    id: job.id,
    employerId: job.employer_id,
    title: job.title,
    company: job.company,
    salary: job.salary,
    minSalary: job.min_salary,
    maxSalary: job.max_salary,
    location: job.location,
    type: job.type,
    status: job.status,
    description: job.description,
    category: job.category,
    experience: job.experience,
    companyField: job.company_field,
    jobField: job.job_field,
    saturday: job.saturday,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
  };
}
