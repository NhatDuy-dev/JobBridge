const STORAGE_KEYS = {
  users: "jobbridge_spa_users",
  jobs: "jobbridge_spa_jobs",
  applications: "jobbridge_spa_applications",
  session: "jobbridge_spa_session",
};
const API_TOKEN_KEY = "jobbridge_api_token";

function getApiToken() {
  return localStorage.getItem(API_TOKEN_KEY);
}

function saveApiToken(token) {
  localStorage.setItem(API_TOKEN_KEY, token);
}

function clearApiToken() {
  localStorage.removeItem(API_TOKEN_KEY);
}

async function apiRequest(endpoint, options = {}) {
  const token = getApiToken();

  const headers = {
    Accept: "application/json",
    ...(options.body
      ? { "Content-Type": "application/json" }
      : {}),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data.error?.message ||
      `Yêu cầu thất bại với mã ${response.status}`;

    throw new Error(message);
  }

  return data;
}

async function loadAdminDashboard() {
  try {
    const result = await apiRequest("/admin/dashboard");
    appState.adminDashboard = result;
    return result;
  } catch (error) {
    console.error("Không thể tải Dashboard Admin:", error);
    appState.adminDashboard = null;
    throw error;
  }
}

async function loadAdminUsers() {
  const params = new URLSearchParams();
  const filters = appState.adminUserFilters;

  if (filters.keyword) params.set("q", filters.keyword);
  if (filters.role) params.set("role", filters.role);
  if (filters.status) params.set("status", filters.status);

  const query = params.toString();
  const result = await apiRequest(
    `/admin/users${query ? `?${query}` : ""}`,
  );

  appState.adminUsers = result.users || [];
  return result;
}

async function loadAdminJobs() {
  const params = new URLSearchParams();
  const filters = appState.adminJobFilters;

  if (filters.keyword) params.set("q", filters.keyword);
  if (filters.status) params.set("status", filters.status);

  const query = params.toString();
  const result = await apiRequest(
    `/jobs${query ? `?${query}` : ""}`,
  );

  appState.adminJobs = result.jobs || [];
  return result;
}
async function loadAdminCompanies() {
  const filters = appState.adminCompanyFilters || {
    keyword: "",
    status: "",
  };

  const params = new URLSearchParams();

  if (filters.keyword) {
    params.set("q", filters.keyword);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  const query = params.toString();

  const result = await apiRequest(
    `/admin/companies${query ? `?${query}` : ""}`,
  );

  appState.adminCompanies =
    Array.isArray(result.companies)
      ? result.companies
      : [];

  return result;
}


/* =========================================
   CHỨC NĂNG 5 - TẢI HỒ SƠ ỨNG TUYỂN
   ========================================= */
async function loadAdminApplications() {
  const filters =
    appState.adminApplicationFilters || {
      keyword: "",
      status: "",
    };

  const params = new URLSearchParams();

  if (filters.keyword) {
    params.set("q", filters.keyword);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  const query = params.toString();

  const result = await apiRequest(
    `/admin/applications${query ? `?${query}` : ""}`,
  );

  appState.adminApplications =
    Array.isArray(result.applications)
      ? result.applications
      : [];

  return result;
}


/* =========================================
   CHỨC NĂNG 7 - TẢI BÁO CÁO VI PHẠM
   ========================================= */
async function loadAdminReports() {
  const filters =
    appState.adminReportFilters || {
      keyword: "",
      status: "",
      type: "",
    };

  const params = new URLSearchParams();

  if (filters.keyword) {
    params.set("q", filters.keyword);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.type) {
    params.set("type", filters.type);
  }

  const query = params.toString();

  const result = await apiRequest(
    `/admin/reports${query ? `?${query}` : ""}`,
  );

  appState.adminReports =
    Array.isArray(result.reports)
      ? result.reports
      : [];

  return result;
}

/* =========================================
   CHỨC NĂNG 8 - TẢI NHẬT KÝ ADMIN
   ========================================= */
async function loadAdminLogs() {
  const filters =
    appState.adminLogFilters || {
      keyword: "",
      action: "",
    };

  const params = new URLSearchParams();

  if (filters.keyword) {
    params.set("q", filters.keyword);
  }

  if (filters.action) {
    params.set("action", filters.action);
  }

  const query = params.toString();

  const result = await apiRequest(
    `/admin/logs${query ? `?${query}` : ""}`,
  );

  appState.adminLogs =
    Array.isArray(result.logs)
      ? result.logs
      : [];

  return result;
}
const seedUsers = [
  {
    id: 1,
    name: "Nguyen Minh Anh",
    email: "ungvien@test.com",
    password: "123",
    role: "candidate",
    avatar: "MA",
    desiredTitle: "Frontend Developer",
    phone: "0901234567",
    location: "TP.HCM",
    dateOfBirth: "2000-05-12",
    gender: "Nữ",
    experienceLevel: "1 nam",
    education: "Đại học Công nghệ - Công nghệ thông tin",
    portfolio: "https://portfolio.example.com",
    summary: "Ứng viên frontend yêu thích xây dựng giao diện tuyển dụng rõ ràng, dễ dùng và tối ưu trải nghiệm người dùng.",
    skills: ["ReactJS", "Figma", "JavaScript"],
    savedJobs: [102],
    appliedJobs: [101, 102, 104],
  },
  {
    id: 2,
    name: "Cong ty BridgeTech",
    email: "congty@test.com",
    password: "123",
    role: "employer",
  },
  {
    id: 3,
    name: "Quan tri vien",
    email: "admin@test.com",
    password: "123",
    role: "admin",
  },
];

const seedJobs = [
  {
    id: 101,
    title: "Frontend Developer",
    company: "BridgeTech",
    salary: "20 - 35 trieu",
    minSalary: 20,
    maxSalary: 35,
    location: "TP.HCM",
    type: "Full-time",
    status: "Approved",
    description: "Xay dung giao dien dashboard tuyen dung bang HTML, CSS va JavaScript.",
    category: "IT - Cong nghe thong tin",
    experience: "1 nam",
    companyField: "Cong nghe",
    jobField: "IT - Cong nghe thong tin",
    saturday: "off",
  },
  {
    id: 102,
    title: "UI UX Designer",
    company: "Nova Studio",
    salary: "18 - 30 trieu",
    minSalary: 18,
    maxSalary: 30,
    location: "Ha Noi",
    type: "Full-time",
    status: "Approved",
    description: "Thiet ke flow ung tuyen, prototype va design system cho san pham viec lam.",
    category: "Thiet ke va Kien truc",
    experience: "2 nam",
    companyField: "Sang tao",
    jobField: "Marketing sang tao",
    saturday: "unknown",
  },
  {
    id: 103,
    title: "Backend Node.js Engineer",
    company: "CloudNest",
    salary: "30 - 45 trieu",
    minSalary: 30,
    maxSalary: 45,
    location: "Remote",
    type: "Remote",
    status: "Pending",
    description: "Phat trien API, xu ly ung tuyen va quan ly co so du lieu viec lam.",
    category: "IT - Cong nghe thong tin",
    experience: "3 nam",
    companyField: "Cong nghe",
    jobField: "IT - Cong nghe thong tin",
    saturday: "work",
  },
  {
    id: 104,
    title: "Data Analyst",
    company: "FinSight",
    salary: "16 - 28 trieu",
    minSalary: 16,
    maxSalary: 28,
    location: "Da Nang",
    type: "Remote",
    status: "Approved",
    description: "Phan tich du lieu ung vien, tao bao cao ve ty le ung tuyen va nganh nghe hot.",
    category: "Ke toan",
    experience: "Duoi 1 nam",
    companyField: "Tai chinh",
    jobField: "Ke toan/Kiem toan",
    saturday: "off",
  },
];

const jobCategories = [
  { label: "Marketing", value: "Marketing", count: 5515 },
  { label: "Kế toán", value: "Ke toan", count: 4654 },
  { label: "Nhân sự", value: "Nhan su", count: 2042 },
  { label: "Quản lý dự án xây dựng", value: "Quan ly du an xay dung", count: 1963 },
  { label: "Thiết kế và Kiến trúc", value: "Thiet ke va Kien truc", count: 1544 },
];

const experienceOptions = [
  { label: "Không yêu cầu", value: "Khong yeu cau" },
  { label: "Dưới 1 năm", value: "Duoi 1 nam" },
  { label: "1 năm", value: "1 nam" },
  { label: "2 năm", value: "2 nam" },
  { label: "3 năm", value: "3 nam" },
  { label: "4 năm", value: "4 nam" },
  { label: "5 năm", value: "5 nam" },
  { label: "Trên 5 năm", value: "Tren 5 nam" },
];

const companyFields = [
  { label: "Tất cả lĩnh vực", value: "" },
  { label: "Công nghệ", value: "Cong nghe" },
  { label: "Sáng tạo", value: "Sang tao" },
  { label: "Tài chính", value: "Tai chinh" },
  { label: "Dịch vụ", value: "Dich vu" },
  { label: "Xây dựng", value: "Xay dung" },
];

const jobFields = [
  { label: "Tất cả lĩnh vực", value: "" },
  { label: "IT - Công nghệ thông tin", value: "IT - Cong nghe thong tin" },
  { label: "Marketing sáng tạo", value: "Marketing sang tao" },
  { label: "Kế toán/Kiểm toán", value: "Ke toan/Kiem toan" },
  { label: "Hành chính/Văn phòng", value: "Hanh chinh/Van phong" },
  { label: "Bán hàng/Kinh doanh", value: "Ban hang/Kinh doanh" },
];

const careerCategories = [
  { title: "Việc không yêu cầu bằng cấp", icon: "doc", keyword: "Khong yeu cau" },
  { title: "Việc thực tập sinh", icon: "cap", keyword: "thuc tap" },
  { title: "Việc part-time, thời vụ", icon: "hour", keyword: "part-time" },
  { title: "Bán hàng/Kinh doanh", icon: "tag", keyword: "Ban hang/Kinh doanh" },
  { title: "Hành chính/Văn phòng", icon: "office", keyword: "Hanh chinh/Van phong" },
  { title: "IT-Công nghệ thông tin", icon: "code", keyword: "IT - Cong nghe thong tin" },
  { title: "Marketing sáng tạo", icon: "mega", keyword: "Marketing sang tao" },
  { title: "Kế toán/Kiểm toán", icon: "calc", keyword: "Ke toan/Kiem toan" },
  { title: "Xem tất cả Ngành nghề", icon: "more", keyword: "" },
];

const siteNavItems = [
  {
    label: "Việc làm",
    active: true,
    items: ["Tìm việc làm", "Việc làm mới nhất", "Việc làm theo ngành", "Việc làm theo địa điểm"],
  },
  {
    label: "Tạo CV",
    items: ["Mẫu CV chuyên nghiệp", "Tạo CV online", "Quản lý CV", "Kiểm tra CV"],
  },
  {
    label: "Công cụ",
    items: ["Tính lương Gross Net", "Trắc nghiệm tính cách", "Gợi ý nghề nghiệp", "So sánh lương"],
  },
  {
    label: "Cẩm nang nghề nghiệp",
    items: ["Định hướng nghề nghiệp", "Kinh nghiệm phỏng vấn", "Mẫu email ứng tuyển", "Xu hướng tuyển dụng"],
  },
];

const seedApplications = [
  {
    id: 1001,
    candidateId: 1,
    candidateName: "Nguyen Minh Anh",
    jobId: 101,
    jobTitle: "Frontend Developer",
    company: "BridgeTech",
    status: "Da nop",
    appliedAt: "2026-07-01",
  },
  {
    id: 1002,
    candidateId: 1,
    candidateName: "Le Bao Tran",
    jobId: 102,
    jobTitle: "UI UX Designer",
    company: "Nova Studio",
    status: "Len lich phong van",
    appliedAt: "2026-07-03",
  },
  {
    id: 1003,
    candidateId: 1,
    candidateName: "Tran Hoang Khoa",
    jobId: 104,
    jobTitle: "Data Analyst",
    company: "FinSight",
    status: "Tu choi",
    appliedAt: "2026-07-05",
  },
];

const appState = {
  users: [],
  jobs: [],
  applications: [],
  currentUser: null,
 adminSettings: {
  site_name: "JobBridge",
  support_email: "",
  allow_registration: "true",
  allow_job_posting: "true",
  require_job_approval: "true",
  log_retention_days: "90",
  maintenance_mode: "false",

  updatedAt: "",
  updatedByName: "",
  updatedByEmail: "",
},

 adminTab: "dashboard",

  adminLogs: [],

  adminLogFilters: {
    keyword: "",
    action: "",
  },
  

  adminTab: "dashboard",
  adminDashboard: null,
  adminReports: [],

adminReportFilters: {
  keyword: "",
  status: "",
  type: "",
},

  adminUsers: [],
  adminUserFilters: {
    keyword: "",
    role: "",
    status: "",
  },
  adminJobs: [],
  adminJobFilters: {
    keyword: "",
    status: "",
  },
  adminCompanies: [],
adminCompanyFilters: {
  keyword: "",
  status: "",
},

adminApplications: [],

adminApplicationFilters: {
  keyword: "",
  status: "",
},
  authMode: "login",
  candidateTab: "jobs",
  candidateKeyword: "",
  candidateFilters: {
    location: "",
    types: [],
    minSalary: 0,
    saturday: "",
    categories: [],
    experiences: [],
    companyField: "",
    jobField: "",
  },
  matchScores: {},
  employerTab: "post",
  
};

const app = document.querySelector("#app");
let realtimeUpdateTimer = null;

document.addEventListener("DOMContentLoaded", initApp);
window.addEventListener("storage", handleRealtimeStorageUpdate);

function initApp() {
  bootMockDatabase();
  appState.users = readStorage(STORAGE_KEYS.users, seedUsers).map(normalizeUser);
  appState.jobs = readStorage(STORAGE_KEYS.jobs, seedJobs).map(normalizeJob);
  appState.applications = readStorage(STORAGE_KEYS.applications, seedApplications);
  syncAppliedJobsFromApplications();
  appState.currentUser = hydrateSessionUser(readStorage(STORAGE_KEYS.session, null));
  writeStorage(STORAGE_KEYS.users, appState.users);
  writeStorage(STORAGE_KEYS.jobs, appState.jobs);
  writeStorage(STORAGE_KEYS.applications, appState.applications);

  if (appState.currentUser) {
    renderDashboard();
  } else {
    renderLogin();
  }
}

function handleRealtimeStorageUpdate(event) {
  if (!appState.currentUser || event.key !== STORAGE_KEYS.jobs) return;

  appState.jobs = readStorage(STORAGE_KEYS.jobs, seedJobs).map(normalizeJob);
  if (appState.currentUser.role === "candidate") renderCandidateView();
  if (appState.currentUser.role === "employer") renderEmployerView();
  if (appState.currentUser.role === "admin") renderAdminView();
  refreshRealtimeLabels();
}

function bootMockDatabase() {
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(seedUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.jobs)) {
    localStorage.setItem(STORAGE_KEYS.jobs, JSON.stringify(seedJobs));
  }
  if (!localStorage.getItem(STORAGE_KEYS.applications)) {
    localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(seedApplications));
  }
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeUser(user) {
  return {
    ...user,
    avatar: user.avatar || getInitials(user.name || user.email || "UV"),
    desiredTitle: user.desiredTitle || (user.role === "candidate" ? "Frontend Developer" : ""),
    phone: user.phone || "",
    location: user.location || "",
    dateOfBirth: user.dateOfBirth || "",
    gender: user.gender || "",
    experienceLevel: user.experienceLevel || "",
    education: user.education || "",
    portfolio: user.portfolio || "",
    summary: user.summary || "",
    skills: Array.isArray(user.skills) ? user.skills : [],
    savedJobs: Array.isArray(user.savedJobs) ? user.savedJobs : [],
    appliedJobs: Array.isArray(user.appliedJobs) ? user.appliedJobs : [],
  };
}

function normalizeJob(job) {
  const salaryNumbers = String(job.salary || "")
    .match(/\d+/g)
    ?.map(Number) || [0, 0];
  const minSalary = Number.isFinite(job.minSalary) ? job.minSalary : salaryNumbers[0] || 0;
  const maxSalary = Number.isFinite(job.maxSalary)
    ? job.maxSalary
    : salaryNumbers[salaryNumbers.length - 1] || minSalary;
  const now = new Date().toISOString();
  const createdAt = job.createdAt || job.postedAt || job.updatedAt || now;
  const updatedAt = job.updatedAt || createdAt;

  const normalizedJob = {
    ...job,
    minSalary,
    maxSalary,
    createdAt,
    updatedAt,
    type: job.type || (job.location === "Remote" ? "Remote" : "Full-time"),
  };

  return {
    ...normalizedJob,
    category: normalizedJob.category || getDefaultJobCategory(normalizedJob),
    experience: normalizedJob.experience || getDefaultJobExperience(normalizedJob),
    companyField: normalizedJob.companyField || getDefaultCompanyField(normalizedJob),
    jobField: normalizedJob.jobField || getDefaultJobField(normalizedJob),
    saturday: normalizedJob.saturday || "unknown",
  };
}

function getDefaultJobCategory(job) {
  const text = `${job.title} ${job.description}`.toLowerCase();
  if (text.includes("design") || text.includes("ux")) return "Thiet ke va Kien truc";
  if (text.includes("data") || text.includes("ke toan")) return "Ke toan";
  if (text.includes("marketing")) return "Marketing";
  if (text.includes("nhan su")) return "Nhan su";
  return "IT - Cong nghe thong tin";
}

function getDefaultJobExperience(job) {
  if (job.maxSalary >= 40) return "3 nam";
  if (job.maxSalary >= 30) return "2 nam";
  if (job.maxSalary >= 25) return "1 nam";
  return "Khong yeu cau";
}

function getDefaultCompanyField(job) {
  const category = getDefaultJobCategory(job);
  if (category === "Ke toan") return "Tai chinh";
  if (category === "Marketing" || category === "Thiet ke va Kien truc") return "Sang tao";
  if (category.includes("xay dung")) return "Xay dung";
  return "Cong nghe";
}

function getDefaultJobField(job) {
  const category = getDefaultJobCategory(job);
  if (category === "Ke toan") return "Ke toan/Kiem toan";
  if (category === "Marketing" || category === "Thiet ke va Kien truc") return "Marketing sang tao";
  return "IT - Cong nghe thong tin";
}

function hydrateSessionUser(sessionUser) {
  if (!sessionUser) return null;
  const fullUser = appState.users.find((user) => user.id === sessionUser.id);
  return fullUser ? createSessionUser(fullUser) : null;
}

function createSessionUser(user) {
  const normalizedUser = normalizeUser(user);
  return {
    id: normalizedUser.id,
    name: normalizedUser.name,
    email: normalizedUser.email,
    role: normalizedUser.role,
    avatar: normalizedUser.avatar,
    desiredTitle: normalizedUser.desiredTitle,
    phone: normalizedUser.phone,
    location: normalizedUser.location,
    dateOfBirth: normalizedUser.dateOfBirth,
    gender: normalizedUser.gender,
    experienceLevel: normalizedUser.experienceLevel,
    education: normalizedUser.education,
    portfolio: normalizedUser.portfolio,
    summary: normalizedUser.summary,
    skills: normalizedUser.skills,
    savedJobs: normalizedUser.savedJobs,
    appliedJobs: normalizedUser.appliedJobs,
  };
}

function syncAppliedJobsFromApplications() {
  appState.users = appState.users.map((user) => {
    if (user.role !== "candidate") return user;
    const appliedFromApplications = appState.applications
      .filter((application) => application.candidateId === user.id)
      .map((application) => application.jobId);
    return {
      ...user,
      appliedJobs: Array.from(new Set([...(user.appliedJobs || []), ...appliedFromApplications])),
    };
  });
}

function updateCurrentUser(patch) {
  const existingUser = appState.users.find((user) => user.id === appState.currentUser.id) || {};
  const updatedUser = normalizeUser({
    ...existingUser,
    ...appState.currentUser,
    ...patch,
  });
  appState.currentUser = createSessionUser(updatedUser);
  appState.users = appState.users.map((user) =>
    user.id === appState.currentUser.id ? updatedUser : user,
  );
  writeStorage(STORAGE_KEYS.users, appState.users);
  writeStorage(STORAGE_KEYS.session, appState.currentUser);
}

function renderLogin() {
  const isRegister = appState.authMode === "register";

  app.innerHTML = `
    <main class="spa-login-screen">
      <section class="auth-shell" aria-label="Xác thực JobBridge">
        <div class="auth-visual">
          <div class="spa-login-brand">
            ${renderBrandLogo()}
            <div>
              <strong>JobBridge</strong>
              <span>Nền tảng tuyển dụng & ứng tuyển việc làm</span>
            </div>
          </div>
          <div class="auth-copy">
            <p class="eyebrow">Welcome back</p>
            <h1>${isRegister ? "Tạo tài khoản JobBridge" : "Đăng nhập JobBridge"}</h1>
            <p>${isRegister ? "Tạo hồ sơ ứng viên hoặc tài khoản nhà tuyển dụng để bắt đầu quản lý công việc trong một nơi." : "Vào dashboard phù hợp với vai trò của bạn và tiếp tục tìm việc, đăng tin hoặc duyệt hệ thống."}</p>
          </div>
          <div class="auth-benefits">
            <span>Gợi ý việc làm theo hồ sơ</span>
            <span>Quản lý ứng tuyển và tin tuyển dụng</span>
            <span>Bộ lọc ngành nghề, kinh nghiệm, địa điểm</span>
          </div>
        </div>

        <section class="spa-login-card auth-card">
          <div class="auth-tabs" role="tablist" aria-label="Chọn chế độ xác thực">
            <button class="${!isRegister ? "active" : ""}" data-auth-mode="login" type="button">Đăng nhập</button>
            <button class="${isRegister ? "active" : ""}" data-auth-mode="register" type="button">Đăng ký</button>
          </div>

          <div class="spa-login-heading">
            <h2>${isRegister ? "Tạo tài khoản mới" : "Chào mừng quay lại"}</h2>
            <p>${isRegister ? "Điền thông tin bên dưới để tạo tài khoản và vào hệ thống ngay." : "Dùng tài khoản đã có hoặc chọn nhanh tài khoản mẫu."}</p>
          </div>

          ${isRegister ? renderRegisterForm() : renderLoginForm()}

          <div class="auth-divider"><span>Hoặc dùng tài khoản mẫu</span></div>
          <div class="demo-accounts">
            <button data-demo-login="ungvien@test.com" type="button">Ứng viên</button>
            <button data-demo-login="congty@test.com" type="button">Công ty</button>
            <button data-demo-login="admin@test.com" type="button">Admin</button>
          </div>
        </section>
      </section>
    </main>
  `;

  bindAuthScreen();
}

function renderLoginForm() {
  return `
    <form id="loginForm" class="spa-login-form" novalidate>
      <label>
        Email
        <input id="loginEmail" type="email" value="ungvien@test.com" autocomplete="email" />
      </label>
      <label>
        Mật khẩu
        <input id="loginPassword" type="password" value="123" autocomplete="current-password" />
      </label>
      <button class="primary-button full-button" type="submit">Đăng nhập</button>
      <div id="authMessage" class="auth-message" aria-live="polite"></div>
    </form>
  `;
}

function renderRegisterForm() {
  return `
    <form id="registerForm" class="spa-login-form" novalidate>
      <div class="auth-role-grid">
        <label class="auth-role-card">
          <input name="registerRole" type="radio" value="candidate" checked />
          <span>
            <strong>Ứng viên</strong>
            <small>Tìm việc, lưu việc, ứng tuyển</small>
          </span>
        </label>
        <label class="auth-role-card">
          <input name="registerRole" type="radio" value="employer" />
          <span>
            <strong>Nhà tuyển dụng</strong>
            <small>Đăng tin và quản lý hồ sơ</small>
          </span>
        </label>
      </div>

      <label>
        Họ tên / Tên công ty
        <input id="registerName" type="text" placeholder="VD: Nguyễn Minh Anh" autocomplete="name" />
      </label>
      <label>
        Email
        <input id="registerEmail" type="email" placeholder="ban@email.com" autocomplete="email" />
      </label>
      <div class="form-grid auth-password-grid">
        <label>
          Mật khẩu
          <input id="registerPassword" type="password" placeholder="Tối thiểu 3 ký tự" autocomplete="new-password" />
        </label>
        <label>
          Nhập lại mật khẩu
          <input id="registerConfirmPassword" type="password" placeholder="Nhập lại mật khẩu" autocomplete="new-password" />
        </label>
      </div>
      <button class="primary-button full-button" type="submit">Tạo tài khoản</button>
      <div id="authMessage" class="auth-message" aria-live="polite"></div>
    </form>
  `;
}

function bindAuthScreen() {
  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      appState.authMode = button.dataset.authMode;
      renderLogin();
    });
  });

  document.querySelector("#loginForm")?.addEventListener("submit", handleLogin);
  document.querySelector("#registerForm")?.addEventListener("submit", handleRegister);

  document.querySelectorAll("[data-demo-login]").forEach((button) => {
    button.addEventListener("click", () => loginDemoAccount(button.dataset.demoLogin));
  });
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.querySelector("#loginEmail").value.trim().toLowerCase();
  const password = document.querySelector("#loginPassword").value;
  const user = appState.users.find(
    (item) => item.email.toLowerCase() === email && item.password === password,
  );

  if (!user) {
    showInlineMessage("#authMessage", "Email hoặc mật khẩu không đúng.", "error");
    return;
  }

  appState.currentUser = createSessionUser(user);
  writeStorage(STORAGE_KEYS.session, appState.currentUser);
  renderDashboard();
}

function handleRegister(event) {
  event.preventDefault();
  const name = document.querySelector("#registerName").value.trim();
  const email = document.querySelector("#registerEmail").value.trim().toLowerCase();
  const password = document.querySelector("#registerPassword").value;
  const confirmPassword = document.querySelector("#registerConfirmPassword").value;
  const role = document.querySelector('input[name="registerRole"]:checked')?.value || "candidate";

  if (!name || !email || !password || !confirmPassword) {
    showInlineMessage("#authMessage", "Vui lòng nhập đầy đủ thông tin đăng ký.", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showInlineMessage("#authMessage", "Email chưa đúng định dạng.", "error");
    return;
  }

  if (password.length < 3) {
    showInlineMessage("#authMessage", "Mật khẩu cần tối thiểu 3 ký tự.", "error");
    return;
  }

  if (password !== confirmPassword) {
    showInlineMessage("#authMessage", "Mật khẩu nhập lại chưa khớp.", "error");
    return;
  }

  if (appState.users.some((user) => user.email.toLowerCase() === email)) {
    showInlineMessage("#authMessage", "Email này đã được đăng ký.", "error");
    return;
  }

  const newUser = normalizeUser({
    id: getNextUserId(),
    name,
    email,
    password,
    role,
    avatar: getInitials(name),
    desiredTitle: role === "candidate" ? "Ứng viên JobBridge" : "",
    skills: [],
    savedJobs: [],
    appliedJobs: [],
  });

  appState.users.push(newUser);
  appState.currentUser = createSessionUser(newUser);
  writeStorage(STORAGE_KEYS.users, appState.users);
  writeStorage(STORAGE_KEYS.session, appState.currentUser);
  renderDashboard();
  showToast("Tạo tài khoản thành công", "success");
}

function loginDemoAccount(email) {
  const user = appState.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    showInlineMessage("#authMessage", "Không tìm thấy tài khoản mẫu.", "error");
    return;
  }

  appState.currentUser = createSessionUser(user);
  writeStorage(STORAGE_KEYS.session, appState.currentUser);
  renderDashboard();
}

function getNextUserId() {
  return Math.max(0, ...appState.users.map((user) => Number(user.id) || 0)) + 1;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function renderDashboard() {
  const user = appState.currentUser;
  const roleLabel = getRoleLabel(user.role);

  app.innerHTML = `
    <header class="spa-topbar">
      <div class="spa-brand">
        ${renderBrandLogo()}
        <div>
          <strong>JobBridge</strong>
          <span>${roleLabel}</span>
        </div>
      </div>
      ${renderSiteNavigation()}
      ${renderTopbarUserArea(user)}
    </header>
    <main id="dashboardRoot" class="spa-dashboard"></main>
  `;

  if (user.role === "candidate") {
    bindCandidateAccountMenu();
  } else {
    document.querySelector("#logoutButton").addEventListener("click", logout);
  }

  if (user.role === "candidate") renderCandidateView();
  if (user.role === "employer") renderEmployerView();
  if (user.role === "admin") renderAdminView();

  startRealtimeUpdates();
}

function renderSiteNavigation() {
  return `
    <nav class="site-nav" aria-label="Điều hướng chính">
      ${siteNavItems
        .map(
          (item) => `
            <div class="site-nav-group">
              <button class="site-nav-item ${item.active ? "active" : ""}" type="button" aria-haspopup="true">
                ${escapeHtml(item.label)}
              </button>
              <div class="site-nav-dropdown" role="menu">
                ${item.items
                  .map((label) => `<button type="button" role="menuitem">${escapeHtml(label)}</button>`)
                  .join("")}
              </div>
            </div>
          `,
        )
        .join("")}
    </nav>
  `;
}

function renderBrandLogo() {
  return `<img class="brand-logo" src="../assets/jobbridge-logo.png" alt="JobBridge" />`;
}

function renderTopbarUserArea(user) {
  if (user.role !== "candidate") {
    return `
      <div class="spa-user-box">
        <span class="spa-user-name">${escapeHtml(user.name)}</span>
        <button id="logoutButton" class="ghost-button" type="button">Đăng xuất</button>
      </div>
    `;
  }

  return `
    <div class="spa-user-box account-menu-shell">
      <button class="topbar-icon-button" type="button" aria-label="Thông báo">
        ${renderAccountIcon("bell")}
      </button>
      <button class="topbar-icon-button" type="button" aria-label="Tin nhắn">
        ${renderAccountIcon("chat")}
      </button>
      <button id="accountMenuButton" class="account-avatar-button" type="button" aria-label="Mở menu tài khoản" aria-controls="candidateAccountMenu" aria-expanded="false">
        ${renderUserAvatar("topbar")}
        <span class="account-avatar-chevron"></span>
      </button>
      ${renderCandidateAccountMenu(user)}
    </div>
  `;
}

function renderCandidateAccountMenu(user) {
  const jobItems = [
    { label: "Việc làm đã lưu", tab: "saved" },
    { label: "Việc làm đã ứng tuyển", tab: "history" },
    { label: "Việc làm phù hợp với bạn", tab: "jobs" },
    { label: "Cài đặt gợi ý việc làm", tab: "jobs" },
  ];
  const cvItems = [
    { label: "CV của tôi", tab: "profile" },
    { label: "Cover Letter của tôi", tab: "profile" },
    { label: "Nhà tuyển dụng muốn kết nối với bạn", tab: "profile" },
    { label: "Nhà tuyển dụng xem hồ sơ", tab: "profile" },
  ];

  return `
    <div id="candidateAccountMenu" class="candidate-account-menu" hidden>
      <div class="account-menu-profile">
        <div class="account-menu-avatar">${renderUserAvatar("account")}</div>
        <div class="account-menu-info">
          <strong>${escapeHtml(user.name)}</strong>
          <span>Tài khoản đã xác thực</span>
          <small>ID ${formatCandidateAccountId(user)}</small>
        </div>
      </div>
      <div class="account-menu-divider"></div>
      ${renderAccountMenuGroup("jobs", "Quản lý tìm việc", jobItems, true)}
      ${renderAccountMenuGroup("cv", "Quản lý CV & Cover letter", cvItems, true)}
      ${renderAccountMenuGroup("mail", "Cài đặt email & thông báo", [], false)}
      ${renderAccountMenuGroup("security", "Cá nhân & Bảo mật", [], false)}
      ${renderAccountMenuGroup("upgrade", "Nâng cấp tài khoản", [], false)}
      <button id="logoutButton" class="account-logout-button" type="button">
        ${renderAccountIcon("logout")}
        <span>Đăng xuất</span>
      </button>
    </div>
  `;
}

function renderAccountMenuGroup(icon, label, items, expanded) {
  return `
    <section class="account-menu-group">
      <button class="account-menu-group-head" type="button">
        <span class="account-menu-group-title">
          ${renderAccountIcon(icon)}
          <strong>${escapeHtml(label)}</strong>
        </span>
        ${renderAccountIcon(expanded ? "chevronUp" : "chevronDown")}
      </button>
      ${
        items.length
          ? `<div class="account-menu-subitems">
              ${items
                .map(
                  (item) => `
                    <button class="account-menu-subitem" data-candidate-account-tab="${escapeHtml(item.tab)}" type="button">
                      ${escapeHtml(item.label)}
                    </button>
                  `,
                )
                .join("")}
            </div>`
          : ""
      }
    </section>
  `;
}

function bindCandidateAccountMenu() {
  const button = document.querySelector("#accountMenuButton");
  const menu = document.querySelector("#candidateAccountMenu");
  const logoutButton = document.querySelector("#logoutButton");

  if (!button || !menu || !logoutButton) return;

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = menu.hidden;
    menu.hidden = !willOpen;
    button.setAttribute("aria-expanded", String(willOpen));
  });

  menu.addEventListener("click", (event) => event.stopPropagation());
  menu.querySelectorAll("[data-candidate-account-tab]").forEach((item) => {
    item.addEventListener("click", () => {
      showCandidateTab(item.dataset.candidateAccountTab);
      menu.hidden = true;
      button.setAttribute("aria-expanded", "false");
    });
  });
  logoutButton.addEventListener("click", logout);

  document.addEventListener("click", () => {
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
  });
}

function logout() {
  stopRealtimeUpdates();
  localStorage.removeItem(STORAGE_KEYS.session);
  appState.currentUser = null;
  appState.authMode = "login";
  renderLogin();
}

function renderCandidateView() {
  const currentUser = normalizeUser(appState.currentUser);
  const approvedJobs = getFilteredApprovedJobs();
  const appliedCount = currentUser.appliedJobs.length;
  const savedCount = currentUser.savedJobs.length;
  const recommendedJob = getRecommendedJob(approvedJobs);
  const profileCompletion = getCandidateProfileCompletion(currentUser);

  document.querySelector("#dashboardRoot").innerHTML = `
    ${renderCareerCategoryRail()}

    ${renderJobSearchBar()}

    <section class="candidate-summary-strip" aria-label="Tổng quan tìm việc">
      <div>
        <strong>${approvedJobs.length}</strong>
        <span>việc phù hợp</span>
      </div>
      <div>
        <strong>${appliedCount}</strong>
        <span>việc đã ứng tuyển</span>
      </div>
      <div>
        <strong>${savedCount}</strong>
        <span>việc đã lưu</span>
      </div>
    </section>

    <section class="candidate-workspace">
      <nav class="candidate-sidebar candidate-tab-bar" aria-label="Menu ứng viên">
        <button class="candidate-menu-item ${appState.candidateTab === "jobs" ? "active" : ""}" data-candidate-tab="jobs" type="button">Tìm việc làm</button>
      </nav>

      <div class="candidate-content">
        <section class="candidate-tab-panel ${appState.candidateTab === "jobs" ? "active" : ""}" data-candidate-panel="jobs">
          <div class="candidate-panel-heading">
            <div>
              <p class="eyebrow">Job Search</p>
              <h2>Tìm việc làm</h2>
            </div>
            <span class="muted-count">${approvedJobs.length} kết quả</span>
          </div>

          ${recommendedJob ? renderCandidateSpotlight(recommendedJob) : ""}

          <div class="candidate-job-layout">
            ${renderAdvancedFilterPanel()}
            <div class="candidate-results-column">
              <div id="candidateJobGrid" class="job-grid"></div>
            </div>
          </div>
        </section>

        <section class="candidate-tab-panel ${appState.candidateTab === "profile" ? "active" : ""}" data-candidate-panel="profile">
          <div class="candidate-panel-heading">
            <div>
              <p class="eyebrow">My Profile</p>
              <h2>Hồ sơ cá nhân</h2>
            </div>
            <span class="profile-completion">${profileCompletion}% hoàn thiện</span>
          </div>
          <form id="candidateProfileForm" class="profile-editor">
            <div class="profile-avatar-row">
              <div class="profile-avatar" aria-label="Ảnh đại diện ứng viên">
                ${renderUserAvatar("profile")}
              </div>
              <div>
                <h3>${escapeHtml(currentUser.name)}</h3>
                <p>${escapeHtml(currentUser.desiredTitle || "Ứng viên JobBridge")}</p>
              </div>
            </div>

            <section class="profile-form-section">
              <div class="profile-section-heading">
                <h3>Thông tin cá nhân</h3>
                <span>Hiển thị trong hồ sơ ứng tuyển</span>
              </div>
              <div class="form-grid profile-form-grid">
                <label>
                  Họ tên
                  <input id="profileName" type="text" value="${escapeHtml(currentUser.name)}" />
                </label>
                <label>
                  Số điện thoại
                  <input id="profilePhone" type="tel" value="${escapeHtml(currentUser.phone)}" placeholder="VD: 0901234567" />
                </label>
                <label>
                  Địa điểm
                  <input id="profileLocation" type="text" value="${escapeHtml(currentUser.location)}" placeholder="VD: TP.HCM" />
                </label>
                <label>
                  Ngày sinh
                  <input id="profileDateOfBirth" type="date" value="${escapeHtml(currentUser.dateOfBirth)}" />
                </label>
                <label>
                  Giới tính
                  <select id="profileGender">
                    ${renderProfileOption("", "Chưa cập nhật", currentUser.gender)}
                    ${renderProfileOption("Nam", "Nam", currentUser.gender)}
                    ${renderProfileOption("Nữ", "Nữ", currentUser.gender)}
                    ${renderProfileOption("Khác", "Khác", currentUser.gender)}
                  </select>
                </label>
                <label>
                  Link CV / Portfolio
                  <input id="profilePortfolio" type="url" value="${escapeHtml(currentUser.portfolio)}" placeholder="https://..." />
                </label>
              </div>
            </section>

            <section class="profile-form-section">
              <div class="profile-section-heading">
                <h3>Thông tin nghề nghiệp</h3>
                <span>Giúp JobBridge gợi ý việc làm phù hợp hơn</span>
              </div>
              <div class="form-grid profile-form-grid">
                <label>
                  Vị trí mong muốn
                  <input id="profileDesiredTitle" type="text" value="${escapeHtml(currentUser.desiredTitle || "")}" />
                </label>
                <label>
                  Kinh nghiệm
                  <select id="profileExperienceLevel">
                    ${renderProfileOption("", "Chưa cập nhật", currentUser.experienceLevel)}
                    ${experienceOptions.map((option) => renderProfileOption(option.value, option.label, currentUser.experienceLevel)).join("")}
                  </select>
                </label>
                <label class="profile-full-field">
                  Học vấn
                  <input id="profileEducation" type="text" value="${escapeHtml(currentUser.education)}" placeholder="VD: Đại học Công nghệ - CNTT" />
                </label>
              </div>
            </section>

            <section class="profile-form-section">
              <div class="profile-section-heading">
                <h3>Giới thiệu bản thân</h3>
                <span>Viết ngắn gọn về kinh nghiệm, mục tiêu và điểm mạnh</span>
              </div>
              <textarea id="profileSummary" placeholder="VD: Tôi có kinh nghiệm xây dựng giao diện web, yêu thích sản phẩm tuyển dụng và mong muốn phát triển trong môi trường năng động.">${escapeHtml(currentUser.summary)}</textarea>
            </section>

            <div class="skills-editor">
              <label>
                Kỹ năng
                <input id="skillInput" type="text" placeholder="Nhập kỹ năng và nhấn Enter" />
              </label>
              <div id="skillTags" class="skill-tags">
                ${currentUser.skills.map((skill) => renderSkillTag(skill)).join("")}
              </div>
            </div>
            <button class="primary-button" type="submit">Cập nhật hồ sơ</button>
          </form>
        </section>

        <section class="candidate-tab-panel ${appState.candidateTab === "history" ? "active" : ""}" data-candidate-panel="history">
          <div class="candidate-panel-heading">
            <div>
              <p class="eyebrow">Application History</p>
              <h2>Lịch sử ứng tuyển</h2>
            </div>
          </div>
          <div id="applicationHistory"></div>
        </section>

        <section class="candidate-tab-panel ${appState.candidateTab === "saved" ? "active" : ""}" data-candidate-panel="saved">
          <div class="candidate-panel-heading">
            <div>
              <p class="eyebrow">Saved Jobs</p>
              <h2>Việc làm đã lưu</h2>
            </div>
            <span class="muted-count">${savedCount} việc</span>
          </div>
          <div id="savedJobGrid" class="job-grid"></div>
        </section>
      </div>
    </section>
  `;

  bindCandidateTabs();
  bindCareerCategoryRail();
  bindCandidateFilters();
  bindCandidateProfile();
  renderCandidateJobs();
  renderCandidateHistory();
  renderSavedJobs();
  bindCandidateJobCardActions(document.querySelector("#dashboardRoot"));
  syncCandidateTabButtons();
}

function renderCareerCategoryRail() {
  const approvedJobCount = appState.jobs.filter((job) => job.status === "Approved").length;
  const marketJobCount = 51610 + approvedJobCount;
  const currentYear = new Date().getFullYear();
  const updateLabel = formatLiveUpdateTime(new Date());

  return `
    <section class="job-market-strip">
      <div class="job-market-heading">
        <div>
          <strong>Tuyển dụng <span>${formatNumber(marketJobCount)} việc làm</span> <em data-live-updated-at>${updateLabel}</em></strong>
          <p>Trang chủ <span>/</span> Tuyển dụng ${formatNumber(marketJobCount)} việc làm ${currentYear} <em data-live-updated-at>${updateLabel}</em></p>
        </div>
        <button class="job-alert-button" data-create-job-alert type="button">Tạo thông báo việc làm</button>
      </div>
      <div class="career-category-rail">
        ${careerCategories.map((item) => `
          <button class="career-category-card" data-career-keyword="${escapeHtml(item.keyword)}" type="button">
            <span class="career-icon career-icon-${escapeHtml(item.icon)}"></span>
            <strong>${escapeHtml(item.title)}</strong>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderJobSearchBar() {
  const locations = getAvailableJobLocations();
  const selectedLocation = appState.candidateFilters.location;

  return `
    <section class="job-search-panel" aria-label="Thanh tìm kiếm việc làm">
      <form id="jobSearchForm" class="job-search-form">
        <label class="job-search-field job-search-keyword">
          <span>Từ khóa</span>
          <div class="job-search-input-shell">
            <span class="job-search-icon">⌕</span>
            <input id="jobSearchKeyword" type="search" value="${escapeHtml(appState.candidateKeyword)}" placeholder="Vị trí, công ty hoặc kỹ năng" />
          </div>
        </label>

        <label class="job-search-field">
          <span>Địa điểm</span>
          <div class="job-search-input-shell">
            <span class="job-search-icon">⌖</span>
            <select id="candidateLocationFilter">
              <option value="">Tất cả địa điểm</option>
              ${locations
                .map(
                  (location) =>
                    `<option value="${escapeHtml(location)}" ${selectedLocation === location ? "selected" : ""}>${escapeHtml(location)}</option>`,
                )
                .join("")}
            </select>
          </div>
        </label>

        <button class="job-search-button" type="submit">Tìm kiếm</button>
      </form>
    </section>
  `;
}

function getAvailableJobLocations() {
  return Array.from(
    new Set(
      appState.jobs
        .filter((job) => job.status === "Approved")
        .map((job) => job.location)
        .filter(Boolean),
    ),
  ).sort((first, second) => first.localeCompare(second, "vi"));
}

function renderProfileOption(value, label, selectedValue) {
  return `<option value="${escapeHtml(value)}" ${selectedValue === value ? "selected" : ""}>${escapeHtml(label)}</option>`;
}

function getCandidateProfileCompletion(user) {
  const fields = [
    user.name,
    user.desiredTitle,
    user.phone,
    user.location,
    user.dateOfBirth,
    user.gender,
    user.experienceLevel,
    user.education,
    user.portfolio,
    user.summary,
    user.skills.length > 0 ? "skills" : "",
  ];

  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

function bindCareerCategoryRail() {
  document.querySelector("[data-create-job-alert]")?.addEventListener("click", () => {
    showToast("Đã tạo nhắc thông báo việc làm.", "success");
  });

  document.querySelectorAll("[data-career-keyword]").forEach((button) => {
    button.addEventListener("click", () => {
      const keyword = button.dataset.careerKeyword;
      appState.candidateTab = "jobs";

      if (!keyword) {
        appState.candidateKeyword = "";
        appState.candidateFilters.categories = [];
        appState.candidateFilters.experiences = [];
        appState.candidateFilters.jobField = "";
        renderCandidateView();
        return;
      }

      if (experienceOptions.some((option) => option.value === keyword)) {
        appState.candidateKeyword = "";
        appState.candidateFilters.experiences = [keyword];
      } else if (jobFields.some((field) => field.value === keyword)) {
        appState.candidateKeyword = "";
        appState.candidateFilters.jobField = keyword;
      } else {
        appState.candidateKeyword = keyword;
      }

      renderCandidateView();
    });
  });
}

function renderAdvancedFilterPanel() {
  const activeFilters = getActiveAdvancedFilterCount();
  const selectedCompanyField = appState.candidateFilters.companyField || "";
  const selectedJobField = appState.candidateFilters.jobField || "";

  return `
    <aside class="candidate-filter-panel advanced-filter-panel" aria-label="Lọc nâng cao">
      <div class="advanced-filter-heading">
        <span class="filter-funnel"></span>
        <h3>Lọc nâng cao</h3>
      </div>

      <div class="filter-section">
        <div class="filter-title-row">
          <strong>Nghỉ thứ 7</strong>
          <span>AI ✣</span>
        </div>
        <div class="filter-radio-grid">
          ${renderFilterRadio("saturdayFilter", "", "Không lọc", appState.candidateFilters.saturday === "")}
          ${renderFilterRadio("saturdayFilter", "work", "Làm thứ 7", appState.candidateFilters.saturday === "work")}
          ${renderFilterRadio("saturdayFilter", "off", "Nghỉ thứ 7", appState.candidateFilters.saturday === "off")}
          ${renderFilterRadio("saturdayFilter", "unknown", "Tin đăng không đề cập", appState.candidateFilters.saturday === "unknown")}
        </div>
      </div>

      <div class="filter-section">
        <h4>Theo danh mục nghề</h4>
        <div class="filter-list">
          ${jobCategories.map((category) => renderFilterCheckbox("category", category.value, `${escapeHtml(category.label)} <small>(${category.count})</small>`, appState.candidateFilters.categories.includes(category.value), true)).join("")}
        </div>
        <button class="filter-more" type="button">Xem thêm</button>
      </div>

      <div class="filter-section">
        <h4>Kinh nghiệm</h4>
        <div class="filter-check-grid">
          ${experienceOptions.map((experience) => renderFilterCheckbox("experience", experience.value, escapeHtml(experience.label), appState.candidateFilters.experiences.includes(experience.value), false)).join("")}
        </div>
      </div>

      <div class="filter-section">
        <h4>Lĩnh vực công ty</h4>
        <label class="select-shell">
          <span class="select-icon">◇</span>
          <select id="candidateCompanyFieldFilter">
            ${companyFields.map((field) => `<option value="${escapeHtml(field.value)}" ${selectedCompanyField === field.value ? "selected" : ""}>${escapeHtml(field.label)}</option>`).join("")}
          </select>
        </label>
      </div>

      <div class="filter-section">
        <h4>Lĩnh vực công việc</h4>
        <label class="select-shell">
          <span class="select-icon">▣</span>
          <select id="candidateJobFieldFilter">
            ${jobFields.map((field) => `<option value="${escapeHtml(field.value)}" ${selectedJobField === field.value ? "selected" : ""}>${escapeHtml(field.label)}</option>`).join("")}
          </select>
        </label>
      </div>

      <div class="filter-section salary-section">
        <label>
          Mức lương tối thiểu: <strong id="salaryRangeValue">${appState.candidateFilters.minSalary} triệu</strong>
          <input id="candidateSalaryRange" type="range" min="0" max="50" step="5" value="${appState.candidateFilters.minSalary}" />
        </label>
      </div>

      <div class="filter-action-row">
        <button id="clearAdvancedFilters" class="filter-clear" type="button" ${activeFilters === 0 ? "disabled" : ""}>Xóa lọc</button>
        <button id="saveAdvancedFilters" class="filter-save" type="button">Lưu bộ lọc</button>
      </div>
    </aside>
  `;
}

function renderFilterRadio(name, value, label, checked) {
  return `
    <label class="radio-option">
      <input name="${name}" type="radio" value="${escapeHtml(value)}" ${checked ? "checked" : ""} />
      <span>${escapeHtml(label)}</span>
    </label>
  `;
}

function renderFilterCheckbox(type, value, label, checked, hasChevron) {
  return `
    <label class="filter-check-option">
      <input data-filter-${type}="${escapeHtml(value)}" type="checkbox" value="${escapeHtml(value)}" ${checked ? "checked" : ""} />
      <span>${label}</span>
      ${hasChevron ? '<b class="filter-chevron"></b>' : ""}
    </label>
  `;
}

function getActiveAdvancedFilterCount() {
  const filters = appState.candidateFilters;
  return [
    filters.location,
    filters.saturday,
    filters.companyField,
    filters.jobField,
    filters.minSalary > 0 ? filters.minSalary : "",
    ...filters.types,
    ...filters.categories,
    ...filters.experiences,
  ].filter(Boolean).length;
}

function bindCandidateTabs() {
  document.querySelectorAll("[data-candidate-tab]").forEach((button) => {
    button.addEventListener("click", () => showCandidateTab(button.dataset.candidateTab));
  });
}

function showCandidateTab(tab) {
  appState.candidateTab = tab;
  syncCandidateTabButtons();
}

function syncCandidateTabButtons() {
  document.querySelectorAll("[data-candidate-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.candidateTab === appState.candidateTab);
  });
  document.querySelectorAll("[data-candidate-account-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.candidateAccountTab === appState.candidateTab);
  });
  document.querySelectorAll("[data-candidate-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.candidatePanel === appState.candidateTab);
  });
}

function bindCandidateFilters() {
  document.querySelector("#jobSearchForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    appState.candidateKeyword = document.querySelector("#jobSearchKeyword").value.trim();
    appState.candidateTab = "jobs";
    renderCandidateView();
  });

  document.querySelector("#jobSearchKeyword")?.addEventListener("input", (event) => {
    appState.candidateKeyword = event.target.value;
    const inlineSearch = document.querySelector("#candidateSearch");
    if (inlineSearch) inlineSearch.value = event.target.value;
  });

  document.querySelector("#candidateSearch")?.addEventListener("input", (event) => {
    appState.candidateKeyword = event.target.value;
    const topSearch = document.querySelector("#jobSearchKeyword");
    if (topSearch) topSearch.value = event.target.value;
    renderCandidateJobs();
  });

  document.querySelector("#candidateLocationFilter")?.addEventListener("change", (event) => {
    appState.candidateFilters.location = event.target.value;
    renderCandidateView();
  });

  document.querySelectorAll('input[name="saturdayFilter"]').forEach((input) => {
    input.addEventListener("change", (event) => {
      appState.candidateFilters.saturday = event.target.value;
      renderCandidateView();
    });
  });

  document.querySelectorAll("[data-filter-category]").forEach((input) => {
    input.addEventListener("change", () => {
      appState.candidateFilters.categories = Array.from(document.querySelectorAll("[data-filter-category]:checked")).map((item) => item.value);
      renderCandidateView();
    });
  });

  document.querySelectorAll("[data-filter-experience]").forEach((input) => {
    input.addEventListener("change", () => {
      appState.candidateFilters.experiences = Array.from(document.querySelectorAll("[data-filter-experience]:checked")).map((item) => item.value);
      renderCandidateView();
    });
  });

  document.querySelector("#candidateCompanyFieldFilter")?.addEventListener("change", (event) => {
    appState.candidateFilters.companyField = event.target.value;
    renderCandidateView();
  });

  document.querySelector("#candidateJobFieldFilter")?.addEventListener("change", (event) => {
    appState.candidateFilters.jobField = event.target.value;
    renderCandidateView();
  });

  document.querySelector("#candidateSalaryRange")?.addEventListener("input", (event) => {
    appState.candidateFilters.minSalary = Number(event.target.value);
    document.querySelector("#salaryRangeValue").textContent = `${event.target.value} triệu`;
    renderCandidateJobs();
  });

  document.querySelector("#clearAdvancedFilters")?.addEventListener("click", resetCandidateFilters);
  document.querySelector("#saveAdvancedFilters")?.addEventListener("click", () => showToast("Đã lưu bộ lọc tìm việc", "success"));
}

function resetCandidateFilters() {
  appState.candidateFilters = {
    location: "",
    types: [],
    minSalary: 0,
    saturday: "",
    categories: [],
    experiences: [],
    companyField: "",
    jobField: "",
  };
  renderCandidateView();
}

function renderCandidateJobs() {
  const jobs = getFilteredApprovedJobs();
  const grid = document.querySelector("#candidateJobGrid");

  if (jobs.length === 0) {
    grid.innerHTML = `<div class="empty-state">Khong co viec lam phu hop.</div>`;
    return;
  }

  grid.innerHTML = jobs.map((job) => renderCandidateJobCard(job)).join("");
  bindCandidateJobCardActions(grid);
}

function renderCandidateJobCard(job) {
  const saved = appState.currentUser.savedJobs.includes(job.id);
  const applied = appState.currentUser.appliedJobs.includes(job.id);

  return `
    <article class="job-card candidate-job-card">
      <div class="job-topline">
        <span class="company-logo">${escapeHtml(getInitials(job.company))}</span>
        <div class="job-title-group">
          <h3>${escapeHtml(job.title)}</h3>
          <p>${escapeHtml(job.company)} - ${escapeHtml(job.location)}</p>
          <small class="job-live-time" data-job-relative-time="${escapeHtml(job.updatedAt)}">Cập nhật ${formatRelativeTime(job.updatedAt)}</small>
        </div>
        <button class="heart-button ${saved ? "active" : ""}" data-save-job="${job.id}" type="button" aria-label="Luu viec lam">
          ${saved ? "&#9829;" : "&#9825;"}
        </button>
      </div>
      <p class="job-description">${escapeHtml(job.description)}</p>
      <div class="job-meta">
        <span>${escapeHtml(job.salary)}</span>
        <span>${escapeHtml(job.location)}</span>
        <span>${escapeHtml(job.type)}</span>
      </div>
      <div class="job-actions">
        <span class="match-badge">Độ phù hợp: ${getAiMatchScore(job.id)}%</span>
        <button class="ghost-button compact-button" data-view-job="${job.id}" type="button">Xem chi tiết</button>
        <button class="${applied ? "secondary-button" : "primary-button"}" data-apply-job="${job.id}" type="button">
          ${applied ? "Đã ứng tuyển" : "Ứng tuyển"}
        </button>
      </div>
    </article>
  `;
}

function bindCandidateJobCardActions(root) {
  if (!root) return;

  root.querySelectorAll("[data-view-job]").forEach((button) => {
    if (button.dataset.jobActionBound) return;
    button.dataset.jobActionBound = "true";
    button.addEventListener("click", () => openJobDetailModal(Number(button.dataset.viewJob)));
  });

  root.querySelectorAll("[data-apply-job]").forEach((button) => {
    if (button.dataset.jobActionBound) return;
    button.dataset.jobActionBound = "true";
    button.addEventListener("click", () => applyJob(Number(button.dataset.applyJob)));
  });

  root.querySelectorAll("[data-save-job]").forEach((button) => {
    if (button.dataset.jobActionBound) return;
    button.dataset.jobActionBound = "true";
    button.addEventListener("click", () => toggleSavedJob(Number(button.dataset.saveJob)));
  });
}

function getRecommendedJob(jobs) {
  return [...jobs].sort((a, b) => getAiMatchScore(b.id) - getAiMatchScore(a.id))[0];
}

function renderCandidateSpotlight(job) {
  const applied = appState.currentUser.appliedJobs.includes(job.id);
  const saved = appState.currentUser.savedJobs.includes(job.id);
  const matchScore = getAiMatchScore(job.id);

  return `
    <section class="candidate-spotlight">
      <div>
        <p class="eyebrow">Goi y phu hop nhat</p>
        <h3>${escapeHtml(job.title)}</h3>
        <p>${escapeHtml(job.company)} - ${escapeHtml(job.location)} - ${escapeHtml(job.salary)}</p>
        <small class="job-live-time" data-job-relative-time="${escapeHtml(job.updatedAt)}">Cập nhật ${formatRelativeTime(job.updatedAt)}</small>
      </div>
      <div class="spotlight-score">
        <strong>${matchScore}%</strong>
        <span>phù hợp</span>
      </div>
      <div class="spotlight-actions">
        <button class="ghost-button" data-view-job="${job.id}" type="button">Xem chi tiết</button>
        <button class="secondary-button" data-save-job="${job.id}" type="button">${saved ? "Đã lưu" : "Lưu việc"}</button>
        <button class="${applied ? "secondary-button" : "primary-button"}" data-apply-job="${job.id}" type="button">
          ${applied ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
        </button>
      </div>
    </section>
  `;
}

function openJobDetailModal(jobId) {
  const job = appState.jobs.find((item) => item.id === jobId);
  if (!job) return;

  const saved = appState.currentUser.savedJobs.includes(job.id);
  const applied = appState.currentUser.appliedJobs.includes(job.id);
  const matchScore = getAiMatchScore(job.id);
  const reasons = getMatchReasons(job);

  closeJobDetailModal();
  document.body.classList.add("modal-open");
  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div id="jobDetailModal" class="modal-backdrop" role="presentation">
        <section class="job-detail-modal" role="dialog" aria-modal="true" aria-labelledby="jobDetailTitle">
          <button class="modal-close" data-close-job-detail type="button" aria-label="Dong chi tiet viec lam">&times;</button>
          <div class="job-detail-header">
            <span class="company-logo large">${escapeHtml(getInitials(job.company))}</span>
            <div>
              <p class="eyebrow">Chi tiet viec lam</p>
              <h2 id="jobDetailTitle">${escapeHtml(job.title)}</h2>
              <p>${escapeHtml(job.company)} - ${escapeHtml(job.location)}</p>
            </div>
          </div>

          <div class="job-detail-meta">
            <span>${escapeHtml(job.salary)}</span>
            <span>${escapeHtml(job.location)}</span>
            <span>${escapeHtml(job.type)}</span>
            <span>${escapeHtml(job.status)}</span>
            <span data-job-relative-time="${escapeHtml(job.updatedAt)}">Cập nhật ${formatRelativeTime(job.updatedAt)}</span>
          </div>

          <div class="job-detail-match">
            <div>
              <strong>${matchScore}%</strong>
              <span>Do phu hop voi ho so</span>
            </div>
            <ul>
              ${reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
            </ul>
          </div>

          <div class="job-detail-section">
            <h3>Mo ta cong viec</h3>
            <p>${escapeHtml(job.description)}</p>
          </div>

          <div class="modal-actions">
            <button class="secondary-button" data-save-job="${job.id}" type="button">
              ${saved ? "Bo luu" : "Luu viec"}
            </button>
            <button class="${applied ? "secondary-button" : "primary-button"}" data-apply-job="${job.id}" type="button">
              ${applied ? "Da ung tuyen" : "Ung tuyen ngay"}
            </button>
          </div>
        </section>
      </div>
    `,
  );

  const modal = document.querySelector("#jobDetailModal");
  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.closest("[data-close-job-detail]")) {
      closeJobDetailModal();
    }
  });
  bindCandidateJobCardActions(modal);
  document.addEventListener("keydown", handleJobDetailEscape);
}

function closeJobDetailModal() {
  document.querySelector("#jobDetailModal")?.remove();
  document.body.classList.remove("modal-open");
  document.removeEventListener("keydown", handleJobDetailEscape);
}

function handleJobDetailEscape(event) {
  if (event.key === "Escape") {
    closeJobDetailModal();
  }
}

function getMatchReasons(job) {
  const currentUser = normalizeUser(appState.currentUser);
  const desiredWords = currentUser.desiredTitle.toLowerCase().split(/\s+/).filter(Boolean);
  const jobText = `${job.title} ${job.description}`.toLowerCase();
  const reasons = [];

  if (desiredWords.some((word) => jobText.includes(word))) {
    reasons.push("Gan voi vi tri mong muon trong ho so cua ban.");
  }

  const matchedSkills = currentUser.skills.filter((skill) => jobText.includes(skill.toLowerCase()));
  if (matchedSkills.length > 0) {
    reasons.push(`Co ky nang lien quan: ${matchedSkills.join(", ")}.`);
  }

  if (job.maxSalary >= appState.candidateFilters.minSalary) {
    reasons.push("Muc luong dat nguong loc hien tai.");
  }

  if (job.type === "Remote") {
    reasons.push("Co hinh thuc Remote, phu hop voi ung vien can linh hoat.");
  }

  return reasons.length > 0 ? reasons.slice(0, 3) : ["Thong tin viec lam phu hop voi bo loc tim kiem hien tai."];
}

function getFilteredApprovedJobs() {
  const keyword = appState.candidateKeyword.trim().toLowerCase();
  const { location, types, minSalary, saturday, categories, experiences, companyField, jobField } = appState.candidateFilters;

  return appState.jobs
    .filter((job) => {
      const searchable = `${job.title} ${job.company} ${job.location} ${job.salary} ${job.description} ${job.category} ${job.experience}`.toLowerCase();
      const matchKeyword = !keyword || searchable.includes(keyword);
      const matchLocation = !location || job.location === location;
      const matchType = types.length === 0 || types.includes(job.type);
      const matchSalary = job.maxSalary >= minSalary;
      const matchSaturday = !saturday || job.saturday === saturday;
      const matchCategory = categories.length === 0 || categories.includes(job.category);
      const matchExperience = experiences.length === 0 || experiences.includes(job.experience);
      const matchCompanyField = !companyField || job.companyField === companyField;
      const matchJobField = !jobField || job.jobField === jobField;
      return job.status === "Approved" && matchKeyword && matchLocation && matchType && matchSalary && matchSaturday && matchCategory && matchExperience && matchCompanyField && matchJobField;
    })
    .sort((first, second) => getJobTimestamp(second) - getJobTimestamp(first));
}

function applyJob(jobId) {
  const job = appState.jobs.find((item) => item.id === jobId);
  if (!job) return;

  const applied = appState.currentUser.appliedJobs.includes(jobId);
  if (applied) {
    showToast("Ban da ung tuyen cong viec nay.", "info");
    return;
  }

  updateCurrentUser({
    appliedJobs: [...appState.currentUser.appliedJobs, jobId],
  });
  appState.applications.unshift({
    id: Date.now(),
    candidateId: appState.currentUser.id,
    candidateName: appState.currentUser.name,
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    status: "Da nop",
    appliedAt: toDateInput(new Date()),
  });
  writeStorage(STORAGE_KEYS.applications, appState.applications);
  closeJobDetailModal();
  renderCandidateView();
  showToast("Ung tuyen thanh cong", "success");
}

function toggleSavedJob(jobId) {
  const isSaved = appState.currentUser.savedJobs.includes(jobId);
  const savedJobs = isSaved
    ? appState.currentUser.savedJobs.filter((id) => id !== jobId)
    : [...appState.currentUser.savedJobs, jobId];

  updateCurrentUser({ savedJobs });
  closeJobDetailModal();
  renderCandidateView();
  showToast(isSaved ? "Da bo luu viec lam" : "Da luu thanh cong", isSaved ? "info" : "success");
}

function bindCandidateProfile() {
  document.querySelector("#candidateProfileForm").addEventListener("submit", handleProfileSubmit);
  document.querySelector("#skillInput").addEventListener("keydown", handleSkillInput);
  document.querySelectorAll("[data-remove-skill]").forEach((button) => {
    button.addEventListener("click", () => removeSkill(button.dataset.removeSkill));
  });
}

function handleProfileSubmit(event) {
  event.preventDefault();
  const name = document.querySelector("#profileName").value.trim();
  const desiredTitle = document.querySelector("#profileDesiredTitle").value.trim();
  const phone = document.querySelector("#profilePhone").value.trim();
  const location = document.querySelector("#profileLocation").value.trim();
  const dateOfBirth = document.querySelector("#profileDateOfBirth").value;
  const gender = document.querySelector("#profileGender").value;
  const portfolio = document.querySelector("#profilePortfolio").value.trim();
  const experienceLevel = document.querySelector("#profileExperienceLevel").value;
  const education = document.querySelector("#profileEducation").value.trim();
  const summary = document.querySelector("#profileSummary").value.trim();

  if (!name || !desiredTitle) {
    showToast("Vui lòng nhập họ tên và vị trí mong muốn.", "error");
    return;
  }

  updateCurrentUser({
    name,
    avatar: getInitials(name),
    desiredTitle,
    phone,
    location,
    dateOfBirth,
    gender,
    portfolio,
    experienceLevel,
    education,
    summary,
  });
  appState.candidateTab = "profile";
  renderDashboard();
  showToast("Đã cập nhật hồ sơ cá nhân", "success");
}

function handleSkillInput(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();

  const skill = event.target.value.trim();
  if (!skill) return;

  const skills = Array.from(new Set([...appState.currentUser.skills, skill]));
  updateCurrentUser({ skills });
  appState.candidateTab = "profile";
  renderCandidateView();
  showToast("Đã thêm kỹ năng", "success");
}

function removeSkill(skill) {
  updateCurrentUser({
    skills: appState.currentUser.skills.filter((item) => item !== skill),
  });
  appState.candidateTab = "profile";
  renderCandidateView();
  showToast("Đã xóa kỹ năng", "info");
}

function renderSkillTag(skill) {
  return `
    <span class="skill-tag">
      ${escapeHtml(skill)}
      <button data-remove-skill="${escapeHtml(skill)}" type="button" aria-label="Xóa kỹ năng">x</button>
    </span>
  `;
}

function renderCandidateHistory() {
  const root = document.querySelector("#applicationHistory");
  const rows = appState.currentUser.appliedJobs
    .map((jobId) => {
      const job = appState.jobs.find((item) => item.id === jobId);
      const application = appState.applications.find(
        (item) => item.jobId === jobId && item.candidateId === appState.currentUser.id,
      );
      if (!job) return "";
      const status = application?.status || "Da nop";
      return `
        <tr>
          <td>
            <strong>${escapeHtml(job.title)}</strong>
            <span>${escapeHtml(job.company)}</span>
          </td>
          <td>${escapeHtml(job.location)}</td>
          <td>${escapeHtml(application?.appliedAt || toDateInput(new Date()))}</td>
          <td><span class="history-status ${getHistoryStatusClass(status)}">${escapeHtml(status)}</span></td>
        </tr>
      `;
    })
    .filter(Boolean);

  if (rows.length === 0) {
    root.innerHTML = `<div class="empty-state">Ban chua ung tuyen cong viec nao.</div>`;
    return;
  }

  root.innerHTML = `
    <table class="spa-table">
      <thead>
        <tr>
          <th>Cong viec</th>
          <th>Dia diem</th>
          <th>Ngay nop</th>
          <th>Trang thai</th>
        </tr>
      </thead>
      <tbody>${rows.join("")}</tbody>
    </table>
  `;
}

function renderSavedJobs() {
  const root = document.querySelector("#savedJobGrid");
  const savedJobs = appState.currentUser.savedJobs
    .map((jobId) => appState.jobs.find((job) => job.id === jobId))
    .filter(Boolean);

  if (savedJobs.length === 0) {
    root.innerHTML = `<div class="empty-state">Ban chua luu cong viec nao.</div>`;
    return;
  }

  root.innerHTML = savedJobs.map((job) => renderCandidateJobCard(job)).join("");
  bindCandidateJobCardActions(root);
}

function getHistoryStatusClass(status) {
  if (status === "Len lich phong van") return "interview";
  if (status === "Tu choi") return "rejected";
  return "submitted";
}

function getAiMatchScore(jobId) {
  if (!appState.matchScores[jobId]) {
    appState.matchScores[jobId] = 70 + Math.floor(Math.random() * 26);
  }
  return appState.matchScores[jobId];
}

function renderEmployerView() {
  document.querySelector("#dashboardRoot").innerHTML = `
    <section class="spa-hero-band">
      <div>
        <p class="eyebrow">Employer View</p>
        <h1>Quan ly tuyen dung</h1>
        <p>Dang tin moi o trang thai Pending va theo doi ung vien tren Kanban.</p>
      </div>
      <div class="hero-metrics">
        <div>
          <strong>${appState.jobs.length}</strong>
          <span>tong tin tuyen dung</span>
        </div>
        <div>
          <strong>${appState.applications.length}</strong>
          <span>ho so ung vien</span>
        </div>
      </div>
    </section>

    <section class="spa-section">
      <div class="spa-tabs">
        <button class="spa-tab ${appState.employerTab === "post" ? "active" : ""}" data-employer-tab="post" type="button">Dang tin moi</button>
        <button class="spa-tab ${appState.employerTab === "kanban" ? "active" : ""}" data-employer-tab="kanban" type="button">Quan ly Ung vien</button>
      </div>
      <div id="employerPanel"></div>
    </section>
  `;

  document.querySelectorAll("[data-employer-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      appState.employerTab = button.dataset.employerTab;
      renderEmployerView();
    });
  });

  if (appState.employerTab === "post") renderEmployerPostTab();
  if (appState.employerTab === "kanban") renderEmployerKanbanTab();
}

function renderEmployerPostTab() {
  document.querySelector("#employerPanel").innerHTML = `
    <form id="newJobForm" class="spa-form-panel">
      <div class="panel-heading">
        <h2>Tao tin tuyen dung</h2>
        <span class="status-pill warning">Pending mac dinh</span>
      </div>
      <div class="form-grid">
        <label>
          Tieu de
          <input id="jobTitle" type="text" placeholder="VD: Frontend Developer" />
        </label>
        <label>
          Cong ty
          <input id="jobCompany" type="text" value="BridgeTech" />
        </label>
        <label>
          Muc luong
          <input id="jobSalary" type="text" placeholder="VD: 20 - 35 trieu" />
        </label>
        <label>
          Dia diem
          <input id="jobLocation" type="text" placeholder="VD: TP.HCM" />
        </label>
      </div>
      <label>
        Mo ta
        <textarea id="jobDescription" rows="4" placeholder="Mo ta ngan ve cong viec"></textarea>
      </label>
      <button class="primary-button" type="submit">Gui tin cho Admin duyet</button>
      <div id="postMessage" class="auth-message" aria-live="polite"></div>
    </form>
  `;

  document.querySelector("#newJobForm").addEventListener("submit", createPendingJob);
}

function createPendingJob(event) {
  event.preventDefault();
  const title = document.querySelector("#jobTitle").value.trim();
  const company = document.querySelector("#jobCompany").value.trim();
  const salary = document.querySelector("#jobSalary").value.trim();
  const location = document.querySelector("#jobLocation").value.trim();
  const description = document.querySelector("#jobDescription").value.trim();

  if (!title || !company || !salary || !location || !description) {
    showInlineMessage("#postMessage", "Vui long nhap day du thong tin cong viec.", "error");
    return;
  }

  const now = new Date().toISOString();
  appState.jobs.unshift(normalizeJob({
    id: Date.now(),
    title,
    company,
    salary,
    location,
    type: "Full-time",
    status: "Pending",
    description,
    createdAt: now,
    updatedAt: now,
  }));
  writeStorage(STORAGE_KEYS.jobs, appState.jobs);
  event.target.reset();
  document.querySelector("#jobCompany").value = company;
  showInlineMessage("#postMessage", "Tin moi da tao voi trang thai Pending.", "success");
}

function renderEmployerKanbanTab() {
  const columns = [
    { id: "Da nop", title: "Cho xu ly" },
    { id: "Len lich phong van", title: "Dang phong van" },
    { id: "Da tuyen", title: "Da tuyen" },
  ];

  document.querySelector("#employerPanel").innerHTML = `
    <div class="kanban-board employer-kanban">
      ${columns
        .map((column) => {
          const cards = appState.applications.filter((item) => item.status === column.id);
          return `
            <section class="kanban-column">
              <div class="kanban-column-header">
                <span>${column.title}</span>
                <span>${cards.length}</span>
              </div>
              <div class="kanban-list">
                ${cards.map(renderApplicationCard).join("") || `<div class="kanban-empty">Chua co ung vien</div>`}
              </div>
            </section>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderApplicationCard(application) {
  return `
    <article class="kanban-card">
      <strong>${escapeHtml(application.candidateName)}</strong>
      <span>${escapeHtml(application.jobTitle)}</span>
      <small>${escapeHtml(application.company)} - ${formatDate(application.appliedAt)}</small>
    </article>
  `;
}


async function renderAdminView() {
  try {
    await loadAdminDashboard();
  } catch (error) {
    showToast(
      error.message || "Không thể tải Dashboard Admin.",
      "error",
    );
  }

  const root = document.querySelector("#app");
  if (!root) return;

  root.innerHTML = `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-sidebar-brand">
          <h2>JobBridge Admin</h2>
          <p>Quản trị hệ thống</p>
        </div>

        <nav class="admin-navigation">
          ${renderAdminNavButton("dashboard", "Tổng quan")}
          ${renderAdminNavButton("users", "Người dùng")}
          ${renderAdminNavButton("jobs", "Tin tuyển dụng")}
          ${renderAdminNavButton("companies", "Doanh nghiệp")}
          ${renderAdminNavButton("applications", "Hồ sơ ứng tuyển")}
          ${renderAdminNavButton("reports", "Báo cáo vi phạm")}
          ${renderAdminNavButton("logs", "Nhật ký Admin")}
          ${renderAdminNavButton("settings", "Cấu hình")}
        </nav>
      </aside>

      <main class="admin-main">
        <header class="admin-topbar">
          <div>
            <h1 id="adminPageTitle">Dashboard Admin</h1>
            <p>Xin chào, ${escapeHtml(appState.currentUser.name)}</p>
          </div>

          <button
            type="button"
            class="secondary-button"
            id="adminLogoutButton"
          >
            Đăng xuất
          </button>
        </header>

        <div id="adminContent">
          ${renderAdminDashboardContent()}
        </div>
      </main>
    </div>
  `;

  document
    .querySelector("#adminLogoutButton")
    ?.addEventListener("click", logout);

  bindAdminDashboardEvents();
  bindAdminNavigationEvents();
}
function renderAdminCompanyRow(company) {
  const companyId = Number(company.id);
  const isLocked = company.status === "Locked";

  return `
    <tr>
      <td>#${companyId}</td>

      <td>
        <strong>
          ${escapeHtml(company.name || "Chưa cập nhật")}
        </strong>

        <small>
          ${escapeHtml(company.email || "")}
        </small>
      </td>

      <td>
        <span
          class="admin-company-status ${
            isLocked ? "locked" : "active"
          }"
        >
          ${isLocked ? "Đã khóa" : "Hoạt động"}
        </span>
      </td>

      <td>
        ${Number(company.totalJobs || 0)}
      </td>

      <td>
        ${Number(company.approvedJobs || 0)}
      </td>

      <td>
        ${Number(company.pendingJobs || 0)}
      </td>

      <td>
        ${
          company.lastLoginAt
            ? formatAdminDate(company.lastLoginAt)
            : "Chưa có"
        }
      </td>

      <td>
        ${
          company.createdAt
            ? formatAdminDate(company.createdAt)
            : "Chưa có"
        }
      </td>

      <td>
        <div class="admin-company-actions">
          <button
            type="button"
            class="admin-company-view-button"
            data-admin-view-company="${companyId}"
          >
            Chi tiết
          </button>

          <button
            type="button"
            class="admin-company-status-button ${
              isLocked ? "unlock" : "lock"
            }"
            data-admin-company-status="${companyId}"
            data-next-company-status="${
              isLocked ? "Active" : "Locked"
            }"
          >
            ${isLocked ? "Mở khóa" : "Khóa"}
          </button>
        </div>
      </td>
    </tr>
  `;
}
  function findAdminCompanyById(companyId) {
  return (appState.adminCompanies || []).find(
    (company) =>
      Number(company.id) === Number(companyId),
  );
}

function closeAdminCompanyModal() {
  document
    .querySelector("#adminCompanyModal")
    ?.remove();
}

function openAdminCompanyDetail(companyId) {
  const company =
    findAdminCompanyById(companyId);

  if (!company) {
    showToast(
      "Không tìm thấy thông tin doanh nghiệp.",
      "error",
    );
    return;
  }

  closeAdminCompanyModal();

  const isLocked =
    company.status === "Locked";

  const modal =
    document.createElement("div");

  modal.id = "adminCompanyModal";
  modal.className =
    "admin-company-modal-backdrop";

  modal.innerHTML = `
    <section
      class="admin-company-modal-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adminCompanyModalTitle"
    >
      <header class="admin-company-modal-heading">
        <div>
          <h2 id="adminCompanyModalTitle">
            ${escapeHtml(
              company.name ||
                "Chi tiết doanh nghiệp",
            )}
          </h2>

          <p>
            Thông tin tài khoản và hoạt động tuyển dụng
          </p>
        </div>

        <button
          type="button"
          class="admin-company-modal-close"
          data-close-company-modal
          aria-label="Đóng"
        >
          ×
        </button>
      </header>

      <div class="admin-company-detail-grid">
        <div class="admin-company-detail-item">
          <span>ID tài khoản</span>
          <strong>
            #${Number(company.id)}
          </strong>
        </div>

        <div class="admin-company-detail-item">
          <span>Email</span>
          <strong>
            ${escapeHtml(
              company.email || "Chưa có",
            )}
          </strong>
        </div>

        <div class="admin-company-detail-item">
          <span>Trạng thái</span>

          <strong>
            <span
              class="admin-company-status ${
                isLocked ? "locked" : "active"
              }"
            >
              ${
                isLocked
                  ? "Đã khóa"
                  : "Hoạt động"
              }
            </span>
          </strong>
        </div>

        <div class="admin-company-detail-item">
          <span>Tổng tin tuyển dụng</span>
          <strong>
            ${Number(company.totalJobs || 0)}
          </strong>
        </div>

        <div class="admin-company-detail-item">
          <span>Tin đã duyệt</span>
          <strong>
            ${Number(company.approvedJobs || 0)}
          </strong>
        </div>

        <div class="admin-company-detail-item">
          <span>Tin chờ duyệt</span>
          <strong>
            ${Number(company.pendingJobs || 0)}
          </strong>
        </div>

        <div class="admin-company-detail-item">
          <span>Đăng nhập cuối</span>
          <strong>
            ${
              company.lastLoginAt
                ? formatAdminDate(
                    company.lastLoginAt,
                  )
                : "Chưa có"
            }
          </strong>
        </div>

        <div class="admin-company-detail-item">
          <span>Ngày tạo</span>
          <strong>
            ${
              company.createdAt
                ? formatAdminDate(
                    company.createdAt,
                  )
                : "Chưa có"
            }
          </strong>
        </div>
      </div>

      <footer class="admin-company-modal-footer">
        <button
          type="button"
          class="admin-company-modal-cancel"
          data-close-company-modal
        >
          Đóng
        </button>

        <button
          type="button"
          class="admin-company-status-button ${
            isLocked ? "unlock" : "lock"
          }"
          data-modal-company-status="${Number(
            company.id,
          )}"
          data-next-company-status="${
            isLocked ? "Active" : "Locked"
          }"
        >
          ${
            isLocked
              ? "Mở khóa"
              : "Khóa tài khoản"
          }
        </button>
      </footer>
    </section>
  `;

  document.body.appendChild(modal);

  modal
    .querySelectorAll(
      "[data-close-company-modal]",
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        closeAdminCompanyModal,
      );
    });

  modal.addEventListener(
    "click",
    (event) => {
      if (event.target === modal) {
        closeAdminCompanyModal();
      }
    },
  );

  modal
    .querySelector(
      "[data-modal-company-status]",
    )
    ?.addEventListener(
      "click",
      async (event) => {
        const button =
          event.currentTarget;

        const id = Number(
          button.dataset
            .modalCompanyStatus,
        );

        const nextStatus =
          button.dataset
            .nextCompanyStatus;

        closeAdminCompanyModal();

        await handleAdminCompanyStatusChange(
          id,
          nextStatus,
        );
      },
    );
}

function askAdminCompanyLockReason(company) {
  return new Promise((resolve) => {
    document
      .querySelector(
        "#adminCompanyLockModal",
      )
      ?.remove();

    const modal =
      document.createElement("div");

    modal.id = "adminCompanyLockModal";
    modal.className =
      "admin-company-modal-backdrop";

    modal.innerHTML = `
      <section
        class="admin-company-lock-card"
        role="dialog"
        aria-modal="true"
      >
        <header class="admin-company-modal-heading">
          <div>
            <h2>Khóa doanh nghiệp</h2>

            <p>
              ${escapeHtml(
                company.name || "",
              )}
            </p>
          </div>

          <button
            type="button"
            class="admin-company-modal-close"
            data-cancel-company-lock
            aria-label="Đóng"
          >
            ×
          </button>
        </header>

        <div class="admin-company-lock-body">
          <label for="adminCompanyLockReason">
            Lý do khóa tài khoản
          </label>

          <textarea
            id="adminCompanyLockReason"
            rows="5"
            maxlength="500"
            placeholder="Nhập lý do khóa doanh nghiệp..."
          ></textarea>

          <p
            id="adminCompanyLockMessage"
            class="admin-company-lock-message"
          ></p>
        </div>

        <footer class="admin-company-modal-footer">
          <button
            type="button"
            class="admin-company-modal-cancel"
            data-cancel-company-lock
          >
            Hủy
          </button>

          <button
            type="button"
            class="admin-company-confirm-lock"
            id="confirmAdminCompanyLockButton"
          >
            Xác nhận khóa
          </button>
        </footer>
      </section>
    `;

    document.body.appendChild(modal);

    let finished = false;

    const finish = (value) => {
      if (finished) {
        return;
      }

      finished = true;
      modal.remove();
      resolve(value);
    };

    modal
      .querySelectorAll(
        "[data-cancel-company-lock]",
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => finish(null),
        );
      });

    modal.addEventListener(
      "click",
      (event) => {
        if (event.target === modal) {
          finish(null);
        }
      },
    );

    modal
      .querySelector(
        "#confirmAdminCompanyLockButton",
      )
      ?.addEventListener(
        "click",
        () => {
          const reason =
            modal
              .querySelector(
                "#adminCompanyLockReason",
              )
              ?.value.trim() || "";

          const message =
            modal.querySelector(
              "#adminCompanyLockMessage",
            );

          if (!reason) {
            if (message) {
              message.textContent =
                "Vui lòng nhập lý do khóa tài khoản.";
            }

            return;
          }

          finish(reason);
        },
      );

    modal
      .querySelector(
        "#adminCompanyLockReason",
      )
      ?.focus();
  });
}

async function handleAdminCompanyStatusChange(
  companyId,
  nextStatus,
) {
  const company =
    findAdminCompanyById(companyId);

  if (!company) {
    showToast(
      "Không tìm thấy doanh nghiệp.",
      "error",
    );
    return;
  }

  if (
    !["Active", "Locked"].includes(
      nextStatus,
    )
  ) {
    showToast(
      "Trạng thái tài khoản không hợp lệ.",
      "error",
    );
    return;
  }

  let reason = "";

  if (nextStatus === "Locked") {
    reason =
      await askAdminCompanyLockReason(
        company,
      );

    if (reason === null) {
      return;
    }
  } else {
    const confirmed =
      window.confirm(
        `Bạn có chắc muốn mở khóa doanh nghiệp "${company.name}"?`,
      );

    if (!confirmed) {
      return;
    }
  }

  try {
    await apiRequest(
      `/admin/users/${Number(
        companyId,
      )}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: nextStatus,
          reason:
            nextStatus === "Locked"
              ? reason
              : "",
        }),
      },
    );

    showToast(
      nextStatus === "Locked"
        ? "Đã khóa tài khoản doanh nghiệp."
        : "Đã mở khóa tài khoản doanh nghiệp.",
      "success",
    );

    await showAdminTab("companies");
  } catch (error) {
    console.error(
      "Lỗi thay đổi trạng thái doanh nghiệp:",
      error,
    );

    showToast(
      error.message ||
        "Không thể cập nhật trạng thái doanh nghiệp.",
      "error",
    );
  }
}

function renderAdminCompaniesContent() {
  const companies =
    appState.adminCompanies || [];

  const filters =
    appState.adminCompanyFilters || {
      keyword: "",
      status: "",
    };

  return `
    <section class="admin-companies-section">
      <div class="admin-companies-heading">
        <div>
          <h2>Quản lý doanh nghiệp</h2>

          <p>
            Theo dõi tài khoản doanh nghiệp và hoạt động tuyển dụng.
          </p>
        </div>

        <button
          type="button"
          id="refreshAdminCompaniesButton"
          class="admin-company-refresh-button"
        >
          Làm mới
        </button>
      </div>

      <section class="admin-companies-card">
        <div class="admin-companies-toolbar">
          <form id="adminCompanyFilterForm">
            <input
              type="search"
              id="adminCompanyKeyword"
              value="${escapeHtml(
                filters.keyword || "",
              )}"
              placeholder="Tìm theo tên hoặc email doanh nghiệp"
            />

            <select
              id="adminCompanyStatusFilter"
            >
              <option value="">
                Tất cả trạng thái
              </option>

              <option
                value="Active"
                ${
                  filters.status === "Active"
                    ? "selected"
                    : ""
                }
              >
                Hoạt động
              </option>

              <option
                value="Locked"
                ${
                  filters.status === "Locked"
                    ? "selected"
                    : ""
                }
              >
                Bị khóa
              </option>
            </select>

            <button
              type="submit"
              class="admin-company-search-button"
            >
              Tìm kiếm
            </button>

            <button
              type="button"
              id="clearAdminCompanyFiltersButton"
              class="admin-company-clear-button"
            >
              Xóa lọc
            </button>
          </form>
        </div>

        <div class="admin-companies-table-wrapper">
          <table class="admin-companies-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Doanh nghiệp</th>
                <th>Trạng thái</th>
                <th>Tổng tin</th>
                <th>Đã duyệt</th>
                <th>Chờ duyệt</th>
                <th>Đăng nhập cuối</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              ${
                companies.length > 0
                  ? companies
                      .map(
                        renderAdminCompanyRow,
                      )
                      .join("")
                  : `
                    <tr>
                      <td
                        colspan="9"
                        class="admin-company-empty-cell"
                      >
                        Không có doanh nghiệp phù hợp.
                      </td>
                    </tr>
                  `
              }
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `;
}
function renderAdminNavButton(tab, label) {
  return `
    <button
      class="admin-nav-button ${appState.adminTab === tab ? "active" : ""}"
      type="button"
      data-admin-tab="${escapeHtml(tab)}"
    >
      ${escapeHtml(label)}
    </button>
  `;
}

function formatAdminDate(value) {
  if (!value) return "Chưa có";

  const normalizedValue =
    String(value).includes("T")
      ? value
      : `${String(value).replace(" ", "T")}Z`;

  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("vi-VN");
}

function renderAdminStatCard(title, value, description = "") {
  return `
    <article class="admin-stat-card">
      <span class="admin-stat-title">${escapeHtml(title)}</span>
      <strong class="admin-stat-value">
        ${Number(value || 0).toLocaleString("vi-VN")}
      </strong>
      ${
        description
          ? `<small class="admin-stat-description">${escapeHtml(description)}</small>`
          : ""
      }
    </article>
  `;
}

function getAdminJobStatusClass(status) {
  const classes = {
    Pending: "warning",
    Approved: "success",
    Rejected: "danger",
    Closed: "neutral",
  };

  return classes[status] || "neutral";
}

function getAdminJobStatusLabel(status) {
  const labels = {
    Pending: "Chờ duyệt",
    Approved: "Đã duyệt",
    Rejected: "Bị từ chối",
    Closed: "Đã đóng",
  };

  return labels[status] || status;
}

function getAdminRoleLabel(role) {
  const labels = {
    candidate: "Ứng viên",
    employer: "Nhà tuyển dụng",
    admin: "Admin",
  };

  return labels[role] || role;
}

function renderAdminDashboardContent() {
  const dashboard = appState.adminDashboard;

  if (!dashboard) {
    return `
      <section class="admin-empty-state">
        Không thể tải dữ liệu Dashboard.
      </section>
    `;
  }

  const summary = dashboard.summary || {};
  const recentUsers = dashboard.recentUsers || [];
  const recentJobs = dashboard.recentJobs || [];

  return `
      <div class="admin-stat-grid">
        ${renderAdminStatCard("Tổng người dùng", summary.totalUsers, "Tất cả tài khoản")}
        ${renderAdminStatCard("Ứng viên", summary.totalCandidates, "Tài khoản candidate")}
        ${renderAdminStatCard("Nhà tuyển dụng", summary.totalEmployers, "Tài khoản employer")}
        ${renderAdminStatCard("Tài khoản bị khóa", summary.lockedUsers, "Không thể đăng nhập")}
        ${renderAdminStatCard("Tổng tin tuyển dụng", summary.totalJobs, "Tất cả trạng thái")}
        ${renderAdminStatCard("Tin chờ duyệt", summary.pendingJobs, "Pending")}
        ${renderAdminStatCard("Tin đã duyệt", summary.approvedJobs, "Approved")}
        ${renderAdminStatCard("Tin bị từ chối", summary.rejectedJobs, "Rejected")}
        ${renderAdminStatCard("Tin đã đóng", summary.closedJobs, "Closed")}
        ${renderAdminStatCard("Tổng hồ sơ", summary.totalApplications, "Tất cả hồ sơ")}
        ${renderAdminStatCard("Đã tuyển", summary.hiredApplications, "Ứng viên được tuyển")}
        ${renderAdminStatCard("Hồ sơ bị từ chối", summary.rejectedApplications, "Trạng thái từ chối")}
      </div>

      <div class="admin-dashboard-columns">
        <section class="admin-table-card">
          <div class="admin-card-heading">
            <h3>Người dùng mới nhất</h3>
          </div>

          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                ${
                  recentUsers.length
                    ? recentUsers.map((user) => `
                        <tr>
                          <td>${escapeHtml(user.name)}</td>
                          <td>${escapeHtml(user.email)}</td>
                          <td>${escapeHtml(getAdminRoleLabel(user.role))}</td>
                          <td>
                            <span class="admin-status-badge ${user.status === "Locked" ? "danger" : "success"}">
                              ${user.status === "Locked" ? "Bị khóa" : "Hoạt động"}
                            </span>
                          </td>
                          <td>${formatAdminDate(user.created_at)}</td>
                        </tr>
                      `).join("")
                    : `<tr><td colspan="5">Chưa có dữ liệu người dùng.</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </section>

        <section class="admin-table-card">
          <div class="admin-card-heading">
            <h3>Tin tuyển dụng mới nhất</h3>
          </div>

          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Công ty</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                ${
                  recentJobs.length
                    ? recentJobs.map((job) => `
                        <tr>
                          <td>${escapeHtml(job.title)}</td>
                          <td>${escapeHtml(job.company)}</td>
                          <td>
                            <span class="admin-status-badge ${getAdminJobStatusClass(job.status)}">
                              ${escapeHtml(getAdminJobStatusLabel(job.status))}
                            </span>
                          </td>
                          <td>${formatAdminDate(job.created_at)}</td>
                        </tr>
                      `).join("")
                    : `<tr><td colspan="4">Chưa có dữ liệu tin tuyển dụng.</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  `;
}

function renderAdminUserRow(user) {
  const isCurrentAdmin =
    Number(user.id) === Number(appState.currentUser.id);

  return `
    <tr>
      <td>#${Number(user.id)}</td>
      <td>
        <strong>${escapeHtml(user.name)}</strong>
        <br />
        <small>${escapeHtml(user.email)}</small>
      </td>
      <td>
        <span class="admin-status-badge neutral">
          ${escapeHtml(getAdminRoleLabel(user.role))}
        </span>
      </td>
      <td>
        <span class="admin-status-badge ${user.status === "Locked" ? "danger" : "success"}">
          ${user.status === "Locked" ? "Bị khóa" : "Hoạt động"}
        </span>
        ${
          user.lockedReason
            ? `<br /><small>${escapeHtml(user.lockedReason)}</small>`
            : ""
        }
      </td>
      <td>${formatAdminDate(user.lastLoginAt)}</td>
      <td>${formatAdminDate(user.createdAt)}</td>
      <td>
        <div class="admin-row-actions">
          ${
            isCurrentAdmin
              ? `<span class="admin-self-label">Tài khoản hiện tại</span>`
              : `
                <button
                  type="button"
                  class="secondary-button compact-button"
                  data-admin-toggle-user="${Number(user.id)}"
                  data-next-status="${user.status === "Locked" ? "Active" : "Locked"}"
                >
                  ${user.status === "Locked" ? "Mở khóa" : "Khóa"}
                </button>

                <button
                  type="button"
                  class="secondary-button compact-button"
                  data-admin-change-role="${Number(user.id)}"
                  data-current-role="${escapeHtml(user.role)}"
                >
                  Đổi vai trò
                </button>

                ${
                  user.role !== "admin"
                    ? `
                      <button
                        type="button"
                        class="danger-button compact-button"
                        data-admin-delete-user="${Number(user.id)}"
                      >
                        Xóa
                      </button>
                    `
                    : ""
                }
              `
          }
        </div>
      </td>
    </tr>
  `;
}

function renderAdminUsersContent() {
  const users = appState.adminUsers || [];
  const filters = appState.adminUserFilters;

  return `
    <section class="admin-dashboard-section admin-users-section">
      <div class="admin-section-heading">
        <div>
          <h2>Quản lý người dùng</h2>
          <p>Tìm kiếm, lọc và quản lý tài khoản JobBridge.</p>
        </div>

        <button
          type="button"
          id="refreshAdminUsersButton"
          class="secondary-button"
        >
          Làm mới
        </button>
      </div>

      <section class="admin-table-card">
        <div class="admin-user-toolbar">
          <form id="adminUserFilterForm">
            <input
              id="adminUserKeyword"
              type="search"
              value="${escapeHtml(filters.keyword)}"
              placeholder="Tìm theo tên hoặc email"
            />

            <select id="adminUserRoleFilter">
              <option value="">Tất cả vai trò</option>
              <option value="candidate" ${filters.role === "candidate" ? "selected" : ""}>Ứng viên</option>
              <option value="employer" ${filters.role === "employer" ? "selected" : ""}>Nhà tuyển dụng</option>
              <option value="admin" ${filters.role === "admin" ? "selected" : ""}>Admin</option>
            </select>

            <select id="adminUserStatusFilter">
              <option value="">Tất cả trạng thái</option>
              <option value="Active" ${filters.status === "Active" ? "selected" : ""}>Hoạt động</option>
              <option value="Locked" ${filters.status === "Locked" ? "selected" : ""}>Bị khóa</option>
            </select>

            <button class="primary-button" type="submit">Tìm kiếm</button>
            <button
              class="secondary-button"
              id="clearAdminUserFiltersButton"
              type="button"
            >
              Xóa lọc
            </button>
          </form>
        </div>

        <div class="admin-table-wrapper">
          <table class="admin-table admin-users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Đăng nhập cuối</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${
                users.length
                  ? users.map(renderAdminUserRow).join("")
                  : `<tr><td colspan="7">Không có người dùng phù hợp.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `;
}

function renderAdminJobRow(job) {
  return `
    <tr>
      <td>#${Number(job.id)}</td>
      <td>
        <strong>${escapeHtml(job.title)}</strong>
        <br />
        <small>${escapeHtml(job.company)}</small>
      </td>
      <td>${escapeHtml(job.location || "Chưa cập nhật")}</td>
      <td>${escapeHtml(job.type || "Chưa cập nhật")}</td>
      <td>
        <span class="admin-status-badge ${getAdminJobStatusClass(job.status)}">
          ${escapeHtml(getAdminJobStatusLabel(job.status))}
        </span>
      </td>
      <td>${escapeHtml(job.salary || "Thỏa thuận")}</td>
      <td>${formatAdminDate(job.createdAt || job.created_at)}</td>
      <td>
        <div class="admin-row-actions admin-job-actions">
          <button
            type="button"
            class="secondary-button compact-button"
            data-admin-view-job="${Number(job.id)}"
          >
            Chi tiết
          </button>

          ${
            job.status !== "Approved"
              ? `
                <button
                  type="button"
                  class="admin-action-approve compact-button"
                  data-admin-job-status="${Number(job.id)}"
                  data-next-job-status="Approved"
                >
                  Duyệt
                </button>
              `
              : ""
          }

          ${
            job.status !== "Rejected"
              ? `
                <button
                  type="button"
                  class="admin-action-reject compact-button"
                  data-admin-job-status="${Number(job.id)}"
                  data-next-job-status="Rejected"
                >
                  Từ chối
                </button>
              `
              : ""
          }

          ${
            job.status !== "Closed"
              ? `
                <button
                  type="button"
                  class="admin-action-close compact-button"
                  data-admin-job-status="${Number(job.id)}"
                  data-next-job-status="Closed"
                >
                  Đóng
                </button>
              `
              : `
                <button
                  type="button"
                  class="admin-action-approve compact-button"
                  data-admin-job-status="${Number(job.id)}"
                  data-next-job-status="Approved"
                >
                  Mở lại
                </button>
              `
          }

          <button
            type="button"
            class="danger-button compact-button"
            data-admin-delete-job="${Number(job.id)}"
          >
            Xóa
          </button>
        </div>
      </td>
    </tr>
  `;
}

function renderAdminJobsContent() {
  const jobs = appState.adminJobs || [];
  const filters = appState.adminJobFilters || {
    keyword: "",
    status: "",
  };

  const totalJobs = jobs.length;

  const pendingJobs = jobs.filter(
    (job) => job.status === "Pending",
  ).length;

  const approvedJobs = jobs.filter(
    (job) => job.status === "Approved",
  ).length;

  const rejectedJobs = jobs.filter(
    (job) => job.status === "Rejected",
  ).length;

  const closedJobs = jobs.filter(
    (job) => job.status === "Closed",
  ).length;

  return `
    <section class="admin-dashboard-section admin-jobs-section">

      <div class="admin-section-heading admin-jobs-heading">
        <div>
          <h2>Quản lý tin tuyển dụng</h2>

          <p>
            Duyệt, từ chối, đóng và quản lý các tin tuyển dụng.
          </p>
        </div>

        <button
          type="button"
          id="refreshAdminJobsButton"
          class="secondary-button admin-refresh-button"
        >
          Làm mới
        </button>
      </div>

      <div class="admin-job-stat-grid">
        ${renderAdminJobStatCard(
          "Tổng tin",
          totalJobs,
          "Tất cả tin tuyển dụng",
          "all",
        )}

        ${renderAdminJobStatCard(
          "Chờ duyệt",
          pendingJobs,
          "Tin đang chờ xử lý",
          "pending",
        )}

        ${renderAdminJobStatCard(
          "Đã duyệt",
          approvedJobs,
          "Tin đang được hiển thị",
          "approved",
        )}

        ${renderAdminJobStatCard(
          "Bị từ chối",
          rejectedJobs,
          "Tin không được duyệt",
          "rejected",
        )}

        ${renderAdminJobStatCard(
          "Đã đóng",
          closedJobs,
          "Tin đã ngừng tuyển",
          "closed",
        )}
      </div>

      <section class="admin-table-card">
        <div class="admin-job-toolbar">
          <form id="adminJobFilterForm">

            <input
              id="adminJobKeyword"
              type="search"
              value="${escapeHtml(filters.keyword || "")}"
              placeholder="Tìm theo tiêu đề hoặc công ty"
            />

            <select id="adminJobStatusFilter">
              <option value="">
                Tất cả trạng thái
              </option>

              <option
                value="Pending"
                ${
                  filters.status === "Pending"
                    ? "selected"
                    : ""
                }
              >
                Chờ duyệt
              </option>

              <option
                value="Approved"
                ${
                  filters.status === "Approved"
                    ? "selected"
                    : ""
                }
              >
                Đã duyệt
              </option>

              <option
                value="Rejected"
                ${
                  filters.status === "Rejected"
                    ? "selected"
                    : ""
                }
              >
                Bị từ chối
              </option>

              <option
                value="Closed"
                ${
                  filters.status === "Closed"
                    ? "selected"
                    : ""
                }
              >
                Đã đóng
              </option>
            </select>

            <button
              type="submit"
              class="primary-button"
            >
              Tìm kiếm
            </button>

            <button
              type="button"
              id="clearAdminJobFiltersButton"
              class="secondary-button"
            >
              Xóa lọc
            </button>
          </form>
        </div>

        <div class="admin-table-wrapper">
          <table class="admin-table admin-job-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tin tuyển dụng</th>
                <th>Địa điểm</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th>Mức lương</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              ${
                jobs.length
                  ? jobs.map(renderAdminJobRow).join("")
                  : `
                    <tr>
                      <td colspan="8">
                        Không có tin tuyển dụng phù hợp.
                      </td>
                    </tr>
                  `
              }
            </tbody>
          </table>
        </div>
      </section>

    </section>
  `;
}
function renderAdminJobStatCard(
  title,
  value,
  description,
  variant,
) {
  const icons = {
    all: "▦",
    pending: "◷",
    approved: "✓",
    rejected: "×",
    closed: "■",
  };

  return `
    <article class="admin-job-stat-card ${variant}">
      <div class="admin-job-stat-header">
        <div class="admin-job-stat-icon">
          ${icons[variant] || "•"}
        </div>

        <span class="admin-job-stat-title">
          ${escapeHtml(title)}
        </span>
      </div>

      <strong class="admin-job-stat-value">
        ${Number(value || 0).toLocaleString("vi-VN")}
      </strong>

      <small class="admin-job-stat-description">
        ${escapeHtml(description)}
      </small>
    </article>
  `;
}

/* =========================================
   CHỨC NĂNG 5 - HỒ SƠ ỨNG TUYỂN
   ========================================= */

function getAdminApplicationStatusLabel(status) {
  const labels = {
    "Da nop": "Đã nộp",
    "Len lich phong van": "Lên lịch phỏng vấn",
    "Da tuyen": "Đã tuyển",
    "Tu choi": "Từ chối",
  };

  return labels[status] || status || "Chưa xác định";
}

function getAdminApplicationStatusClass(status) {
  const classes = {
    "Da nop": "warning",
    "Len lich phong van": "interview",
    "Da tuyen": "success",
    "Tu choi": "danger",
  };

  return classes[status] || "neutral";
}

function findAdminApplicationById(applicationId) {
  return (appState.adminApplications || []).find(
    (application) =>
      Number(application.id) === Number(applicationId),
  );
}

function renderAdminApplicationRow(application) {
  return `
    <tr>
      <td>#${Number(application.id)}</td>

      <td>
        <strong>${escapeHtml(
          application.candidateName ||
            application.candidate_name ||
            "Chưa có tên",
        )}</strong>
        <small>${escapeHtml(
          application.candidateEmail ||
            application.candidate_email ||
            "",
        )}</small>
      </td>

      <td>
        <strong>${escapeHtml(
          application.jobTitle ||
            application.job_title ||
            "Không xác định",
        )}</strong>
        <small>${escapeHtml(
          application.companyName ||
            application.company_name ||
            application.company ||
            "",
        )}</small>
      </td>

      <td>
        <span class="admin-status-badge ${getAdminApplicationStatusClass(
          application.status,
        )}">
          ${escapeHtml(
            getAdminApplicationStatusLabel(
              application.status,
            ),
          )}
        </span>
      </td>

      <td>
        ${escapeHtml(
          application.jobLocation ||
            application.job_location ||
            "Chưa cập nhật",
        )}
      </td>

      <td>
        ${formatAdminDate(
          application.createdAt ||
            application.created_at ||
            application.appliedAt ||
            application.applied_at ||
            "",
        )}
      </td>

      <td>
        <div class="admin-row-actions">
          <button
            type="button"
            class="compact-button secondary-button"
            data-admin-view-application="${Number(
              application.id,
            )}"
          >
            Chi tiết
          </button>

          <button
            type="button"
            class="compact-button"
            data-admin-change-application-status="${Number(
              application.id,
            )}"
          >
            Đổi trạng thái
          </button>
        </div>
      </td>
    </tr>
  `;
}

function renderAdminApplicationsContent() {
  const applications =
    appState.adminApplications || [];

  const filters =
    appState.adminApplicationFilters || {
      keyword: "",
      status: "",
    };

  return `
    <section class="admin-dashboard-section admin-applications-section">
      <div class="admin-section-heading">
        <div>
          <h2>Quản lý hồ sơ ứng tuyển</h2>
          <p class="admin-users-description">
    Theo dõi ứng viên, tin tuyển dụng và tiến trình tuyển dụng.
</p>
        </div>

        <button
          type="button"
          id="refreshAdminApplicationsButton"
          class="secondary-button"
        >
          Làm mới
        </button>
      </div>

      <section class="admin-table-card">
        <div class="admin-user-toolbar admin-application-toolbar">
          <form id="adminApplicationFilterForm">
            <input
              type="search"
              id="adminApplicationKeyword"
              value="${escapeHtml(
                filters.keyword || "",
              )}"
              placeholder="Tìm ứng viên, email, công việc hoặc công ty"
            />

            <select id="adminApplicationStatusFilter">
              <option value="">
                Tất cả trạng thái
              </option>

              <option value="Da nop" ${
                filters.status === "Da nop"
                  ? "selected"
                  : ""
              }>
                Đã nộp
              </option>

              <option value="Len lich phong van" ${
                filters.status ===
                "Len lich phong van"
                  ? "selected"
                  : ""
              }>
                Lên lịch phỏng vấn
              </option>

              <option value="Da tuyen" ${
                filters.status === "Da tuyen"
                  ? "selected"
                  : ""
              }>
                Đã tuyển
              </option>

              <option value="Tu choi" ${
                filters.status === "Tu choi"
                  ? "selected"
                  : ""
              }>
                Từ chối
              </option>
            </select>

            <button type="submit" class="primary-button">
              Tìm kiếm
            </button>

            <button
              type="button"
              id="clearAdminApplicationFiltersButton"
              class="secondary-button"
            >
              Xóa lọc
            </button>
          </form>
        </div>

        <div class="admin-table-wrapper">
          <table class="admin-table admin-application-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ứng viên</th>
                <th>Tin tuyển dụng</th>
                <th>Trạng thái</th>
                <th>Địa điểm</th>
                <th>Ngày nộp</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              ${
                applications.length
                  ? applications
                      .map(renderAdminApplicationRow)
                      .join("")
                  : `
                    <tr>
                      <td colspan="7">
                        Không có hồ sơ ứng tuyển phù hợp.
                      </td>
                    </tr>
                  `
              }
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `;
}

function closeAdminApplicationModal() {
  document
    .querySelector("#adminApplicationModal")
    ?.remove();
}

function openAdminApplicationDetail(applicationId) {
  const application =
    findAdminApplicationById(applicationId);

  if (!application) {
    showToast(
      "Không tìm thấy hồ sơ ứng tuyển.",
      "error",
    );
    return;
  }

  closeAdminApplicationModal();

  const candidateName =
    application.candidateName ||
    application.candidate_name ||
    "Chưa có tên";

  const candidateEmail =
    application.candidateEmail ||
    application.candidate_email ||
    "Chưa có";

  const jobTitle =
    application.jobTitle ||
    application.job_title ||
    "Không xác định";

  const companyName =
    application.companyName ||
    application.company_name ||
    application.company ||
    "Chưa có";

  const location =
    application.jobLocation ||
    application.job_location ||
    "Chưa cập nhật";

  const createdAt =
    application.createdAt ||
    application.created_at ||
    application.appliedAt ||
    application.applied_at ||
    "";

  const coverLetter =
    application.coverLetter ||
    application.cover_letter ||
    "Ứng viên chưa nhập thư ứng tuyển.";

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div
        id="adminApplicationModal"
        class="admin-modal-backdrop"
      >
        <section class="admin-modal-card">
          <div class="admin-modal-heading">
            <div>
              <h2>${escapeHtml(candidateName)}</h2>
              <span>${escapeHtml(jobTitle)}</span>
            </div>

            <button
              type="button"
              class="admin-modal-close"
              data-close-admin-application-modal
            >
              ×
            </button>
          </div>

          <div class="admin-job-detail-grid">
            <div>
              <small>ID hồ sơ</small>
              <strong>#${Number(application.id)}</strong>
            </div>

            <div>
              <small>Email ứng viên</small>
              <strong>${escapeHtml(candidateEmail)}</strong>
            </div>

            <div>
              <small>Công ty</small>
              <strong>${escapeHtml(companyName)}</strong>
            </div>

            <div>
              <small>Trạng thái</small>
              <strong>${escapeHtml(
                getAdminApplicationStatusLabel(
                  application.status,
                ),
              )}</strong>
            </div>

            <div>
              <small>Địa điểm</small>
              <strong>${escapeHtml(location)}</strong>
            </div>

            <div>
              <small>Ngày nộp</small>
              <strong>${formatAdminDate(createdAt)}</strong>
            </div>
          </div>

          <div class="admin-job-description">
            <h3>Thư ứng tuyển</h3>
            <p>${escapeHtml(coverLetter)}</p>
          </div>

          <div class="modal-actions">
            <button
              type="button"
              class="secondary-button"
              data-close-admin-application-modal
            >
              Đóng
            </button>
          </div>
        </section>
      </div>
    `,
  );

  const modal =
    document.querySelector(
      "#adminApplicationModal",
    );

  modal
    ?.querySelectorAll(
      "[data-close-admin-application-modal]",
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        closeAdminApplicationModal,
      );
    });

  modal?.addEventListener(
    "click",
    (event) => {
      if (event.target === modal) {
        closeAdminApplicationModal();
      }
    },
  );
}

async function changeAdminApplicationStatus(applicationId) {
  const application =
    findAdminApplicationById(applicationId);

  if (!application) {
    showToast(
      "Không tìm thấy hồ sơ ứng tuyển.",
      "error",
    );
    return;
  }

  const nextStatus = window
    .prompt(
      [
        "Nhập một trong các trạng thái sau:",
        "Da nop",
        "Len lich phong van",
        "Da tuyen",
        "Tu choi",
      ].join("\n"),
      application.status || "Da nop",
    )
    ?.trim();

  if (!nextStatus) {
    return;
  }

  const allowedStatuses = [
    "Da nop",
    "Len lich phong van",
    "Da tuyen",
    "Tu choi",
  ];

  if (!allowedStatuses.includes(nextStatus)) {
    showToast(
      "Trạng thái không hợp lệ.",
      "error",
    );
    return;
  }

  try {
    await apiRequest(
      `/applications/${Number(
        applicationId,
      )}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: nextStatus,
        }),
      },
    );

    await showAdminTab("applications");

    showToast(
      "Đã cập nhật trạng thái hồ sơ.",
      "success",
    );
  } catch (error) {
    showToast(
      error.message ||
        "Không thể cập nhật trạng thái hồ sơ.",
      "error",
    );
  }
}
function bindAdminCompanyEvents() {
  document
    .querySelector("#adminCompanyFilterForm")
    ?.addEventListener("submit", async (event) => {
      event.preventDefault();

      appState.adminCompanyFilters = {
        keyword:
          document
            .querySelector("#adminCompanyKeyword")
            ?.value.trim() || "",
        status:
          document
            .querySelector("#adminCompanyStatusFilter")
            ?.value || "",
      };

      await showAdminTab("companies");
    });

  document
    .querySelector("#clearAdminCompanyFiltersButton")
    ?.addEventListener("click", async () => {
      appState.adminCompanyFilters = {
        keyword: "",
        status: "",
      };

      await showAdminTab("companies");
    });

  document
    .querySelector("#refreshAdminCompaniesButton")
    ?.addEventListener("click", async () => {
      await showAdminTab("companies");

      showToast(
        "Đã làm mới danh sách doanh nghiệp.",
        "success",
      );
    });

  document
    .querySelectorAll("[data-admin-view-company]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        openAdminCompanyDetail(
          Number(button.dataset.adminViewCompany),
        );
      });
    });

  document
    .querySelectorAll("[data-admin-company-status]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const companyId = Number(
          button.dataset.adminCompanyStatus,
        );

        const nextStatus =
          button.dataset.nextCompanyStatus;

        await handleAdminCompanyStatusChange(
          companyId,
          nextStatus,
        );
      });
    });
}
function bindAdminApplicationEvents() {
  document
    .querySelector("#adminApplicationFilterForm")
    ?.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();

        appState.adminApplicationFilters = {
          keyword:
            document
              .querySelector(
                "#adminApplicationKeyword",
              )
              ?.value.trim() || "",
          status:
            document
              .querySelector(
                "#adminApplicationStatusFilter",
              )
              ?.value || "",
        };

        await showAdminTab("applications");
      },
    );

  document
    .querySelector(
      "#clearAdminApplicationFiltersButton",
    )
    ?.addEventListener(
      "click",
      async () => {
        appState.adminApplicationFilters = {
          keyword: "",
          status: "",
        };

        await showAdminTab("applications");
      },
    );

  document
    .querySelector(
      "#refreshAdminApplicationsButton",
    )
    ?.addEventListener(
      "click",
      async () => {
        await showAdminTab("applications");
        showToast(
          "Đã làm mới danh sách hồ sơ.",
          "success",
        );
      },
    );

  document
    .querySelectorAll(
      "[data-admin-view-application]",
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          openAdminApplicationDetail(
            Number(
              button.dataset
                .adminViewApplication,
            ),
          );
        },
      );
    });

  document
    .querySelectorAll(
      "[data-admin-change-application-status]",
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        async () => {
          await changeAdminApplicationStatus(
            Number(
              button.dataset
                .adminChangeApplicationStatus,
            ),
          );
        },
      );
    });
}
function getAdminReportStatusLabel(status) {
  const labels = {
    Pending: "Chờ xử lý",
    Resolved: "Đã xử lý",
    Rejected: "Đã từ chối",
  };

  return labels[status] || status || "Chưa xác định";
}

function getAdminReportStatusClass(status) {
  const classes = {
    Pending: "warning",
    Resolved: "success",
    Rejected: "danger",
  };

  return classes[status] || "neutral";
}

function getAdminReportTargetLabel(targetType) {
  const labels = {
    user: "Người dùng",
    job: "Tin tuyển dụng",
    company: "Doanh nghiệp",
  };

  return labels[targetType] || targetType || "Không xác định";
}

function renderAdminReportRow(report) {
  return `
    <tr>
      <td>#${Number(report.id)}</td>

      <td>
        <strong>
          ${escapeHtml(
            report.reporterName || "Ẩn danh",
          )}
        </strong>

        <small>
          ${escapeHtml(
            report.reporterEmail || "",
          )}
        </small>
      </td>

      <td>
        ${escapeHtml(
          getAdminReportTargetLabel(
            report.targetType,
          ),
        )}
      </td>

      <td>
        #${Number(report.targetId)}
      </td>

      <td>
        <strong>
          ${escapeHtml(
            report.reason || "Không có lý do",
          )}
        </strong>
      </td>

      <td>
        <span
          class="admin-status-badge ${getAdminReportStatusClass(
            report.status,
          )}"
        >
          ${escapeHtml(
            getAdminReportStatusLabel(
              report.status,
            ),
          )}
        </span>
      </td>

      <td>
        ${
          report.createdAt
            ? formatAdminDate(report.createdAt)
            : "Chưa có"
        }
      </td>

      <td>
        <button
          type="button"
          class="compact-button secondary-button"
          data-admin-view-report="${Number(
            report.id,
          )}"
        >
          Chi tiết
        </button>
      </td>
    </tr>
  `;
}

function renderAdminReportsContent() {
  const reports =
    appState.adminReports || [];

  const filters =
    appState.adminReportFilters || {
      keyword: "",
      status: "",
      type: "",
    };

  return `
    <section class="admin-dashboard-section admin-reports-section">
      <div class="admin-section-heading">
        <div>
          <h2>Quản lý báo cáo vi phạm</h2>

          <p class="admin-users-description">
            Theo dõi và xử lý các báo cáo vi phạm trong hệ thống.
          </p>
        </div>

        <button
          type="button"
          id="refreshAdminReportsButton"
          class="secondary-button"
        >
          Làm mới
        </button>
      </div>

      <section class="admin-table-card">
        <div class="admin-user-toolbar admin-report-toolbar">
          <form id="adminReportFilterForm">
            <input
              type="search"
              id="adminReportKeyword"
              value="${escapeHtml(
                filters.keyword || "",
              )}"
              placeholder="Tìm người báo cáo, email hoặc lý do"
            />

            <select id="adminReportTypeFilter">
              <option value="">
                Tất cả đối tượng
              </option>

              <option
                value="user"
                ${
                  filters.type === "user"
                    ? "selected"
                    : ""
                }
              >
                Người dùng
              </option>

              <option
                value="job"
                ${
                  filters.type === "job"
                    ? "selected"
                    : ""
                }
              >
                Tin tuyển dụng
              </option>

              <option
                value="company"
                ${
                  filters.type === "company"
                    ? "selected"
                    : ""
                }
              >
                Doanh nghiệp
              </option>
            </select>

            <select id="adminReportStatusFilter">
              <option value="">
                Tất cả trạng thái
              </option>

              <option
                value="Pending"
                ${
                  filters.status === "Pending"
                    ? "selected"
                    : ""
                }
              >
                Chờ xử lý
              </option>

              <option
                value="Resolved"
                ${
                  filters.status === "Resolved"
                    ? "selected"
                    : ""
                }
              >
                Đã xử lý
              </option>

              <option
                value="Rejected"
                ${
                  filters.status === "Rejected"
                    ? "selected"
                    : ""
                }
              >
                Đã từ chối
              </option>
            </select>

            <button
              type="submit"
              class="primary-button"
            >
              Tìm kiếm
            </button>

            <button
              type="button"
              id="clearAdminReportFiltersButton"
              class="secondary-button"
            >
              Xóa lọc
            </button>
          </form>
        </div>

        <div class="admin-table-wrapper">
          <table class="admin-table admin-report-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Người báo cáo</th>
                <th>Đối tượng</th>
                <th>ID đối tượng</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              ${
                reports.length
                  ? reports
                      .map(renderAdminReportRow)
                      .join("")
                  : `
                    <tr>
                      <td colspan="8">
                        Không có báo cáo vi phạm phù hợp.
                      </td>
                    </tr>
                  `
              }
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `;
}

function bindAdminReportEvents() {
  document
    .querySelector("#adminReportFilterForm")
    ?.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();

        appState.adminReportFilters = {
          keyword:
            document
              .querySelector(
                "#adminReportKeyword",
              )
              ?.value.trim() || "",

          type:
            document
              .querySelector(
                "#adminReportTypeFilter",
              )
              ?.value || "",

          status:
            document
              .querySelector(
                "#adminReportStatusFilter",
              )
              ?.value || "",
        };

        await showAdminTab("reports");
      },
    );

  document
    .querySelector(
      "#clearAdminReportFiltersButton",
    )
    ?.addEventListener(
      "click",
      async () => {
        appState.adminReportFilters = {
          keyword: "",
          type: "",
          status: "",
        };

        await showAdminTab("reports");
      },
    );

  document
    .querySelector(
      "#refreshAdminReportsButton",
    )
    ?.addEventListener(
      "click",
      async () => {
        await showAdminTab("reports");

        showToast(
          "Đã làm mới danh sách báo cáo.",
          "success",
        );
      },
    );

  document
    .querySelectorAll(
      "[data-admin-view-report]",
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          openAdminReportDetail(
            Number(
              button.dataset.adminViewReport,
            ),
          );
        },
      );
    });
}

function findAdminReportById(reportId) {
  return (appState.adminReports || []).find(
    (report) =>
      Number(report.id) === Number(reportId),
  );
}

function closeAdminReportModal() {
  document
    .querySelector("#adminReportModal")
    ?.remove();
}

function openAdminReportDetail(reportId) {
  const report = findAdminReportById(reportId);

  if (!report) {
    showToast(
      "Không tìm thấy báo cáo vi phạm.",
      "error",
    );
    return;
  }

  closeAdminReportModal();

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div
        id="adminReportModal"
        class="admin-modal-backdrop"
      >
        <section class="admin-modal-card">
          <div class="admin-modal-heading">
            <div>
              <h2>Báo cáo #${Number(report.id)}</h2>
              <span>${escapeHtml(
                getAdminReportStatusLabel(
                  report.status,
                ),
              )}</span>
            </div>

            <button
              type="button"
              class="admin-modal-close"
              data-close-admin-report-modal
            >
              ×
            </button>
          </div>

          <div class="admin-job-detail-grid">
            <div>
              <small>Người báo cáo</small>
              <strong>${escapeHtml(
                report.reporterName || "Ẩn danh",
              )}</strong>
            </div>

            <div>
              <small>Email</small>
              <strong>${escapeHtml(
                report.reporterEmail || "Chưa có",
              )}</strong>
            </div>

            <div>
              <small>Đối tượng</small>
              <strong>${escapeHtml(
                getAdminReportTargetLabel(
                  report.targetType,
                ),
              )} #${Number(report.targetId)}</strong>
            </div>

            <div>
              <small>Trạng thái</small>
              <strong>${escapeHtml(
                getAdminReportStatusLabel(
                  report.status,
                ),
              )}</strong>
            </div>

            <div>
              <small>Ngày tạo</small>
              <strong>${
                report.createdAt
                  ? formatAdminDate(report.createdAt)
                  : "Chưa có"
              }</strong>
            </div>

            <div>
              <small>Ngày xử lý</small>
              <strong>${
                report.resolvedAt
                  ? formatAdminDate(report.resolvedAt)
                  : "Chưa xử lý"
              }</strong>
            </div>
          </div>

          <div class="admin-job-description">
            <h3>${escapeHtml(
              report.reason || "Không có lý do",
            )}</h3>
            <p>${escapeHtml(
              report.description ||
                "Không có mô tả bổ sung.",
            )}</p>
          </div>

          <div class="modal-actions">
            <button
              type="button"
              class="secondary-button"
              data-close-admin-report-modal
            >
              Đóng
            </button>
          </div>
        </section>
      </div>
    `,
  );

  const modal = document.querySelector(
    "#adminReportModal",
  );

  modal
    ?.querySelectorAll(
      "[data-close-admin-report-modal]",
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        closeAdminReportModal,
      );
    });

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeAdminReportModal();
    }
  });
}
function getAdminLogActionLabel(action) {
  const labels = {
  LOGIN: "Đăng nhập",
  LOGOUT: "Đăng xuất",

  LOCK_USER:
    "Khóa tài khoản",

  UNLOCK_USER:
    "Mở khóa tài khoản",

  UPDATE_ROLE:
    "Đổi vai trò",

  DELETE_USER:
    "Xóa người dùng",

  APPROVE_JOB:
    "Duyệt tin",

  REJECT_JOB:
    "Từ chối tin",

  CLOSE_JOB:
    "Đóng tin",

  UPDATE_APPLICATION:
    "Cập nhật hồ sơ",

  RESOLVE_REPORT:
    "Xử lý báo cáo",

  REJECT_REPORT:
    "Từ chối báo cáo",

    UPDATE_SETTINGS:
  "Cập nhật cấu hình",
};

  return (
    labels[action] ||
    action ||
    "Không xác định"
  );
}

function renderAdminLogRow(log) {
  return `
    <tr>
      <td>#${Number(log.id)}</td>

      <td>
        <strong>
          ${escapeHtml(
            log.adminName ||
              "Không xác định",
          )}
        </strong>

        <small>
          ${escapeHtml(
            log.adminEmail || "",
          )}
        </small>
      </td>

      <td>
        <span class="admin-log-action-badge">
          ${escapeHtml(
            getAdminLogActionLabel(
              log.action,
            ),
          )}
        </span>
      </td>

      <td>
        ${escapeHtml(
          log.targetType ||
            "Không có",
        )}
      </td>

      <td>
        ${
          log.targetId
            ? `#${Number(log.targetId)}`
            : "Không có"
        }
      </td>

      <td>
        ${escapeHtml(
          log.description ||
            "Không có mô tả",
        )}
      </td>

      <td>
        ${
          log.createdAt
            ? formatAdminDate(
                log.createdAt,
              )
            : "Chưa có"
        }
      </td>
    </tr>
  `;
}

function renderAdminLogsContent() {
  const logs =
    appState.adminLogs || [];

  const filters =
    appState.adminLogFilters || {
      keyword: "",
      action: "",
    };

  return `
    <section class="admin-dashboard-section admin-logs-section">
      <div class="admin-section-heading">
        <div>
          <h2>Nhật ký Admin</h2>

          <p class="admin-users-description">
            Theo dõi các thao tác quản trị đã thực hiện trong hệ thống.
          </p>
        </div>

        <button
          type="button"
          id="refreshAdminLogsButton"
          class="secondary-button"
        >
          Làm mới
        </button>
      </div>

      <section class="admin-table-card">
        <div class="admin-user-toolbar admin-log-toolbar">
          <form id="adminLogFilterForm">
            <input
              type="search"
              id="adminLogKeyword"
              value="${escapeHtml(
                filters.keyword || "",
              )}"
              placeholder="Tìm quản trị viên, mô tả hoặc đối tượng"
            />

            <select id="adminLogActionFilter">
              <option value="">
                Tất cả hành động
              </option>

              <option
                value="LOGIN"
                ${
                  filters.action === "LOGIN"
                    ? "selected"
                    : ""
                }
              >
                Đăng nhập
              </option>

              <option
                value="LOGOUT"
                ${
                  filters.action === "LOGOUT"
                    ? "selected"
                    : ""
                }
              >
                Đăng xuất
              </option>

              <option
                value="LOCK_USER"
                ${
                  filters.action ===
                  "LOCK_USER"
                    ? "selected"
                    : ""
                }
              >
                Khóa tài khoản
              </option>

              <option
                value="UNLOCK_USER"
                ${
                  filters.action ===
                  "UNLOCK_USER"
                    ? "selected"
                    : ""
                }
              >
                Mở khóa tài khoản
              </option>

              <option
                value="UPDATE_JOB"
                ${
                  filters.action ===
                  "UPDATE_JOB"
                    ? "selected"
                    : ""
                }
              >
                Cập nhật tin
              </option>

              <option
                value="RESOLVE_REPORT"
                ${
                  filters.action ===
                  "RESOLVE_REPORT"
                    ? "selected"
                    : ""
                }
              >
                Xử lý báo cáo
              </option>
            </select>

            <button
              type="submit"
              class="primary-button"
            >
              Tìm kiếm
            </button>

            <button
              type="button"
              id="clearAdminLogFiltersButton"
              class="secondary-button"
            >
              Xóa lọc
            </button>
          </form>
        </div>

        <div class="admin-table-wrapper">
          <table class="admin-table admin-log-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Quản trị viên</th>
                <th>Hành động</th>
                <th>Đối tượng</th>
                <th>ID đối tượng</th>
                <th>Mô tả</th>
                <th>Thời gian</th>
              </tr>
            </thead>

            <tbody>
              ${
                logs.length
                  ? logs
                      .map(renderAdminLogRow)
                      .join("")
                  : `
                    <tr>
                      <td colspan="7">
                        Không có nhật ký phù hợp.
                      </td>
                    </tr>
                  `
              }
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `;
}

function bindAdminLogEvents() {
  document
    .querySelector("#adminLogFilterForm")
    ?.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();

        appState.adminLogFilters = {
          keyword:
            document
              .querySelector(
                "#adminLogKeyword",
              )
              ?.value.trim() || "",

          action:
            document
              .querySelector(
                "#adminLogActionFilter",
              )
              ?.value || "",
        };

        await showAdminTab("logs");
      },
    );

  document
    .querySelector(
      "#clearAdminLogFiltersButton",
    )
    ?.addEventListener(
      "click",
      async () => {
        appState.adminLogFilters = {
          keyword: "",
          action: "",
        };

        await showAdminTab("logs");
      },
    );

  document
    .querySelector(
      "#refreshAdminLogsButton",
    )
    ?.addEventListener(
      "click",
      async () => {
        await showAdminTab("logs");

        showToast(
          "Đã làm mới nhật ký Admin.",
          "success",
        );
      },
    );
}
function formatAdminSettingUpdateTime(value) {
  if (!value) {
    return "Chưa có lần cập nhật";
  }

  const normalizedValue =
    String(value).includes("T")
      ? value
      : `${value.replace(" ", "T")}Z`;

  const date =
    new Date(normalizedValue);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "vi-VN",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  );
}
function renderAdminSettingsContent() {
  const settings =
    appState.adminSettings || {};

  const isTrue = (value) =>
    String(value) === "true";

  const updatedByText =
    settings.updatedByName
      ? `${settings.updatedByName}${
          settings.updatedByEmail
            ? ` (${settings.updatedByEmail})`
            : ""
        }`
      : "Chưa xác định";

  const updatedAtText =
    formatAdminSettingUpdateTime(
      settings.updatedAt,
    );

  return `
    <section class="admin-dashboard-section admin-settings-section">
      <div class="admin-section-heading">
        <div>
          <h2>Cấu hình hệ thống</h2>

          <p class="admin-users-description">
            Quản lý các thiết lập chung của hệ thống JobBridge.
          </p>
        
      
<div class="admin-settings-update-info">
  <span>
    <strong>Cập nhật lần cuối:</strong>
    ${escapeHtml(updatedAtText)}
  </span>

  <span>
    <strong>Người cập nhật:</strong>
    ${escapeHtml(updatedByText)}
  </span>
</div>
</div>
</div>
      <section class="admin-settings-card">
        <form id="adminSettingsForm">
          <div class="admin-settings-grid">
            <label>
              Tên hệ thống

              <input
                type="text"
                id="adminSettingSiteName"
                value="${escapeHtml(
                  settings.site_name ||
                    "JobBridge",
                )}"
              />
            </label>

            <label>
              Email hỗ trợ

              <input
                type="email"
                id="adminSettingSupportEmail"
                value="${escapeHtml(
                  settings.support_email || "",
                )}"
                placeholder="support@jobbridge.vn"
              />
            </label>

            <label>
              Số ngày lưu nhật ký

              <input
                type="number"
                id="adminSettingLogRetention"
                min="1"
                max="3650"
                value="${escapeHtml(
                  settings.log_retention_days ||
                    "90",
                )}"
              />
            </label>
          </div>

          <div class="admin-settings-options">
            <label class="admin-setting-toggle">
              <input
                type="checkbox"
                id="adminSettingAllowRegistration"
                ${
                  isTrue(
                    settings.allow_registration,
                  )
                    ? "checked"
                    : ""
                }
              />

              <span>
                <strong>
                  Cho phép đăng ký tài khoản
                </strong>

                <small>
                  Người dùng mới có thể tạo tài khoản.
                </small>
              </span>
            </label>

            <label class="admin-setting-toggle">
              <input
                type="checkbox"
                id="adminSettingAllowJobPosting"
                ${
                  isTrue(
                    settings.allow_job_posting,
                  )
                    ? "checked"
                    : ""
                }
              />

              <span>
                <strong>
                  Cho phép đăng tin tuyển dụng
                </strong>

                <small>
                  Nhà tuyển dụng có thể tạo tin mới.
                </small>
              </span>
            </label>

            <label class="admin-setting-toggle">
              <input
                type="checkbox"
                id="adminSettingRequireApproval"
                ${
                  isTrue(
                    settings.require_job_approval,
                  )
                    ? "checked"
                    : ""
                }
              />

              <span>
                <strong>
                  Yêu cầu Admin duyệt tin
                </strong>

                <small>
                  Tin mới phải được duyệt trước khi hiển thị.
                </small>
              </span>
            </label>

            <label class="admin-setting-toggle danger">
              <input
                type="checkbox"
                id="adminSettingMaintenanceMode"
                ${
                  isTrue(
                    settings.maintenance_mode,
                  )
                    ? "checked"
                    : ""
                }
              />

              <span>
                <strong>
                  Chế độ bảo trì
                </strong>

                <small>
                  Tạm hạn chế truy cập hệ thống.
                </small>
              </span>
            </label>
          </div>

          <div class="admin-settings-actions">
            <button
              type="submit"
              class="primary-button"
            >
              Lưu cấu hình
            </button>

            <button
              type="button"
              id="reloadAdminSettingsButton"
              class="secondary-button"
            >
              Tải lại
            </button>
          </div>
        </form>
      </section>
    </section>
  `;
}
function bindAdminSettingsEvents() {
  document
    .querySelector("#adminSettingsForm")
    ?.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();

        const form = event.currentTarget;

        const submitButton =
          form.querySelector(
            'button[type="submit"]',
          );

        const originalButtonText =
          submitButton?.textContent ||
          "Lưu cấu hình";

        const siteName =
          document
            .querySelector(
              "#adminSettingSiteName",
            )
            ?.value.trim() || "";

        const supportEmail =
          document
            .querySelector(
              "#adminSettingSupportEmail",
            )
            ?.value.trim() || "";

        const retentionDays =
          Number(
            document
              .querySelector(
                "#adminSettingLogRetention",
              )
              ?.value || 90,
          );

        if (!siteName) {
          showToast(
            "Tên hệ thống không được để trống.",
            "error",
          );
          return;
        }

        if (
          !Number.isInteger(retentionDays) ||
          retentionDays < 1 ||
          retentionDays > 3650
        ) {
          showToast(
            "Số ngày lưu nhật ký phải từ 1 đến 3650.",
            "error",
          );
          return;
        }

        const payload = {
          site_name: siteName,

          support_email:
            supportEmail,

          allow_registration:
            document
              .querySelector(
                "#adminSettingAllowRegistration",
              )
              ?.checked
              ? "true"
              : "false",

          allow_job_posting:
            document
              .querySelector(
                "#adminSettingAllowJobPosting",
              )
              ?.checked
              ? "true"
              : "false",

          require_job_approval:
            document
              .querySelector(
                "#adminSettingRequireApproval",
              )
              ?.checked
              ? "true"
              : "false",

          log_retention_days:
            String(retentionDays),

          maintenance_mode:
            document
              .querySelector(
                "#adminSettingMaintenanceMode",
              )
              ?.checked
              ? "true"
              : "false",
        };

        try {
          if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent =
              "Đang lưu...";
          }

          const result =
            await apiRequest(
              "/admin/settings",
              {
                method: "PUT",
                body:
                  JSON.stringify(payload),
              },
            );

          appState.adminSettings = {
            ...appState.adminSettings,
            ...(result.settings || payload),

            updatedAt:
              result.meta?.updatedAt || "",

            updatedByName:
              result.meta?.updatedByName || "",

            updatedByEmail:
              result.meta?.updatedByEmail || "",
          };

          adminContent.innerHTML =
            renderAdminSettingsContent();

          bindAdminSettingsEvents();

          showToast(
            result.message ||
              "Đã cập nhật cấu hình hệ thống.",
            "success",
          );
        } catch (error) {
          console.error(
            "Lỗi lưu cấu hình:",
            error,
          );

          showToast(
            error.message ||
              "Lỗi máy chủ khi lưu cấu hình.",
            "error",
          );
        } finally {
          const currentSubmitButton =
            document.querySelector(
              '#adminSettingsForm button[type="submit"]',
            );

          if (currentSubmitButton) {
            currentSubmitButton.disabled =
              false;

            currentSubmitButton.textContent =
              originalButtonText;
          }
        }
      },
    );

  document
    .querySelector(
      "#reloadAdminSettingsButton",
    )
    ?.addEventListener(
      "click",
      async () => {
        await showAdminTab("settings");
      },
    );
}

async function showAdminTab(tab) {
  appState.adminTab = tab;

  document
    .querySelectorAll("[data-admin-tab]")
    .forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.adminTab === tab,
      );
    });

  const adminContent = document.querySelector("#adminContent");
  const pageTitle = document.querySelector("#adminPageTitle");

  if (!adminContent) return;

  if (tab === "dashboard") {
    if (pageTitle) pageTitle.textContent = "Dashboard Admin";
    try {
      await loadAdminDashboard();
      adminContent.innerHTML = renderAdminDashboardContent();
      bindAdminDashboardEvents();
    } catch (error) {
      adminContent.innerHTML = `
      
        <section class="admin-empty-state">${escapeHtml(error.message)}</section>
      `;
    }
    return;
  }

  if (tab === "users") {
    if (pageTitle) pageTitle.textContent = "Quản lý người dùng";
    adminContent.innerHTML = `
      <section class="admin-empty-state">Đang tải danh sách người dùng...</section>
    `;

    try {
      await loadAdminUsers();
      adminContent.innerHTML = renderAdminUsersContent();
      bindAdminUserEvents();
    } catch (error) {
      adminContent.innerHTML = `
        <section class="admin-empty-state">${escapeHtml(error.message)}</section>
      `;
    }
    return;
  }

  if (tab === "jobs") {
  pageTitle.textContent =
    "Quản lý tin tuyển dụng";

  try {
    await loadAdminJobs();

    adminContent.innerHTML =
      renderAdminJobsContent();

    bindAdminJobEvents();
  } catch (error) {
    adminContent.innerHTML = `
      <section class="admin-job-error">
        ${escapeHtml(
          error.message ||
            "Không thể tải danh sách tin tuyển dụng.",
        )}
      </section>
    `;
  }

  return;
}

/* CHỨC NĂNG 4: DOANH NGHIỆP */
if (tab === "companies") {
  pageTitle.textContent = "Quản lý doanh nghiệp";

  adminContent.innerHTML = `
    <section class="admin-company-loading">
      Đang tải danh sách doanh nghiệp...
    </section>
  `;

 try {
    await loadAdminCompanies();

    adminContent.innerHTML =
      renderAdminCompaniesContent();

    bindAdminCompanyEvents();
  } catch (error) {
    console.error(
      "Lỗi tải doanh nghiệp:",
      error,
    );

    adminContent.innerHTML = `
      <section class="admin-company-error">
        ${escapeHtml(
          error.message ||
            "Không thể tải danh sách doanh nghiệp.",
        )}
      </section>
    `;
  }

  return;
}

/* CHỨC NĂNG 5: HỒ SƠ ỨNG TUYỂN */
if (tab === "applications") {
  pageTitle.textContent =
    "Quản lý hồ sơ ứng tuyển";

  adminContent.innerHTML = `
    <section class="admin-application-loading">
      Đang tải danh sách hồ sơ ứng tuyển...
    </section>
  `;

  try {
    await loadAdminApplications();

    adminContent.innerHTML =
      renderAdminApplicationsContent();

    bindAdminApplicationEvents();
  } catch (error) {
    console.error(
      "Lỗi tải hồ sơ ứng tuyển:",
      error,
    );

    adminContent.innerHTML = `
      <section class="admin-application-error">
        ${escapeHtml(
          error.message ||
            "Không thể tải danh sách hồ sơ ứng tuyển.",
        )}
      </section>
    `;
  }

  return;
}
if (tab === "reports") {
  if (pageTitle) {
    pageTitle.textContent =
      "Quản lý báo cáo vi phạm";
  }

  adminContent.innerHTML = `
    <section class="admin-empty-state">
      Đang tải danh sách báo cáo...
    </section>
  `;

  try {
    await loadAdminReports();

    adminContent.innerHTML =
      renderAdminReportsContent();

    bindAdminReportEvents();
  } catch (error) {
    console.error(
      "Lỗi tải báo cáo vi phạm:",
      error,
    );

    adminContent.innerHTML = `
      <section class="admin-empty-state">
        ${escapeHtml(
          error.message ||
            "Không thể tải danh sách báo cáo.",
        )}
      </section>
    `;
  }

  return;
}

/* CHỨC NĂNG 8: NHẬT KÝ ADMIN */
if (tab === "logs") {
  if (pageTitle) {
    pageTitle.textContent = "Nhật ký Admin";
  }

  adminContent.innerHTML = `
    <section class="admin-empty-state">
      Đang tải nhật ký Admin...
    </section>
  `;

  try {
    await loadAdminLogs();

    adminContent.innerHTML =
      renderAdminLogsContent();

    bindAdminLogEvents();
  } catch (error) {
    console.error(
      "Lỗi tải nhật ký Admin:",
      error,
    );

    adminContent.innerHTML = `
      <section class="admin-empty-state">
        ${escapeHtml(
          error.message ||
            "Không thể tải nhật ký Admin.",
        )}
      </section>
    `;
  }

  return;
}

adminContent.innerHTML = `
  <section class="admin-empty-state">
    Chức năng này đang được phát triển.
  </section>
`;
if (tab === "settings") {
  pageTitle.textContent =
    "Cấu hình hệ thống";

  adminContent.innerHTML = `
    <section class="admin-empty-state">
      Đang tải cấu hình hệ thống...
    </section>
  `;

  try {
    await loadAdminSettings();

    adminContent.innerHTML =
      renderAdminSettingsContent();

    bindAdminSettingsEvents();
  } catch (error) {
    console.error(
      "Lỗi tải cấu hình:",
      error,
    );

    adminContent.innerHTML = `
      <section class="admin-empty-state">
        ${escapeHtml(
          error.message ||
            "Không thể tải cấu hình hệ thống.",
        )}
      </section>
    `;
  }

  return;
}
}
async function loadAdminSettings() {
  const result = await apiRequest(
    "/admin/settings",
  );

  appState.adminSettings = {
    ...appState.adminSettings,
    ...(result.settings || {}),

    updatedAt:
      result.meta?.updatedAt || "",

    updatedByName:
      result.meta?.updatedByName || "",

    updatedByEmail:
      result.meta?.updatedByEmail || "",
  };

  return result;
}

function bindAdminNavigationEvents() {
  document
    .querySelectorAll("[data-admin-tab]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        showAdminTab(
          button.dataset.adminTab,
        );
      });
    });
}

function bindAdminDashboardEvents() {
  document
    .querySelector("#refreshAdminDashboardButton")
    ?.addEventListener("click", async () => {
      try {
        await loadAdminDashboard();
        const adminContent = document.querySelector("#adminContent");
        if (adminContent) {
          adminContent.innerHTML = renderAdminDashboardContent();
        }
        bindAdminDashboardEvents();
        showToast("Đã cập nhật Dashboard.", "success");
      } catch (error) {
        showToast(error.message, "error");
      }
    });
}

function bindAdminUserEvents() {
  document
    .querySelector("#adminUserFilterForm")
    ?.addEventListener("submit", async (event) => {
      event.preventDefault();

      appState.adminUserFilters.keyword =
        document.querySelector("#adminUserKeyword")?.value.trim() || "";
      appState.adminUserFilters.role =
        document.querySelector("#adminUserRoleFilter")?.value || "";
      appState.adminUserFilters.status =
        document.querySelector("#adminUserStatusFilter")?.value || "";

      await showAdminTab("users");
    });

  document
    .querySelector("#clearAdminUserFiltersButton")
    ?.addEventListener("click", async () => {
      appState.adminUserFilters = {
        keyword: "",
        role: "",
        status: "",
      };
      await showAdminTab("users");
    });

  document
    .querySelector("#refreshAdminUsersButton")
    ?.addEventListener("click", async () => {
      await showAdminTab("users");
      showToast("Đã cập nhật danh sách người dùng.", "success");
    });

  document
    .querySelectorAll("[data-admin-toggle-user]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const userId = Number(button.dataset.adminToggleUser);
        const nextStatus = button.dataset.nextStatus;
        let reason = "";

        if (nextStatus === "Locked") {
          reason = window.prompt("Nhập lý do khóa tài khoản:")?.trim();
          if (!reason) return;
        }

        try {
          const result = await apiRequest(
            `/admin/users/${userId}/status`,
            {
              method: "PATCH",
              body: JSON.stringify({ status: nextStatus, reason }),
            },
          );
          await showAdminTab("users");
          showToast(result.message, "success");
        } catch (error) {
          showToast(error.message, "error");
        }
      });
    });

  document
    .querySelectorAll("[data-admin-change-role]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const userId = Number(button.dataset.adminChangeRole);
        const currentRole = button.dataset.currentRole;
        const nextRole = window
          .prompt(
            "Nhập vai trò mới: candidate, employer hoặc admin",
            currentRole,
          )
          ?.trim()
          .toLowerCase();

        if (
          !nextRole ||
          !["candidate", "employer", "admin"].includes(nextRole)
        ) {
          if (nextRole) showToast("Vai trò không hợp lệ.", "error");
          return;
        }

        try {
          const result = await apiRequest(
            `/admin/users/${userId}/role`,
            {
              method: "PATCH",
              body: JSON.stringify({ role: nextRole }),
            },
          );
          await showAdminTab("users");
          showToast(result.message, "success");
        } catch (error) {
          showToast(error.message, "error");
        }
      });
    });

  document
    .querySelectorAll("[data-admin-delete-user]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const userId = Number(button.dataset.adminDeleteUser);
        const confirmed = window.confirm(
          "Bạn chắc chắn muốn xóa tài khoản này? Thao tác không thể hoàn tác.",
        );
        if (!confirmed) return;

        try {
          const result = await apiRequest(
            `/admin/users/${userId}`,
            { method: "DELETE" },
          );
          await showAdminTab("users");
          showToast(result.message, "success");
        } catch (error) {
          showToast(error.message, "error");
        }
      });
    });
}

function bindAdminJobEvents() {
  document
    .querySelector("#adminJobFilterForm")
    ?.addEventListener("submit", async (event) => {
      event.preventDefault();

      appState.adminJobFilters.keyword =
        document.querySelector("#adminJobKeyword")?.value.trim() || "";
      appState.adminJobFilters.status =
        document.querySelector("#adminJobStatusFilter")?.value || "";

      await showAdminTab("jobs");
    });

  document
    .querySelector("#clearAdminJobFiltersButton")
    ?.addEventListener("click", async () => {
      appState.adminJobFilters = {
        keyword: "",
        status: "",
      };
      await showAdminTab("jobs");
    });

  document
    .querySelector("#refreshAdminJobsButton")
    ?.addEventListener("click", async () => {
      await showAdminTab("jobs");
      showToast("Đã cập nhật danh sách tin tuyển dụng.", "success");
    });

  document
    .querySelectorAll("[data-admin-view-job]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        openAdminJobDetail(Number(button.dataset.adminViewJob));
      });
    });

  document
    .querySelectorAll("[data-admin-job-status]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const jobId = Number(button.dataset.adminJobStatus);
        const nextStatus = button.dataset.nextJobStatus;
        const label = getAdminJobStatusLabel(nextStatus);

        if (
          !window.confirm(
            `Bạn chắc chắn muốn chuyển tin này sang trạng thái "${label}"?`,
          )
        ) {
          return;
        }

        try {
          await apiRequest(`/jobs/${jobId}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status: nextStatus }),
          });
          await showAdminTab("jobs");
          showToast(`Đã cập nhật trạng thái: ${label}.`, "success");
        } catch (error) {
          showToast(error.message, "error");
        }
      });
    });

  document
    .querySelectorAll("[data-admin-delete-job]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const jobId = Number(button.dataset.adminDeleteJob);

        if (
          !window.confirm(
            "Bạn chắc chắn muốn xóa tin tuyển dụng này? Thao tác không thể hoàn tác.",
          )
        ) {
          return;
        }

        try {
          const result = await apiRequest(
            `/jobs/${jobId}`,
            { method: "DELETE" },
          );
          await showAdminTab("jobs");
          showToast(
            result.message || "Đã xóa tin tuyển dụng.",
            "success",
          );
        } catch (error) {
          showToast(error.message, "error");
        }
      });
    });
}

function openAdminJobDetail(jobId) {
  const job = appState.adminJobs.find(
    (item) => Number(item.id) === Number(jobId),
  );

  if (!job) {
    showToast("Không tìm thấy thông tin tin tuyển dụng.", "error");
    return;
  }

  document.querySelector("#adminJobDetailModal")?.remove();

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div id="adminJobDetailModal" class="admin-modal-backdrop">
        <section class="admin-modal-card">
          <div class="admin-modal-heading">
            <div>
              <p class="eyebrow">Chi tiết tin tuyển dụng</p>
              <h2>${escapeHtml(job.title)}</h2>
              <span>${escapeHtml(job.company)}</span>
            </div>

            <button
              type="button"
              data-close-admin-job-modal
              class="admin-modal-close"
            >
              ×
            </button>
          </div>

          <div class="admin-job-detail-grid">
            <div>
              <small>Trạng thái</small>
              <strong>${escapeHtml(getAdminJobStatusLabel(job.status))}</strong>
            </div>
            <div>
              <small>Địa điểm</small>
              <strong>${escapeHtml(job.location || "")}</strong>
            </div>
            <div>
              <small>Mức lương</small>
              <strong>${escapeHtml(job.salary || "")}</strong>
            </div>
            <div>
              <small>Loại công việc</small>
              <strong>${escapeHtml(job.type || "")}</strong>
            </div>
            <div>
              <small>Kinh nghiệm</small>
              <strong>${escapeHtml(job.experience || "")}</strong>
            </div>
            <div>
              <small>Danh mục</small>
              <strong>${escapeHtml(job.category || "")}</strong>
            </div>
          </div>

          <div class="admin-job-description">
            <h3>Mô tả công việc</h3>
            <p>${escapeHtml(job.description || "")}</p>
          </div>
        </section>
      </div>
    `,
  );

  const modal = document.querySelector("#adminJobDetailModal");

  modal
    ?.querySelector("[data-close-admin-job-modal]")
    ?.addEventListener("click", () => modal.remove());

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) modal.remove();
  });
}

function updateJobStatus(jobId, status) {
  appState.jobs = appState.jobs.map((job) =>
    job.id === jobId ? normalizeJob({ ...job, status, updatedAt: new Date().toISOString() }) : job,
  );
  writeStorage(STORAGE_KEYS.jobs, appState.jobs);
  renderAdminView();
}

function showInlineMessage(selector, text, type) {
  const message = document.querySelector(selector);
  message.textContent = text;
  message.className = `auth-message active ${type}`;
}

function showToast(message, type = "success") {
  let toastHost = document.querySelector("#toastHost");
  if (!toastHost) {
    toastHost = document.createElement("div");
    toastHost.id = "toastHost";
    toastHost.className = "toast-host";
    document.body.append(toastHost);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastHost.append(toast);

  window.setTimeout(() => {
    toast.classList.add("leaving");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 2200);
}

function getRoleLabel(role) {
  const labels = {
    candidate: "Ung vien",
    employer: "Nha tuyen dung",
    admin: "Quan tri vien",
  };
  return labels[role] || role;
}

function startRealtimeUpdates() {
  stopRealtimeUpdates();
  refreshRealtimeLabels();
  realtimeUpdateTimer = window.setInterval(refreshRealtimeLabels, 30000);
}

function stopRealtimeUpdates() {
  if (!realtimeUpdateTimer) return;
  window.clearInterval(realtimeUpdateTimer);
  realtimeUpdateTimer = null;
}

function refreshRealtimeLabels() {
  document.querySelectorAll("[data-live-updated-at]").forEach((item) => {
    item.textContent = formatLiveUpdateTime(new Date());
  });
  document.querySelectorAll("[data-job-relative-time]").forEach((item) => {
    item.textContent = `Cập nhật ${formatRelativeTime(item.dataset.jobRelativeTime)}`;
  });
}

function formatLiveUpdateTime(date) {
  return `[Update ${date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}]`;
}

function formatNumber(value) {
  return Number(value).toLocaleString("vi-VN");
}

function getJobTimestamp(job) {
  const timestamp = Date.parse(job.updatedAt || job.createdAt || "");
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatRelativeTime(dateString) {
  const timestamp = Date.parse(dateString);
  if (Number.isNaN(timestamp)) return formatDate(toDateInput(new Date()));
  return formatDate(dateString);
}

function toDateInput(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getInitials(value) {
  return value
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatCandidateAccountId(user) {
  return String(92413230 + (Number(user.id) || 0));
}

function renderAccountIcon(name) {
  const icons = {
    bell: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M18 9.8c0-3.3-2.3-5.8-6-5.8s-6 2.5-6 5.8c0 4-1.6 5.4-2.2 6.2h16.4c-.6-.8-2.2-2.2-2.2-6.2Z" />
        <path d="M9.8 19a2.3 2.3 0 0 0 4.4 0" />
      </svg>
    `,
    chat: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M5 17.2a7.2 7.2 0 1 1 3.1 2.4L4 20.4l1-3.2Z" />
        <path d="M8.5 11.5h.1M12 11.5h.1M15.5 11.5h.1" />
      </svg>
    `,
    jobs: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M8 7V5.8C8 4.8 8.8 4 9.8 4h4.4c1 0 1.8.8 1.8 1.8V7" />
        <path d="M4.5 9.2h15v9.3h-15z" />
        <path d="M4.5 12.2h15M10 14h4" />
      </svg>
    `,
    cv: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M7 3.8h7l3 3v13.4H7z" />
        <path d="M14 3.8v3h3" />
        <path d="M9 14.5c.4.6.9.9 1.6.9.8 0 1.4-.5 1.4-1.2s-.5-1.1-1.4-1.1H10" />
        <path d="M13.4 12.4l1.1 3 1.1-3" />
      </svg>
    `,
    mail: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M5 5.8h12.5v10H5z" />
        <path d="m5 7 6.2 4.4L17.5 7" />
        <path d="M16.5 17.8a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" />
        <path d="M16.5 12.5v1.1M16.5 17.6v1.1M13.9 15.1h1.1M18 15.1h1.1" />
      </svg>
    `,
    security: `
      <svg viewBox="0 0 24 24" focusable="false">
        <circle cx="12" cy="7.5" r="3.2" />
        <path d="M5.5 20c.5-3.7 3-6 6.5-6s6 2.3 6.5 6" />
      </svg>
    `,
    upgrade: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M6.4 3.8h11.2c.8 0 1.4.6 1.4 1.4v13.6c0 .8-.6 1.4-1.4 1.4H6.4c-.8 0-1.4-.6-1.4-1.4V5.2c0-.8.6-1.4 1.4-1.4Z" />
        <circle cx="12" cy="10" r="2.6" />
        <path d="M8.8 16.8c.5-1.4 1.6-2.2 3.2-2.2s2.7.8 3.2 2.2" />
      </svg>
    `,
    chevronUp: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="m6 15 6-6 6 6" />
      </svg>
    `,
    chevronDown: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="m6 9 6 6 6-6" />
      </svg>
    `,
    logout: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M10 6H6v12h4" />
        <path d="M13 8.5 16.5 12 13 15.5" />
        <path d="M8.5 12h8" />
      </svg>
    `,
  };

  return `<span class="account-icon account-icon-${escapeHtml(name)}" aria-hidden="true">${icons[name] || ""}</span>`;
}

function renderUserAvatar(variant = "") {
  const variantClass = variant ? ` user-avatar-${variant}` : "";
  return `
    <span class="user-avatar${variantClass}" aria-hidden="true">
      <svg viewBox="0 0 32 32" focusable="false">
        <circle cx="16" cy="10.5" r="5" />
        <path d="M7.5 26c0-5.2 3.8-9 8.5-9s8.5 3.8 8.5 9" />
      </svg>
      <span class="user-avatar-status"></span>
    </span>
  `;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char];
  });
}


