function renderCompanyProfile() {
  const content = document.querySelector("#companyTabContent");
  if (!content) return;
  const user = appState.currentUser;
  const completionFields = [user.name, user.phone, user.location, user.portfolio, user.desiredTitle, user.summary];
  const completion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  content.innerHTML = `
    <div class="company-profile-layout">
      <aside class="company-panel company-profile-summary">
        <span class="company-profile-logo">${escapeHtml(getInitials(companyDisplayName()))}</span>
        <h2>${escapeHtml(companyDisplayName())}</h2>
        <p>${escapeHtml(user.desiredTitle || "Nhà tuyển dụng trên JobBridge")}</p>
        <div class="company-profile-progress"><div><span>Mức độ hoàn thiện</span><strong>${completion}%</strong></div><div class="company-progress-track"><span style="width:${completion}%"></span></div></div>
        <dl><div><dt>Email đăng nhập</dt><dd>${escapeHtml(user.email)}</dd></div><div><dt>Tin tuyển dụng</dt><dd>${formatNumber(companyJobs().length)}</dd></div><div><dt>Hồ sơ đã nhận</dt><dd>${formatNumber(companyApplications().length)}</dd></div></dl>
      </aside>

      <section class="company-panel company-profile-form-panel">
        <div class="company-panel-heading"><div><p>Thông tin doanh nghiệp</p><h2>Hồ sơ công ty</h2></div><p class="company-panel-note">Thông tin này được hiển thị trên các tin tuyển dụng của công ty.</p></div>
        <form id="companyProfileForm" class="company-form">
          <div class="company-form-grid">
            <label class="company-field company-field-wide">Tên công ty<input name="name" value="${escapeHtml(companyDisplayName())}" maxlength="120" required /></label>
            <label class="company-field">Lĩnh vực hoạt động<input name="desiredTitle" value="${escapeHtml(user.desiredTitle || "")}" maxlength="100" placeholder="VD: Công nghệ thông tin" /></label>
            <label class="company-field">Địa chỉ<input name="location" value="${escapeHtml(user.location || "")}" maxlength="150" placeholder="VD: TP.HCM" /></label>
            <label class="company-field">Số điện thoại<input name="phone" value="${escapeHtml(user.phone || "")}" maxlength="20" placeholder="VD: 028 1234 5678" /></label>
            <label class="company-field">Website<input name="portfolio" type="url" value="${escapeHtml(user.portfolio || "")}" maxlength="200" placeholder="https://congty.vn" /></label>
            <label class="company-field company-field-wide">Giới thiệu công ty<textarea name="summary" maxlength="1500" placeholder="Mô tả môi trường làm việc, sản phẩm và giá trị của công ty...">${escapeHtml(user.summary || "")}</textarea></label>
          </div>
          <footer class="company-form-footer"><span>Thay đổi tên công ty sẽ được đồng bộ sang các tin thuộc công ty.</span><button class="company-button company-button-primary" type="submit">${companyIcon("check")}Lưu hồ sơ công ty</button></footer>
        </form>
      </section>
    </div>
  `;
  content.querySelector("#companyProfileForm")?.addEventListener("submit", saveCompanyProfile);
}

function saveCompanyProfile(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  if (name.length < 2) {
    showCompanyToast("Tên công ty cần ít nhất 2 ký tự.", "error");
    return;
  }

  const ownedJobIds = new Set(companyJobs().map((job) => Number(job.id)));
  appState.jobs = appState.jobs.map((job) => ownedJobIds.has(Number(job.id)) ? { ...job, employerId: appState.currentUser.id, company: name, updatedAt: new Date().toISOString() } : job);
  companyPersistJobs();
  updateCurrentUser({
    name,
    desiredTitle: String(data.get("desiredTitle") || "").trim(),
    location: String(data.get("location") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    portfolio: String(data.get("portfolio") || "").trim(),
    summary: String(data.get("summary") || "").trim(),
  });
  renderDashboard();
  appState.companyTab = "profile";
  showCompanyToast("Đã cập nhật hồ sơ công ty.", "success");
}
