// Điểm vào của khu vực công ty; các màn hình chi tiết nằm trong từng file riêng.
function renderCompanyView() {
  const root = document.querySelector("#dashboardRoot");
  if (!root) return;

  if (appState.companyTab === "post") {
    appState.companyTab = "jobs";
    companyUiState.openCreateJobAfterRender = true;
  }
  if (appState.companyTab === "kanban") appState.companyTab = "applications";
  if (!COMPANY_TAB_CONFIG[appState.companyTab]) appState.companyTab = "home";

  const activeTab = COMPANY_TAB_CONFIG[appState.companyTab];
  root.innerHTML = `
    <div class="company-app">
      <aside class="company-sidebar" aria-label="Điều hướng nhà tuyển dụng">
        <div class="company-sidebar-heading">
          <span class="company-logo-mark">${escapeHtml(getInitials(companyDisplayName()))}</span>
          <div>
            <strong>${escapeHtml(companyDisplayName())}</strong>
            <span>Trung tâm tuyển dụng</span>
          </div>
        </div>
        <nav class="company-nav">
          ${Object.entries(COMPANY_TAB_CONFIG)
            .map(
              ([key, item]) => `
                <button class="company-nav-item ${appState.companyTab === key ? "active" : ""}" data-company-tab="${key}" type="button">
                  ${companyIcon(item.icon)}
                  <span>${escapeHtml(item.label)}</span>
                  ${key === "applications" && companyApplications().length ? `<small>${companyApplications().length}</small>` : ""}
                </button>
              `,
            )
            .join("")}
        </nav>
        <div class="company-sidebar-note">
          <strong>Quy trình tuyển dụng</strong>
          <p>Tin mới được gửi đến admin duyệt. Hồ sơ ứng viên do công ty trực tiếp xử lý.</p>
        </div>
      </aside>

      <section class="company-main">
        <header class="company-page-header">
          <div>
            <p class="company-breadcrumb">Nhà tuyển dụng / ${escapeHtml(activeTab.label)}</p>
            <h1>${escapeHtml(activeTab.label)}</h1>
          </div>
          <button class="company-button company-button-primary" data-company-create-job type="button" aria-label="Đăng tin mới">
            ${companyIcon("plus")}<span>Đăng tin mới</span>
          </button>
        </header>
        <div id="companyTabContent" class="company-content"></div>
      </section>
    </div>
  `;

  root.querySelectorAll("[data-company-tab]").forEach((button) => {
    button.addEventListener("click", () => companyGoToTab(button.dataset.companyTab));
  });
  root.querySelector("[data-company-create-job]")?.addEventListener("click", () => openCompanyJobForm());
  renderCompanyTabContent();
}

function renderCompanyTabContent() {
  companyCloseModal();
  if (appState.companyTab === "jobs") renderCompanyJobs();
  else if (appState.companyTab === "applications") renderCompanyApplications();
  else if (appState.companyTab === "profile") renderCompanyProfile();
  else renderCompanyOverview();

  if (companyUiState.openCreateJobAfterRender) {
    companyUiState.openCreateJobAfterRender = false;
    openCompanyJobForm();
  }
}
