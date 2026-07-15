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
          const statusDetail = companyApplicationStatusDetail(application);
          return `
            <tr>
              <td data-label="Ứng viên"><div class="company-candidate-cell"><span class="company-avatar">${escapeHtml(getInitials(application.candidateName || candidate?.name || "UV"))}</span><div><strong>${escapeHtml(application.candidateName || candidate?.name || "Ứng viên")}</strong><small>${escapeHtml(candidate?.email || application.cvName || "Hồ sơ JobBridge")}</small></div></div></td>
              <td data-label="Vị trí"><strong>${escapeHtml(job?.title || application.jobTitle || "Tin tuyển dụng")}</strong><small class="company-cell-secondary">${escapeHtml(application.cvName || "CV ứng tuyển")}</small></td>
              <td data-label="Ngày nộp"><time>${escapeHtml(formatDate(application.appliedAt))}</time></td>
              <td data-label="Trạng thái"><div class="company-application-status-cell">${companyStatusBadge(application.status, "application")}${statusDetail ? `<small>${escapeHtml(statusDetail)}</small>` : ""}</div></td>
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
      ${renderCompanyInterviewSummary(application)}
      ${renderCompanyRecruitmentActions(application)}
    </div>
  `, "company-modal-large");

  modal.querySelectorAll("[data-company-show-form]").forEach((button) => {
    button.addEventListener("click", () => showCompanyApplicationForm(modal, button.dataset.companyShowForm));
  });
  modal.querySelectorAll("[data-company-cancel-form]").forEach((button) => {
    button.addEventListener("click", () => hideCompanyApplicationForms(modal));
  });
  modal.querySelector("#companyInterviewForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    scheduleCompanyInterview(application.id, new FormData(event.currentTarget));
  });
  modal.querySelector("#companyRejectionForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    rejectCompanyApplication(application.id, new FormData(event.currentTarget));
  });
  modal.querySelector("[data-company-hire]")?.addEventListener("click", () => hireCompanyApplication(application.id));
}

function renderCompanyInterviewSummary(application) {
  if (!application.interviewAt) return "";
  return `
    <section class="company-interview-card">
      <div class="company-interview-heading"><div><p>Lịch phỏng vấn</p><h3>${escapeHtml(companyFormatDateTime(application.interviewAt))}</h3></div>${companyStatusBadge(application.status, "application")}</div>
      <dl>
        <div><dt>Hình thức</dt><dd>${escapeHtml(application.interviewMethod || "Chưa cập nhật")}</dd></div>
        <div><dt>Địa điểm/Link</dt><dd>${escapeHtml(application.interviewLocation || "Chưa cập nhật")}</dd></div>
        <div><dt>Người phỏng vấn</dt><dd>${escapeHtml(application.interviewer || "Chưa cập nhật")}</dd></div>
        <div><dt>Ghi chú</dt><dd>${escapeHtml(application.interviewNote || "Không có ghi chú")}</dd></div>
      </dl>
    </section>
  `;
}

function renderCompanyRecruitmentActions(application) {
  if (application.status === "Da tuyen" || application.status === "Tu choi") {
    const isHired = application.status === "Da tuyen";
    const result = isHired ? "Ứng viên đã được tuyển" : application.rejectionStage === "interview" ? "Không đạt sau phỏng vấn" : "Hồ sơ đã bị từ chối";
    const detail = isHired ? "Kết quả tuyển dụng đã được lưu." : application.rejectionReason || "Không có lý do được ghi nhận.";
    return `<section class="company-result-card ${isHired ? "success" : "danger"}"><span>${companyIcon(isHired ? "check" : "close")}</span><div><h3>${escapeHtml(result)}</h3><p>${escapeHtml(detail)}</p></div></section>`;
  }

  const isInterview = application.status === "Len lich phong van";
  return `
    <section class="company-recruitment-panel">
      <div class="company-recruitment-heading"><div><p>Quyết định tuyển dụng</p><h3>${isInterview ? "Kết quả sau phỏng vấn" : "Xử lý hồ sơ ứng viên"}</h3></div></div>
      <div class="company-recruitment-actions" data-company-default-actions>
        ${isInterview
          ? `<button class="company-button company-button-primary" data-company-hire type="button">${companyIcon("check")}Tuyển ứng viên</button><button class="company-button company-button-danger" data-company-show-form="companyRejectionForm" type="button">${companyIcon("close")}Không đạt sau phỏng vấn</button><button class="company-button company-button-secondary" data-company-show-form="companyInterviewForm" type="button">${companyIcon("calendar")}Đổi lịch</button>`
          : `<button class="company-button company-button-primary" data-company-show-form="companyInterviewForm" type="button">${companyIcon("calendar")}Hẹn phỏng vấn</button><button class="company-button company-button-danger" data-company-show-form="companyRejectionForm" type="button">${companyIcon("close")}Từ chối hồ sơ</button>`}
      </div>
      ${renderCompanyInterviewForm(application)}
      ${renderCompanyRejectionForm(isInterview ? "interview" : "profile")}
    </section>
  `;
}

function renderCompanyInterviewForm(application) {
  return `
    <form id="companyInterviewForm" class="company-form company-action-form" hidden>
      <div class="company-form-grid">
        <label class="company-field">Ngày và giờ phỏng vấn<input name="interviewAt" type="datetime-local" value="${escapeHtml(companyDateTimeLocalValue(application.interviewAt))}" required /></label>
        <label class="company-field">Hình thức<select name="interviewMethod" required>${companyOption("Trực tiếp", "Trực tiếp", application.interviewMethod || "Trực tiếp")}${companyOption("Trực tuyến", "Trực tuyến", application.interviewMethod || "Trực tiếp")}${companyOption("Điện thoại", "Điện thoại", application.interviewMethod || "Trực tiếp")}</select></label>
        <label class="company-field">Địa điểm hoặc link<input name="interviewLocation" type="text" value="${escapeHtml(application.interviewLocation || "")}" maxlength="300" placeholder="Văn phòng hoặc link cuộc họp" required /></label>
        <label class="company-field">Người phỏng vấn<input name="interviewer" type="text" value="${escapeHtml(application.interviewer || companyDisplayName())}" maxlength="120" required /></label>
        <label class="company-field company-field-wide">Ghi chú<textarea name="interviewNote" maxlength="1000" placeholder="Nội dung cần chuẩn bị hoặc lưu ý cho ứng viên">${escapeHtml(application.interviewNote || "")}</textarea></label>
      </div>
      <footer class="company-action-form-footer"><button class="company-button company-button-secondary" data-company-cancel-form type="button">Hủy</button><button class="company-button company-button-primary" type="submit">${companyIcon("calendar")}Lưu lịch phỏng vấn</button></footer>
    </form>
  `;
}

function renderCompanyRejectionForm(stage) {
  return `
    <form id="companyRejectionForm" class="company-form company-action-form" hidden>
      <input name="rejectionStage" type="hidden" value="${escapeHtml(stage)}" />
      <label class="company-field">Lý do ${stage === "interview" ? "không đạt" : "từ chối hồ sơ"}<textarea name="rejectionReason" maxlength="1000" placeholder="Nhập nhận xét hoặc lý do" required></textarea></label>
      <footer class="company-action-form-footer"><button class="company-button company-button-secondary" data-company-cancel-form type="button">Hủy</button><button class="company-button company-button-danger" type="submit">${companyIcon("close")}${stage === "interview" ? "Xác nhận không đạt" : "Xác nhận từ chối"}</button></footer>
    </form>
  `;
}

function showCompanyApplicationForm(modal, formId) {
  modal.querySelectorAll(".company-action-form").forEach((form) => { form.hidden = form.id !== formId; });
  const actions = modal.querySelector("[data-company-default-actions]");
  if (actions) actions.hidden = true;
  modal.querySelector(`#${formId} input:not([type="hidden"]), #${formId} select, #${formId} textarea`)?.focus();
}

function hideCompanyApplicationForms(modal) {
  modal.querySelectorAll(".company-action-form").forEach((form) => { form.hidden = true; });
  const actions = modal.querySelector("[data-company-default-actions]");
  if (actions) actions.hidden = false;
}

function scheduleCompanyInterview(applicationId, data) {
  const interviewDate = new Date(String(data.get("interviewAt") || ""));
  if (Number.isNaN(interviewDate.getTime())) {
    showToast("Vui lòng chọn ngày và giờ phỏng vấn hợp lệ.", "error");
    return;
  }
  updateCompanyApplication(applicationId, {
    status: "Len lich phong van",
    interviewAt: interviewDate.toISOString(),
    interviewMethod: String(data.get("interviewMethod") || "").trim(),
    interviewLocation: String(data.get("interviewLocation") || "").trim(),
    interviewer: String(data.get("interviewer") || "").trim(),
    interviewNote: String(data.get("interviewNote") || "").trim(),
    rejectionStage: null,
    rejectionReason: null,
  }, "Đã lưu lịch phỏng vấn ứng viên.");
}

function rejectCompanyApplication(applicationId, data) {
  const stage = String(data.get("rejectionStage") || "profile");
  const reason = String(data.get("rejectionReason") || "").trim();
  if (!reason) {
    showToast("Vui lòng nhập lý do xử lý hồ sơ.", "error");
    return;
  }
  updateCompanyApplication(applicationId, {
    status: "Tu choi",
    rejectionStage: stage,
    rejectionReason: reason,
    decisionAt: new Date().toISOString(),
  }, stage === "interview" ? "Đã ghi nhận ứng viên không đạt sau phỏng vấn." : "Đã từ chối hồ sơ ứng viên.");
}

function hireCompanyApplication(applicationId) {
  updateCompanyApplication(applicationId, {
    status: "Da tuyen",
    hiredAt: new Date().toISOString(),
    decisionAt: new Date().toISOString(),
    rejectionStage: null,
    rejectionReason: null,
  }, "Đã tuyển ứng viên.");
}

function updateCompanyApplication(applicationId, changes, successMessage) {
  const ownedApplication = companyApplications().find((item) => Number(item.id) === Number(applicationId));
  if (!ownedApplication) {
    showToast("Không tìm thấy hồ sơ ứng tuyển thuộc công ty.", "error");
    return;
  }
  const updatedAt = new Date().toISOString();
  appState.applications = appState.applications.map((application) => Number(application.id) === Number(ownedApplication.id) ? { ...application, ...changes, updatedAt } : application);
  companyPersistApplications();
  companyCloseModal();
  renderCompanyTabContent();
  showToast(successMessage, "success");
}

function companyApplicationStatusDetail(application) {
  if (application.status === "Len lich phong van" && application.interviewAt) return companyFormatDateTime(application.interviewAt);
  if (application.status === "Tu choi") return application.rejectionStage === "interview" ? "Không đạt sau phỏng vấn" : "Từ chối hồ sơ";
  return "";
}

function companyFormatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa xác định";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function companyDateTimeLocalValue(value) {
  const source = value ? new Date(value) : new Date(Date.now() + 24 * 60 * 60 * 1000);
  if (Number.isNaN(source.getTime())) return "";
  const local = new Date(source.getTime() - source.getTimezoneOffset() * 60 * 1000);
  return local.toISOString().slice(0, 16);
}
