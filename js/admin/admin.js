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
  const sharedResult = handleSharedRoleAdminRequest(endpoint, options);
  if (sharedResult.handled) return sharedResult.value;
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

// Cầu nối dữ liệu: admin dùng chung nguồn localStorage với company/candidate.
// Giao diện admin gốc được giữ nguyên, chỉ thay nơi đọc và ghi dữ liệu.
function handleSharedRoleAdminRequest(endpoint, options = {}) {
  refreshSharedRoleData();
  const method = String(options.method || "GET").toUpperCase();
  const url = new URL(endpoint, window.location.origin);
  const pathname = url.pathname;
  const payload = options.body ? JSON.parse(options.body) : {};
  const done = (value) => ({ handled: true, value });
  const pass = () => ({ handled: false });
  const matchesSearch = (values) => {
    const query = String(url.searchParams.get("q") || "").trim().toLowerCase();
    return !query || values.some((value) => String(value || "").toLowerCase().includes(query));
  };

  if (method === "GET" && pathname === "/admin/dashboard") {
    const users = appState.users;
    const jobs = appState.jobs;
    const applications = appState.applications.filter((item) => !item.withdrawnAt);
    return done({
      summary: {
        totalUsers: users.length,
        totalCandidates: users.filter((user) => user.role === "candidate").length,
        totalEmployers: users.filter((user) => user.role === "employer").length,
        lockedUsers: users.filter((user) => user.status === "Locked" || user.locked).length,
        totalJobs: jobs.length,
        pendingJobs: jobs.filter((job) => job.status === "Pending").length,
        approvedJobs: jobs.filter((job) => job.status === "Approved").length,
        rejectedJobs: jobs.filter((job) => job.status === "Rejected").length,
        closedJobs: jobs.filter((job) => job.status === "Closed").length,
        totalApplications: applications.length,
        hiredApplications: applications.filter((item) => item.status === "Da tuyen").length,
        rejectedApplications: applications.filter((item) => item.status === "Tu choi").length,
      },
      recentUsers: users.slice(-5).reverse().map(mapSharedAdminUser),
      recentJobs: jobs.slice(0, 5).map((job) => ({ ...job, created_at: job.createdAt || job.created_at })),
    });
  }

  if (method === "GET" && pathname === "/admin/users") {
    const role = url.searchParams.get("role");
    const status = url.searchParams.get("status");
    const users = appState.users.map(mapSharedAdminUser).filter((user) =>
      (!role || user.role === role) && (!status || user.status === status) && matchesSearch([user.name, user.email]),
    );
    return done({ users, total: users.length });
  }

  if (method === "GET" && pathname === "/jobs") {
    const status = url.searchParams.get("status");
    const jobs = appState.jobs.filter((job) => (!status || job.status === status) && matchesSearch([job.title, job.company, job.location]));
    return done({ jobs, total: jobs.length });
  }

  if (method === "GET" && pathname === "/admin/companies") {
    const status = url.searchParams.get("status");
    const companies = appState.users.filter((user) => user.role === "employer").map((user) => {
      const jobs = appState.jobs.filter((job) => companyMatchesSharedUser(job, user));
      return { ...mapSharedAdminUser(user), totalJobs: jobs.length, approvedJobs: jobs.filter((job) => job.status === "Approved").length, pendingJobs: jobs.filter((job) => job.status === "Pending").length };
    }).filter((company) => (!status || company.status === status) && matchesSearch([company.name, company.email]));
    return done({ companies, total: companies.length });
  }

  if (method === "GET" && pathname === "/admin/applications") {
    const status = url.searchParams.get("status");
    const applications = appState.applications.filter((item) => !item.withdrawnAt).map(mapSharedAdminApplication).filter((item) =>
      (!status || item.status === status) && matchesSearch([item.candidateName, item.candidateEmail, item.jobTitle, item.companyName]),
    );
    return done({ applications, total: applications.length });
  }

  if (method === "GET" && pathname === "/admin/reports") {
    const status = url.searchParams.get("status");
    const type = url.searchParams.get("type");
    const reports = appState.reports.map(mapSharedAdminReport).filter((report) =>
      (!status || report.status === status) && (!type || report.targetType === type) && matchesSearch([report.reporterName, report.reporterEmail, report.reason, report.description]),
    );
    return done({ reports, total: reports.length });
  }

  let match = pathname.match(/^\/admin\/users\/(\d+)\/(status|role)$/);
  if (method === "PATCH" && match) {
    const user = appState.users.find((item) => Number(item.id) === Number(match[1]));
    if (!user) throw new Error("Không tìm thấy tài khoản.");
    if (match[2] === "status") {
      user.status = payload.status;
      user.locked = payload.status === "Locked";
      user.lockedReason = payload.reason || "";
    } else user.role = payload.role;
    persistSharedAdminUsers();
    return done({ message: "Đã cập nhật tài khoản.", user: mapSharedAdminUser(user) });
  }

  match = pathname.match(/^\/admin\/users\/(\d+)$/);
  if (method === "DELETE" && match) {
    const id = Number(match[1]);
    if (id === Number(appState.currentUser.id)) throw new Error("Không thể xóa tài khoản đang đăng nhập.");
    appState.users = appState.users.filter((user) => Number(user.id) !== id);
    persistSharedAdminUsers();
    return done({ message: "Đã xóa tài khoản." });
  }

  match = pathname.match(/^\/jobs\/(\d+)\/status$/);
  if (method === "PATCH" && match) {
    const job = appState.jobs.find((item) => Number(item.id) === Number(match[1]));
    if (!job) throw new Error("Không tìm thấy tin tuyển dụng.");
    job.status = payload.status;
    job.updatedAt = new Date().toISOString();
    writeStorage(STORAGE_KEYS.jobs, appState.jobs);
    return done({ message: "Đã cập nhật trạng thái tin tuyển dụng.", job });
  }

  match = pathname.match(/^\/jobs\/(\d+)$/);
  if (method === "DELETE" && match) {
    const id = Number(match[1]);
    if (appState.applications.some((item) => Number(item.jobId) === id && !item.withdrawnAt)) throw new Error("Không thể xóa tin đã có hồ sơ ứng tuyển.");
    appState.jobs = appState.jobs.filter((job) => Number(job.id) !== id);
    writeStorage(STORAGE_KEYS.jobs, appState.jobs);
    return done({ message: "Đã xóa tin tuyển dụng." });
  }

  if (method === "PATCH" && /^\/applications\/\d+\/status$/.test(pathname)) {
    throw new Error("Hồ sơ ứng tuyển do doanh nghiệp xử lý.");
  }

  return pass();
}

function refreshSharedRoleData() {
  appState.users = readStorage(STORAGE_KEYS.users, seedUsers).map(normalizeUser);
  appState.jobs = readStorage(STORAGE_KEYS.jobs, seedJobs).map(normalizeJob);
  appState.applications = readStorage(STORAGE_KEYS.applications, seedApplications).map(normalizeApplication);
  appState.reports = readStorage(STORAGE_KEYS.reports, seedJobReports);
}

function mapSharedAdminUser(user) {
  const createdAt = user.createdAt || user.created_at || "";
  return { ...user, status: user.status || (user.locked ? "Locked" : "Active"), lockedReason: user.lockedReason || "", createdAt, created_at: createdAt, lastLoginAt: user.lastLoginAt || "" };
}

function companyMatchesSharedUser(job, user) {
  if (Number(job.employerId) === Number(user.id)) return true;
  const companyName = String(user.name || "").replace(/^Công ty\s+|^Cong ty\s+/i, "").toLowerCase();
  return companyName && String(job.company || "").toLowerCase().includes(companyName);
}

function mapSharedAdminApplication(application) {
  const candidate = appState.users.find((user) => Number(user.id) === Number(application.candidateId));
  const job = appState.jobs.find((item) => Number(item.id) === Number(application.jobId));
  return { ...application, candidateEmail: candidate?.email || "", companyName: application.company || job?.company || "", jobLocation: job?.location || "", createdAt: application.appliedAt };
}

function mapSharedAdminReport(report) {
  const reporter = appState.users.find((user) => Number(user.id) === Number(report.candidateId));
  const status = String(report.status || "pending").toLowerCase();
  return { ...report, reporterName: reporter?.name || "Ẩn danh", reporterEmail: reporter?.email || "", targetType: "job", targetId: report.jobId, description: report.details || "", status: status === "resolved" ? "Resolved" : status === "rejected" ? "Rejected" : "Pending", createdAt: report.reportedAt || report.createdAt };
}

function persistSharedAdminUsers() {
  writeStorage(STORAGE_KEYS.users, appState.users);
  appState.currentUser = hydrateSessionUser(appState.currentUser);
  writeStorage(STORAGE_KEYS.session, appState.currentUser);
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

async function ensureAdminApiSession() {
  if (getApiToken()) return;
  const account = appState.users.find((user) => user.id === appState.currentUser?.id);
  if (!account?.email || !account?.password) throw new Error("Không tìm thấy thông tin đăng nhập Admin.");
  const result = await apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ email: account.email, password: account.password }) });
  if (!result?.token) throw new Error("Không thể tạo phiên API Admin.");
  saveApiToken(result.token);
}

async function renderAdminView() {
  await ensureAdminApiSession();
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

        <div class="admin-heading-actions">
          <button
            type="button"
            id="exportAdminJobsButton"
            class="secondary-button admin-refresh-button"
          >
            Xuất CSV
          </button>
          <button
            type="button"
            id="refreshAdminJobsButton"
            class="secondary-button admin-refresh-button"
          >
            Làm mới
          </button>
        </div>
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
    .querySelector("#exportAdminJobsButton")
    ?.addEventListener("click", exportAdminJobsCsv);

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

function exportAdminJobsCsv() {
  const jobs = appState.adminJobs || [];
  if (!jobs.length) {
    showToast("Không có tin tuyển dụng để xuất.", "error");
    return;
  }

  const rows = [
    ["ID", "Tiêu đề", "Công ty", "Địa điểm", "Loại", "Trạng thái", "Mức lương", "Ngày tạo"],
    ...jobs.map((job) => [
      job.id,
      job.title,
      job.company,
      job.location,
      job.type,
      getAdminJobStatusLabel(job.status),
      job.salary,
      job.createdAt || job.created_at || "",
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(formatAdminCsvCell).join(",")).join("\r\n")}`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `jobbridge-tin-tuyen-dung-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast(`Đã xuất ${jobs.length} tin tuyển dụng.`, "success");
}

function formatAdminCsvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
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
