function renderCompanyApplications() {
  const content = document.querySelector("#companyTabContent");
  if (!content) return;
  const jobs = companyJobs();
  const allApplications = companyApplications();
  const search = companyNormalizeText(companyUiState.applicationSearch);
  const applications = allApplications.filter((application) => {
    const job = companyFindJob(application.jobId);
    const searchable = companyNormalizeText(`${application.candidateName} ${application.cvName} ${job?.title || application.jobTitle}`);
    const matchesSearch = !search || searchable.includes(search);
    const matchesJob = companyUiState.applicationJobId === "all" || Number(application.jobId) === Number(companyUiState.applicationJobId);
    const matchesStatus = companyUiState.applicationStatus === "all" || application.status === companyUiState.applicationStatus;
    return matchesSearch && matchesJob && matchesStatus;
  });

  content.innerHTML = `
    <section class="company-pipeline" aria-label="Quy trình xử lý hồ sơ">
      ${COMPANY_APPLICATION_STATUSES.map((status) => {
        const count = allApplications.filter((application) => application.status === status.value).length;
        return `<button class="company-pipeline-step ${companyUiState.applicationStatus === status.value ? "active" : ""}" data-pipeline-status="${status.value}" type="button"><span>${escapeHtml(status.label)}</span><strong>${formatNumber(count)}</strong></button>`;
      }).join("")}
    </section>

    <section class="company-panel company-toolbar-panel">
      <form id="companyApplicationFilters" class="company-toolbar company-application-toolbar">
        <label class="company-search-field">
          <span class="sr-only">Tìm ứng viên</span>${companyIcon("search")}
          <input name="applicationSearch" type="search" value="${escapeHtml(companyUiState.applicationSearch)}" placeholder="Tìm tên ứng viên hoặc CV" />
        </label>
        <label class="company-filter-field"><span>Tin tuyển dụng</span><select name="applicationJobId">${companyOption("all", "Tất cả tin tuyển dụng", companyUiState.applicationJobId)}${jobs.map((job) => companyOption(String(job.id), job.title, companyUiState.applicationJobId)).join("")}</select></label>
        <label class="company-filter-field"><span>Trạng thái</span><select name="applicationStatus">${companyOption("all", "Tất cả trạng thái", companyUiState.applicationStatus)}${COMPANY_APPLICATION_STATUSES.map((status) => companyOption(status.value, status.label, companyUiState.applicationStatus)).join("")}</select></label>
        <button class="company-button company-button-secondary" type="submit">${companyIcon("search")}Lọc hồ sơ</button>
      </form>
    </section>

    <section class="company-panel company-table-panel">
      <div class="company-panel-heading">
        <div><p>Danh sách ứng viên</p><h2>${formatNumber(applications.length)} hồ sơ phù hợp</h2></div>
        <p class="company-panel-note">Công ty trực tiếp phỏng vấn, tuyển hoặc từ chối ứng viên.</p>
      </div>
      ${applications.length ? renderCompanyApplicationTable(applications) : companyEmptyState("Chưa có hồ sơ phù hợp", "Hãy đổi bộ lọc hoặc chờ ứng viên nộp đơn vào tin đang tuyển.")}
    </section>
  `;

  content.querySelector("#companyApplicationFilters")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    companyUiState.applicationSearch = String(data.get("applicationSearch") || "").trim();
    companyUiState.applicationJobId = String(data.get("applicationJobId") || "all");
    companyUiState.applicationStatus = String(data.get("applicationStatus") || "all");
    renderCompanyApplications();
  });
  content.querySelectorAll('[name="applicationJobId"], [name="applicationStatus"]').forEach((select) => {
    select.addEventListener("change", () => {
      companyUiState.applicationJobId = content.querySelector('[name="applicationJobId"]').value;
      companyUiState.applicationStatus = content.querySelector('[name="applicationStatus"]').value;
      renderCompanyApplications();
    });
  });
  content.querySelectorAll("[data-pipeline-status]").forEach((button) => {
    button.addEventListener("click", () => {
      companyUiState.applicationStatus = companyUiState.applicationStatus === button.dataset.pipelineStatus ? "all" : button.dataset.pipelineStatus;
      renderCompanyApplications();
    });
  });
  content.querySelectorAll("[data-application-detail]").forEach((button) => button.addEventListener("click", () => openCompanyApplicationDetail(button.dataset.applicationDetail)));
}

function renderCompanyApplicationTable(applications) {
  return `
    <div class="company-table-scroll">
      <table class="company-table company-applications-table">
        <thead><tr><th>Ứng viên</th><th>Vị trí ứng tuyển</th><th>Ngày nộp</th><th>Trạng thái</th><th></th></tr></thead>
        <tbody>${applications.map((application) => {
          const job = companyFindJob(application.jobId);
          const candidate = companyFindCandidate(application.candidateId);
          return `
            <tr>
              <td data-label="Ứng viên"><div class="company-candidate-cell"><span class="company-avatar">${escapeHtml(getInitials(application.candidateName || candidate?.name || "UV"))}</span><div><strong>${escapeHtml(application.candidateName || candidate?.name || "Ứng viên")}</strong><small>${escapeHtml(candidate?.email || application.cvName || "Hồ sơ JobBridge")}</small></div></div></td>
              <td data-label="Vị trí"><strong>${escapeHtml(job?.title || application.jobTitle || "Tin tuyển dụng")}</strong><small class="company-cell-secondary">${escapeHtml(application.cvName || "CV ứng tuyển")}</small></td>
              <td data-label="Ngày nộp"><time>${escapeHtml(formatDate(application.appliedAt))}</time></td>
              <td data-label="Trạng thái">${companyStatusBadge(application.status, "application")}</td>
              <td class="company-table-action-single"><button class="company-button company-button-secondary company-button-small" data-application-detail="${application.id}" type="button">${companyIcon("eye")}Xem hồ sơ</button></td>
            </tr>
          `;
        }).join("")}</tbody>
      </table>
    </div>
  `;
}

function openCompanyApplicationDetail(applicationId) {
  const application = companyApplications().find((item) => Number(item.id) === Number(applicationId));
  if (!application) {
    showToast("Không tìm thấy hồ sơ ứng tuyển thuộc công ty.", "error");
    return;
  }
  const job = companyFindJob(application.jobId);
  const candidate = companyFindCandidate(application.candidateId);
  const modal = companyOpenModal(`
    <header class="company-modal-header">
      <div><p>Chi tiết hồ sơ</p><h2>${escapeHtml(application.candidateName || candidate?.name || "Ứng viên")}</h2></div>
      <button class="company-icon-button" data-company-modal-close type="button" aria-label="Đóng">${companyIcon("close")}</button>
    </header>
    <div class="company-application-detail">
      <section class="company-candidate-summary">
        <span class="company-avatar company-avatar-large">${escapeHtml(getInitials(application.candidateName || candidate?.name || "UV"))}</span>
        <div><h3>${escapeHtml(application.candidateName || candidate?.name || "Ứng viên")}</h3><p>${escapeHtml(candidate?.desiredTitle || job?.title || "Ứng viên JobBridge")}</p><div class="company-contact-list"><span>${escapeHtml(candidate?.email || "Chưa có email")}</span><span>${escapeHtml(candidate?.phone || "Chưa có số điện thoại")}</span><span>${escapeHtml(candidate?.location || "Chưa cập nhật địa điểm")}</span></div></div>
      </section>
      <div class="company-detail-grid">
        <section class="company-detail-section"><h3>Thông tin ứng tuyển</h3><dl><div><dt>Vị trí</dt><dd>${escapeHtml(job?.title || application.jobTitle || "Tin tuyển dụng")}</dd></div><div><dt>Ngày nộp</dt><dd>${escapeHtml(formatDate(application.appliedAt))}</dd></div><div><dt>CV đã chọn</dt><dd>${escapeHtml(application.cvName || "CV ứng tuyển")}</dd></div></dl></section>
        <section class="company-detail-section"><h3>Năng lực ứng viên</h3><dl><div><dt>Kinh nghiệm</dt><dd>${escapeHtml(candidate?.experienceLevel || "Chưa cập nhật")}</dd></div><div><dt>Học vấn</dt><dd>${escapeHtml(candidate?.education || "Chưa cập nhật")}</dd></div><div><dt>Kỹ năng</dt><dd>${escapeHtml(candidate?.skills?.join(", ") || "Chưa cập nhật")}</dd></div></dl></section>
      </div>
      <section class="company-cover-letter"><h3>Thư giới thiệu</h3><p>${escapeHtml(application.coverLetter || "Ứng viên chưa gửi thư giới thiệu.")}</p></section>
      <form id="companyApplicationStatusForm" class="company-status-form">
        <label>Trạng thái xử lý<select name="status">${COMPANY_APPLICATION_STATUSES.map((status) => companyOption(status.value, status.label, application.status)).join("")}</select></label>
        <button class="company-button company-button-primary" type="submit">${companyIcon("check")}Cập nhật trạng thái</button>
      </form>
    </div>
  `, "company-modal-large");
  modal.querySelector("#companyApplicationStatusForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = new FormData(event.currentTarget).get("status");
    updateCompanyApplicationStatus(application.id, status);
  });
}

function updateCompanyApplicationStatus(applicationId, status) {
  if (!COMPANY_APPLICATION_STATUSES.some((item) => item.value === status)) {
    showToast("Trạng thái hồ sơ không hợp lệ.", "error");
    return;
  }
  const ownedApplication = companyApplications().find((item) => Number(item.id) === Number(applicationId));
  if (!ownedApplication) return;
  appState.applications = appState.applications.map((application) => Number(application.id) === Number(ownedApplication.id) ? { ...application, status, updatedAt: new Date().toISOString() } : application);
  companyPersistApplications();
  companyCloseModal();
  renderCompanyTabContent();
  showToast(`Đã chuyển hồ sơ sang “${companyApplicationStatus(status).label}”.`, "success");
}
