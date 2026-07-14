// Trạng thái giao diện và hàm dùng chung cho khu vực nhà tuyển dụng.
const COMPANY_TAB_CONFIG = {
  home: { label: "Tổng quan", icon: "dashboard" },
  jobs: { label: "Tin tuyển dụng", icon: "briefcase" },
  applications: { label: "Đơn ứng tuyển", icon: "users" },
  profile: { label: "Hồ sơ công ty", icon: "building" },
};

const COMPANY_APPLICATION_STATUSES = [
  { value: "Da nop", label: "Mới nhận" },
  { value: "Len lich phong van", label: "Phỏng vấn" },
  { value: "Da tuyen", label: "Đã tuyển" },
  { value: "Tu choi", label: "Từ chối" },
];

const companyUiState = {
  jobSearch: "",
  jobStatus: "all",
  applicationSearch: "",
  applicationJobId: "all",
  applicationStatus: "all",
  openCreateJobAfterRender: false,
};

function companyNormalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function companyDisplayName(user = appState.currentUser) {
  return String(user?.name || "Doanh nghiệp JobBridge")
    .replace(/^(công ty|cong ty|company)\s+/i, "")
    .trim();
}

function companyOwnsJob(job) {
  if (!job || !appState.currentUser) return false;
  if (Number(job.employerId) === Number(appState.currentUser.id)) return true;
  if (job.employerId !== undefined && job.employerId !== null) return false;
  return companyNormalizeText(job.company) === companyNormalizeText(companyDisplayName());
}

function companyJobs() {
  return appState.jobs
    .filter(companyOwnsJob)
    .sort((first, second) => getJobTimestamp(second) - getJobTimestamp(first));
}

function companyApplications() {
  const jobIds = new Set(companyJobs().map((job) => Number(job.id)));
  return appState.applications
    .filter((application) => jobIds.has(Number(application.jobId)) && !application.withdrawnAt)
    .sort((first, second) => Date.parse(second.appliedAt || 0) - Date.parse(first.appliedAt || 0));
}

function companyFindJob(jobId) {
  return appState.jobs.find((job) => Number(job.id) === Number(jobId) && companyOwnsJob(job));
}

function companyFindCandidate(candidateId) {
  return appState.users.find((user) => Number(user.id) === Number(candidateId) && user.role === "candidate");
}

function companyJobStatus(status) {
  const statuses = {
    Pending: { label: "Chờ duyệt", tone: "warning" },
    Approved: { label: "Đang tuyển", tone: "success" },
    Rejected: { label: "Bị từ chối", tone: "danger" },
    Closed: { label: "Đã đóng", tone: "neutral" },
  };
  return statuses[status] || { label: status || "Không xác định", tone: "neutral" };
}

function companyApplicationStatus(status) {
  const item = COMPANY_APPLICATION_STATUSES.find((entry) => entry.value === status);
  const tones = {
    "Da nop": "info",
    "Len lich phong van": "warning",
    "Da tuyen": "success",
    "Tu choi": "danger",
  };
  return { label: item?.label || status || "Không xác định", tone: tones[status] || "neutral" };
}

function companyStatusBadge(status, type = "job") {
  const metadata = type === "application" ? companyApplicationStatus(status) : companyJobStatus(status);
  return `<span class="company-status company-status-${metadata.tone}">${escapeHtml(metadata.label)}</span>`;
}

function companyNextId(items) {
  return Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1;
}

function companyPersistJobs() {
  writeStorage(STORAGE_KEYS.jobs, appState.jobs);
}

function companyPersistApplications() {
  writeStorage(STORAGE_KEYS.applications, appState.applications);
}

function companyGoToTab(tab, options = {}) {
  appState.companyTab = COMPANY_TAB_CONFIG[tab] ? tab : "home";
  companyUiState.openCreateJobAfterRender = Boolean(options.createJob);
  renderCompanyView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function companyOpenModal(content, className = "") {
  companyCloseModal();
  const modal = document.createElement("div");
  modal.id = "companyModal";
  modal.className = "company-modal-backdrop";
  modal.innerHTML = `<section class="company-modal ${escapeHtml(className)}" role="dialog" aria-modal="true">${content}</section>`;
  document.body.append(modal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.closest("[data-company-modal-close]")) companyCloseModal();
  });
  document.addEventListener("keydown", companyHandleModalEscape);
  modal.querySelector("input, select, textarea, button")?.focus();
  return modal;
}

function companyCloseModal() {
  document.querySelector("#companyModal")?.remove();
  document.removeEventListener("keydown", companyHandleModalEscape);
}

function companyHandleModalEscape(event) {
  if (event.key === "Escape") companyCloseModal();
}

function companyIcon(name) {
  const paths = {
    dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    briefcase: '<path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M3 12h18M10 12v2h4v-2"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 21v-4h6v4M8 7h2M14 7h2M8 11h2M14 11h2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    close: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    file: '<path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5M9 13h6M9 17h6"/>',
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  };
  return `<svg class="company-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.dashboard}</svg>`;
}

function companyEmptyState(title, description, action = "") {
  return `
    <div class="company-empty-state">
      <span class="company-empty-icon">${companyIcon("file")}</span>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
      ${action}
    </div>
  `;
}
