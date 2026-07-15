import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { openDatabase, publicUser, mapJob } from "./src/database.js";
import {
  createToken,
  hashPassword,
  hashToken,
  verifyPassword,
} from "./src/auth.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const db = openDatabase(process.env.DB_PATH || undefined);
const port = Number(process.env.PORT || 3000);
const SESSION_DAYS = 7;
const app = express();

function ensureAdminSchema() {
  const userColumns = new Set(
    db.prepare("PRAGMA table_info(users)").all().map((column) => column.name),
  );

  if (!userColumns.has("status")) {
    db.exec(`
      ALTER TABLE users
      ADD COLUMN status TEXT NOT NULL DEFAULT 'Active'
      CHECK (status IN ('Active', 'Locked'));
    `);
  }

  if (!userColumns.has("locked_reason")) {
    db.exec(`
      ALTER TABLE users
      ADD COLUMN locked_reason TEXT NOT NULL DEFAULT '';
    `);
  }

  if (!userColumns.has("locked_at")) {
    db.exec(`
      ALTER TABLE users
      ADD COLUMN locked_at TEXT;
    `);
  }

  if (!userColumns.has("last_login_at")) {
    db.exec(`
      ALTER TABLE users
      ADD COLUMN last_login_at TEXT;
    `);
  }

  const adminLogColumns = new Set(
    db
      .prepare("PRAGMA table_info(admin_logs)")
      .all()
      .map((column) => column.name),
  );

  const requiredAdminLogColumns = [
    "id",
    "admin_id",
    "action",
    "entity_type",
    "entity_id",
    "old_value",
    "new_value",
    "note",
    "created_at",
  ];

  if (
    adminLogColumns.size > 0 &&
    requiredAdminLogColumns.some(
      (column) => !adminLogColumns.has(column),
    )
  ) {
    db.exec("DROP TABLE admin_logs;");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL DEFAULT '',
      entity_id INTEGER,
      old_value TEXT NOT NULL DEFAULT '',
      new_value TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_users_role_status
    ON users(role, status);

    CREATE INDEX IF NOT EXISTS idx_admin_logs_created
    ON admin_logs(created_at DESC);
  `);
  const existingAdminLogCount = db
  .prepare(`
    SELECT COUNT(*) AS total
    FROM admin_logs
  `)
  .get().total;

if (existingAdminLogCount === 0) {
  const firstAdmin = db
    .prepare(`
      SELECT id
      FROM users
      WHERE role = 'admin'
      ORDER BY id ASC
      LIMIT 1
    `)
    .get();

  if (firstAdmin) {
    db.prepare(`
      INSERT INTO admin_logs (
        admin_id,
        action,
        entity_type,
        entity_id,
        old_value,
        new_value,
        note
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      firstAdmin.id,
      "LOGIN",
      "Admin",
      firstAdmin.id,
      "",
      "",
      "Khởi tạo nhật ký quản trị hệ thống",
    );
  }
}
}

ensureAdminSchema();

const json = (res, status, data) => {
  res.status(status).set("Cache-Control", "no-store");

  if (status === 204) {
    res.end();
    return;
  }

  res.json(data);
};

const fail = (
  res,
  status,
  message,
  code = "REQUEST_ERROR",
) => json(res, status, { error: { code, message } });

const body = async (req) => {
  return req.body || {};
};

const route = (pattern, pathname) => {
  const keys = [];

  const regex = new RegExp(
    `^${pattern.replace(/:([A-Za-z]+)/g, (_, key) => {
      keys.push(key);
      return "([^/]+)";
    })}$`,
  );

  const match = pathname.match(regex);

  return (
    match &&
    Object.fromEntries(
      keys.map((key, index) => [
        key,
        decodeURIComponent(match[index + 1]),
      ]),
    )
  );
};

const userByToken = (req) => {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];

  if (!token) {
    return null;
  }

  return db.prepare(`
    SELECT u.*
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE
      s.token_hash = ?
      AND s.expires_at > datetime('now')
  `).get(hashToken(token));
};

const requireUser = (req, res, roles) => {
  const user = userByToken(req);

  if (!user) {
    fail(res, 401, "Vui lòng đăng nhập", "UNAUTHORIZED");
    return null;
  }

  if (user.status === "Locked") {
    fail(res, 403, "Tài khoản đã bị khóa", "ACCOUNT_LOCKED");
    return null;
  }

  if (roles && !roles.includes(user.role)) {
    fail(
      res,
      403,
      "Bạn không có quyền thực hiện thao tác này",
      "FORBIDDEN",
    );
    return null;
  }

  return user;
};

const issueSession = (userId) => {
  const token = createToken();
  const expires = new Date(
    Date.now() + SESSION_DAYS * 86_400_000,
  ).toISOString();

  db.prepare(
    "DELETE FROM sessions WHERE expires_at <= datetime('now')",
  ).run();

  db.prepare(`
    INSERT INTO sessions(
      id,
      user_id,
      token_hash,
      expires_at
    )
    VALUES (?, ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    userId,
    hashToken(token),
    expires,
  );

  return {
    token,
    expiresAt: expires,
  };
};

const writeAdminLog = ({
  adminId,
  action,
  entityType,
  entityId = null,
  oldValue = "",
  newValue = "",
  note = "",
}) => {
  const normalizedOldValue =
    typeof oldValue === "string"
      ? oldValue
      : JSON.stringify(oldValue);

  const normalizedNewValue =
    typeof newValue === "string"
      ? newValue
      : JSON.stringify(newValue);

  db.prepare(`
    INSERT INTO admin_logs(
      admin_id,
      action,
      entity_type,
      entity_id,
      old_value,
      new_value,
      note
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    adminId,
    action,
    entityType,
    entityId,
    normalizedOldValue,
    normalizedNewValue,
    note,
  );
};

function selectAdminUserById(userId) {
  return db.prepare(`
    SELECT
      id,
      name,
      email,
      role,
      phone,
      location,
      desired_title AS desiredTitle,
      date_of_birth AS dateOfBirth,
      gender,
      experience_level AS experienceLevel,
      education,
      portfolio,
      summary,
      status,
      locked_reason AS lockedReason,
      locked_at AS lockedAt,
      last_login_at AS lastLoginAt,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM users
    WHERE id = ?
  `).get(userId);
}

async function api(req, res, url) {
  const { pathname, searchParams } = url;

  if (req.method === "GET" && pathname === "/api/health") {
    return json(res, 200, {
      status: "ok",
      database: "connected",
    });
  }

  if (req.method === "POST" && pathname === "/api/auth/register") {
    const data = await body(req);
    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim().toLowerCase();
    const password = String(data.password || "");
    const role = data.role;

    if (
      !name ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      password.length < 6
    ) {
      return fail(
        res,
        422,
        "Tên, email hợp lệ và mật khẩu tối thiểu 6 ký tự là bắt buộc",
        "VALIDATION_ERROR",
      );
    }

    if (!["candidate", "employer"].includes(role)) {
      return fail(
        res,
        422,
        "Vai trò không hợp lệ",
        "VALIDATION_ERROR",
      );
    }

    try {
      const userId = db.prepare(`
        INSERT INTO users(
          name,
          email,
          password_hash,
          role
        )
        VALUES (?, ?, ?, ?)
      `).run(
        name,
        email,
        hashPassword(password),
        role,
      ).lastInsertRowid;

      const session = issueSession(userId);
      const user = db
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(userId);

      return json(res, 201, {
        ...session,
        user: publicUser(db, user),
      });
    } catch (error) {
      if (
        error.code === "ERR_SQLITE_ERROR" &&
        error.message.includes("UNIQUE")
      ) {
        return fail(
          res,
          409,
          "Email đã được sử dụng",
          "EMAIL_EXISTS",
        );
      }

      throw error;
    }
  }

  if (req.method === "POST" && pathname === "/api/auth/login") {
    const data = await body(req);

    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(
        String(data.email || "")
          .trim()
          .toLowerCase(),
      );

    if (user?.status === "Locked") {
      return fail(
        res,
        403,
        user.locked_reason
          ? `Tài khoản đã bị khóa: ${user.locked_reason}`
          : "Tài khoản đã bị khóa",
        "ACCOUNT_LOCKED",
      );
    }

    if (
      !user ||
      !verifyPassword(
        String(data.password || ""),
        user.password_hash,
      )
    ) {
      return fail(
        res,
        401,
        "Email hoặc mật khẩu không đúng",
        "INVALID_CREDENTIALS",
      );
    }

    db.prepare(`
      UPDATE users
      SET
        last_login_at = datetime('now'),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(user.id);

    const updatedUser = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(user.id);
      if (updatedUser.role === "admin") {
  writeAdminLog({
    adminId: updatedUser.id,
    action: "LOGIN",
    entityType: "Admin",
    entityId: updatedUser.id,
    oldValue: "",
    newValue: "",
    note: "Quản trị viên đăng nhập hệ thống",
  });
}
if (updatedUser.role === "admin") {
  writeAdminLog({
    adminId: updatedUser.id,
    action: "LOGIN",
    entityType: "Admin",
    entityId: updatedUser.id,
    note: "Quản trị viên đăng nhập hệ thống",
  });
}
    return json(res, 200, {
      ...issueSession(user.id),
      user: publicUser(db, updatedUser),
    });
  }

  if (
  req.method === "POST" &&
  pathname === "/api/auth/logout"
) {
  const currentUser = userByToken(req);

  const token =
    req.headers.authorization
      ?.match(/^Bearer (.+)$/)?.[1];

  if (
    currentUser &&
    currentUser.role === "admin"
  ) {
    writeAdminLog({
      adminId: currentUser.id,
      action: "LOGOUT",
      entityType: "Admin",
      entityId: currentUser.id,
      note: "Quản trị viên đăng xuất hệ thống",
    });
  }

  if (token) {
    db.prepare(`
      DELETE FROM sessions
      WHERE token_hash = ?
    `).run(hashToken(token));
  }

  return json(res, 204, null);
}

  if (req.method === "GET" && pathname === "/api/auth/me") {
    const user = requireUser(req, res);

    if (!user) {
      return;
    }

    return json(res, 200, {
      user: publicUser(db, user),
    });
  }

  if (
    req.method === "GET" &&
    pathname === "/api/admin/dashboard"
  ) {
    const admin = requireUser(req, res, ["admin"]);

    if (!admin) {
      return;
    }

    const totalUsers = db
      .prepare("SELECT COUNT(*) AS total FROM users")
      .get().total;

    const totalCandidates = db.prepare(`
      SELECT COUNT(*) AS total
      FROM users
      WHERE role = 'candidate'
    `).get().total;

    const totalEmployers = db.prepare(`
      SELECT COUNT(*) AS total
      FROM users
      WHERE role = 'employer'
    `).get().total;

    const lockedUsers = db.prepare(`
      SELECT COUNT(*) AS total
      FROM users
      WHERE status = 'Locked'
    `).get().total;

    const totalJobs = db
      .prepare("SELECT COUNT(*) AS total FROM jobs")
      .get().total;

    const pendingJobs = db.prepare(`
      SELECT COUNT(*) AS total
      FROM jobs
      WHERE status = 'Pending'
    `).get().total;

    const approvedJobs = db.prepare(`
      SELECT COUNT(*) AS total
      FROM jobs
      WHERE status = 'Approved'
    `).get().total;

    const rejectedJobs = db.prepare(`
      SELECT COUNT(*) AS total
      FROM jobs
      WHERE status = 'Rejected'
    `).get().total;

    const closedJobs = db.prepare(`
      SELECT COUNT(*) AS total
      FROM jobs
      WHERE status = 'Closed'
    `).get().total;

    const totalApplications = db
      .prepare("SELECT COUNT(*) AS total FROM applications")
      .get().total;

    const hiredApplications = db.prepare(`
      SELECT COUNT(*) AS total
      FROM applications
      WHERE status = 'Da tuyen'
    `).get().total;

    const rejectedApplications = db.prepare(`
      SELECT COUNT(*) AS total
      FROM applications
      WHERE status = 'Tu choi'
    `).get().total;

    const recentUsers = db.prepare(`
      SELECT
        id,
        name,
        email,
        role,
        status,
        created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    const recentJobs = db.prepare(`
      SELECT
        id,
        title,
        company,
        status,
        created_at
      FROM jobs
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    return json(res, 200, {
      summary: {
        totalUsers,
        totalCandidates,
        totalEmployers,
        lockedUsers,
        totalJobs,
        pendingJobs,
        approvedJobs,
        rejectedJobs,
        closedJobs,
        totalApplications,
        hiredApplications,
        rejectedApplications,
      },
      recentUsers,
      recentJobs,
    });
  }

  /* =========================================
   CHỨC NĂNG 2 - QUẢN LÝ NGƯỜI DÙNG
   ========================================= */

if (
  req.method === "GET" &&
  pathname === "/api/admin/users"
) {
  const admin = requireUser(req, res, ["admin"]);

  if (!admin) {
    return;
  }

  const keyword = String(
    searchParams.get("q") || "",
  ).trim();

  const role = String(
    searchParams.get("role") || "",
  ).trim();

  const status = String(
    searchParams.get("status") || "",
  ).trim();

  const clauses = [];
  const values = [];

  if (keyword) {
    clauses.push(`
      (
        name LIKE ?
        OR email LIKE ?
      )
    `);

    const searchValue = `%${keyword}%`;

    values.push(searchValue, searchValue);
  }

  if (
    role &&
    ["candidate", "employer", "admin"].includes(role)
  ) {
    clauses.push("role = ?");
    values.push(role);
  }

  if (
    status &&
    ["Active", "Locked"].includes(status)
  ) {
    clauses.push("status = ?");
    values.push(status);
  }

  const whereClause =
    clauses.length > 0
      ? `WHERE ${clauses.join(" AND ")}`
      : "";

  const users = db.prepare(`
    SELECT
      id,
      name,
      email,
      role,
      status,
      last_login_at,
      created_at
    FROM users
    ${whereClause}
    ORDER BY created_at DESC
  `).all(...values);

  return json(res, 200, {
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLoginAt: user.last_login_at,
      createdAt: user.created_at,
    })),
  });
}


/* =========================================
   CHỨC NĂNG 4 - QUẢN LÝ DOANH NGHIỆP
   ========================================= */

if (
  req.method === "GET" &&
  pathname === "/api/admin/companies"
) {
  const admin = requireUser(req, res, ["admin"]);

  if (!admin) {
    return;
  }

  const keyword = String(
    searchParams.get("q") || "",
  ).trim();

  const status = String(
    searchParams.get("status") || "",
  ).trim();

  const clauses = [
    "u.role = 'employer'",
  ];

  const values = [];

  if (keyword) {
  clauses.push(`
    (
      u.name LIKE ?
      OR u.email LIKE ?
    )
  `);

  const searchValue = `%${keyword}%`;
  values.push(searchValue, searchValue);
}

  if (
  status &&
  ["Active", "Locked"].includes(status)
) {
  clauses.push("u.status = ?");
  values.push(status);
}

  const whereClause =
    `WHERE ${clauses.join(" AND ")}`;

  const companies = db.prepare(`
  SELECT
    u.id,
    u.name,
    u.email,
    u.status,
    u.last_login_at,
    u.created_at,

    COUNT(j.id) AS total_jobs,

    SUM(
      CASE
        WHEN j.status = 'Approved'
        THEN 1
        ELSE 0
      END
    ) AS approved_jobs,

    SUM(
      CASE
        WHEN j.status = 'Pending'
        THEN 1
        ELSE 0
      END
    ) AS pending_jobs

  FROM users u

  LEFT JOIN jobs j
    ON j.employer_id = u.id

  ${whereClause}

  GROUP BY
    u.id,
    u.name,
    u.email,
    u.status,
    u.last_login_at,
    u.created_at

  ORDER BY u.created_at DESC
`).all(...values);

return json(res, 200, {
  companies: companies.map((company) => ({
    id: company.id,
    name: company.name,
    email: company.email,
    status: company.status,
    lastLoginAt: company.last_login_at,
    createdAt: company.created_at,

    totalJobs: Number(company.total_jobs || 0),
    approvedJobs: Number(company.approved_jobs || 0),
    pendingJobs: Number(company.pending_jobs || 0),
  })),
});
}
   
/* =========================================
   CHỨC NĂNG 5 - QUẢN LÝ HỒ SƠ ỨNG TUYỂN
   GET DANH SÁCH HỒ SƠ
   ========================================= */

if (
  req.method === "GET" &&
  pathname === "/api/admin/applications"
) {
  const admin = requireUser(
    req,
    res,
    ["admin"],
  );

  if (!admin) {
    return;
  }

  const keyword = String(
    searchParams.get("q") || "",
  ).trim();

  const status = String(
    searchParams.get("status") || "",
  ).trim();

  const clauses = [];
  const values = [];

  if (keyword) {
    clauses.push(`
      (
        candidate.name LIKE ?
        OR candidate.email LIKE ?
        OR job.title LIKE ?
        OR job.company LIKE ?
      )
    `);

    const searchValue =
      `%${keyword}%`;

    values.push(
      searchValue,
      searchValue,
      searchValue,
      searchValue,
    );
  }

  if (status) {
    clauses.push(
      "application.status = ?",
    );

    values.push(status);
  }

  const whereClause =
    clauses.length > 0
      ? `WHERE ${clauses.join(" AND ")}`
      : "";

  const applications = db.prepare(`
  SELECT
    application.id,
    application.candidate_id,
    application.job_id,
    application.status,
    application.cover_letter,
    application.applied_at,

    candidate.name AS candidate_name,
    candidate.email AS candidate_email,

    job.title AS job_title,
    job.company AS company_name,
    job.location AS job_location,
    job.type AS job_type,
    job.status AS job_status

  FROM applications AS application

  JOIN users AS candidate
    ON candidate.id =
      application.candidate_id

  JOIN jobs AS job
    ON job.id =
      application.job_id

  ${whereClause}

  ORDER BY application.applied_at DESC
`).all(...values);

  return json(res, 200, {
    applications: applications.map(
      (application) => ({
        id: application.id,

        candidateId:
          application.candidate_id,

        candidateName:
          application.candidate_name,

        candidateEmail:
          application.candidate_email,

        jobId:
          application.job_id,

        jobTitle:
          application.job_title,

        companyName:
          application.company_name,

        jobLocation:
          application.job_location,

        jobType:
          application.job_type,

        jobStatus:
          application.job_status,

        status:
          application.status,

        coverLetter:
          application.cover_letter,

        createdAt:
          application.applied_at,

        updatedAt:
          application.updated_at,
      }),
    ),
  });
}
/* =========================================
   CHỨC NĂNG 7 - BÁO CÁO VI PHẠM
   GET DANH SÁCH
   ========================================= */

if (
  req.method === "GET" &&
  pathname === "/api/admin/reports"
) {
  const admin =
    requireUser(
      req,
      res,
      ["admin"],
    );

  if (!admin) {
    return;
  }

  const keyword = String(
    searchParams.get("q") || "",
  ).trim();

  const status = String(
    searchParams.get("status") || "",
  ).trim();

  const targetType = String(
    searchParams.get("type") || "",
  ).trim();

  const clauses = [];
  const values = [];

  if (keyword) {

    clauses.push(`(
      reporter.name LIKE ?
      OR reporter.email LIKE ?
      OR reports.reason LIKE ?
    )`);

    const search = `%${keyword}%`;

    values.push(
      search,
      search,
      search,
    );
  }

  if (status) {

    clauses.push(
      "reports.status = ?",
    );

    values.push(status);
  }

  if (targetType) {

    clauses.push(
      "reports.target_type = ?",
    );

    values.push(targetType);
  }

  const whereClause =
    clauses.length
      ? `WHERE ${clauses.join(
          " AND ",
        )}`
      : "";

  const reports = db.prepare(`
SELECT

    reports.id,

    reports.target_type,

    reports.target_id,

    reports.reason,

    reports.description,

    reports.status,

    reports.created_at,

    reports.resolved_at,

    reporter.name
        AS reporter_name,

    reporter.email
        AS reporter_email

FROM reports

LEFT JOIN users reporter

ON reporter.id =
reports.reporter_id

${whereClause}

ORDER BY
reports.created_at DESC

`).all(...values);

  return json(
    res,
    200,
    {

      reports:
        reports.map(
          (report) => ({

            id:
              report.id,

            reporterName:
              report.reporter_name,

            reporterEmail:
              report.reporter_email,

            targetType:
              report.target_type,

            targetId:
              report.target_id,

            reason:
              report.reason,

            description:
              report.description,

            status:
              report.status,

            createdAt:
              report.created_at,

            resolvedAt:
              report.resolved_at,
          }),
        ),
    },
  );
}
/* =========================================
   CHỨC NĂNG 8 - NHẬT KÝ ADMIN
   GET DANH SÁCH
   ========================================= */

if (
  req.method === "GET" &&
  pathname === "/api/admin/logs"
) {
  const admin = requireUser(
    req,
    res,
    ["admin"],
  );

  if (!admin) {
    return;
  }

  const keyword = String(
    searchParams.get("q") || "",
  ).trim();

  const action = String(
    searchParams.get("action") || "",
  ).trim();

  const clauses = [];
  const values = [];

  if (keyword) {
    clauses.push(`
      (
        admin_user.name LIKE ?
        OR admin_user.email LIKE ?
        OR admin_logs.action LIKE ?
        OR admin_logs.entity_type LIKE ?
        OR admin_logs.note LIKE ?
      )
    `);

    const searchValue = `%${keyword}%`;

    values.push(
      searchValue,
      searchValue,
      searchValue,
      searchValue,
      searchValue,
    );
  }

  if (action) {
    clauses.push(
      "admin_logs.action = ?",
    );
    values.push(action);
  }

  const whereClause =
    clauses.length
      ? `WHERE ${clauses.join(" AND ")}`
      : "";

  const logs = db.prepare(`
    SELECT
      admin_logs.id,
      admin_logs.admin_id,
      admin_logs.action,
      admin_logs.entity_type,
      admin_logs.entity_id,
      admin_logs.old_value,
      admin_logs.new_value,
      admin_logs.note,
      admin_logs.created_at,

      admin_user.name AS admin_name,
      admin_user.email AS admin_email

    FROM admin_logs

    LEFT JOIN users AS admin_user
      ON admin_user.id = admin_logs.admin_id

    ${whereClause}

    ORDER BY admin_logs.created_at DESC
  `).all(...values);

  return json(res, 200, {
    logs: logs.map((log) => ({
      id: log.id,
      adminId: log.admin_id,
      adminName: log.admin_name,
      adminEmail: log.admin_email,
      action: log.action,
      targetType: log.entity_type,
      targetId: log.entity_id,
      description:
        log.note ||
        log.new_value ||
        log.old_value ||
        "",
      oldValue: log.old_value,
      newValue: log.new_value,
      createdAt: log.created_at,
    })),
  });
}
/* =========================================
   CHỨC NĂNG 9 - LẤY CẤU HÌNH HỆ THỐNG
   ========================================= */

if (
  req.method === "GET" &&
  pathname === "/api/admin/settings"
) {
  const admin = requireUser(
    req,
    res,
    ["admin"],
  );

  if (!admin) {
    return;
  }

  const rows = db.prepare(`
    SELECT
      setting_key,
      setting_value,
      updated_at,
      updated_by
    FROM system_settings
    ORDER BY setting_key ASC
  `).all();

  const settings = {};

  for (const row of rows) {
    settings[row.setting_key] =
      row.setting_value;
  }

  return json(res, 200, {
    settings,
  });
}
/* =========================================
   CHỨC NĂNG 9 - CẬP NHẬT CẤU HÌNH
   ========================================= */

if (
  req.method === "PUT" &&
  pathname === "/api/admin/settings"
) {
  const admin = requireUser(
    req,
    res,
    ["admin"],
  );

  if (!admin) {
    return;
  }

  const data = await body(req);

  const allowedKeys = [
    "site_name",
    "support_email",
    "allow_registration",
    "allow_job_posting",
    "require_job_approval",
    "log_retention_days",
    "maintenance_mode",
  ];

  const siteName = String(
    data.site_name || "",
  ).trim();

  const supportEmail = String(
    data.support_email || "",
  ).trim();

  const retentionDays = Number(
    data.log_retention_days,
  );

  if (!siteName) {
    return fail(
      res,
      422,
      "Tên hệ thống không được để trống",
      "VALIDATION_ERROR",
    );
  }

  if (
    supportEmail &&
    !/^\S+@\S+\.\S+$/.test(
      supportEmail,
    )
  ) {
    return fail(
      res,
      422,
      "Email hỗ trợ không hợp lệ",
      "VALIDATION_ERROR",
    );
  }

  if (
    !Number.isInteger(retentionDays) ||
    retentionDays < 1 ||
    retentionDays > 3650
  ) {
    return fail(
      res,
      422,
      "Số ngày lưu nhật ký phải từ 1 đến 3650",
      "VALIDATION_ERROR",
    );
  }

  const oldRows = db.prepare(`
    SELECT
      setting_key,
      setting_value
    FROM system_settings
  `).all();

  const oldSettings =
    Object.fromEntries(
      oldRows.map((row) => [
        row.setting_key,
        row.setting_value,
      ]),
    );

  const updateSetting = db.prepare(`
    INSERT INTO system_settings (
      setting_key,
      setting_value,
      updated_at,
      updated_by
    )
    VALUES (
      ?,
      ?,
      datetime('now'),
      ?
    )

    ON CONFLICT(setting_key)
    DO UPDATE SET
      setting_value =
        excluded.setting_value,

      updated_at =
        datetime('now'),

      updated_by =
        excluded.updated_by
  `);

  try {
  db.exec("BEGIN");

  for (const key of allowedKeys) {
    if (
      Object.prototype.hasOwnProperty.call(
        data,
        key,
      )
    ) {
      updateSetting.run(
        key,
        String(data[key]),
        admin.id,
      );
    }
  }

  db.exec("COMMIT");
} catch (error) {
  try {
    db.exec("ROLLBACK");
  } catch {
    // Không làm gì nếu transaction chưa bắt đầu.
  }

  throw error;
}



  const newRows = db.prepare(`
    SELECT
      setting_key,
      setting_value
    FROM system_settings
  `).all();

  const newSettings =
    Object.fromEntries(
      newRows.map((row) => [
        row.setting_key,
        row.setting_value,
      ]),
    );

  /* Ghi Nhật ký Admin */
  writeAdminLog({
    adminId: admin.id,
    action: "UPDATE_SETTINGS",
    entityType: "System",
    entityId: null,

    oldValue:
      oldSettings,

    newValue:
      newSettings,

    note:
      "Cập nhật cấu hình hệ thống",
  });

  const updateInfo = db.prepare(`
    SELECT
      datetime('now') AS updated_at,
      id,
      name,
      email
    FROM users
    WHERE id = ?
  `).get(admin.id);

  return json(res, 200, {
    message:
      "Đã cập nhật cấu hình hệ thống.",

    settings:
      newSettings,

    meta: {
      updatedAt:
        updateInfo?.updated_at || "",

      updatedBy:
        updateInfo?.id || null,

      updatedByName:
        updateInfo?.name || "",

      updatedByEmail:
        updateInfo?.email || "",
    },
  });
}
function buildAdminLogDescription(log) {
  const labels = {
    LOGIN:
      "Quản trị viên đăng nhập hệ thống",

    LOGOUT:
      "Quản trị viên đăng xuất hệ thống",

    LOCK_USER:
      "Khóa tài khoản người dùng",

    UNLOCK_USER:
      "Mở khóa tài khoản người dùng",

    UPDATE_ROLE:
      "Thay đổi vai trò người dùng",

    DELETE_USER:
      "Xóa tài khoản người dùng",

    APPROVE_JOB:
      "Duyệt tin tuyển dụng",

    REJECT_JOB:
      "Từ chối tin tuyển dụng",

    UPDATE_APPLICATION:
      "Cập nhật trạng thái hồ sơ ứng tuyển",

    RESOLVE_REPORT:
      "Xử lý báo cáo vi phạm",
  };

  return (
    labels[log.action] ||
    log.action ||
    "Thực hiện thao tác quản trị"
  );
}
  let adminUserParams = route(
    "/api/admin/users/:id/status",
    pathname,
  );

  if (req.method === "PATCH" && adminUserParams) {
    const admin = requireUser(req, res, ["admin"]);

    if (!admin) {
      return;
    }

    const targetUserId = Number(adminUserParams.id);

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return fail(
        res,
        400,
        "ID người dùng không hợp lệ",
        "INVALID_USER_ID",
      );
    }

    if (targetUserId === admin.id) {
      return fail(
        res,
        400,
        "Bạn không thể khóa tài khoản của chính mình",
        "CANNOT_MODIFY_SELF",
      );
    }

    const data = await body(req);
    const nextStatus = String(data.status || "").trim();
    const reason = String(data.reason || "").trim();

    if (!["Active", "Locked"].includes(nextStatus)) {
      return fail(
        res,
        422,
        "Trạng thái tài khoản không hợp lệ",
        "VALIDATION_ERROR",
      );
    }

    if (nextStatus === "Locked" && !reason) {
      return fail(
        res,
        422,
        "Vui lòng nhập lý do khóa tài khoản",
        "LOCK_REASON_REQUIRED",
      );
    }

    const oldUser = db.prepare(`
      SELECT
        id,
        name,
        email,
        role,
        status,
        locked_reason
      FROM users
      WHERE id = ?
    `).get(targetUserId);

    if (!oldUser) {
      return fail(
        res,
        404,
        "Không tìm thấy người dùng",
        "USER_NOT_FOUND",
      );
    }

    db.prepare(`
      UPDATE users
      SET
        status = ?,
        locked_reason = ?,
        locked_at = CASE
          WHEN ? = 'Locked' THEN datetime('now')
          ELSE NULL
        END,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      nextStatus,
      nextStatus === "Locked" ? reason : "",
      nextStatus,
      targetUserId,
    );
writeAdminLog({
  adminId: admin.id,

  action:
    nextStatus === "Locked"
      ? "LOCK_USER"
      : "UNLOCK_USER",

  entityType: "User",
  entityId: targetUserId,

  oldValue: {
    name: oldUser.name,
    email: oldUser.email,
    status: oldUser.status,
    lockedReason:
      oldUser.locked_reason || "",
  },

  newValue: {
    status: nextStatus,
    lockedReason:
      nextStatus === "Locked"
        ? reason
        : "",
  },

  note:
    nextStatus === "Locked"
      ? `Khóa tài khoản ${oldUser.name}. Lý do: ${reason}`
      : `Mở khóa tài khoản ${oldUser.name}`,
});
    if (nextStatus === "Locked") {
      db.prepare(
        "DELETE FROM sessions WHERE user_id = ?",
      ).run(targetUserId);
    }

    const updatedUser = selectAdminUserById(targetUserId);

    writeAdminLog({
      adminId: admin.id,
      action:
        nextStatus === "Locked"
          ? "LOCK_USER"
          : "UNLOCK_USER",
      entityType: "User",
      entityId: targetUserId,
      oldValue: {
        status: oldUser.status,
        lockedReason: oldUser.locked_reason,
      },
      newValue: {
        status: updatedUser.status,
        lockedReason: updatedUser.lockedReason,
      },
      note: reason,
    });

    return json(res, 200, {
      user: updatedUser,
      message:
        nextStatus === "Locked"
          ? "Đã khóa tài khoản"
          : "Đã mở khóa tài khoản",
    });
  }

  adminUserParams = route(
    "/api/admin/users/:id/role",
    pathname,
  );

  if (req.method === "PATCH" && adminUserParams) {
    const admin = requireUser(req, res, ["admin"]);

    if (!admin) {
      return;
    }

    const targetUserId = Number(adminUserParams.id);

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return fail(
        res,
        400,
        "ID người dùng không hợp lệ",
        "INVALID_USER_ID",
      );
    }

    if (targetUserId === admin.id) {
      return fail(
        res,
        400,
        "Bạn không thể thay đổi vai trò của chính mình",
        "CANNOT_MODIFY_SELF",
      );
    }

    const data = await body(req);
    const nextRole = String(data.role || "").trim();

    if (!["candidate", "employer", "admin"].includes(nextRole)) {
      return fail(
        res,
        422,
        "Vai trò không hợp lệ",
        "VALIDATION_ERROR",
      );
    }

    const oldUser = db.prepare(`
      SELECT
        id,
        name,
        email,
        role,
        status
      FROM users
      WHERE id = ?
    `).get(targetUserId);

    if (!oldUser) {
      return fail(
        res,
        404,
        "Không tìm thấy người dùng",
        "USER_NOT_FOUND",
      );
    }

    db.prepare(`
      UPDATE users
      SET
        role = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(nextRole, targetUserId);
writeAdminLog({
  adminId: admin.id,
  action: "UPDATE_ROLE",
  entityType: "User",
  entityId: targetUserId,

  oldValue: {
    role: oldUser.role,
  },

  newValue: {
    role: nextRole,
  },

  note:
    `Đổi vai trò của ${oldUser.name} từ ${oldUser.role} sang ${nextRole}`,
});
    db.prepare(
      "DELETE FROM sessions WHERE user_id = ?",
    ).run(targetUserId);

    const updatedUser = selectAdminUserById(targetUserId);

    writeAdminLog({
      adminId: admin.id,
      action: "CHANGE_USER_ROLE",
      entityType: "User",
      entityId: targetUserId,
      oldValue: { role: oldUser.role },
      newValue: { role: updatedUser.role },
    });

    return json(res, 200, {
      user: updatedUser,
      message: "Đã cập nhật vai trò người dùng",
    });
  }

  adminUserParams = route(
    "/api/admin/users/:id",
    pathname,
  );

  if (req.method === "GET" && adminUserParams) {
    const admin = requireUser(req, res, ["admin"]);

    if (!admin) {
      return;
    }

    const targetUserId = Number(adminUserParams.id);
    const user = selectAdminUserById(targetUserId);

    if (!user) {
      return fail(
        res,
        404,
        "Không tìm thấy người dùng",
        "USER_NOT_FOUND",
      );
    }

    return json(res, 200, { user });
  }

  if (req.method === "DELETE" && adminUserParams) {
    const admin = requireUser(req, res, ["admin"]);

    if (!admin) {
      return;
    }

    const targetUserId = Number(adminUserParams.id);

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return fail(
        res,
        400,
        "ID người dùng không hợp lệ",
        "INVALID_USER_ID",
      );
    }

    if (targetUserId === admin.id) {
      return fail(
        res,
        400,
        "Bạn không thể xóa tài khoản của chính mình",
        "CANNOT_DELETE_SELF",
      );
    }

    const targetUser = db.prepare(`
      SELECT
        id,
        name,
        email,
        role,
        status
      FROM users
      WHERE id = ?
    `).get(targetUserId);

    if (!targetUser) {
      return fail(
        res,
        404,
        "Không tìm thấy người dùng",
        "USER_NOT_FOUND",
      );
    }

    if (targetUser.role === "admin") {
      return fail(
        res,
        403,
        "Không được phép xóa tài khoản Admin",
        "CANNOT_DELETE_ADMIN",
      );
    }

    writeAdminLog({
      adminId: admin.id,
      action: "DELETE_USER",
      entityType: "User",
      entityId: targetUserId,
      oldValue: targetUser,
      note: "Xóa tài khoản khỏi hệ thống",
    });

    const result = db
      .prepare("DELETE FROM users WHERE id = ?")
      .run(targetUserId);

    if (!result.changes) {
      return fail(
        res,
        404,
        "Không tìm thấy người dùng",
        "USER_NOT_FOUND",
      );
    }

    return json(res, 200, {
      deleted: true,
      message: "Đã xóa tài khoản",
    });
  }

  if (req.method === "GET" && pathname === "/api/jobs") {
    const current = userByToken(req);
    const clauses = [];
    const values = [];

    if (current?.role !== "admin") {
      clauses.push("status = 'Approved'");
    }

    if (
      searchParams.get("status") &&
      current?.role === "admin"
    ) {
      clauses.push("status = ?");
      values.push(searchParams.get("status"));
    }

    for (const [query, column] of [
      ["location", "location"],
      ["type", "type"],
      ["category", "category"],
    ]) {
      if (searchParams.get(query)) {
        clauses.push(`${column} = ?`);
        values.push(searchParams.get(query));
      }
    }

    if (searchParams.get("q")) {
      clauses.push(
        "(title LIKE ? OR company LIKE ? OR description LIKE ?)",
      );
      values.push(
        ...Array(3).fill(`%${searchParams.get("q")}%`),
      );
    }

    const jobs = db.prepare(`
      SELECT *
      FROM jobs
      ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""}
      ORDER BY created_at DESC
    `).all(...values);

    return json(res, 200, {
      jobs: jobs.map(mapJob),
      total: jobs.length,
    });
  }

  let params = route("/api/jobs/:id", pathname);

  if (req.method === "GET" && params) {
    const job = db
      .prepare("SELECT * FROM jobs WHERE id = ?")
      .get(Number(params.id));

    if (
      !job ||
      (job.status !== "Approved" &&
        userByToken(req)?.role !== "admin")
    ) {
      return fail(
        res,
        404,
        "Không tìm thấy việc làm",
        "NOT_FOUND",
      );
    }

    return json(res, 200, {
      job: mapJob(job),
    });
  }

  if (req.method === "POST" && pathname === "/api/jobs") {
    const user = requireUser(req, res, ["employer", "admin"]);

    if (!user) {
      return;
    }

    const data = await body(req);

    for (const key of [
      "title",
      "company",
      "salary",
      "location",
      "description",
    ]) {
      if (!String(data[key] || "").trim()) {
        return fail(
          res,
          422,
          `Thiếu trường ${key}`,
          "VALIDATION_ERROR",
        );
      }
    }

    const result = db.prepare(`
      INSERT INTO jobs(
        employer_id,
        title,
        company,
        salary,
        min_salary,
        max_salary,
        location,
        type,
        status,
        description,
        category,
        experience,
        company_field,
        job_field,
        saturday
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      user.id,
      data.title.trim(),
      data.company.trim(),
      data.salary.trim(),
      Number(data.minSalary || 0),
      Number(data.maxSalary || data.minSalary || 0),
      data.location.trim(),
      data.type || "Full-time",
      user.role === "admin"
        ? data.status || "Approved"
        : "Pending",
      data.description.trim(),
      data.category || "",
      data.experience || "",
      data.companyField || "",
      data.jobField || "",
      data.saturday || "unknown",
    );

    const job = db
      .prepare("SELECT * FROM jobs WHERE id = ?")
      .get(result.lastInsertRowid);

    return json(res, 201, {
      job: mapJob(job),
    });
  }

  params = route("/api/jobs/:id/status", pathname);

  if (req.method === "PATCH" && params) {
    const user = requireUser(req, res, ["admin"]);

    if (!user) {
      return;
    }

    const data = await body(req);

    if (
      !["Pending", "Approved", "Rejected", "Closed"].includes(
        data.status,
      )
    ) {
      return fail(
        res,
        422,
        "Trạng thái không hợp lệ",
        "VALIDATION_ERROR",
      );
    }
const oldJob = db.prepare(`
  SELECT
    id,
    title,
    company,
    status
  FROM jobs
  WHERE id = ?
`).get(jobId);

if (!oldJob) {
  return fail(
    res,
    404,
    "Không tìm thấy tin tuyển dụng",
    "JOB_NOT_FOUND",
  );
}
    const result = db.prepare(`
      UPDATE jobs
      SET
        status = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(data.status, Number(params.id));
const jobActionMap = {
  Approved: "APPROVE_JOB",
  Rejected: "REJECT_JOB",
  Closed: "CLOSE_JOB",
  Pending: "UPDATE_JOB",
};

const jobActionLabelMap = {
  Approved: "Duyệt tin tuyển dụng",
  Rejected: "Từ chối tin tuyển dụng",
  Closed: "Đóng tin tuyển dụng",
  Pending: "Chuyển tin về trạng thái chờ duyệt",
};

writeAdminLog({
  adminId: admin.id,

  action:
    jobActionMap[nextStatus] ||
    "UPDATE_JOB",

  entityType: "Job",
  entityId: jobId,

  oldValue: {
    title: oldJob.title,
    status: oldJob.status,
  },

  newValue: {
    status: nextStatus,
  },

  note:
    `${
      jobActionLabelMap[nextStatus] ||
      "Cập nhật tin tuyển dụng"
    }: ${oldJob.title}`,
});
    if (!result.changes) {
      return fail(
        res,
        404,
        "Không tìm thấy việc làm",
        "NOT_FOUND",
      );
    }

    const job = db
      .prepare("SELECT * FROM jobs WHERE id = ?")
      .get(Number(params.id));

    return json(res, 200, {
      job: mapJob(job),
    });
  }

  const deleteJobParams = route(
    "/api/jobs/:id",
    pathname,
  );

  if (req.method === "DELETE" && deleteJobParams) {
    const admin = requireUser(req, res, ["admin"]);

    if (!admin) {
      return;
    }

    const jobId = Number(deleteJobParams.id);

    if (!Number.isInteger(jobId) || jobId <= 0) {
      return fail(
        res,
        400,
        "ID tin tuyển dụng không hợp lệ",
        "INVALID_JOB_ID",
      );
    }

    const oldJob = db.prepare(`
      SELECT
        id,
        title,
        company,
        status
      FROM jobs
      WHERE id = ?
    `).get(jobId);

    if (!oldJob) {
      return fail(
        res,
        404,
        "Không tìm thấy tin tuyển dụng",
        "JOB_NOT_FOUND",
      );
    }

    writeAdminLog({
      adminId: admin.id,
      action: "DELETE_JOB",
      entityType: "Job",
      entityId: jobId,
      oldValue: oldJob,
      note: "Xóa tin tuyển dụng khỏi hệ thống",
    });

    db.prepare(
      "DELETE FROM jobs WHERE id = ?",
    ).run(jobId);

    return json(res, 200, {
      deleted: true,
      message: "Đã xóa tin tuyển dụng",
    });
  }

  if (
    req.method === "POST" &&
    pathname === "/api/applications"
  ) {
    const user = requireUser(req, res, ["candidate"]);

    if (!user) {
      return;
    }

    const data = await body(req);
    const job = db.prepare(`
      SELECT *
      FROM jobs
      WHERE id = ? AND status = 'Approved'
    `).get(Number(data.jobId));

    if (!job) {
      return fail(
        res,
        404,
        "Việc làm không tồn tại hoặc chưa được duyệt",
        "NOT_FOUND",
      );
    }

    try {
      const applicationId = db.prepare(`
        INSERT INTO applications(
          candidate_id,
          job_id,
          cover_letter
        )
        VALUES (?, ?, ?)
      `).run(
        user.id,
        job.id,
        String(data.coverLetter || ""),
      ).lastInsertRowid;

      const application = db.prepare(`
        SELECT *
        FROM applications
        WHERE id = ?
      `).get(applicationId);

      return json(res, 201, { application });
    } catch (error) {
      if (error.message.includes("UNIQUE")) {
        return fail(
          res,
          409,
          "Bạn đã ứng tuyển công việc này",
          "ALREADY_APPLIED",
        );
      }

      throw error;
    }
  }

  if (
    req.method === "GET" &&
    pathname === "/api/applications"
  ) {
    const user = requireUser(req, res);

    if (!user) {
      return;
    }

    const whereClause =
      user.role === "candidate"
        ? "a.candidate_id = ?"
        : user.role === "employer"
          ? "j.employer_id = ?"
          : "1 = 1";

    const values = user.role === "admin" ? [] : [user.id];

    const applications = db.prepare(`
      SELECT
        a.*,
        u.name AS candidate_name,
        j.title AS job_title,
        j.company
      FROM applications a
      JOIN users u ON u.id = a.candidate_id
      JOIN jobs j ON j.id = a.job_id
      WHERE ${whereClause}
      ORDER BY a.applied_at DESC
    `).all(...values);

    return json(res, 200, { applications });
  }

  params = route("/api/applications/:id/status", pathname);

  if (req.method === "PATCH" && params) {
    const user = requireUser(req, res, ["employer", "admin"]);

    if (!user) {
      return;
    }

    const data = await body(req);

    if (
      ![
        "Da nop",
        "Len lich phong van",
        "Da tuyen",
        "Tu choi",
      ].includes(data.status)
    ) {
      return fail(
        res,
        422,
        "Trạng thái không hợp lệ",
        "VALIDATION_ERROR",
      );
    }

    const ownerConstraint =
      user.role === "admin"
        ? ""
        : " AND job_id IN (SELECT id FROM jobs WHERE employer_id = ?)";

    const result = db.prepare(`
      UPDATE applications
      
      SET
        status = ?,
        updated_at = datetime('now')
      WHERE id = ?${ownerConstraint}
    `).run(
      data.status,
      Number(params.id),
      ...(user.role === "admin" ? [] : [user.id]),
    );
writeAdminLog({
  adminId: admin.id,
  action: "UPDATE_APPLICATION",
  entityType: "Application",
  entityId: applicationId,

  oldValue: {
    status: oldApplication.status,
  },

  newValue: {
    status: nextStatus,
  },

  note:
    `Cập nhật hồ sơ của ${oldApplication.candidate_name} cho vị trí ${oldApplication.job_title}: ${oldApplication.status} → ${nextStatus}`,
});
    if (!result.changes) {
      return fail(
        res,
        404,
        "Không tìm thấy hồ sơ",
        "NOT_FOUND",
      );
    }

    const application = db.prepare(`
      SELECT *
      FROM applications
      WHERE id = ?
    `).get(Number(params.id));

    return json(res, 200, { application });
  }

  params = route("/api/saved-jobs/:jobId", pathname);

  if (params && req.method === "POST") {
    const user = requireUser(req, res, ["candidate"]);

    if (!user) {
      return;
    }

    db.prepare(`
      INSERT OR IGNORE INTO saved_jobs(
        user_id,
        job_id
      )
      VALUES (?, ?)
    `).run(user.id, Number(params.jobId));

    return json(res, 201, { saved: true });
  }

  if (params && req.method === "DELETE") {
    const user = requireUser(req, res, ["candidate"]);

    if (!user) {
      return;
    }

    db.prepare(`
      DELETE FROM saved_jobs
      WHERE user_id = ? AND job_id = ?
    `).run(user.id, Number(params.jobId));

    return json(res, 200, { saved: false });
  }

  if (
    req.method === "GET" &&
    pathname === "/api/saved-jobs"
  ) {
    const user = requireUser(req, res, ["candidate"]);

    if (!user) {
      return;
    }

    const jobs = db.prepare(`
      SELECT j.*
      FROM jobs j
      JOIN saved_jobs s ON s.job_id = j.id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
    `).all(user.id).map(mapJob);

    return json(res, 200, { jobs });
  }

  if (req.method === "PATCH" && pathname === "/api/profile") {
    const user = requireUser(req, res);

    if (!user) {
      return;
    }

    const data = await body(req);

    const fields = {
      name: "name",
      phone: "phone",
      location: "location",
      desiredTitle: "desired_title",
      dateOfBirth: "date_of_birth",
      gender: "gender",
      experienceLevel: "experience_level",
      education: "education",
      portfolio: "portfolio",
      summary: "summary",
    };

    const updates = Object.entries(fields).filter(
      ([key]) => key in data,
    );

    if (updates.length) {
      db.prepare(`
        UPDATE users
        SET
          ${updates.map(([, column]) => `${column} = ?`).join(", ")},
          updated_at = datetime('now')
        WHERE id = ?
      `).run(
        ...updates.map(([key]) => String(data[key] ?? "").trim()),
        user.id,
      );
    }

    if (Array.isArray(data.skills)) {
      db.prepare(
        "DELETE FROM user_skills WHERE user_id = ?",
      ).run(user.id);

      const uniqueSkills = [
        ...new Set(
          data.skills
            .map((skill) => String(skill).trim())
            .filter(Boolean),
        ),
      ];

      for (const skill of uniqueSkills) {
        db.prepare(
          "INSERT OR IGNORE INTO skills(name) VALUES (?)",
        ).run(skill);

        const skillId = db
          .prepare("SELECT id FROM skills WHERE name = ?")
          .get(skill).id;

        db.prepare(`
          INSERT INTO user_skills(
            user_id,
            skill_id
          )
          VALUES (?, ?)
        `).run(user.id, skillId);
      }
    }

    const updatedUser = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(user.id);

    return json(res, 200, {
      user: publicUser(db, updatedUser),
    });
  }
/* =========================================
   CHỨC NĂNG 5 - QUẢN LÝ HỒ SƠ ỨNG TUYỂN
   GET DANH SÁCH HỒ SƠ
   ========================================= */

if (
  req.method === "GET" &&
  pathname === "/api/admin/applications"
) {
  const admin = requireUser(
    req,
    res,
    ["admin"],
  );

  if (!admin) {
    return;
  }

  const keyword = String(
    searchParams.get("q") || "",
  ).trim();

  const status = String(
    searchParams.get("status") || "",
  ).trim();

  const clauses = [];
  const values = [];

  if (keyword) {
    clauses.push(`
      (
        candidate.name LIKE ?
        OR candidate.email LIKE ?
        OR job.title LIKE ?
        OR job.company LIKE ?
      )
    `);

    const searchValue = `%${keyword}%`;

    values.push(
      searchValue,
      searchValue,
      searchValue,
      searchValue,
    );
  }

  if (status) {
    clauses.push(
      "application.status = ?",
    );

    values.push(status);
  }

  const whereClause =
    clauses.length > 0
      ? `WHERE ${clauses.join(" AND ")}`
      : "";

  const applications = db.prepare(`
SELECT
    application.id,
    application.candidate_id,
    application.job_id,
    application.status,
    application.cover_letter,
    application.created_at,
    application.updated_at,

    candidate.name  AS candidate_name,
    candidate.email AS candidate_email,

    job.title       AS job_title,
    job.company     AS company_name,
    job.location    AS job_location,
    job.type        AS job_type,
    job.status      AS job_status

FROM applications application

JOIN users candidate
ON candidate.id = application.candidate_id

JOIN jobs job
ON job.id = application.job_id

${whereClause}

ORDER BY application.created_at DESC
`).all(...values);

  return json(res, 200, {
    applications: applications.map(
      (application) => ({
        id: application.id,

        candidateId:
          application.candidate_id,

        candidateName:
          application.candidate_name,

        candidateEmail:
          application.candidate_email,

        jobId:
          application.job_id,

        jobTitle:
          application.job_title,

        companyName:
          application.company_name,

        jobLocation:
          application.job_location,

        jobType:
          application.job_type,

        jobStatus:
          application.job_status,

        status:
          application.status,

        coverLetter:
          application.cover_letter,

        createdAt:
          application.created_at,

        updatedAt:
          application.updated_at,
      }),
    ),
  });
}
  return fail(
    res,
    404,
    "API không tồn tại",
    "NOT_FOUND",
  );
}

app.use(express.json({ limit: 1_000_000 }));

app.use("/api", async (req, res, next) => {
  const url = new URL(
    req.originalUrl,
    `http://${req.headers.host || "localhost"}`,
  );

  try {
    await api(req, res, url);
  } catch (error) {
    next(error);
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(root, "html", "index.html"));
});

for (const directory of ["assets", "css", "html", "js"]) {
  app.use(
    `/${directory}`,
    express.static(path.join(root, directory), { index: false }),
  );
}

app.use((req, res) => {
  fail(
    res,
    404,
    "Không tìm thấy tài nguyên",
    "NOT_FOUND",
  );
});

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  const status = error.status || 500;
  let message = status < 500 ? error.message : "Lỗi máy chủ";

  if (error.type === "entity.too.large") {
    message = "Dữ liệu quá lớn";
  } else if (error.type === "entity.parse.failed") {
    message = "JSON không hợp lệ";
  }

  return fail(res, status, message, "INTERNAL_ERROR");
});

const server = app.listen(port, () => {
  console.log(`JobBridge: http://localhost:${port}`);
});

export { app, server, db };
