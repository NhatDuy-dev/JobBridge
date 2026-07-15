// Bootstrap duy nhất của JobBridge SPA.
const ROLE_STYLESHEETS = {
  candidate: "../css/candidate/candidate.css",
  employer: "../css/company/company.css",
  admin: "../css/admin/admin.css",
};

document.addEventListener("DOMContentLoaded", initApp);
window.addEventListener("storage", handleRealtimeStorageUpdate);
window.addEventListener("popstate", handleCandidateRouteChange);

async function initApp() {
  if (window.location.port !== "3000") {
    window.location.replace(`http://localhost:3000${window.location.pathname === "/html/index.html" ? "/" : window.location.pathname}${window.location.search}${window.location.hash}`);
    return;
  }

  // Luôn bắt đầu từ màn hình đăng nhập khi mở hoặc tải lại ứng dụng.
  // Callback OAuth được giữ lại để service có thể hoàn tất phiên đăng nhập.
  const isOAuthCallback = new URL(window.location.href).searchParams.has("auth_code");
  if (!isOAuthCallback) {
    localStorage.removeItem(STORAGE_KEYS.session);
    localStorage.removeItem("jobbridge_api_token");
  }

  bootMockDatabase();
  appState.users = readStorage(STORAGE_KEYS.users, seedUsers).map(normalizeUser);
  appState.jobs = readStorage(STORAGE_KEYS.jobs, seedJobs).map(normalizeJob);
  appState.applications = readStorage(STORAGE_KEYS.applications, seedApplications).map(normalizeApplication);
  appState.cvs = readStorage(STORAGE_KEYS.cvs, seedCvs).map(normalizeCv);
  appState.reports = readStorage(STORAGE_KEYS.reports, seedJobReports);
  appState.notifications = readStorage(STORAGE_KEYS.notifications, seedNotifications).map(normalizeNotification);
  syncAppliedJobsFromApplications();
  appState.currentUser = hydrateSessionUser(readStorage(STORAGE_KEYS.session, null));

  writeStorage(STORAGE_KEYS.users, appState.users);
  writeStorage(STORAGE_KEYS.jobs, appState.jobs);
  writeStorage(STORAGE_KEYS.applications, appState.applications);
  writeStorage(STORAGE_KEYS.cvs, appState.cvs);
  writeStorage(STORAGE_KEYS.reports, appState.reports);
  writeStorage(STORAGE_KEYS.notifications, appState.notifications);

  if (await consumeOAuthCallback()) return;
  if (appState.currentUser) renderDashboard();
  else renderLogin();
}

function handleRealtimeStorageUpdate(event) {
  if (!appState.currentUser) return;
  const sharedKeys = [STORAGE_KEYS.users, STORAGE_KEYS.jobs, STORAGE_KEYS.applications, STORAGE_KEYS.reports, STORAGE_KEYS.notifications];
  if (!sharedKeys.includes(event.key)) return;
  if (event.key === STORAGE_KEYS.users) appState.users = readStorage(STORAGE_KEYS.users, seedUsers).map(normalizeUser);
  if (event.key === STORAGE_KEYS.jobs) appState.jobs = readStorage(STORAGE_KEYS.jobs, seedJobs).map(normalizeJob);
  if (event.key === STORAGE_KEYS.applications) appState.applications = readStorage(STORAGE_KEYS.applications, seedApplications).map(normalizeApplication);
  if (event.key === STORAGE_KEYS.reports) appState.reports = readStorage(STORAGE_KEYS.reports, seedJobReports);
  if (event.key === STORAGE_KEYS.notifications) appState.notifications = readStorage(STORAGE_KEYS.notifications, seedNotifications).map(normalizeNotification);
  if (event.key === STORAGE_KEYS.notifications && appState.currentUser.role === "candidate") {
    renderDashboard();
    return;
  }
  renderRoleView();
  refreshRealtimeLabels();
}

function renderDashboard() {
  const user = appState.currentUser;
  syncRoleStylesheet(user.role);
  document.body.dataset.role = user.role;

  app.innerHTML = `
    <header class="spa-topbar">
      <button id="homeLogoButton" class="spa-brand brand-home-button" type="button" aria-label="Về trang chủ">
        ${renderBrandLogo()}
      </button>
      ${renderSiteNavigation()}
      ${renderTopbarUserArea(user)}
    </header>
    <main id="dashboardRoot" class="spa-dashboard"></main>
    ${renderTopEmployers()}
    ${renderSiteFooter(user)}
  `;

  document.querySelector("#homeLogoButton")?.addEventListener("click", goToDashboardHome);
  if (user.role === "candidate") bindCandidateAccountMenu();
  else document.querySelector("#logoutButton")?.addEventListener("click", logout);

  renderRoleView();
  mountSupportChatbox();
  bindSiteFooter();
  bindTopEmployers();
  startRealtimeUpdates();
}

function renderRoleView() {
  const role = appState.currentUser?.role;
  if (role === "candidate") return renderCandidateRoute();
  if (role === "employer") return renderCompanyView();
  if (role === "admin") return renderAdminView();
  throw new Error(`Vai trò không được hỗ trợ: ${role || "unknown"}`);
}

function goToDashboardHome() {
  if (appState.currentUser?.role === "candidate") {
    closeJobDetailModal();
    closeApplicationModal();
    closeJobReportModal();
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
  }
  renderRoleView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function syncRoleStylesheet(role) {
  const current = document.querySelector("#roleStylesheet");
  const href = ROLE_STYLESHEETS[role];
  if (!href) {
    current?.remove();
    delete document.body.dataset.role;
    return;
  }
  if (current?.getAttribute("href") === href) return;
  const link = current || document.createElement("link");
  link.id = "roleStylesheet";
  link.rel = "stylesheet";
  link.href = href;
  if (!current) document.head.append(link);
}
