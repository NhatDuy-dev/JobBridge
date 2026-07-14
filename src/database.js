import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword } from "./auth.js";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

export function openDatabase(filename = path.join(root, "data", "jobbridge.db")) {
  if (filename !== ":memory:") fs.mkdirSync(path.dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;");
  db.exec(fs.readFileSync(path.join(root, "database", "schema.sql"), "utf8"));
  migrateDatabase(db);
  seedDatabase(db);
  return db;
}

function migrateDatabase(db) {
  const applicationColumns = new Set(db.prepare("PRAGMA table_info(applications)").all().map((column) => column.name));
  const additions = [
    ["cv_id", "INTEGER"],
    ["cv_name", "TEXT NOT NULL DEFAULT ''"],
    ["withdrawn_at", "TEXT"],
  ];
  for (const [name, definition] of additions) {
    if (!applicationColumns.has(name)) db.exec(`ALTER TABLE applications ADD COLUMN ${name} ${definition}`);
  }

  const cvColumns = new Set(db.prepare("PRAGMA table_info(cvs)").all().map((column) => column.name));
  const cvAdditions = [
    ["original_file_name", "TEXT NOT NULL DEFAULT ''"],
    ["mime_type", "TEXT NOT NULL DEFAULT ''"],
    ["file_size", "INTEGER NOT NULL DEFAULT 0"],
    ["file_data", "BLOB"],
  ];
  for (const [name, definition] of cvAdditions) {
    if (!cvColumns.has(name)) db.exec(`ALTER TABLE cvs ADD COLUMN ${name} ${definition}`);
  }
}

function seedDatabase(db) {
  if (db.prepare("SELECT COUNT(*) AS count FROM users").get().count > 0) return;
  const insertUser = db.prepare("INSERT INTO users (name,email,password_hash,role,desired_title,phone,location,summary) VALUES (?,?,?,?,?,?,?,?)");
  const insertJob = db.prepare(`INSERT INTO jobs
    (id,employer_id,title,company,salary,min_salary,max_salary,location,type,status,description,category,experience,company_field,job_field,saturday)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  db.exec("BEGIN");
  try {
    const candidate = insertUser.run("Nguyen Minh Anh", "ungvien@test.com", hashPassword("123"), "candidate", "Frontend Developer", "0901234567", "TP.HCM", "Ứng viên frontend yêu thích xây dựng giao diện rõ ràng, dễ dùng.").lastInsertRowid;
    const employer = insertUser.run("Cong ty BridgeTech", "congty@test.com", hashPassword("123"), "employer", "", "", "TP.HCM", "").lastInsertRowid;
    insertUser.run("Quan tri vien", "admin@test.com", hashPassword("123"), "admin", "", "", "", "");
    const jobs = [
      [101, employer, "Frontend Developer", "BridgeTech", "20 - 35 trieu", 20, 35, "TP.HCM", "Full-time", "Approved", "Xay dung giao dien dashboard tuyen dung bang HTML, CSS va JavaScript.", "IT - Cong nghe thong tin", "1 nam", "Cong nghe", "IT - Cong nghe thong tin", "off"],
      [102, employer, "UI UX Designer", "Nova Studio", "18 - 30 trieu", 18, 30, "Ha Noi", "Full-time", "Approved", "Thiet ke flow ung tuyen, prototype va design system.", "Thiet ke va Kien truc", "2 nam", "Sang tao", "Marketing sang tao", "unknown"],
      [103, employer, "Backend Node.js Engineer", "CloudNest", "30 - 45 trieu", 30, 45, "Remote", "Remote", "Pending", "Phat trien API va quan ly co so du lieu viec lam.", "IT - Cong nghe thong tin", "3 nam", "Cong nghe", "IT - Cong nghe thong tin", "work"],
      [104, employer, "Data Analyst", "FinSight", "16 - 28 trieu", 16, 28, "Da Nang", "Remote", "Approved", "Phan tich du lieu ung vien va tao bao cao.", "Ke toan", "Duoi 1 nam", "Tai chinh", "Ke toan/Kiem toan", "off"]
    ];
    jobs.forEach((job) => insertJob.run(...job));
    const profileSnapshot = JSON.stringify({ name: "Nguyen Minh Anh", desiredTitle: "Frontend Developer", phone: "0901234567", location: "TP.HCM" });
    const cvId = db.prepare("INSERT INTO cvs(candidate_id,name,source,profile_snapshot) VALUES(?,?,?,?)").run(candidate, "CV Frontend Developer", "profile", profileSnapshot).lastInsertRowid;
    const app = db.prepare("INSERT INTO applications (candidate_id,job_id,status,applied_at,cv_id,cv_name) VALUES (?,?,?,?,?,?)");
    app.run(candidate, 101, "Da nop", "2026-07-01", cvId, "CV Frontend Developer");
    app.run(candidate, 102, "Len lich phong van", "2026-07-03", cvId, "CV Frontend Developer");
    app.run(candidate, 104, "Tu choi", "2026-07-05", cvId, "CV Frontend Developer");
    db.prepare("INSERT INTO saved_jobs (user_id,job_id) VALUES (?,?)").run(candidate, 102);
    for (const skill of ["ReactJS", "Figma", "JavaScript"]) {
      const skillId = db.prepare("INSERT INTO skills(name) VALUES (?)").run(skill).lastInsertRowid;
      db.prepare("INSERT INTO user_skills(user_id,skill_id) VALUES (?,?)").run(candidate, skillId);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function publicUser(db, user) {
  if (!user) return null;
  const skills = db.prepare("SELECT s.name FROM skills s JOIN user_skills us ON us.skill_id=s.id WHERE us.user_id=? ORDER BY s.name").all(user.id).map((x) => x.name);
  const savedJobs = db.prepare("SELECT job_id FROM saved_jobs WHERE user_id=?").all(user.id).map((x) => x.job_id);
  const appliedJobs = db.prepare("SELECT job_id FROM applications WHERE candidate_id=? AND withdrawn_at IS NULL").all(user.id).map((x) => x.job_id);
  return { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, location: user.location, desiredTitle: user.desired_title, dateOfBirth: user.date_of_birth, gender: user.gender, experienceLevel: user.experience_level, education: user.education, portfolio: user.portfolio, summary: user.summary, skills, savedJobs, appliedJobs, createdAt: user.created_at };
}

export function mapJob(job) {
  return { id: job.id, employerId: job.employer_id, title: job.title, company: job.company, salary: job.salary, minSalary: job.min_salary, maxSalary: job.max_salary, location: job.location, type: job.type, status: job.status, description: job.description, category: job.category, experience: job.experience, companyField: job.company_field, jobField: job.job_field, saturday: job.saturday, createdAt: job.created_at, updatedAt: job.updated_at };
}
