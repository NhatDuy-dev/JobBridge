function renderCompanyJobs() {
  const content = document.querySelector("#companyTabContent");
  if (!content) return;
  const search = companyNormalizeText(companyUiState.jobSearch);
  const jobs = companyJobs().filter((job) => {
    const matchesSearch = !search || companyNormalizeText(`${job.title} ${job.location} ${job.type}`).includes(search);
    const matchesStatus = companyUiState.jobStatus === "all" || job.status === companyUiState.jobStatus;
    return matchesSearch && matchesStatus;
  });

  content.innerHTML = `
    <section class="company-panel company-toolbar-panel">
      <form id="companyJobFilters" class="company-toolbar">
        <label class="company-search-field">
          <span class="sr-only">Tìm tin tuyển dụng</span>
          ${companyIcon("search")}
          <input name="jobSearch" type="search" value="${escapeHtml(companyUiState.jobSearch)}" placeholder="Tìm theo vị trí hoặc địa điểm" />
        </label>
        <label class="company-filter-field">
          <span>Trạng thái</span>
          <select name="jobStatus">
            ${companyOption("all", "Tất cả trạng thái", companyUiState.jobStatus)}
            ${companyOption("Approved", "Đang tuyển", companyUiState.jobStatus)}
            ${companyOption("Pending", "Chờ duyệt", companyUiState.jobStatus)}
            ${companyOption("Rejected", "Bị từ chối", companyUiState.jobStatus)}
            ${companyOption("Closed", "Đã đóng", companyUiState.jobStatus)}
          </select>
        </label>
        <button class="company-button company-button-secondary" type="submit">${companyIcon("search")}Tìm kiếm</button>
      </form>
    </section>

    <section class="company-panel company-table-panel">
      <div class="company-panel-heading">
        <div><p>Danh sách tin</p><h2>${formatNumber(jobs.length)} tin tuyển dụng</h2></div>
        <p class="company-panel-note">Tin mới và tin chỉnh sửa sẽ chuyển về trạng thái chờ admin duyệt.</p>
      </div>
      ${jobs.length ? renderCompanyJobTable(jobs) : companyEmptyState("Không tìm thấy tin tuyển dụng", "Hãy thay đổi bộ lọc hoặc tạo một tin tuyển dụng mới.", '<button class="company-button company-button-primary" data-empty-create-job type="button">Đăng tin mới</button>')}
    </section>
  `;

  content.querySelector("#companyJobFilters")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    companyUiState.jobSearch = String(data.get("jobSearch") || "").trim();
    companyUiState.jobStatus = String(data.get("jobStatus") || "all");
    renderCompanyJobs();
  });
  content.querySelector('[name="jobStatus"]')?.addEventListener("change", (event) => {
    companyUiState.jobStatus = event.target.value;
    renderCompanyJobs();
  });
  content.querySelector("[data-empty-create-job]")?.addEventListener("click", () => openCompanyJobForm());
  bindCompanyJobActions(content);
}

function renderCompanyJobTable(jobs) {
  const applications = companyApplications();
  return `
    <div class="company-table-scroll">
      <table class="company-table company-jobs-table">
        <thead><tr><th>Vị trí tuyển dụng</th><th>Trạng thái</th><th>Hồ sơ</th><th>Cập nhật</th><th><span class="sr-only">Thao tác</span></th></tr></thead>
        <tbody>
          ${jobs
            .map((job) => {
              const applicationCount = applications.filter((application) => Number(application.jobId) === Number(job.id)).length;
              return `
                <tr>
                  <td data-label="Vị trí">
                    <div class="company-job-title"><span class="company-job-mark">${escapeHtml(getInitials(job.title))}</span><div><strong>${escapeHtml(job.title)}</strong><small>${escapeHtml(job.location)} · ${escapeHtml(job.type)} · ${escapeHtml(job.salary)}</small></div></div>
                  </td>
                  <td data-label="Trạng thái">${companyStatusBadge(job.status)}</td>
                  <td data-label="Hồ sơ"><button class="company-count-link" data-job-applications="${job.id}" type="button">${formatNumber(applicationCount)} hồ sơ</button></td>
                  <td data-label="Cập nhật"><time>${escapeHtml(formatDate(job.updatedAt || job.createdAt))}</time></td>
                  <td class="company-table-actions">
                    <button class="company-icon-button" data-job-edit="${job.id}" type="button" title="Chỉnh sửa tin" aria-label="Chỉnh sửa ${escapeHtml(job.title)}">${companyIcon("edit")}</button>
                    <button class="company-icon-button" data-job-copy="${job.id}" type="button" title="Nhân bản tin" aria-label="Nhân bản ${escapeHtml(job.title)}">${companyIcon("copy")}</button>
                    ${job.status === "Approved" ? `<button class="company-icon-button" data-job-toggle="${job.id}" type="button" title="Đóng tin" aria-label="Đóng ${escapeHtml(job.title)}">${companyIcon("close")}</button>` : ""}
                    ${job.status === "Closed" ? `<button class="company-icon-button" data-job-toggle="${job.id}" type="button" title="Gửi duyệt lại" aria-label="Gửi duyệt lại ${escapeHtml(job.title)}">${companyIcon("arrow")}</button>` : ""}
                    <button class="company-icon-button company-icon-button-danger" data-job-delete="${job.id}" type="button" title="Xóa tin" aria-label="Xóa ${escapeHtml(job.title)}">${companyIcon("trash")}</button>
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function bindCompanyJobActions(scope) {
  scope.querySelectorAll("[data-job-edit]").forEach((button) => button.addEventListener("click", () => openCompanyJobForm(button.dataset.jobEdit)));
  scope.querySelectorAll("[data-job-copy]").forEach((button) => button.addEventListener("click", () => duplicateCompanyJob(button.dataset.jobCopy)));
  scope.querySelectorAll("[data-job-toggle]").forEach((button) => button.addEventListener("click", () => toggleCompanyJob(button.dataset.jobToggle)));
  scope.querySelectorAll("[data-job-delete]").forEach((button) => button.addEventListener("click", () => deleteCompanyJob(button.dataset.jobDelete)));
  scope.querySelectorAll("[data-job-applications]").forEach((button) => {
    button.addEventListener("click", () => {
      companyUiState.applicationJobId = String(button.dataset.jobApplications);
      companyGoToTab("applications");
    });
  });
}

function openCompanyJobForm(jobId = null) {
  const job = jobId ? companyFindJob(jobId) : null;
  if (jobId && !job) {
    showCompanyToast("Không tìm thấy tin tuyển dụng thuộc công ty.", "error");
    return;
  }
  const modal = companyOpenModal(`
    <header class="company-modal-header">
      <div><p>${job ? "Chỉnh sửa tin" : "Tin tuyển dụng mới"}</p><h2>${job ? escapeHtml(job.title) : "Tạo tin tuyển dụng"}</h2></div>
      <button class="company-icon-button" data-company-modal-close type="button" aria-label="Đóng">${companyIcon("close")}</button>
    </header>
    <form id="companyJobForm" class="company-form">
      <div class="company-form-grid">
        <label class="company-field company-field-wide">Tiêu đề công việc<input name="title" value="${escapeHtml(job?.title || "")}" maxlength="120" placeholder="VD: Lập trình viên Frontend" required /></label>
        <label class="company-field">Hình thức<select name="type">${companyOption("Full-time", "Toàn thời gian", job?.type)}${companyOption("Part-time", "Bán thời gian", job?.type)}${companyOption("Remote", "Làm việc từ xa", job?.type)}${companyOption("Internship", "Thực tập", job?.type)}</select></label>
        <label class="company-field">Địa điểm<input name="location" value="${escapeHtml(job?.location || appState.currentUser.location || "")}" maxlength="100" placeholder="VD: TP.HCM" required /></label>
        <label class="company-field">Lương tối thiểu (triệu)<input name="minSalary" type="number" min="0" max="500" value="${Number(job?.minSalary || 0)}" required /></label>
        <label class="company-field">Lương tối đa (triệu)<input name="maxSalary" type="number" min="0" max="500" value="${Number(job?.maxSalary || 0)}" required /></label>
        <label class="company-field">Ngành nghề<select name="category">${companyOption("IT - Cong nghe thong tin", "IT - Công nghệ thông tin", job?.category || "IT - Cong nghe thong tin")}${jobCategories.map((item) => companyOption(item.value, item.label, job?.category)).join("")}</select></label>
        <label class="company-field">Kinh nghiệm<select name="experience">${experienceOptions.map((item) => companyOption(item.value, item.label, job?.experience)).join("")}</select></label>
        <label class="company-field">Lĩnh vực công ty<select name="companyField">${companyFields.filter((item) => item.value).map((item) => companyOption(item.value, item.label, job?.companyField)).join("")}</select></label>
        <label class="company-field">Lĩnh vực công việc<select name="jobField">${jobFields.filter((item) => item.value).map((item) => companyOption(item.value, item.label, job?.jobField)).join("")}</select></label>
        <label class="company-field">Làm thứ Bảy<select name="saturday">${companyOption("off", "Không làm", job?.saturday || "unknown")}${companyOption("work", "Có làm", job?.saturday || "unknown")}${companyOption("unknown", "Trao đổi khi phỏng vấn", job?.saturday || "unknown")}</select></label>
        <label class="company-field company-field-wide">Mô tả công việc<textarea name="description" minlength="20" maxlength="3000" placeholder="Mô tả trách nhiệm, yêu cầu và quyền lợi..." required>${escapeHtml(job?.description || "")}</textarea></label>
      </div>
      <div id="companyJobFormMessage" class="company-form-message" aria-live="polite"></div>
      <footer class="company-modal-actions">
        <button class="company-button company-button-secondary" data-company-modal-close type="button">Hủy</button>
        <button class="company-button company-button-primary" type="submit">${companyIcon("check")}${job ? "Lưu và gửi duyệt lại" : "Tạo và gửi duyệt"}</button>
      </footer>
    </form>
  `, "company-modal-large");
  modal.querySelector("#companyJobForm")?.addEventListener("submit", (event) => saveCompanyJob(event, job));
}

function saveCompanyJob(event, existingJob) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const minSalary = Number(data.get("minSalary"));
  const maxSalary = Number(data.get("maxSalary"));
  const description = String(data.get("description") || "").trim();
  if (maxSalary < minSalary) {
    showCompanyJobFormMessage("Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu.");
    return;
  }
  if (description.length < 20) {
    showCompanyJobFormMessage("Mô tả công việc cần ít nhất 20 ký tự.");
    return;
  }

  const now = new Date().toISOString();
  const draft = normalizeJob({
    ...(existingJob || {}),
    id: existingJob?.id || companyNextId(appState.jobs),
    employerId: appState.currentUser.id,
    title: String(data.get("title") || "").trim(),
    company: companyDisplayName(),
    salary: `${minSalary} - ${maxSalary} triệu`,
    minSalary,
    maxSalary,
    location: String(data.get("location") || "").trim(),
    type: String(data.get("type") || "Full-time"),
    status: "Pending",
    description,
    category: String(data.get("category") || ""),
    experience: String(data.get("experience") || ""),
    companyField: String(data.get("companyField") || ""),
    jobField: String(data.get("jobField") || ""),
    saturday: String(data.get("saturday") || "unknown"),
    createdAt: existingJob?.createdAt || now,
    updatedAt: now,
  });

  if (existingJob) {
    appState.jobs = appState.jobs.map((job) => (Number(job.id) === Number(existingJob.id) ? draft : job));
  } else {
    appState.jobs.unshift(draft);
  }
  companyPersistJobs();
  companyCloseModal();
  renderCompanyJobs();
  showCompanyToast(existingJob ? "Đã cập nhật và gửi tin chờ duyệt lại." : "Đã tạo tin và gửi admin duyệt.", "success");
}

function showCompanyJobFormMessage(message) {
  const target = document.querySelector("#companyJobFormMessage");
  if (!target) return;
  target.textContent = message;
  target.classList.add("active");
}

function duplicateCompanyJob(jobId) {
  const source = companyFindJob(jobId);
  if (!source) return;
  const now = new Date().toISOString();
  appState.jobs.unshift(normalizeJob({
    ...source,
    id: companyNextId(appState.jobs),
    employerId: appState.currentUser.id,
    title: `${source.title} - Bản sao`,
    status: "Pending",
    createdAt: now,
    updatedAt: now,
  }));
  companyPersistJobs();
  renderCompanyJobs();
  showCompanyToast("Đã nhân bản tin và chuyển sang chờ duyệt.", "success");
}

function toggleCompanyJob(jobId) {
  const job = companyFindJob(jobId);
  if (!job || !["Approved", "Closed"].includes(job.status)) return;
  const nextStatus = job.status === "Approved" ? "Closed" : "Pending";
  appState.jobs = appState.jobs.map((item) => Number(item.id) === Number(job.id) ? { ...item, status: nextStatus, updatedAt: new Date().toISOString() } : item);
  companyPersistJobs();
  renderCompanyJobs();
  showCompanyToast(nextStatus === "Closed" ? "Đã đóng tin tuyển dụng." : "Đã gửi tin chờ admin duyệt lại.", "success");
}

function deleteCompanyJob(jobId) {
  const job = companyFindJob(jobId);
  if (!job) return;
  const hasApplications = appState.applications.some((application) => Number(application.jobId) === Number(job.id));
  if (hasApplications) {
    showCompanyToast("Không thể xóa tin đã có hồ sơ. Hãy đóng tin để giữ lịch sử tuyển dụng.", "error");
    return;
  }
  if (!window.confirm(`Xóa tin “${job.title}”? Thao tác này không thể hoàn tác.`)) return;
  appState.jobs = appState.jobs.filter((item) => Number(item.id) !== Number(job.id));
  companyPersistJobs();
  renderCompanyJobs();
  showCompanyToast("Đã xóa tin tuyển dụng.", "success");
}

function companyOption(value, label, selectedValue) {
  return `<option value="${escapeHtml(value)}" ${String(value) === String(selectedValue ?? "") ? "selected" : ""}>${escapeHtml(label)}</option>`;
}
