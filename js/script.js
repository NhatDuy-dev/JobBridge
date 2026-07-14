const STORAGE_KEYS = {
  users: "jobbridge_spa_users",
  jobs: "jobbridge_spa_jobs",
  applications: "jobbridge_spa_applications",
  cvs: "jobbridge_spa_cvs",
  reports: "jobbridge_spa_job_reports",
  session: "jobbridge_spa_session",
};

const CV_FILE_DATABASE = "jobbridge_cv_files";
const CV_FILE_STORE = "cvFiles";
const MAX_CV_FILE_SIZE = 5 * 1024 * 1024;

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
    cvId: 501,
    cvName: "CV Frontend Developer",
    coverLetter: "Tôi mong muốn được ứng tuyển vị trí Frontend Developer và đóng góp kinh nghiệm xây dựng giao diện web.",
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
    cvId: 501,
    cvName: "CV Frontend Developer",
    coverLetter: "Tôi quan tâm đến cơ hội thiết kế sản phẩm tại Nova Studio.",
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
    cvId: 501,
    cvName: "CV Frontend Developer",
    coverLetter: "Tôi mong muốn phát triển thêm kỹ năng phân tích dữ liệu.",
  },
];

const seedCvs = [
  {
    id: 501,
    candidateId: 1,
    name: "CV Frontend Developer",
    source: "profile",
    createdAt: "2026-06-28",
    updatedAt: "2026-06-28",
  },
];

const seedJobReports = [];

const appState = {
  users: [],
  jobs: [],
  applications: [],
  cvs: [],
  reports: [],
  currentUser: null,
  authMode: "login",
  candidateTab: "jobs",
  candidateKeyword: "",
  candidateSort: "newest",
  detailJobId: null,
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
window.addEventListener("popstate", handleCandidateRouteChange);

function initApp() {
  bootMockDatabase();
  appState.users = readStorage(STORAGE_KEYS.users, seedUsers).map(normalizeUser);
  appState.jobs = readStorage(STORAGE_KEYS.jobs, seedJobs).map(normalizeJob);
  appState.applications = readStorage(STORAGE_KEYS.applications, seedApplications).map(normalizeApplication);
  appState.cvs = readStorage(STORAGE_KEYS.cvs, seedCvs).map(normalizeCv);
  appState.reports = readStorage(STORAGE_KEYS.reports, seedJobReports);
  syncAppliedJobsFromApplications();
  appState.currentUser = hydrateSessionUser(readStorage(STORAGE_KEYS.session, null));
  writeStorage(STORAGE_KEYS.users, appState.users);
  writeStorage(STORAGE_KEYS.jobs, appState.jobs);
  writeStorage(STORAGE_KEYS.applications, appState.applications);
  writeStorage(STORAGE_KEYS.cvs, appState.cvs);
  writeStorage(STORAGE_KEYS.reports, appState.reports);

  if (appState.currentUser) {
    renderDashboard();
  } else {
    renderLogin();
  }
}

function handleRealtimeStorageUpdate(event) {
  if (!appState.currentUser || event.key !== STORAGE_KEYS.jobs) return;

  appState.jobs = readStorage(STORAGE_KEYS.jobs, seedJobs).map(normalizeJob);
  if (appState.currentUser.role === "candidate") renderCandidateRoute();
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
  if (!localStorage.getItem(STORAGE_KEYS.cvs)) {
    localStorage.setItem(STORAGE_KEYS.cvs, JSON.stringify(seedCvs));
  }
  if (!localStorage.getItem(STORAGE_KEYS.reports)) {
    localStorage.setItem(STORAGE_KEYS.reports, JSON.stringify(seedJobReports));
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

function normalizeCv(cv) {
  const timestamp = cv.updatedAt || cv.createdAt || new Date().toISOString();
  return {
    ...cv,
    id: Number(cv.id),
    candidateId: Number(cv.candidateId),
    name: String(cv.name || "CV chưa đặt tên"),
    source: cv.source === "upload" ? "upload" : "profile",
    originalFileName: String(cv.originalFileName || ""),
    fileSize: Number(cv.fileSize || 0),
    mimeType: String(cv.mimeType || ""),
    createdAt: cv.createdAt || timestamp,
    updatedAt: timestamp,
  };
}

function normalizeApplication(application) {
  return {
    ...application,
    id: Number(application.id),
    candidateId: Number(application.candidateId),
    jobId: Number(application.jobId),
    coverLetter: String(application.coverLetter || ""),
    cvId: application.cvId ? Number(application.cvId) : null,
    cvName: String(application.cvName || "CV không xác định"),
    withdrawnAt: application.withdrawnAt || null,
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
      .filter((application) => application.candidateId === user.id && !application.withdrawnAt)
      .map((application) => application.jobId);
    return {
      ...user,
      appliedJobs: Array.from(new Set(appliedFromApplications)),
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

  app.innerHTML = `
    <header class="spa-topbar">
      <button id="homeLogoButton" class="spa-brand brand-home-button" type="button" aria-label="Về trang chủ">
        ${renderBrandLogo()}
      </button>
      ${renderSiteNavigation()}
      ${renderTopbarUserArea(user)}
    </header>
    <main id="dashboardRoot" class="spa-dashboard"></main>
  `;

  document.querySelector("#homeLogoButton").addEventListener("click", goToDashboardHome);

  if (user.role === "candidate") {
    bindCandidateAccountMenu();
  } else {
    document.querySelector("#logoutButton").addEventListener("click", logout);
  }

  if (user.role === "candidate") renderCandidateRoute();
  if (user.role === "employer") renderEmployerView();
  if (user.role === "admin") renderAdminView();

  startRealtimeUpdates();
}

function goToDashboardHome() {
  closeJobDetailModal();
  closeApplicationModal();
  closeJobReportModal();
  if (appState.currentUser.role === "candidate") {
    if (window.location.pathname !== "/") window.history.pushState({}, "", "/");
    appState.detailJobId = null;
    appState.candidateTab = "jobs";
    appState.candidateKeyword = "";
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
  } else if (appState.currentUser.role === "employer") {
    appState.employerTab = "post";
    renderEmployerView();
  } else {
    renderAdminView();
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getJobIdFromLocation() {
  const match = window.location.pathname.match(/^\/jobs\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

function renderCandidateRoute() {
  const jobId = getJobIdFromLocation();
  appState.detailJobId = jobId;
  if (jobId) renderCandidateJobDetail(jobId);
  else renderCandidateView();
}

function handleCandidateRouteChange() {
  if (!appState.currentUser || appState.currentUser.role !== "candidate") return;
  closeApplicationModal();
  closeJobReportModal();
  renderCandidateRoute();
  window.scrollTo({ top: 0 });
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
  document.title = "JobBridge - Tuyển dụng việc làm";
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
            <div class="candidate-heading-actions">
              <span class="muted-count">${approvedJobs.length} kết quả</span>
              <label class="job-sort-control">
                <span>Sắp xếp</span>
                <select id="candidateJobSort">
                  <option value="newest" ${appState.candidateSort === "newest" ? "selected" : ""}>Mới nhất</option>
                  <option value="salary" ${appState.candidateSort === "salary" ? "selected" : ""}>Lương cao nhất</option>
                  <option value="match" ${appState.candidateSort === "match" ? "selected" : ""}>Phù hợp nhất</option>
                </select>
              </label>
            </div>
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

            <section class="profile-form-section candidate-cv-manager">
              <div class="profile-section-heading">
                <h3>CV của tôi</h3>
                <span>Tạo CV online từ thông tin hồ sơ đã cập nhật</span>
              </div>
              <div class="cv-manager-create">
                <label>
                  Tên CV
                  <input id="onlineCvName" type="text" placeholder="VD: CV Frontend Developer" />
                </label>
                <button id="createCvFromProfile" class="secondary-button" type="button">Tạo CV từ hồ sơ</button>
              </div>
              <div class="cv-upload-row">
                <label class="cv-upload-button" for="candidateCvUpload">Nhập CV từ máy</label>
                <input id="candidateCvUpload" type="file" accept="application/pdf,.pdf" hidden />
                <span>Chỉ nhận tệp PDF, dung lượng tối đa 5 MB.</span>
              </div>
              <div class="cv-manager-list">
                ${renderCandidateCvList(currentUser.id)}
              </div>
            </section>
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

  return `
    <section class="job-market-strip">
      <div class="job-market-heading">
        <div>
          <strong>Tuyển dụng <span>${formatNumber(marketJobCount)} việc làm</span></strong>
          <p>Trang chủ <span>/</span> Tuyển dụng ${formatNumber(marketJobCount)} việc làm ${currentYear}</p>
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

function getCandidateCvs(candidateId = appState.currentUser?.id) {
  return appState.cvs
    .filter((cv) => cv.candidateId === candidateId)
    .sort((first, second) => Date.parse(second.updatedAt) - Date.parse(first.updatedAt));
}

function renderCandidateCvList(candidateId) {
  const cvs = getCandidateCvs(candidateId);
  if (cvs.length === 0) {
    return `<div class="empty-state compact-empty">Bạn chưa có CV. Hãy tạo CV online từ hồ sơ để bắt đầu ứng tuyển.</div>`;
  }

  return cvs
    .map(
      (cv) => `
        <article class="cv-manager-card">
          <span class="cv-file-icon">CV</span>
          <div class="cv-manager-card-main">
            <strong>${escapeHtml(cv.name)}</strong>
            <small>${cv.source === "profile" ? "Tạo online từ hồ sơ" : `PDF tải lên${cv.fileSize ? ` • ${formatFileSize(cv.fileSize)}` : ""}`} • Cập nhật ${formatDate(cv.updatedAt)}</small>
          </div>
          <footer class="cv-manager-card-actions">
            ${cv.source === "upload" ? `<button class="cv-view-button" data-view-cv="${cv.id}" type="button">Xem PDF</button>` : ""}
            <button class="cv-delete-button" data-delete-cv="${cv.id}" type="button" aria-label="Xoá ${escapeHtml(cv.name)}">Xoá</button>
          </footer>
        </article>
      `,
    )
    .join("");
}

function createCvFromProfile(customName = "") {
  const user = normalizeUser(appState.currentUser);
  const name = customName.trim() || `CV ${user.desiredTitle || user.name}`;
  const now = new Date().toISOString();
  const cv = normalizeCv({
    id: Date.now(),
    candidateId: user.id,
    name,
    source: "profile",
    createdAt: now,
    updatedAt: now,
    profileSnapshot: {
      name: user.name,
      desiredTitle: user.desiredTitle,
      phone: user.phone,
      email: user.email,
      location: user.location,
      education: user.education,
      experienceLevel: user.experienceLevel,
      summary: user.summary,
      skills: [...user.skills],
    },
  });
  appState.cvs.unshift(cv);
  writeStorage(STORAGE_KEYS.cvs, appState.cvs);
  return cv;
}

function openCvFileDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CV_FILE_DATABASE, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(CV_FILE_STORE)) {
        request.result.createObjectStore(CV_FILE_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Không thể mở kho lưu CV."));
  });
}

async function saveCvFile(cvId, file) {
  const database = await openCvFileDatabase();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(CV_FILE_STORE, "readwrite");
    transaction.objectStore(CV_FILE_STORE).put({ id: cvId, file });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("Không thể lưu tệp CV."));
  });
  database.close();
}

async function readCvFile(cvId) {
  const database = await openCvFileDatabase();
  const record = await new Promise((resolve, reject) => {
    const request = database.transaction(CV_FILE_STORE, "readonly").objectStore(CV_FILE_STORE).get(cvId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Không thể đọc tệp CV."));
  });
  database.close();
  return record?.file || null;
}

async function removeCvFile(cvId) {
  const database = await openCvFileDatabase();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(CV_FILE_STORE, "readwrite");
    transaction.objectStore(CV_FILE_STORE).delete(cvId);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("Không thể xoá tệp CV."));
  });
  database.close();
}

async function uploadCvFromComputer(event) {
  const input = event.target;
  const file = input.files?.[0];
  if (!file) return;

  const isPdfName = file.name.toLowerCase().endsWith(".pdf");
  if ((!isPdfName && file.type !== "application/pdf") || file.size === 0) {
    input.value = "";
    showToast("Vui lòng chọn một tệp PDF hợp lệ.", "error");
    return;
  }
  if (file.size > MAX_CV_FILE_SIZE) {
    input.value = "";
    showToast("Tệp PDF không được vượt quá 5 MB.", "error");
    return;
  }

  const headerBytes = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  const hasPdfSignature = String.fromCharCode(...headerBytes) === "%PDF-";
  if (!hasPdfSignature) {
    input.value = "";
    showToast("Tệp đã chọn không phải là PDF hợp lệ.", "error");
    return;
  }

  const customName = document.querySelector("#onlineCvName")?.value.trim();
  const now = new Date().toISOString();
  const cv = normalizeCv({
    id: Date.now(),
    candidateId: appState.currentUser.id,
    name: customName || file.name.replace(/\.pdf$/i, ""),
    source: "upload",
    originalFileName: file.name,
    fileSize: file.size,
    mimeType: "application/pdf",
    createdAt: now,
    updatedAt: now,
  });

  try {
    await saveCvFile(cv.id, file);
    appState.cvs.unshift(cv);
    writeStorage(STORAGE_KEYS.cvs, appState.cvs);
    appState.candidateTab = "profile";
    renderCandidateView();
    showToast(`Đã tải lên ${cv.name}`, "success");
  } catch {
    input.value = "";
    showToast("Không thể lưu tệp PDF trên trình duyệt này.", "error");
  }
}

async function viewUploadedCv(cvId) {
  const cv = appState.cvs.find((item) => item.id === cvId && item.candidateId === appState.currentUser.id);
  if (!cv || cv.source !== "upload") return;
  const previewWindow = window.open("", "_blank");
  try {
    const file = await readCvFile(cvId);
    if (!file) throw new Error("CV file missing");
    const url = URL.createObjectURL(file);
    if (previewWindow) previewWindow.location.href = url;
    else showToast("Trình duyệt đang chặn cửa sổ xem PDF.", "info");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch {
    previewWindow?.close();
    showToast("Không tìm thấy tệp PDF. Bạn có thể tải lên lại CV.", "error");
  }
}

async function deleteCandidateCv(cvId) {
  const cv = appState.cvs.find((item) => item.id === cvId && item.candidateId === appState.currentUser.id);
  if (!cv) return;
  const usedCount = appState.applications.filter((application) => application.cvId === cv.id).length;
  const detail = usedCount ? ` CV này đã dùng cho ${usedCount} hồ sơ; tên CV vẫn được giữ trong lịch sử.` : "";
  if (!window.confirm(`Bạn chắc chắn muốn xoá \"${cv.name}\"?${detail}`)) return;

  appState.cvs = appState.cvs.filter((item) => item.id !== cv.id);
  writeStorage(STORAGE_KEYS.cvs, appState.cvs);
  if (cv.source === "upload") {
    try {
      await removeCvFile(cv.id);
    } catch {
      // Metadata is already removed; an orphaned browser blob is harmless.
    }
  }
  appState.candidateTab = "profile";
  renderCandidateView();
  showToast(`Đã xoá ${cv.name}`, "success");
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
        <div class="filter-radio-grid">
          ${renderFilterRadio("saturdayFilter", "", "Không lọc", appState.candidateFilters.saturday === "")}
          ${renderFilterRadio("saturdayFilter", "work", "Làm thứ 7", appState.candidateFilters.saturday === "work")}
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
  if (appState.detailJobId || getJobIdFromLocation()) {
    window.history.pushState({}, "", "/");
    appState.detailJobId = null;
    renderCandidateView();
    window.scrollTo({ top: 0 });
    return;
  }
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
  document.querySelector("#candidateJobSort")?.addEventListener("change", (event) => {
    appState.candidateSort = event.target.value;
    renderCandidateView();
  });
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
    button.addEventListener("click", () => openJobDetailPage(Number(button.dataset.viewJob)));
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

function openJobDetailPage(jobId) {
  const job = appState.jobs.find((item) => item.id === jobId && item.status === "Approved");
  if (!job) return;
  closeJobDetailModal();
  if (window.location.pathname !== `/jobs/${jobId}`) window.history.pushState({ jobId }, "", `/jobs/${jobId}`);
  appState.detailJobId = jobId;
  renderCandidateJobDetail(jobId);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function navigateToCandidateHome() {
  if (window.location.pathname !== "/") window.history.pushState({}, "", "/");
  appState.detailJobId = null;
  appState.candidateTab = "jobs";
  renderCandidateView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getRelatedJobs(job) {
  return appState.jobs
    .filter((item) => item.id !== job.id && item.status === "Approved")
    .map((item) => ({
      job: item,
      score:
        (item.category === job.category ? 4 : 0) +
        (item.jobField === job.jobField ? 3 : 0) +
        (item.location === job.location ? 2 : 0) +
        (item.type === job.type ? 1 : 0),
    }))
    .sort((first, second) => second.score - first.score || getJobTimestamp(second.job) - getJobTimestamp(first.job))
    .slice(0, 3)
    .map((item) => item.job);
}

function renderCandidateJobDetail(jobId) {
  const root = document.querySelector("#dashboardRoot");
  const job = appState.jobs.find((item) => item.id === jobId && item.status === "Approved");
  if (!job) {
    root.innerHTML = `
      <section class="job-detail-not-found">
        <h1>Không tìm thấy việc làm</h1>
        <p>Tin tuyển dụng có thể đã đóng hoặc không còn tồn tại.</p>
        <button class="primary-button" data-back-to-jobs type="button">Về trang tìm việc</button>
      </section>`;
    root.querySelector("[data-back-to-jobs]").addEventListener("click", navigateToCandidateHome);
    return;
  }

  const applied = appState.currentUser.appliedJobs.includes(job.id);
  const saved = appState.currentUser.savedJobs.includes(job.id);
  const matchScore = getAiMatchScore(job.id);
  const relatedJobs = getRelatedJobs(job);
  const reported = appState.reports.some(
    (report) => report.jobId === job.id && report.candidateId === appState.currentUser.id,
  );

  document.title = `${job.title} - ${job.company} | JobBridge`;
  root.innerHTML = `
    <nav class="job-detail-breadcrumb" aria-label="Breadcrumb">
      <button data-back-to-jobs type="button">Việc làm</button>
      <span>/</span>
      <span>${escapeHtml(job.title)}</span>
    </nav>

    <section class="job-detail-page">
      <article class="job-detail-main">
        <header class="job-detail-hero">
          <span class="company-logo large">${escapeHtml(getInitials(job.company))}</span>
          <div class="job-detail-hero-copy">
            <p>${escapeHtml(job.company)}</p>
            <h1>${escapeHtml(job.title)}</h1>
            <div class="job-detail-tags">
              <span>${escapeHtml(job.salary)}</span>
              <span>${escapeHtml(job.location)}</span>
              <span>${escapeHtml(job.type)}</span>
            </div>
          </div>
          <div class="job-detail-primary-actions">
            <button class="${applied ? "secondary-button" : "primary-button"}" data-apply-job="${job.id}" type="button">${applied ? "Đã ứng tuyển" : "Ứng tuyển ngay"}</button>
            <button class="secondary-button" data-save-job="${job.id}" type="button">${saved ? "Bỏ lưu" : "Lưu việc"}</button>
          </div>
        </header>

        <section class="job-detail-content-card">
          <h2>Mô tả công việc</h2>
          <p>${escapeHtml(job.description)}</p>
        </section>

        <section class="job-detail-content-card">
          <h2>Thông tin chung</h2>
          <dl class="job-detail-facts">
            <div><dt>Kinh nghiệm</dt><dd>${escapeHtml(job.experience || "Không yêu cầu")}</dd></div>
            <div><dt>Ngành nghề</dt><dd>${escapeHtml(job.jobField || job.category || "Khác")}</dd></div>
            <div><dt>Lĩnh vực công ty</dt><dd>${escapeHtml(job.companyField || "Chưa cập nhật")}</dd></div>
            <div><dt>Hình thức</dt><dd>${escapeHtml(job.type)}</dd></div>
          </dl>
        </section>

        <section class="job-detail-content-card job-detail-match-card">
          <div><strong>${matchScore}%</strong><span>phù hợp với bạn</span></div>
          <ul>${getMatchReasons(job).map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}</ul>
        </section>
      </article>

      <aside class="job-detail-sidebar">
        <section class="job-detail-side-card">
          <h2>Thao tác</h2>
          <button data-share-job="${job.id}" type="button">Chia sẻ việc làm</button>
          <button class="report-job-button ${reported ? "reported" : ""}" data-report-job="${job.id}" type="button">${reported ? "Đã báo cáo tin này" : "Báo cáo tin sai hoặc lừa đảo"}</button>
        </section>
        <section class="job-detail-side-card">
          <h2>Về công ty</h2>
          <strong>${escapeHtml(job.company)}</strong>
          <p>${escapeHtml(job.companyField || "Nhà tuyển dụng trên JobBridge")}</p>
          <span>${escapeHtml(job.location)}</span>
        </section>
      </aside>
    </section>

    <section class="related-jobs-section">
      <div class="related-jobs-heading">
        <div><p class="eyebrow">Có thể bạn quan tâm</p><h2>Việc làm liên quan</h2></div>
        <button data-back-to-jobs type="button">Xem tất cả việc làm</button>
      </div>
      <div class="related-job-grid">
        ${relatedJobs.length ? relatedJobs.map(renderRelatedJobCard).join("") : `<div class="empty-state compact-empty">Chưa có việc làm liên quan.</div>`}
      </div>
    </section>
  `;

  root.querySelectorAll("[data-back-to-jobs]").forEach((button) => button.addEventListener("click", navigateToCandidateHome));
  root.querySelector("[data-share-job]").addEventListener("click", () => shareJob(job));
  root.querySelector("[data-report-job]").addEventListener("click", () => openJobReportModal(job.id));
  bindCandidateJobCardActions(root);
}

function renderRelatedJobCard(job) {
  return `
    <article class="related-job-card">
      <div><span class="company-logo">${escapeHtml(getInitials(job.company))}</span><div><h3>${escapeHtml(job.title)}</h3><p>${escapeHtml(job.company)}</p></div></div>
      <div class="job-meta"><span>${escapeHtml(job.salary)}</span><span>${escapeHtml(job.location)}</span></div>
      <button class="ghost-button" data-view-job="${job.id}" type="button">Xem chi tiết</button>
    </article>
  `;
}

async function shareJob(job) {
  const url = `${window.location.origin}/jobs/${job.id}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: `${job.title} - ${job.company}`, text: `Xem việc làm ${job.title} tại ${job.company}`, url });
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      showToast("Đã sao chép liên kết việc làm", "success");
    } else {
      const input = document.createElement("textarea");
      input.value = url;
      document.body.append(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      showToast("Đã sao chép liên kết việc làm", "success");
    }
  } catch (error) {
    if (error?.name !== "AbortError") showToast("Không thể chia sẻ việc làm lúc này.", "error");
  }
}

function openJobReportModal(jobId) {
  const job = appState.jobs.find((item) => item.id === jobId);
  if (!job) return;
  closeJobReportModal();
  document.body.classList.add("modal-open");
  document.body.insertAdjacentHTML("beforeend", `
    <div id="jobReportModal" class="modal-backdrop" role="presentation">
      <section class="job-report-modal" role="dialog" aria-modal="true" aria-labelledby="jobReportTitle">
        <button class="modal-close" data-close-job-report type="button" aria-label="Đóng báo cáo">&times;</button>
        <div><p class="eyebrow">Báo cáo tin tuyển dụng</p><h2 id="jobReportTitle">${escapeHtml(job.title)}</h2><p>${escapeHtml(job.company)}</p></div>
        <form id="jobReportForm">
          <label>Lý do báo cáo
            <select id="jobReportReason" required>
              <option value="">Chọn lý do</option>
              <option value="incorrect">Nội dung sai sự thật</option>
              <option value="scam">Có dấu hiệu lừa đảo</option>
              <option value="impersonation">Giả mạo công ty</option>
              <option value="fee">Yêu cầu ứng viên nộp phí</option>
              <option value="other">Lý do khác</option>
            </select>
          </label>
          <label>Thông tin bổ sung
            <textarea id="jobReportDetails" maxlength="1000" rows="5" placeholder="Mô tả chi tiết để JobBridge có thể kiểm tra..."></textarea>
          </label>
          <div id="jobReportMessage" class="auth-message" aria-live="polite"></div>
          <div class="modal-actions"><button class="ghost-button" data-close-job-report type="button">Huỷ</button><button class="danger-button" type="submit">Gửi báo cáo</button></div>
        </form>
      </section>
    </div>`);

  const modal = document.querySelector("#jobReportModal");
  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.closest("[data-close-job-report]")) closeJobReportModal();
  });
  modal.querySelector("#jobReportForm").addEventListener("submit", (event) => submitJobReport(event, job));
  document.addEventListener("keydown", handleJobReportEscape);
  modal.querySelector("#jobReportReason").focus();
}

function submitJobReport(event, job) {
  event.preventDefault();
  const reason = document.querySelector("#jobReportReason").value;
  const details = document.querySelector("#jobReportDetails").value.trim();
  if (!reason) {
    showInlineMessage("#jobReportMessage", "Vui lòng chọn lý do báo cáo.", "error");
    return;
  }
  const previous = appState.reports.find((report) => report.jobId === job.id && report.candidateId === appState.currentUser.id);
  const report = { id: previous?.id || Date.now(), jobId: job.id, candidateId: appState.currentUser.id, reason, details, status: "pending", reportedAt: new Date().toISOString() };
  appState.reports = [report, ...appState.reports.filter((item) => item.id !== report.id)];
  writeStorage(STORAGE_KEYS.reports, appState.reports);
  closeJobReportModal();
  renderCandidateJobDetail(job.id);
  showToast("Đã gửi báo cáo để JobBridge kiểm tra", "success");
}

function closeJobReportModal() {
  document.querySelector("#jobReportModal")?.remove();
  if (!document.querySelector("#applicationModal") && !document.querySelector("#jobDetailModal")) document.body.classList.remove("modal-open");
  document.removeEventListener("keydown", handleJobReportEscape);
}

function handleJobReportEscape(event) {
  if (event.key === "Escape") closeJobReportModal();
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

  const jobs = appState.jobs.filter((job) => {
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
    });

  if (appState.candidateSort === "salary") {
    return jobs.sort((first, second) => second.maxSalary - first.maxSalary || second.minSalary - first.minSalary);
  }
  if (appState.candidateSort === "match") {
    return jobs.sort((first, second) => getAiMatchScore(second.id) - getAiMatchScore(first.id));
  }
  return jobs.sort((first, second) => getJobTimestamp(second) - getJobTimestamp(first));
}

function applyJob(jobId) {
  const job = appState.jobs.find((item) => item.id === jobId);
  if (!job) return;

  const applied = appState.currentUser.appliedJobs.includes(jobId);
  if (applied) {
    showToast("Bạn đã ứng tuyển công việc này.", "info");
    return;
  }

  openApplicationModal(jobId);
}

function openApplicationModal(jobId) {
  const job = appState.jobs.find((item) => item.id === jobId);
  if (!job) return;
  const cvs = getCandidateCvs();

  closeJobDetailModal();
  closeApplicationModal();
  document.body.classList.add("modal-open");
  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div id="applicationModal" class="modal-backdrop" role="presentation">
        <section class="application-modal" role="dialog" aria-modal="true" aria-labelledby="applicationModalTitle">
          <button class="modal-close" data-close-application type="button" aria-label="Đóng quy trình ứng tuyển">&times;</button>
          <header class="application-modal-header">
            <p class="eyebrow">Ứng tuyển vào ${escapeHtml(job.company)}</p>
            <h2 id="applicationModalTitle">${escapeHtml(job.title)}</h2>
          </header>

          <ol class="application-steps" aria-label="Các bước ứng tuyển">
            <li class="active" data-application-step-indicator="1"><span>1</span> Chọn CV</li>
            <li data-application-step-indicator="2"><span>2</span> Thư giới thiệu</li>
            <li data-application-step-indicator="3"><span>3</span> Xác nhận</li>
          </ol>

          <form id="applicationForm">
            <section class="application-step-panel active" data-application-step="1">
              <div class="application-section-heading">
                <h3>Chọn CV gửi đến nhà tuyển dụng</h3>
                <p>CV đã chọn sẽ được ghi lại cùng hồ sơ ứng tuyển.</p>
              </div>
              <div class="application-cv-options">
                ${
                  cvs.length
                    ? cvs
                        .map(
                          (cv, index) => `
                            <label class="application-cv-option">
                              <input name="applicationCv" type="radio" value="${cv.id}" ${index === 0 ? "checked" : ""} />
                              <span class="cv-file-icon">CV</span>
                              <span>
                                <strong>${escapeHtml(cv.name)}</strong>
                                <small>${cv.source === "profile" ? "Tạo online từ hồ sơ" : "CV tải lên"} • ${formatDate(cv.updatedAt)}</small>
                              </span>
                            </label>
                          `,
                        )
                        .join("")
                    : `<div class="empty-state compact-empty">Bạn chưa có CV để ứng tuyển.</div>`
                }
              </div>
              <button class="inline-create-cv" data-create-application-cv type="button">+ Tạo CV online từ hồ sơ</button>
            </section>

            <section class="application-step-panel" data-application-step="2" hidden>
              <div class="application-section-heading">
                <h3>Viết thư giới thiệu</h3>
                <p>Giới thiệu ngắn gọn kinh nghiệm và lý do bạn phù hợp với vị trí này.</p>
              </div>
              <label class="cover-letter-field">
                Thư giới thiệu
                <textarea id="applicationCoverLetter" maxlength="2000" rows="8" placeholder="Kính gửi nhà tuyển dụng, tôi quan tâm đến vị trí..."></textarea>
                <small><span id="coverLetterCount">0</span>/2000 ký tự</small>
              </label>
            </section>

            <section class="application-step-panel" data-application-step="3" hidden>
              <div class="application-section-heading">
                <h3>Xác nhận thông tin trước khi gửi</h3>
                <p>Kiểm tra lại thông tin. Sau khi gửi, bạn chỉ có thể rút khi hồ sơ còn ở trạng thái “Đã nộp”.</p>
              </div>
              <dl class="application-confirmation">
                <div><dt>Vị trí</dt><dd>${escapeHtml(job.title)} • ${escapeHtml(job.company)}</dd></div>
                <div><dt>Ứng viên</dt><dd>${escapeHtml(appState.currentUser.name)}</dd></div>
                <div><dt>Liên hệ</dt><dd>${escapeHtml(appState.currentUser.email)}${appState.currentUser.phone ? ` • ${escapeHtml(appState.currentUser.phone)}` : ""}</dd></div>
                <div><dt>CV sử dụng</dt><dd id="confirmCvName">—</dd></div>
                <div><dt>Thư giới thiệu</dt><dd id="confirmCoverLetter" class="confirmation-cover-letter">—</dd></div>
              </dl>
              <label class="application-confirm-check">
                <input id="applicationConfirmed" type="checkbox" />
                <span>Tôi xác nhận thông tin trên là chính xác.</span>
              </label>
            </section>

            <div id="applicationFormMessage" class="auth-message" aria-live="polite"></div>
            <footer class="application-modal-actions">
              <button class="ghost-button" data-application-previous type="button" hidden>Quay lại</button>
              <span></span>
              <button class="primary-button" data-application-next type="button" ${cvs.length ? "" : "disabled"}>Tiếp tục</button>
              <button class="primary-button" data-submit-application type="submit" hidden>Gửi hồ sơ</button>
            </footer>
          </form>
        </section>
      </div>
    `,
  );

  const modal = document.querySelector("#applicationModal");
  modal.dataset.currentStep = "1";
  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.closest("[data-close-application]")) closeApplicationModal();
  });
  modal.querySelector("[data-create-application-cv]").addEventListener("click", () => {
    const cv = createCvFromProfile();
    closeApplicationModal();
    openApplicationModal(jobId);
    showToast(`Đã tạo ${cv.name}`, "success");
  });
  modal.querySelector("[data-application-next]").addEventListener("click", () => moveApplicationStep(1));
  modal.querySelector("[data-application-previous]").addEventListener("click", () => moveApplicationStep(-1));
  modal.querySelector("#applicationCoverLetter").addEventListener("input", (event) => {
    modal.querySelector("#coverLetterCount").textContent = event.target.value.length;
  });
  modal.querySelector("#applicationForm").addEventListener("submit", (event) => submitApplication(event, jobId));
  document.addEventListener("keydown", handleApplicationEscape);
  modal.querySelector('input[name="applicationCv"]')?.focus();
}

function moveApplicationStep(direction) {
  const modal = document.querySelector("#applicationModal");
  if (!modal) return;
  const currentStep = Number(modal.dataset.currentStep || 1);
  if (direction > 0 && currentStep === 1 && !modal.querySelector('input[name="applicationCv"]:checked')) {
    showInlineMessage("#applicationFormMessage", "Vui lòng chọn CV trước khi tiếp tục.", "error");
    return;
  }
  if (direction > 0 && currentStep === 2) {
    const coverLetter = modal.querySelector("#applicationCoverLetter").value.trim();
    if (coverLetter.length < 20) {
      showInlineMessage("#applicationFormMessage", "Thư giới thiệu cần tối thiểu 20 ký tự.", "error");
      return;
    }
  }

  const nextStep = Math.min(3, Math.max(1, currentStep + direction));
  modal.dataset.currentStep = String(nextStep);
  modal.querySelector("#applicationFormMessage").textContent = "";
  modal.querySelectorAll("[data-application-step]").forEach((panel) => {
    const active = Number(panel.dataset.applicationStep) === nextStep;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });
  modal.querySelectorAll("[data-application-step-indicator]").forEach((indicator) => {
    const step = Number(indicator.dataset.applicationStepIndicator);
    indicator.classList.toggle("active", step === nextStep);
    indicator.classList.toggle("complete", step < nextStep);
  });
  modal.querySelector("[data-application-previous]").hidden = nextStep === 1;
  modal.querySelector("[data-application-next]").hidden = nextStep === 3;
  modal.querySelector("[data-submit-application]").hidden = nextStep !== 3;

  if (nextStep === 3) updateApplicationConfirmation();
  if (nextStep === 2) modal.querySelector("#applicationCoverLetter").focus();
  if (nextStep === 3) modal.querySelector("#applicationConfirmed").focus();
}

function updateApplicationConfirmation() {
  const modal = document.querySelector("#applicationModal");
  const selectedCvId = Number(modal.querySelector('input[name="applicationCv"]:checked')?.value);
  const cv = appState.cvs.find((item) => item.id === selectedCvId);
  modal.querySelector("#confirmCvName").textContent = cv?.name || "—";
  modal.querySelector("#confirmCoverLetter").textContent = modal.querySelector("#applicationCoverLetter").value.trim() || "—";
}

function submitApplication(event, jobId) {
  event.preventDefault();
  const modal = document.querySelector("#applicationModal");
  if (!modal.querySelector("#applicationConfirmed").checked) {
    showInlineMessage("#applicationFormMessage", "Vui lòng xác nhận thông tin trước khi gửi.", "error");
    return;
  }
  const job = appState.jobs.find((item) => item.id === jobId);
  const cvId = Number(modal.querySelector('input[name="applicationCv"]:checked')?.value);
  const cv = appState.cvs.find((item) => item.id === cvId && item.candidateId === appState.currentUser.id);
  if (!job || !cv || appState.currentUser.appliedJobs.includes(jobId)) {
    showInlineMessage("#applicationFormMessage", "Không thể gửi hồ sơ. Vui lòng kiểm tra lại CV đã chọn.", "error");
    return;
  }

  updateCurrentUser({
    appliedJobs: [...appState.currentUser.appliedJobs, jobId],
  });
  appState.applications.unshift(
    normalizeApplication({
      id: Date.now(),
      candidateId: appState.currentUser.id,
      candidateName: appState.currentUser.name,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      status: "Da nop",
      appliedAt: new Date().toISOString(),
      cvId: cv.id,
      cvName: cv.name,
      coverLetter: modal.querySelector("#applicationCoverLetter").value.trim(),
      withdrawnAt: null,
    }),
  );
  writeStorage(STORAGE_KEYS.applications, appState.applications);
  closeApplicationModal();
  if (appState.detailJobId) renderCandidateJobDetail(appState.detailJobId);
  else renderCandidateView();
  showToast("Ứng tuyển thành công", "success");
}

function closeApplicationModal() {
  document.querySelector("#applicationModal")?.remove();
  if (!document.querySelector("#jobDetailModal")) document.body.classList.remove("modal-open");
  document.removeEventListener("keydown", handleApplicationEscape);
}

function handleApplicationEscape(event) {
  if (event.key === "Escape") closeApplicationModal();
}

function toggleSavedJob(jobId) {
  const isSaved = appState.currentUser.savedJobs.includes(jobId);
  const savedJobs = isSaved
    ? appState.currentUser.savedJobs.filter((id) => id !== jobId)
    : [...appState.currentUser.savedJobs, jobId];

  updateCurrentUser({ savedJobs });
  closeJobDetailModal();
  if (appState.detailJobId) renderCandidateJobDetail(appState.detailJobId);
  else renderCandidateView();
  showToast(isSaved ? "Da bo luu viec lam" : "Da luu thanh cong", isSaved ? "info" : "success");
}

function bindCandidateProfile() {
  document.querySelector("#candidateProfileForm").addEventListener("submit", handleProfileSubmit);
  document.querySelector("#skillInput").addEventListener("keydown", handleSkillInput);
  document.querySelector("#createCvFromProfile")?.addEventListener("click", () => {
    const input = document.querySelector("#onlineCvName");
    const cv = createCvFromProfile(input?.value || "");
    appState.candidateTab = "profile";
    renderCandidateView();
    showToast(`Đã tạo ${cv.name}`, "success");
  });
  document.querySelector("#candidateCvUpload")?.addEventListener("change", uploadCvFromComputer);
  document.querySelectorAll("[data-view-cv]").forEach((button) => {
    button.addEventListener("click", () => viewUploadedCv(Number(button.dataset.viewCv)));
  });
  document.querySelectorAll("[data-delete-cv]").forEach((button) => {
    button.addEventListener("click", () => deleteCandidateCv(Number(button.dataset.deleteCv)));
  });
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
  const rows = appState.applications
    .filter((application) => application.candidateId === appState.currentUser.id)
    .sort((first, second) => Date.parse(second.appliedAt) - Date.parse(first.appliedAt))
    .map((application) => {
      const job = appState.jobs.find((item) => item.id === application.jobId);
      if (!job) return "";
      const status = application.withdrawnAt ? "Da rut" : application.status || "Da nop";
      const canWithdraw = !application.withdrawnAt && application.status === "Da nop";
      return `
        <tr>
          <td>
            <strong>${escapeHtml(job.title)}</strong>
            <span>${escapeHtml(job.company)}</span>
          </td>
          <td>${escapeHtml(job.location)}</td>
          <td>${formatDate(application.appliedAt)}</td>
          <td>
            <strong>${escapeHtml(application.cvName)}</strong>
            <span class="history-cover-letter" title="${escapeHtml(application.coverLetter)}">${escapeHtml(application.coverLetter || "Không có thư giới thiệu")}</span>
          </td>
          <td><span class="history-status ${getHistoryStatusClass(status)}">${escapeHtml(status)}</span></td>
          <td>${canWithdraw ? `<button class="withdraw-application-button" data-withdraw-application="${application.id}" type="button">Rút hồ sơ</button>` : "—"}</td>
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
          <th>CV đã dùng</th>
          <th>Trang thai</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>${rows.join("")}</tbody>
    </table>
  `;
  root.querySelectorAll("[data-withdraw-application]").forEach((button) => {
    button.addEventListener("click", () => withdrawApplication(Number(button.dataset.withdrawApplication)));
  });
}

function withdrawApplication(applicationId) {
  const application = appState.applications.find(
    (item) => item.id === applicationId && item.candidateId === appState.currentUser.id,
  );
  if (!application || application.withdrawnAt || application.status !== "Da nop") {
    showToast("Hồ sơ không còn ở trạng thái mới nộp nên không thể rút.", "error");
    return;
  }
  if (!window.confirm("Bạn chắc chắn muốn rút hồ sơ này?")) return;

  application.withdrawnAt = new Date().toISOString();
  writeStorage(STORAGE_KEYS.applications, appState.applications);
  const activeJobIds = appState.applications
    .filter((item) => item.candidateId === appState.currentUser.id && !item.withdrawnAt)
    .map((item) => item.jobId);
  updateCurrentUser({ appliedJobs: Array.from(new Set(activeJobIds)) });
  appState.candidateTab = "history";
  renderCandidateView();
  showToast("Đã rút hồ sơ thành công", "success");
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
  if (status === "Da rut") return "withdrawn";
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
          const cards = appState.applications.filter((item) => item.status === column.id && !item.withdrawnAt);
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
      <small>CV: ${escapeHtml(application.cvName || "Không xác định")}</small>
    </article>
  `;
}

function renderAdminView() {
  const pendingJobs = appState.jobs.filter((job) => job.status === "Pending");

  document.querySelector("#dashboardRoot").innerHTML = `
    <section class="spa-hero-band">
      <div>
        <p class="eyebrow">Admin View</p>
        <h1>Kiem duyet he thong</h1>
        <p>Theo doi tong quan va duyet cac tin tuyen dung dang cho phe duyet.</p>
      </div>
      <div class="hero-metrics">
        <div>
          <strong>${appState.users.length}</strong>
          <span>tong user</span>
        </div>
        <div>
          <strong>${appState.jobs.length}</strong>
          <span>tong viec lam</span>
        </div>
        <div>
          <strong>${pendingJobs.length}</strong>
          <span>tin Pending</span>
        </div>
      </div>
    </section>

    <section class="spa-section admin-layout">
      <div class="stats-grid">
        <div class="stat-card">
          <span>Total Users</span>
          <strong>${appState.users.length}</strong>
        </div>
        <div class="stat-card">
          <span>Total Jobs</span>
          <strong>${appState.jobs.length}</strong>
        </div>
        <div class="stat-card">
          <span>Applications</span>
          <strong>${appState.applications.length}</strong>
        </div>
      </div>

      <div class="approval-panel spa-table-panel">
        <div class="panel-heading">
          <h2>Duyet tin tuyen dung</h2>
          <span class="muted-count">${pendingJobs.length} tin cho duyet</span>
        </div>
        <div id="pendingJobTable"></div>
      </div>
    </section>
  `;

  renderPendingJobTable();
}

function renderPendingJobTable() {
  const pendingJobs = appState.jobs.filter((job) => job.status === "Pending");
  const table = document.querySelector("#pendingJobTable");

  if (pendingJobs.length === 0) {
    table.innerHTML = `<div class="empty-state">Khong co tin nao dang cho duyet.</div>`;
    return;
  }

  table.innerHTML = `
    <table class="spa-table">
      <thead>
        <tr>
          <th>Tieu de</th>
          <th>Cong ty</th>
          <th>Luong</th>
          <th>Trang thai</th>
          <th>Thao tac</th>
        </tr>
      </thead>
      <tbody>
        ${pendingJobs
          .map(
            (job) => `
              <tr>
                <td>
                  <strong>${escapeHtml(job.title)}</strong>
                  <span>${escapeHtml(job.location)}</span>
                </td>
                <td>${escapeHtml(job.company)}</td>
                <td>${escapeHtml(job.salary)}</td>
                <td><span class="status-pill warning">${escapeHtml(job.status)}</span></td>
                <td>
                  <div class="table-actions">
                    <button class="primary-button" data-approve="${job.id}" type="button">Duyet</button>
                    <button class="danger-button" data-reject="${job.id}" type="button">Tu choi</button>
                  </div>
                </td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;

  table.querySelectorAll("[data-approve]").forEach((button) => {
    button.addEventListener("click", () => updateJobStatus(Number(button.dataset.approve), "Approved"));
  });
  table.querySelectorAll("[data-reject]").forEach((button) => {
    button.addEventListener("click", () => updateJobStatus(Number(button.dataset.reject), "Rejected"));
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
  document.querySelectorAll("[data-job-relative-time]").forEach((item) => {
    item.textContent = `Cập nhật ${formatRelativeTime(item.dataset.jobRelativeTime)}`;
  });
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


