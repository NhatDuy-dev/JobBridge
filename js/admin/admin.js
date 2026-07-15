// Module quản trị độc lập. Admin quản trị hệ thống và duyệt tin tuyển dụng;
// hồ sơ ứng viên chỉ được xem, nhà tuyển dụng mới là bên xử lý hồ sơ.
const ADMIN_TABS = [
  ["dashboard", "Tổng quan"], ["users", "Người dùng"], ["jobs", "Tin tuyển dụng"],
  ["companies", "Doanh nghiệp"], ["applications", "Hồ sơ ứng tuyển"],
  ["reports", "Báo cáo vi phạm"], ["logs", "Nhật ký"], ["settings", "Cấu hình"],
];

function renderAdminView() {
  const root = document.querySelector("#dashboardRoot");
  if (!root) return;
  root.innerHTML = `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div><h2>JobBridge Admin</h2><p>Quản trị hệ thống</p></div>
        <nav class="admin-navigation" aria-label="Điều hướng quản trị">
          ${ADMIN_TABS.map(([tab, label]) => `<button class="admin-nav-button ${appState.adminTab === tab ? "active" : ""}" data-admin-tab="${tab}" type="button">${label}</button>`).join("")}
        </nav>
      </aside>
      <section class="admin-main">
        <header class="admin-heading"><div><p class="eyebrow">Quản trị viên</p><h1>${adminTabTitle()}</h1></div><button class="secondary-button" data-admin-refresh type="button">Làm mới</button></header>
        <div id="adminContent">${renderAdminContent()}</div>
      </section>
    </div>`;
  bindAdminEvents();
}

function adminTabTitle() {
  return ADMIN_TABS.find(([tab]) => tab === appState.adminTab)?.[1] || "Tổng quan";
}

function renderAdminContent() {
  if (appState.adminTab === "dashboard") return renderAdminDashboard();
  if (appState.adminTab === "users") return renderAdminUsers();
  if (appState.adminTab === "jobs") return renderAdminJobs();
  if (appState.adminTab === "companies") return renderAdminCompanies();
  if (appState.adminTab === "applications") return renderAdminApplications();
  if (appState.adminTab === "reports") return renderAdminReports();
  if (appState.adminTab === "logs") return renderAdminLogs();
  return renderAdminSettings();
}

function renderAdminDashboard() {
  const pending = appState.jobs.filter((job) => job.status === "Pending").length;
  const employers = appState.users.filter((user) => user.role === "employer").length;
  return `<section class="admin-section">
    <div class="admin-stat-grid">
      ${adminStat("Người dùng", appState.users.length, "Tất cả tài khoản")}
      ${adminStat("Doanh nghiệp", employers, "Tài khoản nhà tuyển dụng")}
      ${adminStat("Chờ duyệt", pending, "Tin tuyển dụng cần xử lý")}
      ${adminStat("Hồ sơ", appState.applications.length, "Do doanh nghiệp xử lý")}
    </div>
    <div class="admin-panel"><h2>Công việc cần chú ý</h2>${pending ? `<p>Có <strong>${pending}</strong> tin tuyển dụng đang chờ duyệt.</p><button class="primary-button" data-admin-go="jobs" type="button">Duyệt tin ngay</button>` : "<p>Không có tin tuyển dụng chờ duyệt.</p>"}</div>
  </section>`;
}

function adminStat(label, value, note) {
  return `<article class="admin-stat-card"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`;
}

function adminToolbar(placeholder, filter = "") {
  return `<form class="admin-toolbar" data-admin-search-form><input name="search" value="${escapeHtml(appState.adminSearch)}" placeholder="${placeholder}" /><select name="filter"><option value="">Tất cả</option>${filter}</select><button class="secondary-button" type="submit">Lọc</button><button class="ghost-button" data-admin-clear type="button">Xóa lọc</button></form>`;
}

function adminFiltered(items, textFor, filterFor) {
  const query = appState.adminSearch.toLowerCase();
  const filter = appState.adminFilter || "";
  return items.filter((item) => (!query || textFor(item).toLowerCase().includes(query)) && (!filter || filterFor(item) === filter));
}

function renderAdminUsers() {
  const users = adminFiltered(appState.users, (u) => `${u.name} ${u.email}`, (u) => u.role);
  return adminTableSection("Quản lý người dùng", "Khóa hoặc mở khóa tài khoản. Không thể thao tác trên chính tài khoản đang đăng nhập.", adminToolbar("Tìm tên hoặc email", '<option value="candidate">Ứng viên</option><option value="employer">Doanh nghiệp</option><option value="admin">Admin</option>'),
    ["Người dùng", "Vai trò", "Trạng thái", "Thao tác"], users.map((u) => `<tr><td><strong>${escapeHtml(u.name)}</strong><small>${escapeHtml(u.email)}</small></td><td>${adminRole(u.role)}</td><td>${adminBadge(u.locked ? "Đã khóa" : "Hoạt động", u.locked ? "danger" : "success")}</td><td>${u.id === appState.currentUser.id ? '<span class="admin-self">Tài khoản hiện tại</span>' : `<button class="compact-button" data-admin-user-lock="${u.id}" type="button">${u.locked ? "Mở khóa" : "Khóa"}</button>`}</td></tr>`).join(""));
}

function renderAdminJobs() {
  const jobs = adminFiltered(appState.jobs, (j) => `${j.title} ${j.company}`, (j) => j.status);
  return adminTableSection("Duyệt tin tuyển dụng", "Kiểm tra nội dung trước khi công khai tin tuyển dụng.", adminToolbar("Tìm tin hoặc công ty", '<option value="Pending">Chờ duyệt</option><option value="Approved">Đã duyệt</option><option value="Rejected">Từ chối</option><option value="Closed">Đã đóng</option>'),
    ["Tin tuyển dụng", "Địa điểm", "Mức lương", "Trạng thái", "Thao tác"], jobs.map((j) => `<tr><td><strong>${escapeHtml(j.title)}</strong><small>${escapeHtml(j.company)}</small></td><td>${escapeHtml(j.location)}</td><td>${escapeHtml(j.salary)}</td><td>${adminBadge(adminJobStatus(j.status), adminStatusTone(j.status))}</td><td class="admin-actions"><button class="compact-button" data-admin-job="${j.id}" data-status="Approved" type="button">Duyệt</button><button class="compact-button danger" data-admin-job="${j.id}" data-status="Rejected" type="button">Từ chối</button><button class="compact-button" data-admin-job="${j.id}" data-status="Closed" type="button">Đóng</button></td></tr>`).join(""));
}

function renderAdminCompanies() {
  const companies = adminFiltered(appState.users.filter((u) => u.role === "employer"), (u) => `${u.name} ${u.email}`, (u) => u.locked ? "locked" : "active");
  return adminTableSection("Quản lý doanh nghiệp", "Theo dõi và khóa tài khoản doanh nghiệp vi phạm.", adminToolbar("Tìm doanh nghiệp", '<option value="active">Hoạt động</option><option value="locked">Đã khóa</option>'), ["Doanh nghiệp", "Email", "Tin đã đăng", "Trạng thái", "Thao tác"], companies.map((u) => `<tr><td><strong>${escapeHtml(u.name)}</strong></td><td>${escapeHtml(u.email)}</td><td>${appState.jobs.filter((j) => String(j.company).toLowerCase().includes(String(u.name).replace(/^Cong ty /i, "").toLowerCase())).length}</td><td>${adminBadge(u.locked ? "Đã khóa" : "Hoạt động", u.locked ? "danger" : "success")}</td><td><button class="compact-button" data-admin-user-lock="${u.id}" type="button">${u.locked ? "Mở khóa" : "Khóa"}</button></td></tr>`).join(""));
}

function renderAdminApplications() {
  const items = adminFiltered(appState.applications, (a) => `${a.candidateName} ${a.jobTitle} ${a.company}`, (a) => a.status);
  return adminTableSection("Hồ sơ ứng tuyển", "Admin chỉ theo dõi. Việc xử lý hồ sơ thuộc trách nhiệm của doanh nghiệp.", adminToolbar("Tìm ứng viên, vị trí hoặc công ty"), ["Ứng viên", "Vị trí", "Doanh nghiệp", "Ngày nộp", "Trạng thái"], items.map((a) => `<tr><td><strong>${escapeHtml(a.candidateName)}</strong><small>${escapeHtml(a.cvName)}</small></td><td>${escapeHtml(a.jobTitle)}</td><td>${escapeHtml(a.company)}</td><td>${formatDate(a.appliedAt)}</td><td>${adminBadge(escapeHtml(a.status), "neutral")}</td></tr>`).join(""));
}

function renderAdminReports() {
  const reports = adminFiltered(appState.reports, (r) => `${r.reason || ""} ${r.details || ""} ${r.jobTitle || ""}`, (r) => String(r.status || "pending").toLowerCase() === "resolved" ? "Resolved" : "Pending");
  return adminTableSection("Báo cáo vi phạm", "Xem và đánh dấu các báo cáo đã xử lý.", adminToolbar("Tìm nội dung báo cáo", '<option value="Pending">Chờ xử lý</option><option value="Resolved">Đã xử lý</option>'), ["Đối tượng", "Lý do", "Ngày gửi", "Trạng thái", "Thao tác"], reports.map((r) => { const resolved = String(r.status).toLowerCase() === "resolved"; return `<tr><td><strong>${escapeHtml(r.jobTitle || `Tin #${r.jobId || "-"}`)}</strong></td><td>${escapeHtml(r.reason || r.details || r.description || "Không có mô tả")}</td><td>${formatDate(r.reportedAt || r.createdAt || new Date().toISOString())}</td><td>${adminBadge(resolved ? "Đã xử lý" : "Chờ xử lý", resolved ? "success" : "warning")}</td><td><button class="compact-button" data-admin-report="${r.id}" type="button">${resolved ? "Mở lại" : "Đã xử lý"}</button></td></tr>`; }).join(""));
}

function renderAdminLogs() {
  const logs = readStorage(STORAGE_KEYS.adminLogs, []);
  return adminTableSection("Nhật ký Admin", "Lịch sử các thay đổi do quản trị viên thực hiện.", "", ["Thời gian", "Quản trị viên", "Hành động"], logs.slice().reverse().map((l) => `<tr><td>${formatDate(l.createdAt)}</td><td>${escapeHtml(l.admin)}</td><td>${escapeHtml(l.message)}</td></tr>`).join(""));
}

function renderAdminSettings() {
  const settings = readStorage(STORAGE_KEYS.adminSettings, { siteName: "JobBridge", maintenance: false, autoPublish: false });
  return `<section class="admin-panel admin-settings"><h2>Cấu hình hệ thống</h2><form id="adminSettingsForm"><label>Tên hệ thống<input name="siteName" value="${escapeHtml(settings.siteName)}" required /></label><label class="admin-check"><input name="maintenance" type="checkbox" ${settings.maintenance ? "checked" : ""}/> Bật chế độ bảo trì</label><label class="admin-check"><input name="autoPublish" type="checkbox" ${settings.autoPublish ? "checked" : ""}/> Tự động công khai tin đã duyệt</label><button class="primary-button" type="submit">Lưu cấu hình</button></form></section>`;
}

function adminTableSection(title, description, toolbar, headings, rows) {
  return `<section class="admin-section"><div class="admin-section-heading"><h2>${title}</h2><p>${description}</p></div>${toolbar}<div class="admin-table-card"><div class="admin-table-wrapper"><table class="admin-table"><thead><tr>${headings.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows || `<tr><td colspan="${headings.length}" class="admin-empty">Không có dữ liệu phù hợp.</td></tr>`}</tbody></table></div></div></section>`;
}

function adminBadge(label, tone) { return `<span class="admin-badge ${tone}">${label}</span>`; }
function adminRole(role) { return role === "candidate" ? "Ứng viên" : role === "employer" ? "Doanh nghiệp" : "Admin"; }
function adminJobStatus(status) { return ({ Pending: "Chờ duyệt", Approved: "Đã duyệt", Rejected: "Từ chối", Closed: "Đã đóng" })[status] || status; }
function adminStatusTone(status) { return status === "Approved" ? "success" : status === "Pending" ? "warning" : status === "Rejected" ? "danger" : "neutral"; }

function bindAdminEvents() {
  document.querySelectorAll("[data-admin-tab], [data-admin-go]").forEach((button) => button.addEventListener("click", () => { appState.adminTab = button.dataset.adminTab || button.dataset.adminGo; appState.adminSearch = ""; appState.adminFilter = ""; renderAdminView(); }));
  document.querySelector("[data-admin-refresh]")?.addEventListener("click", () => { reloadAdminStorage(); renderAdminView(); showToast("Đã làm mới dữ liệu admin."); });
  document.querySelector("[data-admin-search-form]")?.addEventListener("submit", (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); appState.adminSearch = String(data.get("search") || "").trim(); appState.adminFilter = String(data.get("filter") || ""); renderAdminView(); });
  document.querySelector("[data-admin-clear]")?.addEventListener("click", () => { appState.adminSearch = ""; appState.adminFilter = ""; renderAdminView(); });
  document.querySelectorAll("[data-admin-user-lock]").forEach((button) => button.addEventListener("click", () => toggleAdminUser(Number(button.dataset.adminUserLock))));
  document.querySelectorAll("[data-admin-job]").forEach((button) => button.addEventListener("click", () => updateAdminJob(Number(button.dataset.adminJob), button.dataset.status)));
  document.querySelectorAll("[data-admin-report]").forEach((button) => button.addEventListener("click", () => toggleAdminReport(Number(button.dataset.adminReport))));
  document.querySelector("#adminSettingsForm")?.addEventListener("submit", saveAdminSettings);
}

function reloadAdminStorage() {
  appState.users = readStorage(STORAGE_KEYS.users, seedUsers).map(normalizeUser);
  appState.jobs = readStorage(STORAGE_KEYS.jobs, seedJobs).map(normalizeJob);
  appState.applications = readStorage(STORAGE_KEYS.applications, seedApplications).map(normalizeApplication);
  appState.reports = readStorage(STORAGE_KEYS.reports, seedJobReports);
}

function addAdminLog(message) {
  const logs = readStorage(STORAGE_KEYS.adminLogs, []);
  logs.push({ admin: appState.currentUser.name, message, createdAt: new Date().toISOString() });
  writeStorage(STORAGE_KEYS.adminLogs, logs.slice(-200));
}

function toggleAdminUser(userId) {
  const user = appState.users.find((item) => item.id === userId);
  if (!user || user.id === appState.currentUser.id) return;
  user.locked = !user.locked;
  writeStorage(STORAGE_KEYS.users, appState.users);
  addAdminLog(`${user.locked ? "Khóa" : "Mở khóa"} tài khoản ${user.email}`);
  showToast(`Đã ${user.locked ? "khóa" : "mở khóa"} tài khoản.`, "success"); renderAdminView();
}

function updateAdminJob(jobId, status) {
  const job = appState.jobs.find((item) => item.id === jobId); if (!job) return;
  job.status = status; job.updatedAt = new Date().toISOString(); writeStorage(STORAGE_KEYS.jobs, appState.jobs);
  addAdminLog(`${adminJobStatus(status)} tin “${job.title}”`); showToast("Đã cập nhật trạng thái tin tuyển dụng.", "success"); renderAdminView();
}

function toggleAdminReport(reportId) {
  const report = appState.reports.find((item) => Number(item.id) === reportId); if (!report) return;
  report.status = String(report.status).toLowerCase() === "resolved" ? "pending" : "resolved"; writeStorage(STORAGE_KEYS.reports, appState.reports);
  addAdminLog(`${report.status === "resolved" ? "Xử lý" : "Mở lại"} báo cáo vi phạm`); renderAdminView();
}

function saveAdminSettings(event) {
  event.preventDefault(); const data = new FormData(event.currentTarget);
  writeStorage(STORAGE_KEYS.adminSettings, { siteName: String(data.get("siteName")), maintenance: data.has("maintenance"), autoPublish: data.has("autoPublish") });
  addAdminLog("Cập nhật cấu hình hệ thống"); showToast("Đã lưu cấu hình hệ thống.", "success");
}
