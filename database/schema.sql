PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('candidate', 'employer', 'admin')),
  phone TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  desired_title TEXT NOT NULL DEFAULT '',
  date_of_birth TEXT,
  gender TEXT NOT NULL DEFAULT '',
  experience_level TEXT NOT NULL DEFAULT '',
  education TEXT NOT NULL DEFAULT '',
  portfolio TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Active'
    CHECK (status IN ('Active', 'Locked')),
  locked_reason TEXT NOT NULL DEFAULT '',
  locked_at TEXT,
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL COLLATE NOCASE UNIQUE
);

CREATE TABLE IF NOT EXISTS user_skills (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  salary TEXT NOT NULL,
  min_salary INTEGER NOT NULL DEFAULT 0 CHECK (min_salary >= 0),
  max_salary INTEGER NOT NULL DEFAULT 0 CHECK (max_salary >= min_salary),
  location TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Full-time',
  status TEXT NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Closed')),
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  experience TEXT NOT NULL DEFAULT '',
  company_field TEXT NOT NULL DEFAULT '',
  job_field TEXT NOT NULL DEFAULT '',
  saturday TEXT NOT NULL DEFAULT 'unknown',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  candidate_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Da nop' CHECK (status IN ('Da nop', 'Len lich phong van', 'Da tuyen', 'Tu choi')),
  cover_letter TEXT NOT NULL DEFAULT '',
  applied_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(candidate_id, job_id)
);

CREATE TABLE IF NOT EXISTS saved_jobs (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, job_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_jobs_status_created ON jobs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications(candidate_id, applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id, applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
/* =========================================
   CHỨC NĂNG 8 - NHẬT KÝ ADMIN
   ========================================= */

/* =========================================
   CHỨC NĂNG 8 - NHẬT KÝ ADMIN
   ========================================= */

DROP TABLE IF EXISTS admin_logs;

CREATE TABLE admin_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  admin_id INTEGER
    REFERENCES users(id)
    ON DELETE SET NULL,

  action TEXT NOT NULL,

  target_type TEXT NOT NULL DEFAULT '',

  target_id INTEGER,

  description TEXT NOT NULL DEFAULT '',

  created_at TEXT NOT NULL
    DEFAULT (datetime('now'))
);

INSERT INTO admin_logs (
  admin_id,
  action,
  target_type,
  target_id,
  description
)
VALUES (
  3,
  'LOGIN',
  'admin',
  3,
  'Quản trị viên đăng nhập hệ thống'
);

CREATE INDEX IF NOT EXISTS idx_users_role_status
ON users(role, status);

CREATE INDEX IF NOT EXISTS idx_admin_logs_created
ON admin_logs(created_at DESC);


/* =========================================
   CHỨC NĂNG 7 - BÁO CÁO VI PHẠM
   ========================================= */

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  reporter_id INTEGER
    REFERENCES users(id)
    ON DELETE SET NULL,

  target_type TEXT NOT NULL
    CHECK (
      target_type IN (
        'user',
        'job',
        'company'
      )
    ),

  target_id INTEGER NOT NULL,

  reason TEXT NOT NULL,

  description TEXT NOT NULL DEFAULT '',

  status TEXT NOT NULL DEFAULT 'Pending'
    CHECK (
      status IN (
        'Pending',
        'Resolved',
        'Rejected'
      )
    ),

  admin_note TEXT NOT NULL DEFAULT '',

  created_at TEXT NOT NULL
    DEFAULT (datetime('now')),

  resolved_at TEXT,

  resolved_by INTEGER
    REFERENCES users(id)
    ON DELETE SET NULL
);
INSERT INTO reports (
  reporter_id,
  target_type,
  target_id,
  reason,
  description,
  status
)
SELECT
  1,
  'job',
  1,
  'Thông tin tuyển dụng không chính xác',
  'Mức lương và nội dung công việc có dấu hiệu không đúng.',
  'Pending'
WHERE NOT EXISTS (
  SELECT 1 FROM reports
);

/* =========================================
   CHỨC NĂNG 8 - NHẬT KÝ ADMIN
   ========================================= */

CREATE TABLE IF NOT EXISTS admin_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  admin_id INTEGER
    REFERENCES users(id)
    ON DELETE SET NULL,

  action TEXT NOT NULL,

  target_type TEXT NOT NULL DEFAULT '',

  target_id INTEGER,

  description TEXT NOT NULL DEFAULT '',

  created_at TEXT NOT NULL
    DEFAULT (datetime('now'))
);
INSERT INTO admin_logs (
  admin_id,
  action,
  description
)
SELECT
  3,
  'LOGIN',
  'Quản trị viên đăng nhập hệ thống'
WHERE NOT EXISTS (
  SELECT 1
  FROM admin_logs
);
SELECT
  3,
  'LOGIN',
  'admin',
  3,
  'Quản trị viên đăng nhập hệ thống'
WHERE NOT EXISTS (
  SELECT 1 FROM admin_logs
);

/* =========================================
   CHỨC NĂNG 9 - CẤU HÌNH HỆ THỐNG
   ========================================= */

CREATE TABLE IF NOT EXISTS system_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

INSERT OR IGNORE INTO system_settings (
  setting_key,
  setting_value
)
VALUES
  ('site_name', 'JobBridge'),
  ('support_email', 'support@jobbridge.vn'),
  ('allow_registration', 'true'),
  ('allow_job_posting', 'true'),
  ('require_job_approval', 'true'),
  ('log_retention_days', '90'),
  ('maintenance_mode', 'false');
