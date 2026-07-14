// Toàn bộ tính năng và giao diện thuộc vai trò ứng viên.
function getJobIdFromLocation() {
  const match = window.location.pathname.match(/^\/jobs\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

function renderCandidateRoute() {
  const jobId = getJobIdFromLocation();
  appState.detailJobId = jobId;
  if (jobId) renderCandidateJobDetail(jobId);
  else renderCandidateView();
}

function handleCandidateRouteChange() {
  if (!appState.currentUser || appState.currentUser.role !== "candidate") return;
  closeApplicationModal();
  closeJobReportModal();
  renderCandidateRoute();
  window.scrollTo({ top: 0 });
}

function renderCandidateView() {
  document.title = "JobBridge - Tuyển dụng việc làm";
  const currentUser = normalizeUser(appState.currentUser);
  const approvedJobs = getFilteredApprovedJobs();
  const appliedCount = currentUser.appliedJobs.length;
  const savedCount = currentUser.savedJobs.length;
  const recommendedJob = getRecommendedJob(approvedJobs);
  const profileCompletion = getCandidateProfileCompletion(currentUser);

  document.querySelector("#dashboardRoot").innerHTML = `
    ${renderCareerCategoryRail()}

    ${renderJobSearchBar()}

    <section class="candidate-summary-strip" aria-label="Tổng quan tìm việc">
      <div>
        <strong>${approvedJobs.length}</strong>
        <span>việc phù hợp</span>
      </div>
      <div>
        <strong>${appliedCount}</strong>
        <span>việc đã ứng tuyển</span>
      </div>
      <div>
        <strong>${savedCount}</strong>
        <span>việc đã lưu</span>
      </div>
    </section>

    <section class="candidate-workspace">
      <nav class="candidate-sidebar candidate-tab-bar" aria-label="Menu ứng viên">
        <button class="candidate-menu-item ${appState.candidateTab === "jobs" ? "active" : ""}" data-candidate-tab="jobs" type="button">Tìm việc làm</button>
      </nav>

      <div class="candidate-content">
        <section class="candidate-tab-panel ${appState.candidateTab === "jobs" ? "active" : ""}" data-candidate-panel="jobs">
          <div class="candidate-panel-heading">
            <div>
              <p class="eyebrow">Job Search</p>
              <h2>Tìm việc làm</h2>
            </div>
            <div class="candidate-heading-actions">
              <span class="muted-count">${approvedJobs.length} kết quả</span>
              <label class="job-sort-control">
                <span>Sắp xếp</span>
                <select id="candidateJobSort">
                  <option value="newest" ${appState.candidateSort === "newest" ? "selected" : ""}>Mới nhất</option>
                  <option value="salary" ${appState.candidateSort === "salary" ? "selected" : ""}>Lương cao nhất</option>
                  <option value="match" ${appState.candidateSort === "match" ? "selected" : ""}>Phù hợp nhất</option>
                </select>
              </label>
            </div>
          </div>

          ${recommendedJob ? renderCandidateSpotlight(recommendedJob) : ""}

          <div class="candidate-job-layout">
            ${renderAdvancedFilterPanel()}
            <div class="candidate-results-column">
              <div id="candidateJobGrid" class="job-grid"></div>
            </div>
          </div>
        </section>

        <section class="candidate-tab-panel ${appState.candidateTab === "profile" ? "active" : ""}" data-candidate-panel="profile">
          <div class="candidate-panel-heading">
            <div>
              <p class="eyebrow">My Profile</p>
              <h2>Hồ sơ cá nhân</h2>
            </div>
            <span class="profile-completion">${profileCompletion}% hoàn thiện</span>
          </div>
          <form id="candidateProfileForm" class="profile-editor">
            <div class="profile-avatar-row">
              <div class="profile-avatar" aria-label="Ảnh đại diện ứng viên">
                ${renderUserAvatar("profile")}
              </div>
              <div>
                <h3>${escapeHtml(currentUser.name)}</h3>
                <p>${escapeHtml(currentUser.desiredTitle || "Ứng viên JobBridge")}</p>
              </div>
            </div>

            <section class="profile-form-section">
              <div class="profile-section-heading">
                <h3>Thông tin cá nhân</h3>
                <span>Hiển thị trong hồ sơ ứng tuyển</span>
              </div>
              <div class="form-grid profile-form-grid">
                <label>
                  Họ tên
                  <input id="profileName" type="text" value="${escapeHtml(currentUser.name)}" />
                </label>
                <label>
                  Số điện thoại
                  <input id="profilePhone" type="tel" value="${escapeHtml(currentUser.phone)}" placeholder="VD: 0901234567" />
                </label>
                <label>
                  Địa điểm
                  <input id="profileLocation" type="text" value="${escapeHtml(currentUser.location)}" placeholder="VD: TP.HCM" />
                </label>
                <label>
                  Ngày sinh
                  <input id="profileDateOfBirth" type="date" value="${escapeHtml(currentUser.dateOfBirth)}" />
                </label>
                <label>
                  Giới tính
                  <select id="profileGender">
                    ${renderProfileOption("", "Chưa cập nhật", currentUser.gender)}
                    ${renderProfileOption("Nam", "Nam", currentUser.gender)}
                    ${renderProfileOption("Nữ", "Nữ", currentUser.gender)}
                    ${renderProfileOption("Khác", "Khác", currentUser.gender)}
                  </select>
                </label>
                <label>
                  Link CV / Portfolio
                  <input id="profilePortfolio" type="url" value="${escapeHtml(currentUser.portfolio)}" placeholder="https://..." />
                </label>
              </div>
            </section>

            <section class="profile-form-section">
              <div class="profile-section-heading">
                <h3>Thông tin nghề nghiệp</h3>
                <span>Giúp JobBridge gợi ý việc làm phù hợp hơn</span>
              </div>
              <div class="form-grid profile-form-grid">
                <label>
                  Vị trí mong muốn
                  <input id="profileDesiredTitle" type="text" value="${escapeHtml(currentUser.desiredTitle || "")}" />
                </label>
                <label>
                  Kinh nghiệm
                  <select id="profileExperienceLevel">
                    ${renderProfileOption("", "Chưa cập nhật", currentUser.experienceLevel)}
                    ${experienceOptions.map((option) => renderProfileOption(option.value, option.label, currentUser.experienceLevel)).join("")}
                  </select>
                </label>
                <label class="profile-full-field">
                  Học vấn
                  <input id="profileEducation" type="text" value="${escapeHtml(currentUser.education)}" placeholder="VD: Đại học Công nghệ - CNTT" />
                </label>
              </div>
            </section>

            <section class="profile-form-section">
              <div class="profile-section-heading">
                <h3>Giới thiệu bản thân</h3>
                <span>Viết ngắn gọn về kinh nghiệm, mục tiêu và điểm mạnh</span>
              </div>
              <textarea id="profileSummary" placeholder="VD: Tôi có kinh nghiệm xây dựng giao diện web, yêu thích sản phẩm tuyển dụng và mong muốn phát triển trong môi trường năng động.">${escapeHtml(currentUser.summary)}</textarea>
            </section>

            <div class="skills-editor">
              <label>
                Kỹ năng
                <input id="skillInput" type="text" placeholder="Nhập kỹ năng và nhấn Enter" />
              </label>
              <div id="skillTags" class="skill-tags">
                ${currentUser.skills.map((skill) => renderSkillTag(skill)).join("")}
              </div>
            </div>

            <section class="profile-form-section candidate-cv-manager">
              <div class="profile-section-heading">
                <h3>CV của tôi</h3>
                <span>Tạo CV online từ thông tin hồ sơ đã cập nhật</span>
              </div>
              <div class="cv-manager-create">
                <label>
                  Tên CV
                  <input id="onlineCvName" type="text" placeholder="VD: CV Frontend Developer" />
                </label>
                <button id="createCvFromProfile" class="secondary-button" type="button">Tạo CV từ hồ sơ</button>
              </div>
              <div class="cv-upload-row">
                <label class="cv-upload-button" for="candidateCvUpload">Nhập CV từ máy</label>
                <input id="candidateCvUpload" type="file" accept="application/pdf,.pdf" hidden />
                <span>Chỉ nhận tệp PDF, dung lượng tối đa 5 MB.</span>
              </div>
              <div class="cv-manager-list">
                ${renderCandidateCvList(currentUser.id)}
              </div>
            </section>
            <button class="primary-button" type="submit">Cập nhật hồ sơ</button>
          </form>
        </section>

        <section class="candidate-tab-panel ${appState.candidateTab === "history" ? "active" : ""}" data-candidate-panel="history">
          <div class="candidate-panel-heading">
            <div>
              <p class="eyebrow">Application History</p>
              <h2>Lịch sử ứng tuyển</h2>
            </div>
          </div>
          <div id="applicationHistory"></div>
        </section>

        <section class="candidate-tab-panel ${appState.candidateTab === "saved" ? "active" : ""}" data-candidate-panel="saved">
          <div class="candidate-panel-heading">
            <div>
              <p class="eyebrow">Saved Jobs</p>
              <h2>Việc làm đã lưu</h2>
            </div>
            <span class="muted-count">${savedCount} việc</span>
          </div>
          <div id="savedJobGrid" class="job-grid"></div>
        </section>
      </div>
    </section>
  `;

  bindCandidateTabs();
  bindCareerCategoryRail();
  bindCandidateFilters();
  bindCandidateProfile();
  renderCandidateJobs();
  renderCandidateHistory();
  renderSavedJobs();
  bindCandidateJobCardActions(document.querySelector("#dashboardRoot"));
  syncCandidateTabButtons();
}

function renderCareerCategoryRail() {
  const approvedJobCount = appState.jobs.filter((job) => job.status === "Approved").length;
  const marketJobCount = 51610 + approvedJobCount;
  const currentYear = new Date().getFullYear();

  return `
    <section class="job-market-strip">
      <div class="job-market-heading">
        <div>
          <strong>Tuyển dụng <span>${formatNumber(marketJobCount)} việc làm</span></strong>
          <p>Trang chủ <span>/</span> Tuyển dụng ${formatNumber(marketJobCount)} việc làm ${currentYear}</p>
        </div>
        <button class="job-alert-button" data-create-job-alert type="button">Tạo thông báo việc làm</button>
      </div>
      <div class="career-category-rail">
        ${careerCategories.map((item) => `
          <button class="career-category-card" data-career-keyword="${escapeHtml(item.keyword)}" type="button">
            <span class="career-icon career-icon-${escapeHtml(item.icon)}"></span>
            <strong>${escapeHtml(item.title)}</strong>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderJobSearchBar() {
  const locations = getAvailableJobLocations();
  const selectedLocation = appState.candidateFilters.location;

  return `
    <section class="job-search-panel" aria-label="Thanh tìm kiếm việc làm">
      <form id="jobSearchForm" class="job-search-form">
        <label class="job-search-field job-search-keyword">
          <span>Từ khóa</span>
          <div class="job-search-input-shell">
            <span class="job-search-icon">⌕</span>
            <input id="jobSearchKeyword" type="search" value="${escapeHtml(appState.candidateKeyword)}" placeholder="Vị trí, công ty hoặc kỹ năng" />
          </div>
        </label>

        <label class="job-search-field">
          <span>Địa điểm</span>
          <div class="job-search-input-shell">
            <span class="job-search-icon">⌖</span>
            <select id="candidateLocationFilter">
              <option value="">Tất cả địa điểm</option>
              ${locations
                .map(
                  (location) =>
                    `<option value="${escapeHtml(location)}" ${selectedLocation === location ? "selected" : ""}>${escapeHtml(location)}</option>`,
                )
                .join("")}
            </select>
          </div>
        </label>

        <button class="job-search-button" type="submit">Tìm kiếm</button>
      </form>
    </section>
  `;
}

function getAvailableJobLocations() {
  return Array.from(
    new Set(
      appState.jobs
        .filter((job) => job.status === "Approved")
        .map((job) => job.location)
        .filter(Boolean),
    ),
  ).sort((first, second) => first.localeCompare(second, "vi"));
}

function renderProfileOption(value, label, selectedValue) {
  return `<option value="${escapeHtml(value)}" ${selectedValue === value ? "selected" : ""}>${escapeHtml(label)}</option>`;
}

function getCandidateProfileCompletion(user) {
  const fields = [
    user.name,
    user.desiredTitle,
    user.phone,
    user.location,
    user.dateOfBirth,
    user.gender,
    user.experienceLevel,
    user.education,
    user.portfolio,
    user.summary,
    user.skills.length > 0 ? "skills" : "",
  ];

  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

function getCandidateCvs(candidateId = appState.currentUser?.id) {
  return appState.cvs
    .filter((cv) => cv.candidateId === candidateId)
    .sort((first, second) => Date.parse(second.updatedAt) - Date.parse(first.updatedAt));
}

function renderCandidateCvList(candidateId) {
  const cvs = getCandidateCvs(candidateId);
  if (cvs.length === 0) {
    return `<div class="empty-state compact-empty">Bạn chưa có CV. Hãy tạo CV online từ hồ sơ để bắt đầu ứng tuyển.</div>`;
  }

  return cvs
    .map(
      (cv) => `
        <article class="cv-manager-card">
          <span class="cv-file-icon">CV</span>
          <div class="cv-manager-card-main">
            <strong>${escapeHtml(cv.name)}</strong>
            <small>${cv.source === "profile" ? "Tạo online từ hồ sơ" : `PDF tải lên${cv.fileSize ? ` • ${formatFileSize(cv.fileSize)}` : ""}`} • Cập nhật ${formatDate(cv.updatedAt)}</small>
          </div>
          <footer class="cv-manager-card-actions">
            ${cv.source === "upload" ? `<button class="cv-view-button" data-view-cv="${cv.id}" type="button">Xem PDF</button>` : ""}
            <button class="cv-delete-button" data-delete-cv="${cv.id}" type="button" aria-label="Xoá ${escapeHtml(cv.name)}">Xoá</button>
          </footer>
        </article>
      `,
    )
    .join("");
}

function createCvFromProfile(customName = "") {
  const user = normalizeUser(appState.currentUser);
  const name = customName.trim() || `CV ${user.desiredTitle || user.name}`;
  const now = new Date().toISOString();
  const cv = normalizeCv({
    id: Date.now(),
    candidateId: user.id,
    name,
    source: "profile",
    createdAt: now,
    updatedAt: now,
    profileSnapshot: {
      name: user.name,
      desiredTitle: user.desiredTitle,
      phone: user.phone,
      email: user.email,
      location: user.location,
      education: user.education,
      experienceLevel: user.experienceLevel,
      summary: user.summary,
      skills: [...user.skills],
    },
  });
  appState.cvs.unshift(cv);
  writeStorage(STORAGE_KEYS.cvs, appState.cvs);
  return cv;
}

function openCvFileDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CV_FILE_DATABASE, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(CV_FILE_STORE)) {
        request.result.createObjectStore(CV_FILE_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Không thể mở kho lưu CV."));
  });
}

async function saveCvFile(cvId, file) {
  const database = await openCvFileDatabase();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(CV_FILE_STORE, "readwrite");
    transaction.objectStore(CV_FILE_STORE).put({ id: cvId, file });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("Không thể lưu tệp CV."));
  });
  database.close();
}

async function readCvFile(cvId) {
  const database = await openCvFileDatabase();
  const record = await new Promise((resolve, reject) => {
    const request = database.transaction(CV_FILE_STORE, "readonly").objectStore(CV_FILE_STORE).get(cvId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Không thể đọc tệp CV."));
  });
  database.close();
  return record?.file || null;
}

async function removeCvFile(cvId) {
  const database = await openCvFileDatabase();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(CV_FILE_STORE, "readwrite");
    transaction.objectStore(CV_FILE_STORE).delete(cvId);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("Không thể xoá tệp CV."));
  });
  database.close();
}

async function uploadCvFromComputer(event) {
  const input = event.target;
  const file = input.files?.[0];
  if (!file) return;

  const isPdfName = file.name.toLowerCase().endsWith(".pdf");
  if ((!isPdfName && file.type !== "application/pdf") || file.size === 0) {
    input.value = "";
    showToast("Vui lòng chọn một tệp PDF hợp lệ.", "error");
    return;
  }
  if (file.size > MAX_CV_FILE_SIZE) {
    input.value = "";
    showToast("Tệp PDF không được vượt quá 5 MB.", "error");
    return;
  }

  const headerBytes = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  const hasPdfSignature = String.fromCharCode(...headerBytes) === "%PDF-";
  if (!hasPdfSignature) {
    input.value = "";
    showToast("Tệp đã chọn không phải là PDF hợp lệ.", "error");
    return;
  }

  const customName = document.querySelector("#onlineCvName")?.value.trim();
  const now = new Date().toISOString();
  const cv = normalizeCv({
    id: Date.now(),
    candidateId: appState.currentUser.id,
    name: customName || file.name.replace(/\.pdf$/i, ""),
    source: "upload",
    originalFileName: file.name,
    fileSize: file.size,
    mimeType: "application/pdf",
    createdAt: now,
    updatedAt: now,
  });

  try {
    await saveCvFile(cv.id, file);
    appState.cvs.unshift(cv);
    writeStorage(STORAGE_KEYS.cvs, appState.cvs);
    appState.candidateTab = "profile";
    renderCandidateView();
    showToast(`Đã tải lên ${cv.name}`, "success");
  } catch {
    input.value = "";
    showToast("Không thể lưu tệp PDF trên trình duyệt này.", "error");
  }
}

async function viewUploadedCv(cvId) {
  const cv = appState.cvs.find((item) => item.id === cvId && item.candidateId === appState.currentUser.id);
  if (!cv || cv.source !== "upload") return;
  const previewWindow = window.open("", "_blank");
  try {
    const file = await readCvFile(cvId);
    if (!file) throw new Error("CV file missing");
    const url = URL.createObjectURL(file);
    if (previewWindow) previewWindow.location.href = url;
    else showToast("Trình duyệt đang chặn cửa sổ xem PDF.", "info");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch {
    previewWindow?.close();
    showToast("Không tìm thấy tệp PDF. Bạn có thể tải lên lại CV.", "error");
  }
}

async function deleteCandidateCv(cvId) {
  const cv = appState.cvs.find((item) => item.id === cvId && item.candidateId === appState.currentUser.id);
  if (!cv) return;
  const usedCount = appState.applications.filter((application) => application.cvId === cv.id).length;
  const detail = usedCount ? ` CV này đã dùng cho ${usedCount} hồ sơ; tên CV vẫn được giữ trong lịch sử.` : "";
  if (!window.confirm(`Bạn chắc chắn muốn xoá \"${cv.name}\"?${detail}`)) return;

  appState.cvs = appState.cvs.filter((item) => item.id !== cv.id);
  writeStorage(STORAGE_KEYS.cvs, appState.cvs);
  if (cv.source === "upload") {
    try {
      await removeCvFile(cv.id);
    } catch {
      // Metadata is already removed; an orphaned browser blob is harmless.
    }
  }
  appState.candidateTab = "profile";
  renderCandidateView();
  showToast(`Đã xoá ${cv.name}`, "success");
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function bindCareerCategoryRail() {
  document.querySelector("[data-create-job-alert]")?.addEventListener("click", () => {
    showToast("Đã tạo nhắc thông báo việc làm.", "success");
  });

  document.querySelectorAll("[data-career-keyword]").forEach((button) => {
    button.addEventListener("click", () => {
      const keyword = button.dataset.careerKeyword;
      appState.candidateTab = "jobs";

      if (!keyword) {
        appState.candidateKeyword = "";
        appState.candidateFilters.categories = [];
        appState.candidateFilters.experiences = [];
        appState.candidateFilters.jobField = "";
        renderCandidateView();
        return;
      }

      if (experienceOptions.some((option) => option.value === keyword)) {
        appState.candidateKeyword = "";
        appState.candidateFilters.experiences = [keyword];
      } else if (jobFields.some((field) => field.value === keyword)) {
        appState.candidateKeyword = "";
        appState.candidateFilters.jobField = keyword;
      } else {
        appState.candidateKeyword = keyword;
      }

      renderCandidateView();
    });
  });
}

function renderAdvancedFilterPanel() {
  const activeFilters = getActiveAdvancedFilterCount();
  const selectedCompanyField = appState.candidateFilters.companyField || "";
  const selectedJobField = appState.candidateFilters.jobField || "";

  return `
    <aside class="candidate-filter-panel advanced-filter-panel" aria-label="Lọc nâng cao">
      <div class="advanced-filter-heading">
        <span class="filter-funnel"></span>
        <h3>Lọc nâng cao</h3>
      </div>

      <div class="filter-section">
        <div class="filter-radio-grid">
          ${renderFilterRadio("saturdayFilter", "", "Không lọc", appState.candidateFilters.saturday === "")}
          ${renderFilterRadio("saturdayFilter", "work", "Làm thứ 7", appState.candidateFilters.saturday === "work")}
          ${renderFilterRadio("saturdayFilter", "unknown", "Tin đăng không đề cập", appState.candidateFilters.saturday === "unknown")}
        </div>
      </div>

      <div class="filter-section">
        <h4>Theo danh mục nghề</h4>
        <div class="filter-list">
          ${jobCategories.map((category) => renderFilterCheckbox("category", category.value, `${escapeHtml(category.label)} <small>(${category.count})</small>`, appState.candidateFilters.categories.includes(category.value))).join("")}
        </div>
        <button class="filter-more" type="button">Xem thêm</button>
      </div>

      <div class="filter-section">
        <h4>Kinh nghiệm</h4>
        <div class="filter-check-grid">
          ${experienceOptions.map((experience) => renderFilterCheckbox("experience", experience.value, escapeHtml(experience.label), appState.candidateFilters.experiences.includes(experience.value))).join("")}
        </div>
      </div>

      <div class="filter-section">
        <h4>Lĩnh vực công ty</h4>
        <label class="select-shell">
          <span class="select-icon">◇</span>
          <select id="candidateCompanyFieldFilter">
            ${companyFields.map((field) => `<option value="${escapeHtml(field.value)}" ${selectedCompanyField === field.value ? "selected" : ""}>${escapeHtml(field.label)}</option>`).join("")}
          </select>
        </label>
      </div>

      <div class="filter-section">
        <h4>Lĩnh vực công việc</h4>
        <label class="select-shell">
          <span class="select-icon">▣</span>
          <select id="candidateJobFieldFilter">
            ${jobFields.map((field) => `<option value="${escapeHtml(field.value)}" ${selectedJobField === field.value ? "selected" : ""}>${escapeHtml(field.label)}</option>`).join("")}
          </select>
        </label>
      </div>

      <div class="filter-section salary-section">
        <label>
          Mức lương tối thiểu: <strong id="salaryRangeValue">${appState.candidateFilters.minSalary} triệu</strong>
          <input id="candidateSalaryRange" type="range" min="0" max="50" step="5" value="${appState.candidateFilters.minSalary}" />
        </label>
      </div>

      <div class="filter-action-row">
        <button id="clearAdvancedFilters" class="filter-clear" type="button" ${activeFilters === 0 ? "disabled" : ""}>Xóa lọc</button>
        <button id="saveAdvancedFilters" class="filter-save" type="button">Lưu bộ lọc</button>
      </div>
    </aside>
  `;
}

function renderFilterRadio(name, value, label, checked) {
  return `
    <label class="radio-option">
      <input name="${name}" type="radio" value="${escapeHtml(value)}" ${checked ? "checked" : ""} />
      <span>${escapeHtml(label)}</span>
    </label>
  `;
}

function renderFilterCheckbox(type, value, label, checked) {
  return `
    <label class="filter-check-option">
      <input data-filter-${type}="${escapeHtml(value)}" type="checkbox" value="${escapeHtml(value)}" ${checked ? "checked" : ""} />
      <span>${label}</span>
    </label>
  `;
}

function getActiveAdvancedFilterCount() {
  const filters = appState.candidateFilters;
  return [
    filters.location,
    filters.saturday,
    filters.companyField,
    filters.jobField,
    filters.minSalary > 0 ? filters.minSalary : "",
    ...filters.types,
    ...filters.categories,
    ...filters.experiences,
  ].filter(Boolean).length;
}

function bindCandidateTabs() {
  document.querySelectorAll("[data-candidate-tab]").forEach((button) => {
    button.addEventListener("click", () => showCandidateTab(button.dataset.candidateTab));
  });
}

function showCandidateTab(tab) {
  appState.candidateTab = tab;
  if (appState.detailJobId || getJobIdFromLocation()) {
    window.history.pushState({}, "", "/");
    appState.detailJobId = null;
    renderCandidateView();
    window.scrollTo({ top: 0 });
    return;
  }
  syncCandidateTabButtons();
}

function syncCandidateTabButtons() {
  document.querySelectorAll("[data-candidate-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.candidateTab === appState.candidateTab);
  });
  document.querySelectorAll("[data-candidate-account-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.candidateAccountTab === appState.candidateTab);
  });
  document.querySelectorAll("[data-candidate-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.candidatePanel === appState.candidateTab);
  });
}

function bindCandidateFilters() {
  document.querySelector("#candidateJobSort")?.addEventListener("change", (event) => {
    appState.candidateSort = event.target.value;
    renderCandidateView();
  });
  document.querySelector("#jobSearchForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    appState.candidateKeyword = document.querySelector("#jobSearchKeyword").value.trim();
    appState.candidateTab = "jobs";
    renderCandidateView();
  });

  document.querySelector("#jobSearchKeyword")?.addEventListener("input", (event) => {
    appState.candidateKeyword = event.target.value;
    const inlineSearch = document.querySelector("#candidateSearch");
    if (inlineSearch) inlineSearch.value = event.target.value;
  });

  document.querySelector("#candidateSearch")?.addEventListener("input", (event) => {
    appState.candidateKeyword = event.target.value;
    const topSearch = document.querySelector("#jobSearchKeyword");
    if (topSearch) topSearch.value = event.target.value;
    renderCandidateJobs();
  });

  document.querySelector("#candidateLocationFilter")?.addEventListener("change", (event) => {
    appState.candidateFilters.location = event.target.value;
    renderCandidateView();
  });

  document.querySelectorAll('input[name="saturdayFilter"]').forEach((input) => {
    input.addEventListener("change", (event) => {
      appState.candidateFilters.saturday = event.target.value;
      renderCandidateView();
    });
  });

  document.querySelectorAll("[data-filter-category]").forEach((input) => {
    input.addEventListener("change", () => {
      appState.candidateFilters.categories = Array.from(document.querySelectorAll("[data-filter-category]:checked")).map((item) => item.value);
      renderCandidateView();
    });
  });

  document.querySelectorAll("[data-filter-experience]").forEach((input) => {
    input.addEventListener("change", () => {
      appState.candidateFilters.experiences = Array.from(document.querySelectorAll("[data-filter-experience]:checked")).map((item) => item.value);
      renderCandidateView();
    });
  });

  document.querySelector("#candidateCompanyFieldFilter")?.addEventListener("change", (event) => {
    appState.candidateFilters.companyField = event.target.value;
    renderCandidateView();
  });

  document.querySelector("#candidateJobFieldFilter")?.addEventListener("change", (event) => {
    appState.candidateFilters.jobField = event.target.value;
    renderCandidateView();
  });

  document.querySelector("#candidateSalaryRange")?.addEventListener("input", (event) => {
    appState.candidateFilters.minSalary = Number(event.target.value);
    document.querySelector("#salaryRangeValue").textContent = `${event.target.value} triệu`;
    renderCandidateJobs();
  });

  document.querySelector("#clearAdvancedFilters")?.addEventListener("click", resetCandidateFilters);
  document.querySelector("#saveAdvancedFilters")?.addEventListener("click", () => showToast("Đã lưu bộ lọc tìm việc", "success"));
}

function resetCandidateFilters() {
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
  renderCandidateView();
}

function renderCandidateJobs() {
  const jobs = getFilteredApprovedJobs();
  const grid = document.querySelector("#candidateJobGrid");

  if (jobs.length === 0) {
    grid.innerHTML = `<div class="empty-state">Khong co viec lam phu hop.</div>`;
    return;
  }

  grid.innerHTML = jobs.map((job) => renderCandidateJobCard(job)).join("");
  bindCandidateJobCardActions(grid);
}

function renderCandidateJobCard(job) {
  const saved = appState.currentUser.savedJobs.includes(job.id);
  const applied = appState.currentUser.appliedJobs.includes(job.id);

  return `
    <article class="job-card candidate-job-card">
      <div class="job-topline">
        <span class="company-logo">${escapeHtml(getInitials(job.company))}</span>
        <div class="job-title-group">
          <h3>${escapeHtml(job.title)}</h3>
          <p>${escapeHtml(job.company)} - ${escapeHtml(job.location)}</p>
          <small class="job-live-time" data-job-relative-time="${escapeHtml(job.updatedAt)}">Cập nhật ${formatRelativeTime(job.updatedAt)}</small>
        </div>
        <button class="heart-button ${saved ? "active" : ""}" data-save-job="${job.id}" type="button" aria-label="Luu viec lam">
          ${saved ? "&#9829;" : "&#9825;"}
        </button>
      </div>
      <p class="job-description">${escapeHtml(job.description)}</p>
      <div class="job-meta">
        <span>${escapeHtml(job.salary)}</span>
        <span>${escapeHtml(job.location)}</span>
        <span>${escapeHtml(job.type)}</span>
      </div>
      <div class="job-actions">
        <span class="match-badge">Độ phù hợp: ${getAiMatchScore(job.id)}%</span>
        <button class="ghost-button compact-button" data-view-job="${job.id}" type="button">Xem chi tiết</button>
        <button class="${applied ? "secondary-button" : "primary-button"}" data-apply-job="${job.id}" type="button">
          ${applied ? "Đã ứng tuyển" : "Ứng tuyển"}
        </button>
      </div>
    </article>
  `;
}

function bindCandidateJobCardActions(root) {
  if (!root) return;

  root.querySelectorAll("[data-view-job]").forEach((button) => {
    if (button.dataset.jobActionBound) return;
    button.dataset.jobActionBound = "true";
    button.addEventListener("click", () => openJobDetailPage(Number(button.dataset.viewJob)));
  });

  root.querySelectorAll("[data-apply-job]").forEach((button) => {
    if (button.dataset.jobActionBound) return;
    button.dataset.jobActionBound = "true";
    button.addEventListener("click", () => applyJob(Number(button.dataset.applyJob)));
  });

  root.querySelectorAll("[data-save-job]").forEach((button) => {
    if (button.dataset.jobActionBound) return;
    button.dataset.jobActionBound = "true";
    button.addEventListener("click", () => toggleSavedJob(Number(button.dataset.saveJob)));
  });
}

function getRecommendedJob(jobs) {
  return [...jobs].sort((a, b) => getAiMatchScore(b.id) - getAiMatchScore(a.id))[0];
}

function renderCandidateSpotlight(job) {
  const applied = appState.currentUser.appliedJobs.includes(job.id);
  const saved = appState.currentUser.savedJobs.includes(job.id);
  const matchScore = getAiMatchScore(job.id);

  return `
    <section class="candidate-spotlight">
      <div>
        <p class="eyebrow">Goi y phu hop nhat</p>
        <h3>${escapeHtml(job.title)}</h3>
        <p>${escapeHtml(job.company)} - ${escapeHtml(job.location)} - ${escapeHtml(job.salary)}</p>
        <small class="job-live-time" data-job-relative-time="${escapeHtml(job.updatedAt)}">Cập nhật ${formatRelativeTime(job.updatedAt)}</small>
      </div>
      <div class="spotlight-score">
        <strong>${matchScore}%</strong>
        <span>phù hợp</span>
      </div>
      <div class="spotlight-actions">
        <button class="ghost-button" data-view-job="${job.id}" type="button">Xem chi tiết</button>
        <button class="secondary-button" data-save-job="${job.id}" type="button">${saved ? "Đã lưu" : "Lưu việc"}</button>
        <button class="${applied ? "secondary-button" : "primary-button"}" data-apply-job="${job.id}" type="button">
          ${applied ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
        </button>
      </div>
    </section>
  `;
}

function openJobDetailPage(jobId) {
  const job = appState.jobs.find((item) => item.id === jobId && item.status === "Approved");
  if (!job) return;
  closeJobDetailModal();
  if (window.location.pathname !== `/jobs/${jobId}`) window.history.pushState({ jobId }, "", `/jobs/${jobId}`);
  appState.detailJobId = jobId;
  renderCandidateJobDetail(jobId);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function navigateToCandidateHome() {
  if (window.location.pathname !== "/") window.history.pushState({}, "", "/");
  appState.detailJobId = null;
  appState.candidateTab = "jobs";
  renderCandidateView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getRelatedJobs(job) {
  return appState.jobs
    .filter((item) => item.id !== job.id && item.status === "Approved")
    .map((item) => ({
      job: item,
      score:
        (item.category === job.category ? 4 : 0) +
        (item.jobField === job.jobField ? 3 : 0) +
        (item.location === job.location ? 2 : 0) +
        (item.type === job.type ? 1 : 0),
    }))
    .sort((first, second) => second.score - first.score || getJobTimestamp(second.job) - getJobTimestamp(first.job))
    .slice(0, 3)
    .map((item) => item.job);
}

function renderCandidateJobDetail(jobId) {
  const root = document.querySelector("#dashboardRoot");
  const job = appState.jobs.find((item) => item.id === jobId && item.status === "Approved");
  if (!job) {
    root.innerHTML = `
      <section class="job-detail-not-found">
        <h1>Không tìm thấy việc làm</h1>
        <p>Tin tuyển dụng có thể đã đóng hoặc không còn tồn tại.</p>
        <button class="primary-button" data-back-to-jobs type="button">Về trang tìm việc</button>
      </section>`;
    root.querySelector("[data-back-to-jobs]").addEventListener("click", navigateToCandidateHome);
    return;
  }

  const applied = appState.currentUser.appliedJobs.includes(job.id);
  const saved = appState.currentUser.savedJobs.includes(job.id);
  const matchScore = getAiMatchScore(job.id);
  const relatedJobs = getRelatedJobs(job);
  const reported = appState.reports.some(
    (report) => report.jobId === job.id && report.candidateId === appState.currentUser.id,
  );

  document.title = `${job.title} - ${job.company} | JobBridge`;
  root.innerHTML = `
    <nav class="job-detail-breadcrumb" aria-label="Breadcrumb">
      <button data-back-to-jobs type="button">Việc làm</button>
      <span>/</span>
      <span>${escapeHtml(job.title)}</span>
    </nav>

    <section class="job-detail-page">
      <article class="job-detail-main">
        <header class="job-detail-hero">
          <span class="company-logo large">${escapeHtml(getInitials(job.company))}</span>
          <div class="job-detail-hero-copy">
            <p>${escapeHtml(job.company)}</p>
            <h1>${escapeHtml(job.title)}</h1>
            <div class="job-detail-tags">
              <span>${escapeHtml(job.salary)}</span>
              <span>${escapeHtml(job.location)}</span>
              <span>${escapeHtml(job.type)}</span>
            </div>
          </div>
          <div class="job-detail-primary-actions">
            <button class="${applied ? "secondary-button" : "primary-button"}" data-apply-job="${job.id}" type="button">${applied ? "Đã ứng tuyển" : "Ứng tuyển ngay"}</button>
            <button class="secondary-button" data-save-job="${job.id}" type="button">${saved ? "Bỏ lưu" : "Lưu việc"}</button>
          </div>
        </header>

        <section class="job-detail-content-card">
          <h2>Mô tả công việc</h2>
          <p>${escapeHtml(job.description)}</p>
        </section>

        <section class="job-detail-content-card">
          <h2>Thông tin chung</h2>
          <dl class="job-detail-facts">
            <div><dt>Kinh nghiệm</dt><dd>${escapeHtml(job.experience || "Không yêu cầu")}</dd></div>
            <div><dt>Ngành nghề</dt><dd>${escapeHtml(job.jobField || job.category || "Khác")}</dd></div>
            <div><dt>Lĩnh vực công ty</dt><dd>${escapeHtml(job.companyField || "Chưa cập nhật")}</dd></div>
            <div><dt>Hình thức</dt><dd>${escapeHtml(job.type)}</dd></div>
          </dl>
        </section>

        <section class="job-detail-content-card job-detail-match-card">
          <div><strong>${matchScore}%</strong><span>phù hợp với bạn</span></div>
          <ul>${getMatchReasons(job).map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}</ul>
        </section>
      </article>

      <aside class="job-detail-sidebar">
        <section class="job-detail-side-card">
          <h2>Thao tác</h2>
          <button data-share-job="${job.id}" type="button">Chia sẻ việc làm</button>
          <button class="report-job-button ${reported ? "reported" : ""}" data-report-job="${job.id}" type="button">${reported ? "Đã báo cáo tin này" : "Báo cáo tin sai hoặc lừa đảo"}</button>
        </section>
        <section class="job-detail-side-card">
          <h2>Về công ty</h2>
          <strong>${escapeHtml(job.company)}</strong>
          <p>${escapeHtml(job.companyField || "Nhà tuyển dụng trên JobBridge")}</p>
          <span>${escapeHtml(job.location)}</span>
        </section>
      </aside>
    </section>

    <section class="related-jobs-section">
      <div class="related-jobs-heading">
        <div><p class="eyebrow">Có thể bạn quan tâm</p><h2>Việc làm liên quan</h2></div>
        <button data-back-to-jobs type="button">Xem tất cả việc làm</button>
      </div>
      <div class="related-job-grid">
        ${relatedJobs.length ? relatedJobs.map(renderRelatedJobCard).join("") : `<div class="empty-state compact-empty">Chưa có việc làm liên quan.</div>`}
      </div>
    </section>
  `;

  root.querySelectorAll("[data-back-to-jobs]").forEach((button) => button.addEventListener("click", navigateToCandidateHome));
  root.querySelector("[data-share-job]").addEventListener("click", () => shareJob(job));
  root.querySelector("[data-report-job]").addEventListener("click", () => openJobReportModal(job.id));
  bindCandidateJobCardActions(root);
}

function renderRelatedJobCard(job) {
  return `
    <article class="related-job-card">
      <div><span class="company-logo">${escapeHtml(getInitials(job.company))}</span><div><h3>${escapeHtml(job.title)}</h3><p>${escapeHtml(job.company)}</p></div></div>
      <div class="job-meta"><span>${escapeHtml(job.salary)}</span><span>${escapeHtml(job.location)}</span></div>
      <button class="ghost-button" data-view-job="${job.id}" type="button">Xem chi tiết</button>
    </article>
  `;
}

async function shareJob(job) {
  const url = `${window.location.origin}/jobs/${job.id}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: `${job.title} - ${job.company}`, text: `Xem việc làm ${job.title} tại ${job.company}`, url });
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      showToast("Đã sao chép liên kết việc làm", "success");
    } else {
      const input = document.createElement("textarea");
      input.value = url;
      document.body.append(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      showToast("Đã sao chép liên kết việc làm", "success");
    }
  } catch (error) {
    if (error?.name !== "AbortError") showToast("Không thể chia sẻ việc làm lúc này.", "error");
  }
}

function openJobReportModal(jobId) {
  const job = appState.jobs.find((item) => item.id === jobId);
  if (!job) return;
  closeJobReportModal();
  document.body.classList.add("modal-open");
  document.body.insertAdjacentHTML("beforeend", `
    <div id="jobReportModal" class="modal-backdrop" role="presentation">
      <section class="job-report-modal" role="dialog" aria-modal="true" aria-labelledby="jobReportTitle">
        <button class="modal-close" data-close-job-report type="button" aria-label="Đóng báo cáo">&times;</button>
        <div><p class="eyebrow">Báo cáo tin tuyển dụng</p><h2 id="jobReportTitle">${escapeHtml(job.title)}</h2><p>${escapeHtml(job.company)}</p></div>
        <form id="jobReportForm">
          <label>Lý do báo cáo
            <select id="jobReportReason" required>
              <option value="">Chọn lý do</option>
              <option value="incorrect">Nội dung sai sự thật</option>
              <option value="scam">Có dấu hiệu lừa đảo</option>
              <option value="impersonation">Giả mạo công ty</option>
              <option value="fee">Yêu cầu ứng viên nộp phí</option>
              <option value="other">Lý do khác</option>
            </select>
          </label>
          <label>Thông tin bổ sung
            <textarea id="jobReportDetails" maxlength="1000" rows="5" placeholder="Mô tả chi tiết để JobBridge có thể kiểm tra..."></textarea>
          </label>
          <div id="jobReportMessage" class="auth-message" aria-live="polite"></div>
          <div class="modal-actions"><button class="ghost-button" data-close-job-report type="button">Huỷ</button><button class="danger-button" type="submit">Gửi báo cáo</button></div>
        </form>
      </section>
    </div>`);

  const modal = document.querySelector("#jobReportModal");
  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.closest("[data-close-job-report]")) closeJobReportModal();
  });
  modal.querySelector("#jobReportForm").addEventListener("submit", (event) => submitJobReport(event, job));
  document.addEventListener("keydown", handleJobReportEscape);
  modal.querySelector("#jobReportReason").focus();
}

function submitJobReport(event, job) {
  event.preventDefault();
  const reason = document.querySelector("#jobReportReason").value;
  const details = document.querySelector("#jobReportDetails").value.trim();
  if (!reason) {
    showInlineMessage("#jobReportMessage", "Vui lòng chọn lý do báo cáo.", "error");
    return;
  }
  const previous = appState.reports.find((report) => report.jobId === job.id && report.candidateId === appState.currentUser.id);
  const report = { id: previous?.id || Date.now(), jobId: job.id, candidateId: appState.currentUser.id, reason, details, status: "pending", reportedAt: new Date().toISOString() };
  appState.reports = [report, ...appState.reports.filter((item) => item.id !== report.id)];
  writeStorage(STORAGE_KEYS.reports, appState.reports);
  closeJobReportModal();
  renderCandidateJobDetail(job.id);
  showToast("Đã gửi báo cáo để JobBridge kiểm tra", "success");
}

function closeJobReportModal() {
  document.querySelector("#jobReportModal")?.remove();
  if (!document.querySelector("#applicationModal") && !document.querySelector("#jobDetailModal")) document.body.classList.remove("modal-open");
  document.removeEventListener("keydown", handleJobReportEscape);
}

function handleJobReportEscape(event) {
  if (event.key === "Escape") closeJobReportModal();
}

function openJobDetailModal(jobId) {
  const job = appState.jobs.find((item) => item.id === jobId);
  if (!job) return;

  const saved = appState.currentUser.savedJobs.includes(job.id);
  const applied = appState.currentUser.appliedJobs.includes(job.id);
  const matchScore = getAiMatchScore(job.id);
  const reasons = getMatchReasons(job);

  closeJobDetailModal();
  document.body.classList.add("modal-open");
  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div id="jobDetailModal" class="modal-backdrop" role="presentation">
        <section class="job-detail-modal" role="dialog" aria-modal="true" aria-labelledby="jobDetailTitle">
          <button class="modal-close" data-close-job-detail type="button" aria-label="Dong chi tiet viec lam">&times;</button>
          <div class="job-detail-header">
            <span class="company-logo large">${escapeHtml(getInitials(job.company))}</span>
            <div>
              <p class="eyebrow">Chi tiet viec lam</p>
              <h2 id="jobDetailTitle">${escapeHtml(job.title)}</h2>
              <p>${escapeHtml(job.company)} - ${escapeHtml(job.location)}</p>
            </div>
          </div>

          <div class="job-detail-meta">
            <span>${escapeHtml(job.salary)}</span>
            <span>${escapeHtml(job.location)}</span>
            <span>${escapeHtml(job.type)}</span>
            <span>${escapeHtml(job.status)}</span>
            <span data-job-relative-time="${escapeHtml(job.updatedAt)}">Cập nhật ${formatRelativeTime(job.updatedAt)}</span>
          </div>

          <div class="job-detail-match">
            <div>
              <strong>${matchScore}%</strong>
              <span>Do phu hop voi ho so</span>
            </div>
            <ul>
              ${reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
            </ul>
          </div>

          <div class="job-detail-section">
            <h3>Mo ta cong viec</h3>
            <p>${escapeHtml(job.description)}</p>
          </div>

          <div class="modal-actions">
            <button class="secondary-button" data-save-job="${job.id}" type="button">
              ${saved ? "Bo luu" : "Luu viec"}
            </button>
            <button class="${applied ? "secondary-button" : "primary-button"}" data-apply-job="${job.id}" type="button">
              ${applied ? "Da ung tuyen" : "Ung tuyen ngay"}
            </button>
          </div>
        </section>
      </div>
    `,
  );

  const modal = document.querySelector("#jobDetailModal");
  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.closest("[data-close-job-detail]")) {
      closeJobDetailModal();
    }
  });
  bindCandidateJobCardActions(modal);
  document.addEventListener("keydown", handleJobDetailEscape);
}

function closeJobDetailModal() {
  document.querySelector("#jobDetailModal")?.remove();
  document.body.classList.remove("modal-open");
  document.removeEventListener("keydown", handleJobDetailEscape);
}

function handleJobDetailEscape(event) {
  if (event.key === "Escape") {
    closeJobDetailModal();
  }
}

function getMatchReasons(job) {
  const currentUser = normalizeUser(appState.currentUser);
  const desiredWords = currentUser.desiredTitle.toLowerCase().split(/\s+/).filter(Boolean);
  const jobText = `${job.title} ${job.description}`.toLowerCase();
  const reasons = [];

  if (desiredWords.some((word) => jobText.includes(word))) {
    reasons.push("Gan voi vi tri mong muon trong ho so cua ban.");
  }

  const matchedSkills = currentUser.skills.filter((skill) => jobText.includes(skill.toLowerCase()));
  if (matchedSkills.length > 0) {
    reasons.push(`Co ky nang lien quan: ${matchedSkills.join(", ")}.`);
  }

  if (job.maxSalary >= appState.candidateFilters.minSalary) {
    reasons.push("Muc luong dat nguong loc hien tai.");
  }

  if (job.type === "Remote") {
    reasons.push("Co hinh thuc Remote, phu hop voi ung vien can linh hoat.");
  }

  return reasons.length > 0 ? reasons.slice(0, 3) : ["Thong tin viec lam phu hop voi bo loc tim kiem hien tai."];
}

function getFilteredApprovedJobs() {
  const keyword = appState.candidateKeyword.trim().toLowerCase();
  const { location, types, minSalary, saturday, categories, experiences, companyField, jobField } = appState.candidateFilters;

  const jobs = appState.jobs.filter((job) => {
      const searchable = `${job.title} ${job.company} ${job.location} ${job.salary} ${job.description} ${job.category} ${job.experience}`.toLowerCase();
      const matchKeyword = !keyword || searchable.includes(keyword);
      const matchLocation = !location || job.location === location;
      const matchType = types.length === 0 || types.includes(job.type);
      const matchSalary = job.maxSalary >= minSalary;
      const matchSaturday = !saturday || job.saturday === saturday;
      const matchCategory = categories.length === 0 || categories.includes(job.category);
      const matchExperience = experiences.length === 0 || experiences.includes(job.experience);
      const matchCompanyField = !companyField || job.companyField === companyField;
      const matchJobField = !jobField || job.jobField === jobField;
      return job.status === "Approved" && matchKeyword && matchLocation && matchType && matchSalary && matchSaturday && matchCategory && matchExperience && matchCompanyField && matchJobField;
    });

  if (appState.candidateSort === "salary") {
    return jobs.sort((first, second) => second.maxSalary - first.maxSalary || second.minSalary - first.minSalary);
  }
  if (appState.candidateSort === "match") {
    return jobs.sort((first, second) => getAiMatchScore(second.id) - getAiMatchScore(first.id));
  }
  return jobs.sort((first, second) => getJobTimestamp(second) - getJobTimestamp(first));
}

function applyJob(jobId) {
  const job = appState.jobs.find((item) => item.id === jobId);
  if (!job) return;

  const applied = appState.currentUser.appliedJobs.includes(jobId);
  if (applied) {
    showToast("Bạn đã ứng tuyển công việc này.", "info");
    return;
  }

  openApplicationModal(jobId);
}

function openApplicationModal(jobId) {
  const job = appState.jobs.find((item) => item.id === jobId);
  if (!job) return;
  const cvs = getCandidateCvs();

  closeJobDetailModal();
  closeApplicationModal();
  document.body.classList.add("modal-open");
  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div id="applicationModal" class="modal-backdrop" role="presentation">
        <section class="application-modal" role="dialog" aria-modal="true" aria-labelledby="applicationModalTitle">
          <button class="modal-close" data-close-application type="button" aria-label="Đóng quy trình ứng tuyển">&times;</button>
          <header class="application-modal-header">
            <p class="eyebrow">Ứng tuyển vào ${escapeHtml(job.company)}</p>
            <h2 id="applicationModalTitle">${escapeHtml(job.title)}</h2>
          </header>

          <ol class="application-steps" aria-label="Các bước ứng tuyển">
            <li class="active" data-application-step-indicator="1"><span>1</span> Chọn CV</li>
            <li data-application-step-indicator="2"><span>2</span> Thư giới thiệu</li>
            <li data-application-step-indicator="3"><span>3</span> Xác nhận</li>
          </ol>

          <form id="applicationForm">
            <section class="application-step-panel active" data-application-step="1">
              <div class="application-section-heading">
                <h3>Chọn CV gửi đến nhà tuyển dụng</h3>
                <p>CV đã chọn sẽ được ghi lại cùng hồ sơ ứng tuyển.</p>
              </div>
              <div class="application-cv-options">
                ${
                  cvs.length
                    ? cvs
                        .map(
                          (cv, index) => `
                            <label class="application-cv-option">
                              <input name="applicationCv" type="radio" value="${cv.id}" ${index === 0 ? "checked" : ""} />
                              <span class="cv-file-icon">CV</span>
                              <span>
                                <strong>${escapeHtml(cv.name)}</strong>
                                <small>${cv.source === "profile" ? "Tạo online từ hồ sơ" : "CV tải lên"} • ${formatDate(cv.updatedAt)}</small>
                              </span>
                            </label>
                          `,
                        )
                        .join("")
                    : `<div class="empty-state compact-empty">Bạn chưa có CV để ứng tuyển.</div>`
                }
              </div>
              <button class="inline-create-cv" data-create-application-cv type="button">+ Tạo CV online từ hồ sơ</button>
            </section>

            <section class="application-step-panel" data-application-step="2" hidden>
              <div class="application-section-heading">
                <h3>Viết thư giới thiệu</h3>
                <p>Giới thiệu ngắn gọn kinh nghiệm và lý do bạn phù hợp với vị trí này.</p>
              </div>
              <label class="cover-letter-field">
                Thư giới thiệu
                <textarea id="applicationCoverLetter" maxlength="2000" rows="8" placeholder="Kính gửi nhà tuyển dụng, tôi quan tâm đến vị trí..."></textarea>
                <small><span id="coverLetterCount">0</span>/2000 ký tự</small>
              </label>
            </section>

            <section class="application-step-panel" data-application-step="3" hidden>
              <div class="application-section-heading">
                <h3>Xác nhận thông tin trước khi gửi</h3>
                <p>Kiểm tra lại thông tin. Sau khi gửi, bạn chỉ có thể rút khi hồ sơ còn ở trạng thái “Đã nộp”.</p>
              </div>
              <dl class="application-confirmation">
                <div><dt>Vị trí</dt><dd>${escapeHtml(job.title)} • ${escapeHtml(job.company)}</dd></div>
                <div><dt>Ứng viên</dt><dd>${escapeHtml(appState.currentUser.name)}</dd></div>
                <div><dt>Liên hệ</dt><dd>${escapeHtml(appState.currentUser.email)}${appState.currentUser.phone ? ` • ${escapeHtml(appState.currentUser.phone)}` : ""}</dd></div>
                <div><dt>CV sử dụng</dt><dd id="confirmCvName">—</dd></div>
                <div><dt>Thư giới thiệu</dt><dd id="confirmCoverLetter" class="confirmation-cover-letter">—</dd></div>
              </dl>
              <label class="application-confirm-check">
                <input id="applicationConfirmed" type="checkbox" />
                <span>Tôi xác nhận thông tin trên là chính xác.</span>
              </label>
            </section>

            <div id="applicationFormMessage" class="auth-message" aria-live="polite"></div>
            <footer class="application-modal-actions">
              <button class="ghost-button" data-application-previous type="button" hidden>Quay lại</button>
              <span></span>
              <button class="primary-button" data-application-next type="button" ${cvs.length ? "" : "disabled"}>Tiếp tục</button>
              <button class="primary-button" data-submit-application type="submit" hidden>Gửi hồ sơ</button>
            </footer>
          </form>
        </section>
      </div>
    `,
  );

  const modal = document.querySelector("#applicationModal");
  modal.dataset.currentStep = "1";
  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.closest("[data-close-application]")) closeApplicationModal();
  });
  modal.querySelector("[data-create-application-cv]").addEventListener("click", () => {
    const cv = createCvFromProfile();
    closeApplicationModal();
    openApplicationModal(jobId);
    showToast(`Đã tạo ${cv.name}`, "success");
  });
  modal.querySelector("[data-application-next]").addEventListener("click", () => moveApplicationStep(1));
  modal.querySelector("[data-application-previous]").addEventListener("click", () => moveApplicationStep(-1));
  modal.querySelector("#applicationCoverLetter").addEventListener("input", (event) => {
    modal.querySelector("#coverLetterCount").textContent = event.target.value.length;
  });
  modal.querySelector("#applicationForm").addEventListener("submit", (event) => submitApplication(event, jobId));
  document.addEventListener("keydown", handleApplicationEscape);
  modal.querySelector('input[name="applicationCv"]')?.focus();
}

function moveApplicationStep(direction) {
  const modal = document.querySelector("#applicationModal");
  if (!modal) return;
  const currentStep = Number(modal.dataset.currentStep || 1);
  if (direction > 0 && currentStep === 1 && !modal.querySelector('input[name="applicationCv"]:checked')) {
    showInlineMessage("#applicationFormMessage", "Vui lòng chọn CV trước khi tiếp tục.", "error");
    return;
  }
  if (direction > 0 && currentStep === 2) {
    const coverLetter = modal.querySelector("#applicationCoverLetter").value.trim();
    if (coverLetter.length < 20) {
      showInlineMessage("#applicationFormMessage", "Thư giới thiệu cần tối thiểu 20 ký tự.", "error");
      return;
    }
  }

  const nextStep = Math.min(3, Math.max(1, currentStep + direction));
  modal.dataset.currentStep = String(nextStep);
  modal.querySelector("#applicationFormMessage").textContent = "";
  modal.querySelectorAll("[data-application-step]").forEach((panel) => {
    const active = Number(panel.dataset.applicationStep) === nextStep;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });
  modal.querySelectorAll("[data-application-step-indicator]").forEach((indicator) => {
    const step = Number(indicator.dataset.applicationStepIndicator);
    indicator.classList.toggle("active", step === nextStep);
    indicator.classList.toggle("complete", step < nextStep);
  });
  modal.querySelector("[data-application-previous]").hidden = nextStep === 1;
  modal.querySelector("[data-application-next]").hidden = nextStep === 3;
  modal.querySelector("[data-submit-application]").hidden = nextStep !== 3;

  if (nextStep === 3) updateApplicationConfirmation();
  if (nextStep === 2) modal.querySelector("#applicationCoverLetter").focus();
  if (nextStep === 3) modal.querySelector("#applicationConfirmed").focus();
}

function updateApplicationConfirmation() {
  const modal = document.querySelector("#applicationModal");
  const selectedCvId = Number(modal.querySelector('input[name="applicationCv"]:checked')?.value);
  const cv = appState.cvs.find((item) => item.id === selectedCvId);
  modal.querySelector("#confirmCvName").textContent = cv?.name || "—";
  modal.querySelector("#confirmCoverLetter").textContent = modal.querySelector("#applicationCoverLetter").value.trim() || "—";
}

function submitApplication(event, jobId) {
  event.preventDefault();
  const modal = document.querySelector("#applicationModal");
  if (!modal.querySelector("#applicationConfirmed").checked) {
    showInlineMessage("#applicationFormMessage", "Vui lòng xác nhận thông tin trước khi gửi.", "error");
    return;
  }
  const job = appState.jobs.find((item) => item.id === jobId);
  const cvId = Number(modal.querySelector('input[name="applicationCv"]:checked')?.value);
  const cv = appState.cvs.find((item) => item.id === cvId && item.candidateId === appState.currentUser.id);
  if (!job || !cv || appState.currentUser.appliedJobs.includes(jobId)) {
    showInlineMessage("#applicationFormMessage", "Không thể gửi hồ sơ. Vui lòng kiểm tra lại CV đã chọn.", "error");
    return;
  }

  updateCurrentUser({
    appliedJobs: [...appState.currentUser.appliedJobs, jobId],
  });
  appState.applications.unshift(
    normalizeApplication({
      id: Date.now(),
      candidateId: appState.currentUser.id,
      candidateName: appState.currentUser.name,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      status: "Da nop",
      appliedAt: new Date().toISOString(),
      cvId: cv.id,
      cvName: cv.name,
      coverLetter: modal.querySelector("#applicationCoverLetter").value.trim(),
      withdrawnAt: null,
    }),
  );
  writeStorage(STORAGE_KEYS.applications, appState.applications);
  closeApplicationModal();
  if (appState.detailJobId) renderCandidateJobDetail(appState.detailJobId);
  else renderCandidateView();
  showToast("Ứng tuyển thành công", "success");
}

function closeApplicationModal() {
  document.querySelector("#applicationModal")?.remove();
  if (!document.querySelector("#jobDetailModal")) document.body.classList.remove("modal-open");
  document.removeEventListener("keydown", handleApplicationEscape);
}

function handleApplicationEscape(event) {
  if (event.key === "Escape") closeApplicationModal();
}

function toggleSavedJob(jobId) {
  const isSaved = appState.currentUser.savedJobs.includes(jobId);
  const savedJobs = isSaved
    ? appState.currentUser.savedJobs.filter((id) => id !== jobId)
    : [...appState.currentUser.savedJobs, jobId];

  updateCurrentUser({ savedJobs });
  closeJobDetailModal();
  if (appState.detailJobId) renderCandidateJobDetail(appState.detailJobId);
  else renderCandidateView();
  showToast(isSaved ? "Da bo luu viec lam" : "Da luu thanh cong", isSaved ? "info" : "success");
}

function bindCandidateProfile() {
  document.querySelector("#candidateProfileForm").addEventListener("submit", handleProfileSubmit);
  document.querySelector("#skillInput").addEventListener("keydown", handleSkillInput);
  document.querySelector("#createCvFromProfile")?.addEventListener("click", () => {
    const input = document.querySelector("#onlineCvName");
    const cv = createCvFromProfile(input?.value || "");
    appState.candidateTab = "profile";
    renderCandidateView();
    showToast(`Đã tạo ${cv.name}`, "success");
  });
  document.querySelector("#candidateCvUpload")?.addEventListener("change", uploadCvFromComputer);
  document.querySelectorAll("[data-view-cv]").forEach((button) => {
    button.addEventListener("click", () => viewUploadedCv(Number(button.dataset.viewCv)));
  });
  document.querySelectorAll("[data-delete-cv]").forEach((button) => {
    button.addEventListener("click", () => deleteCandidateCv(Number(button.dataset.deleteCv)));
  });
  document.querySelectorAll("[data-remove-skill]").forEach((button) => {
    button.addEventListener("click", () => removeSkill(button.dataset.removeSkill));
  });
}

function handleProfileSubmit(event) {
  event.preventDefault();
  const name = document.querySelector("#profileName").value.trim();
  const desiredTitle = document.querySelector("#profileDesiredTitle").value.trim();
  const phone = document.querySelector("#profilePhone").value.trim();
  const location = document.querySelector("#profileLocation").value.trim();
  const dateOfBirth = document.querySelector("#profileDateOfBirth").value;
  const gender = document.querySelector("#profileGender").value;
  const portfolio = document.querySelector("#profilePortfolio").value.trim();
  const experienceLevel = document.querySelector("#profileExperienceLevel").value;
  const education = document.querySelector("#profileEducation").value.trim();
  const summary = document.querySelector("#profileSummary").value.trim();

  if (!name || !desiredTitle) {
    showToast("Vui lòng nhập họ tên và vị trí mong muốn.", "error");
    return;
  }

  updateCurrentUser({
    name,
    avatar: getInitials(name),
    desiredTitle,
    phone,
    location,
    dateOfBirth,
    gender,
    portfolio,
    experienceLevel,
    education,
    summary,
  });
  appState.candidateTab = "profile";
  renderDashboard();
  showToast("Đã cập nhật hồ sơ cá nhân", "success");
}

function handleSkillInput(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();

  const skill = event.target.value.trim();
  if (!skill) return;

  const skills = Array.from(new Set([...appState.currentUser.skills, skill]));
  updateCurrentUser({ skills });
  appState.candidateTab = "profile";
  renderCandidateView();
  showToast("Đã thêm kỹ năng", "success");
}

function removeSkill(skill) {
  updateCurrentUser({
    skills: appState.currentUser.skills.filter((item) => item !== skill),
  });
  appState.candidateTab = "profile";
  renderCandidateView();
  showToast("Đã xóa kỹ năng", "info");
}

function renderSkillTag(skill) {
  return `
    <span class="skill-tag">
      ${escapeHtml(skill)}
      <button data-remove-skill="${escapeHtml(skill)}" type="button" aria-label="Xóa kỹ năng">x</button>
    </span>
  `;
}

function renderCandidateHistory() {
  const root = document.querySelector("#applicationHistory");
  const rows = appState.applications
    .filter((application) => application.candidateId === appState.currentUser.id)
    .sort((first, second) => Date.parse(second.appliedAt) - Date.parse(first.appliedAt))
    .map((application) => {
      const job = appState.jobs.find((item) => item.id === application.jobId);
      if (!job) return "";
      const status = application.withdrawnAt ? "Da rut" : application.status || "Da nop";
      const canWithdraw = !application.withdrawnAt && application.status === "Da nop";
      return `
        <tr>
          <td>
            <strong>${escapeHtml(job.title)}</strong>
            <span>${escapeHtml(job.company)}</span>
          </td>
          <td>${escapeHtml(job.location)}</td>
          <td>${formatDate(application.appliedAt)}</td>
          <td>
            <strong>${escapeHtml(application.cvName)}</strong>
            <span class="history-cover-letter" title="${escapeHtml(application.coverLetter)}">${escapeHtml(application.coverLetter || "Không có thư giới thiệu")}</span>
          </td>
          <td><span class="history-status ${getHistoryStatusClass(status)}">${escapeHtml(status)}</span></td>
          <td>${canWithdraw ? `<button class="withdraw-application-button" data-withdraw-application="${application.id}" type="button">Rút hồ sơ</button>` : "—"}</td>
        </tr>
      `;
    })
    .filter(Boolean);

  if (rows.length === 0) {
    root.innerHTML = `<div class="empty-state">Ban chua ung tuyen cong viec nao.</div>`;
    return;
  }

  root.innerHTML = `
    <table class="spa-table">
      <thead>
        <tr>
          <th>Cong viec</th>
          <th>Dia diem</th>
          <th>Ngay nop</th>
          <th>CV đã dùng</th>
          <th>Trang thai</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>${rows.join("")}</tbody>
    </table>
  `;
  root.querySelectorAll("[data-withdraw-application]").forEach((button) => {
    button.addEventListener("click", () => withdrawApplication(Number(button.dataset.withdrawApplication)));
  });
}

function withdrawApplication(applicationId) {
  const application = appState.applications.find(
    (item) => item.id === applicationId && item.candidateId === appState.currentUser.id,
  );
  if (!application || application.withdrawnAt || application.status !== "Da nop") {
    showToast("Hồ sơ không còn ở trạng thái mới nộp nên không thể rút.", "error");
    return;
  }
  if (!window.confirm("Bạn chắc chắn muốn rút hồ sơ này?")) return;

  application.withdrawnAt = new Date().toISOString();
  writeStorage(STORAGE_KEYS.applications, appState.applications);
  const activeJobIds = appState.applications
    .filter((item) => item.candidateId === appState.currentUser.id && !item.withdrawnAt)
    .map((item) => item.jobId);
  updateCurrentUser({ appliedJobs: Array.from(new Set(activeJobIds)) });
  appState.candidateTab = "history";
  renderCandidateView();
  showToast("Đã rút hồ sơ thành công", "success");
}

function renderSavedJobs() {
  const root = document.querySelector("#savedJobGrid");
  const savedJobs = appState.currentUser.savedJobs
    .map((jobId) => appState.jobs.find((job) => job.id === jobId))
    .filter(Boolean);

  if (savedJobs.length === 0) {
    root.innerHTML = `<div class="empty-state">Ban chua luu cong viec nao.</div>`;
    return;
  }

  root.innerHTML = savedJobs.map((job) => renderCandidateJobCard(job)).join("");
  bindCandidateJobCardActions(root);
}

function getHistoryStatusClass(status) {
  if (status === "Len lich phong van") return "interview";
  if (status === "Tu choi") return "rejected";
  if (status === "Da rut") return "withdrawn";
  return "submitted";
}

function getAiMatchScore(jobId) {
  if (!appState.matchScores[jobId]) {
    appState.matchScores[jobId] = 70 + Math.floor(Math.random() * 26);
  }
  return appState.matchScores[jobId];
}
