// Layout, thông báo và các hàm trình bày dùng chung.
function renderSiteNavigation() {
  return `
    <nav class="site-nav" aria-label="Điều hướng chính">
      ${siteNavItems
        .map(
          (item) => `
            <div class="site-nav-group">
              <button class="site-nav-item ${item.active ? "active" : ""}" type="button" aria-haspopup="true">
                ${escapeHtml(item.label)}
              </button>
              <div class="site-nav-dropdown" role="menu">
                ${item.items
                  .map((label) => `<button type="button" role="menuitem">${escapeHtml(label)}</button>`)
                  .join("")}
              </div>
            </div>
          `,
        )
        .join("")}
    </nav>
  `;
}

function renderBrandLogo() {
  return `<img class="brand-logo" src="../assets/jobbridge-logo.png" alt="JobBridge" />`;
}

function renderTopEmployers() {
  return `
    <section class="top-employers" aria-labelledby="topEmployersTitle">
      <div class="top-employers-inner">
        <p class="top-employers-eyebrow">Đối tác tuyển dụng uy tín</p>
        <h2 id="topEmployersTitle">Nhà tuyển dụng hàng đầu</h2>
        <p class="top-employers-description">Khám phá cơ hội nghề nghiệp từ những doanh nghiệp nổi bật trên JobBridge.</p>
        <div class="top-employer-grid">
          ${featuredEmployers
            .map(
              (employer) => `
                <button class="top-employer-card" data-top-employer="${escapeHtml(employer.name)}" type="button" aria-label="Xem việc làm tại ${escapeHtml(employer.name)}">
                  <span class="top-employer-mark top-employer-mark-${employer.tone}" aria-hidden="true">${escapeHtml(employer.mark)}</span>
                  <span class="top-employer-copy">
                    <strong>${escapeHtml(employer.name)}</strong>
                    <small>${escapeHtml(employer.field)}</small>
                  </span>
                </button>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function bindTopEmployers() {
  document.querySelectorAll("[data-top-employer]").forEach((button) => {
    button.addEventListener("click", () => {
      const company = button.dataset.topEmployer;
      if (appState.currentUser.role !== "candidate") {
        showToast(`Đăng nhập bằng tài khoản ứng viên để xem việc làm tại ${company}.`);
        return;
      }

      const hasOpenJobs = appState.jobs.some(
        (job) => job.status === "Approved" && job.company.toLowerCase() === company.toLowerCase(),
      );
      if (!hasOpenJobs) {
        showToast(`${company} hiện chưa có vị trí đang tuyển.`);
        return;
      }

      if (window.location.pathname !== "/") window.history.pushState({}, "", "/");
      appState.detailJobId = null;
      appState.candidateKeyword = company;
      appState.candidateTab = "jobs";
      renderCandidateView();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function renderSiteFooter(user) {
  const year = new Date().getFullYear();
  return `
    <footer class="site-footer">
      <div class="site-footer-inner">
        <section class="site-footer-brand" aria-label="Giới thiệu JobBridge">
          <button class="site-footer-logo" data-footer-home type="button" aria-label="Về trang chủ JobBridge">
            ${renderBrandLogo()}
          </button>
          <p>Kết nối ứng viên phù hợp với nhà tuyển dụng uy tín bằng một quy trình tìm việc rõ ràng, thuận tiện và an toàn.</p>
          <div class="site-footer-promise">
            <span>Đúng người</span>
            <span>Đúng việc</span>
            <span>Đúng thời điểm</span>
          </div>
        </section>

        <nav class="site-footer-column" aria-label="Dành cho ứng viên">
          <h2>Dành cho ứng viên</h2>
          <button data-footer-candidate-tab="jobs" type="button">Tìm việc làm</button>
          <button data-footer-candidate-tab="profile" type="button">Hồ sơ và CV</button>
          <button data-footer-candidate-tab="saved" type="button">Việc làm đã lưu</button>
          <button data-footer-candidate-tab="history" type="button">Lịch sử ứng tuyển</button>
        </nav>

        <nav class="site-footer-column" aria-label="Dành cho nhà tuyển dụng">
          <h2>Dành cho nhà tuyển dụng</h2>
          <button data-footer-employer-tab="post" type="button">Đăng tin tuyển dụng</button>
          <button data-footer-employer-tab="kanban" type="button">Quản lý ứng viên</button>
          <button data-footer-notice type="button">Giải pháp tuyển dụng</button>
          <button data-footer-notice type="button">Cẩm nang tuyển dụng</button>
        </nav>

        <section class="site-footer-column site-footer-support">
          <h2>Hỗ trợ JobBridge</h2>
          <a href="mailto:support@jobbridge.vn">support@jobbridge.vn</a>
          <p>Thứ 2 - Thứ 6<br />08:00 - 17:30</p>
          <p>TP. Hồ Chí Minh, Việt Nam</p>
          <span class="site-footer-account">Bạn đang dùng tài khoản ${user.role === "candidate" ? "ứng viên" : user.role === "employer" ? "nhà tuyển dụng" : "quản trị viên"}</span>
        </section>
      </div>

      <div class="site-footer-bottom">
        <p>&copy; ${year} JobBridge. Nền tảng tuyển dụng và ứng tuyển việc làm.</p>
        <div>
          <button data-footer-notice type="button">Điều khoản sử dụng</button>
          <button data-footer-notice type="button">Chính sách bảo mật</button>
        </div>
      </div>
    </footer>
  `;
}

function bindSiteFooter() {
  document.querySelectorAll("[data-footer-home]").forEach((button) => {
    button.addEventListener("click", goToDashboardHome);
  });

  document.querySelectorAll("[data-footer-candidate-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      if (appState.currentUser.role !== "candidate") {
        showToast("Vui lòng sử dụng tài khoản ứng viên để mở mục này.", "error");
        return;
      }
      showCandidateTab(button.dataset.footerCandidateTab);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-footer-employer-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      if (appState.currentUser.role !== "employer") {
        showToast("Vui lòng sử dụng tài khoản nhà tuyển dụng để mở mục này.", "error");
        return;
      }
      appState.companyTab = button.dataset.footerEmployerTab;
      renderCompanyView();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-footer-notice]").forEach((button) => {
    button.addEventListener("click", () => showToast("Nội dung này đang được JobBridge cập nhật."));
  });
}

function renderTopbarUserArea(user) {
  if (user.role !== "candidate") {
    return `
      <div class="spa-user-box">
        <span class="spa-user-name">${escapeHtml(user.name)}</span>
        <button id="logoutButton" class="ghost-button" type="button">Đăng xuất</button>
      </div>
    `;
  }

  return `
    <div class="spa-user-box account-menu-shell">
      <button class="topbar-icon-button" type="button" aria-label="Thông báo">
        ${renderAccountIcon("bell")}
      </button>
      <button class="topbar-icon-button" type="button" aria-label="Tin nhắn">
        ${renderAccountIcon("chat")}
      </button>
      <button id="accountMenuButton" class="account-avatar-button" type="button" aria-label="Mở menu tài khoản" aria-controls="candidateAccountMenu" aria-expanded="false">
        ${renderUserAvatar("topbar")}
        <span class="account-avatar-chevron"></span>
      </button>
      ${renderCandidateAccountMenu(user)}
    </div>
  `;
}

function renderCandidateAccountMenu(user) {
  const jobItems = [
    { label: "Việc làm đã lưu", tab: "saved" },
    { label: "Việc làm đã ứng tuyển", tab: "history" },
    { label: "Việc làm phù hợp với bạn", tab: "jobs" },
    { label: "Cài đặt gợi ý việc làm", tab: "jobs" },
  ];
  const cvItems = [
    { label: "CV của tôi", tab: "profile" },
    { label: "Cover Letter của tôi", tab: "profile" },
    { label: "Nhà tuyển dụng muốn kết nối với bạn", tab: "profile" },
    { label: "Nhà tuyển dụng xem hồ sơ", tab: "profile" },
  ];
  const emailItems = [
    { label: "Cài đặt nhận email", tab: "profile" },
    { label: "Thông báo việc làm", tab: "jobs" },
  ];
  const securityItems = [
    { label: "Thông tin cá nhân", tab: "profile" },
    { label: "Cài đặt bảo mật", tab: "profile" },
  ];
  return `
    <div id="candidateAccountMenu" class="candidate-account-menu" hidden>
      <div class="account-menu-profile">
        <div class="account-menu-avatar">${renderUserAvatar("account")}</div>
        <div class="account-menu-info">
          <strong>${escapeHtml(user.name)}</strong>
          <span>Tài khoản đã xác thực</span>
          <small>ID ${formatCandidateAccountId(user)}</small>
        </div>
      </div>
      <div class="account-menu-divider"></div>
      ${renderAccountMenuGroup("jobs", "Quản lý tìm việc", jobItems, false, true)}
      ${renderAccountMenuGroup("cv", "Quản lý CV & Cover letter", cvItems)}
      ${renderAccountMenuGroup("mail", "Cài đặt email & thông báo", emailItems)}
      ${renderAccountMenuGroup("security", "Cá nhân & Bảo mật", securityItems)}
      <button id="logoutButton" class="account-logout-button" type="button">
        ${renderAccountIcon("logout")}
        <span>Đăng xuất</span>
      </button>
    </div>
  `;
}

function renderAccountMenuGroup(icon, label, items, expanded = false, current = false) {
  const panelId = `accountMenuGroup-${icon}`;
  return `
    <section class="account-menu-group ${current ? "is-current" : ""}">
      <button class="account-menu-group-head" data-account-group-toggle type="button" aria-expanded="${expanded}" aria-controls="${panelId}">
        <span class="account-menu-group-title">
          ${renderAccountIcon(icon)}
          <strong>${escapeHtml(label)}</strong>
        </span>
        ${renderAccountIcon("chevronDown")}
      </button>
      <div id="${panelId}" class="account-menu-subitems" ${expanded ? "" : "hidden"}>
        ${items
          .map(
            (item) => `
              <button class="account-menu-subitem" data-candidate-account-tab="${escapeHtml(item.tab)}" type="button">
                ${escapeHtml(item.label)}
              </button>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function bindCandidateAccountMenu() {
  const button = document.querySelector("#accountMenuButton");
  const menu = document.querySelector("#candidateAccountMenu");
  const logoutButton = document.querySelector("#logoutButton");

  if (!button || !menu || !logoutButton) return;

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = menu.hidden;
    menu.hidden = !willOpen;
    button.setAttribute("aria-expanded", String(willOpen));
  });

  menu.addEventListener("click", (event) => event.stopPropagation());
  const groupToggles = [...menu.querySelectorAll("[data-account-group-toggle]")];
  groupToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const willExpand = toggle.getAttribute("aria-expanded") !== "true";

      groupToggles.forEach((otherToggle) => {
        otherToggle.setAttribute("aria-expanded", "false");
        otherToggle.closest(".account-menu-group")?.classList.remove("is-current");
        const otherPanel = document.querySelector(`#${otherToggle.getAttribute("aria-controls")}`);
        if (otherPanel) otherPanel.hidden = true;
      });

      if (willExpand) {
        toggle.setAttribute("aria-expanded", "true");
        toggle.closest(".account-menu-group")?.classList.add("is-current");
        const panel = document.querySelector(`#${toggle.getAttribute("aria-controls")}`);
        if (panel) panel.hidden = false;
      } else {
        menu.querySelector(".account-menu-group")?.classList.add("is-current");
      }
    });
  });

  menu.querySelectorAll("[data-candidate-account-tab]").forEach((item) => {
    item.addEventListener("click", () => {
      showCandidateTab(item.dataset.candidateAccountTab);
      menu.hidden = true;
      button.setAttribute("aria-expanded", "false");
    });
  });
  logoutButton.addEventListener("click", logout);

  document.addEventListener("click", () => {
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
  });
}
function showInlineMessage(selector, text, type) {
  const message = document.querySelector(selector);
  message.textContent = text;
  message.className = `auth-message active ${type}`;
}

function showToast(message, type = "success") {
  let toastHost = document.querySelector("#toastHost");
  if (!toastHost) {
    toastHost = document.createElement("div");
    toastHost.id = "toastHost";
    toastHost.className = "toast-host";
    document.body.append(toastHost);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastHost.append(toast);

  window.setTimeout(() => {
    toast.classList.add("leaving");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 2200);
}

function startRealtimeUpdates() {
  stopRealtimeUpdates();
  refreshRealtimeLabels();
  realtimeUpdateTimer = window.setInterval(refreshRealtimeLabels, 30000);
}

function stopRealtimeUpdates() {
  if (!realtimeUpdateTimer) return;
  window.clearInterval(realtimeUpdateTimer);
  realtimeUpdateTimer = null;
}

function refreshRealtimeLabels() {
  document.querySelectorAll("[data-job-relative-time]").forEach((item) => {
    item.textContent = `Cập nhật ${formatRelativeTime(item.dataset.jobRelativeTime)}`;
  });
}

function formatNumber(value) {
  return Number(value).toLocaleString("vi-VN");
}

function getJobTimestamp(job) {
  const timestamp = Date.parse(job.updatedAt || job.createdAt || "");
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatRelativeTime(dateString) {
  const timestamp = Date.parse(dateString);
  if (Number.isNaN(timestamp)) return formatDate(toDateInput(new Date()));
  return formatDate(dateString);
}

function toDateInput(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getInitials(value) {
  return value
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatCandidateAccountId(user) {
  return String(92413230 + (Number(user.id) || 0));
}

function renderAccountIcon(name) {
  const icons = {
    bell: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M18 9.8c0-3.3-2.3-5.8-6-5.8s-6 2.5-6 5.8c0 4-1.6 5.4-2.2 6.2h16.4c-.6-.8-2.2-2.2-2.2-6.2Z" />
        <path d="M9.8 19a2.3 2.3 0 0 0 4.4 0" />
      </svg>
    `,
    chat: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M5 17.2a7.2 7.2 0 1 1 3.1 2.4L4 20.4l1-3.2Z" />
        <path d="M8.5 11.5h.1M12 11.5h.1M15.5 11.5h.1" />
      </svg>
    `,
    jobs: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M8 7V5.8C8 4.8 8.8 4 9.8 4h4.4c1 0 1.8.8 1.8 1.8V7" />
        <path d="M4.5 9.2h15v9.3h-15z" />
        <path d="M4.5 12.2h15M10 14h4" />
      </svg>
    `,
    cv: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M7 3.8h7l3 3v13.4H7z" />
        <path d="M14 3.8v3h3" />
        <path d="M9 14.5c.4.6.9.9 1.6.9.8 0 1.4-.5 1.4-1.2s-.5-1.1-1.4-1.1H10" />
        <path d="M13.4 12.4l1.1 3 1.1-3" />
      </svg>
    `,
    mail: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M5 5.8h12.5v10H5z" />
        <path d="m5 7 6.2 4.4L17.5 7" />
        <path d="M16.5 17.8a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" />
        <path d="M16.5 12.5v1.1M16.5 17.6v1.1M13.9 15.1h1.1M18 15.1h1.1" />
      </svg>
    `,
    security: `
      <svg viewBox="0 0 24 24" focusable="false">
        <circle cx="12" cy="7.5" r="3.2" />
        <path d="M5.5 20c.5-3.7 3-6 6.5-6s6 2.3 6.5 6" />
      </svg>
    `,
    upgrade: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M6.4 3.8h11.2c.8 0 1.4.6 1.4 1.4v13.6c0 .8-.6 1.4-1.4 1.4H6.4c-.8 0-1.4-.6-1.4-1.4V5.2c0-.8.6-1.4 1.4-1.4Z" />
        <circle cx="12" cy="10" r="2.6" />
        <path d="M8.8 16.8c.5-1.4 1.6-2.2 3.2-2.2s2.7.8 3.2 2.2" />
      </svg>
    `,
    chevronUp: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="m6 15 6-6 6 6" />
      </svg>
    `,
    chevronDown: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="m6 9 6 6 6-6" />
      </svg>
    `,
    logout: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M10 6H6v12h4" />
        <path d="M13 8.5 16.5 12 13 15.5" />
        <path d="M8.5 12h8" />
      </svg>
    `,
  };

  return `<span class="account-icon account-icon-${escapeHtml(name)}" aria-hidden="true">${icons[name] || ""}</span>`;
}

function renderUserAvatar(variant = "") {
  const variantClass = variant ? ` user-avatar-${variant}` : "";
  return `
    <span class="user-avatar${variantClass}" aria-hidden="true">
      <svg viewBox="0 0 32 32" focusable="false">
        <circle cx="16" cy="10.5" r="5" />
        <path d="M7.5 26c0-5.2 3.8-9 8.5-9s8.5 3.8 8.5 9" />
      </svg>
      <span class="user-avatar-status"></span>
    </span>
  `;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char];
  });
}
