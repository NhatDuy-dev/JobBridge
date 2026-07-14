function renderCompanyOverview() {
  const content = document.querySelector("#companyTabContent");
  if (!content) return;
  const jobs = companyJobs();
  const applications = companyApplications();
  const activeJobs = jobs.filter((job) => job.status === "Approved").length;
  const pendingJobs = jobs.filter((job) => job.status === "Pending").length;
  const hiredCandidates = applications.filter((application) => application.status === "Da tuyen").length;
  const recentApplications = applications.slice(0, 5);

  content.innerHTML = `
    <section class="company-welcome-band">
      <div>
        <p class="company-kicker">Bảng điều hành tuyển dụng</p>
        <h2>Chào ${escapeHtml(companyDisplayName())}</h2>
        <p>Theo dõi tin tuyển dụng và xử lý hồ sơ ứng viên trong cùng một quy trình.</p>
      </div>
      <div class="company-welcome-actions">
        <button class="company-button company-button-primary" data-overview-create type="button">${companyIcon("plus")}Đăng tin tuyển dụng</button>
        <button class="company-button company-button-secondary" data-overview-applications type="button">${companyIcon("users")}Xem ứng viên</button>
      </div>
    </section>

    <section class="company-stat-grid" aria-label="Chỉ số tuyển dụng">
      ${renderCompanyStat("Tin đang tuyển", activeJobs, "Tin đã được admin duyệt", "success", "briefcase")}
      ${renderCompanyStat("Tin chờ duyệt", pendingJobs, "Đang chờ admin xử lý", "warning", "calendar")}
      ${renderCompanyStat("Tổng hồ sơ", applications.length, "Ứng viên đã gửi đơn", "info", "users")}
      ${renderCompanyStat("Đã tuyển", hiredCandidates, "Hồ sơ hoàn tất tuyển dụng", "neutral", "check")}
    </section>

    <div class="company-dashboard-grid">
      <section class="company-panel company-recent-panel">
        <div class="company-panel-heading">
          <div><p>Hồ sơ mới nhất</p><h2>Ứng viên gần đây</h2></div>
          <button class="company-text-button" data-overview-applications type="button">Xem tất cả ${companyIcon("arrow")}</button>
        </div>
        ${recentApplications.length ? renderCompanyRecentApplications(recentApplications) : companyEmptyState("Chưa có hồ sơ ứng tuyển", "Hồ sơ ứng viên sẽ xuất hiện tại đây sau khi họ nộp đơn.")}
      </section>

      <section class="company-panel company-progress-panel">
        <div class="company-panel-heading"><div><p>Hiệu quả tin đăng</p><h2>Tình trạng tuyển dụng</h2></div></div>
        ${jobs.length ? renderCompanyJobProgress(jobs, applications) : companyEmptyState("Chưa có tin tuyển dụng", "Tạo tin đầu tiên để bắt đầu nhận hồ sơ.", '<button class="company-button company-button-secondary" data-overview-create type="button">Tạo tin ngay</button>')}
      </section>
    </div>
  `;

  content.querySelectorAll("[data-overview-create]").forEach((button) => button.addEventListener("click", () => openCompanyJobForm()));
  content.querySelectorAll("[data-overview-applications]").forEach((button) => button.addEventListener("click", () => companyGoToTab("applications")));
  content.querySelectorAll("[data-overview-application]").forEach((button) => button.addEventListener("click", () => openCompanyApplicationDetail(button.dataset.overviewApplication)));
}

function renderCompanyStat(label, value, caption, tone, icon) {
  return `
    <article class="company-stat company-stat-${tone}">
      <span class="company-stat-icon">${companyIcon(icon)}</span>
      <div><strong>${formatNumber(value)}</strong><h3>${escapeHtml(label)}</h3><p>${escapeHtml(caption)}</p></div>
    </article>
  `;
}

function renderCompanyRecentApplications(applications) {
  return `<div class="company-recent-list">${applications
    .map((application) => {
      const job = companyFindJob(application.jobId);
      return `
        <button class="company-recent-row" data-overview-application="${application.id}" type="button">
          <span class="company-avatar">${escapeHtml(getInitials(application.candidateName || "Ứng viên"))}</span>
          <span class="company-recent-copy"><strong>${escapeHtml(application.candidateName || "Ứng viên")}</strong><small>${escapeHtml(job?.title || application.jobTitle || "Vị trí tuyển dụng")}</small></span>
          ${companyStatusBadge(application.status, "application")}
          <time>${escapeHtml(formatDate(application.appliedAt))}</time>
        </button>
      `;
    })
    .join("")}</div>`;
}

function renderCompanyJobProgress(jobs, applications) {
  return `<div class="company-progress-list">${jobs
    .slice(0, 5)
    .map((job) => {
      const count = applications.filter((application) => Number(application.jobId) === Number(job.id)).length;
      const width = Math.min(100, Math.max(8, count * 18));
      return `
        <div class="company-progress-row">
          <div><strong>${escapeHtml(job.title)}</strong>${companyStatusBadge(job.status)}</div>
          <div class="company-progress-track"><span style="width:${width}%"></span></div>
          <small>${formatNumber(count)} hồ sơ</small>
        </div>
      `;
    })
    .join("")}</div>`;
}
