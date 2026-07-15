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

const SUPPORT_CHAT_SESSION_KEY = "jobbridge_support_chat";
const SUPPORT_CHAT_CONTEXT_KEY = "jobbridge_support_chat_context";

function mountSupportChatboxLegacy() {
  unmountSupportChatbox();
  const messages = readSupportChatMessages();
  const shell = document.createElement("aside");
  shell.id = "supportChatbox";
  shell.className = "support-chatbox";
  shell.innerHTML = `
    <section class="support-chat-panel" id="supportChatPanel" aria-label="Hỗ trợ JobBridge" hidden>
      <header class="support-chat-header">
        <div class="support-chat-agent">
          <span class="support-chat-avatar" aria-hidden="true">JB</span>
          <div><strong>JobBridge hỗ trợ</strong><small>Phản hồi tự động</small></div>
        </div>
        <button class="support-chat-close" type="button" aria-label="Đóng hộp chat">×</button>
      </header>
      <div class="support-chat-messages" id="supportChatMessages" aria-live="polite">
        ${messages.map(renderSupportChatMessage).join("")}
      </div>
      <form class="support-chat-form" id="supportChatForm">
        <label class="sr-only" for="supportChatInput">Nội dung tin nhắn</label>
        <input id="supportChatInput" maxlength="300" autocomplete="off" placeholder="Nhập câu hỏi của bạn..." />
        <button type="submit" aria-label="Gửi tin nhắn">Gửi</button>
      </form>
    </section>
    <button class="support-chat-launcher" type="button" aria-label="Mở hộp chat hỗ trợ" aria-controls="supportChatPanel" aria-expanded="false">
      <span class="support-chat-launcher-icon" aria-hidden="true">💬</span>
      <span>Hỗ trợ</span>
    </button>
  `;
  document.body.append(shell);
  bindSupportChatbox(shell);
}

function unmountSupportChatbox() {
  document.querySelector("#supportChatbox")?.remove();
}

function bindSupportChatboxLegacy(shell) {
  const panel = shell.querySelector("#supportChatPanel");
  const launcher = shell.querySelector(".support-chat-launcher");
  const input = shell.querySelector("#supportChatInput");
  const toggle = (open) => {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    shell.classList.toggle("open", open);
    if (open) {
      scrollSupportChatToEnd(shell);
      window.setTimeout(() => input.focus(), 0);
    }
  };
  launcher.addEventListener("click", () => toggle(panel.hidden));
  shell.querySelector(".support-chat-close").addEventListener("click", () => toggle(false));
  shell.querySelector("#supportChatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    appendSupportChatMessage(shell, { sender: "user", text, time: new Date().toISOString() });
    input.value = "";
    window.setTimeout(() => {
      appendSupportChatMessage(shell, {
        sender: "bot",
        text: getSupportChatReply(text),
        time: new Date().toISOString(),
      });
    }, 450);
  });
}

function readSupportChatMessages() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(SUPPORT_CHAT_SESSION_KEY) || "[]");
    if (Array.isArray(stored) && stored.length) return stored.slice(-30);
  } catch {}
  return [{
    sender: "bot",
    text: "Xin chào! Mình có thể hỗ trợ bạn về đăng tin, ứng tuyển hoặc quản trị JobBridge.",
    time: new Date().toISOString(),
  }];
}

function appendSupportChatMessageLegacy(shell, message) {
  const messages = readSupportChatMessages();
  messages.push(message);
  sessionStorage.setItem(SUPPORT_CHAT_SESSION_KEY, JSON.stringify(messages.slice(-30)));
  shell.querySelector("#supportChatMessages").insertAdjacentHTML("beforeend", renderSupportChatMessage(message));
  scrollSupportChatToEnd(shell);
}

function renderSupportChatMessageLegacy(message) {
  const time = new Date(message.time);
  const timeLabel = Number.isNaN(time.getTime()) ? "" : time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const sender = message.sender === "user" ? "user" : "bot";
  return `<div class="support-chat-message ${sender}"><p>${escapeHtml(message.text)}</p><time>${escapeHtml(timeLabel)}</time></div>`;
}

function scrollSupportChatToEnd(shell) {
  const messages = shell.querySelector("#supportChatMessages");
  messages.scrollTop = messages.scrollHeight;
}

function getSupportChatReply(message) {
  const text = normalizeSupportChatText(message);
  const optionIntent = ({ "1": "auth", "2": "candidate_application", "3": "post_job", "4": "employer_application", "5": "admin", "6": "report" })[text];
  const intent = optionIntent || detectSupportChatIntent(text);

  if (intent) {
    sessionStorage.setItem(SUPPORT_CHAT_CONTEXT_KEY, intent);
    return getSupportChatIntentReply(intent);
  }

  const previousIntent = sessionStorage.getItem(SUPPORT_CHAT_CONTEXT_KEY);
  if (previousIntent && /^(roi sao|sau do|tiep theo|lam the nao|khong duoc|van loi|chi tiet hon)$/.test(text)) {
    return `${getSupportChatIntentReply(previousIntent)}\n\nNếu bạn vẫn gặp lỗi, hãy cho mình biết thông báo đang hiển thị hoặc bước bạn đang dừng lại.`;
  }

  if (/^(xin chao|chao|hello|hi|alo)$/.test(text)) {
    return `Xin chào ${appState.currentUser?.name || "bạn"}! Mình đang hỗ trợ khu vực ${getSupportChatRoleLabel()}. Bạn có thể mô tả việc cần làm hoặc chọn một mục bên dưới.`;
  }

  return getSupportChatFallback();
}

function normalizeSupportChatText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectSupportChatIntentLegacy(text) {
  const intents = [
    { name: "auth", phrases: ["dang nhap", "mat khau", "tai khoan", "quen mat khau", "bi khoa", "khong vao duoc"] },
    { name: "job_visibility", phrases: ["ung vien khong thay", "khong tim thay tin", "tin khong hien", "tai sao chua thay", "cho duyet", "pending"] },
    { name: "post_job", phrases: ["dang tin", "tao tin", "tin tuyen dung", "duyet tin", "sua tin", "xoa tin", "tuyen dung"] },
    { name: "candidate_application", phrases: ["ung tuyen", "nop ho so", "nop cv", "rut ho so", "tim viec", "cv cua toi"] },
    { name: "employer_application", phrases: ["xu ly ho so", "xem ung vien", "phong van", "da tuyen", "tu choi ung vien", "don ung tuyen"] },
    { name: "report", phrases: ["bao cao", "vi pham", "lua dao", "tin xau", "noi dung sai"] },
    { name: "admin", phrases: ["admin", "quan tri", "quan ly nguoi dung", "khoa tai khoan", "doanh nghiep"] },
    { name: "export", phrases: ["xuat csv", "tai csv", "xuat danh sach", "tai danh sach", "excel"] },
  ];
  const ranked = intents
    .map((intent) => ({
      name: intent.name,
      score: intent.phrases.reduce((score, phrase) => score + (text.includes(phrase) ? phrase.split(" ").length : 0), 0),
    }))
    .filter((intent) => intent.score > 0)
    .sort((a, b) => b.score - a.score);
  if (!ranked.length) return null;
  if (ranked[1] && ranked[0].score === ranked[1].score) return null;
  return ranked[0].name;
}

function getSupportChatIntentReply(intent) {
  const replies = {
    auth: `Để xử lý lỗi đăng nhập:\n1. Kiểm tra email và mật khẩu, không nhập khoảng trắng ở đầu hoặc cuối.\n2. Thử tải lại trang bằng Ctrl + F5.\n3. Nếu hệ thống báo tài khoản bị khóa, hãy liên hệ admin để mở khóa.\n4. Nếu trang không truy cập được, kiểm tra server đang chạy tại đúng cổng.`,
    job_visibility: `Nếu công ty đã đăng tin nhưng ứng viên chưa thấy:\n1. Công ty mở mục Tin tuyển dụng và kiểm tra trạng thái.\n2. Tin “Chờ duyệt” chưa hiển thị cho ứng viên.\n3. Admin cần duyệt để trạng thái chuyển thành “Đã duyệt”.\n4. Ứng viên tải lại trang và xóa bộ lọc tìm kiếm nếu vẫn chưa thấy.`,
    post_job: `Quy trình đăng tin tuyển dụng:\n1. Đăng nhập bằng tài khoản công ty.\n2. Mở Tin tuyển dụng → Tạo tin mới.\n3. Nhập đủ tiêu đề, địa điểm, lương và mô tả.\n4. Gửi tin; trạng thái ban đầu là “Chờ duyệt”.\n5. Sau khi admin duyệt, tin mới xuất hiện với ứng viên.`,
    candidate_application: `Quy trình ứng tuyển:\n1. Đăng nhập tài khoản ứng viên.\n2. Chọn một tin có trạng thái “Đã duyệt”.\n3. Mở chi tiết và chọn Ứng tuyển.\n4. Chọn CV, nhập thư giới thiệu rồi xác nhận.\n5. Theo dõi kết quả trong Lịch sử ứng tuyển; công ty sẽ cập nhật trạng thái hồ sơ.`,
    employer_application: `Công ty xử lý hồ sơ theo các bước:\n1. Mở mục Hồ sơ ứng tuyển.\n2. Xem chi tiết ứng viên và CV trước khi quyết định.\n3. Cập nhật trạng thái: Đã nộp, Lên lịch phỏng vấn, Đã tuyển hoặc Từ chối.\n4. Admin chỉ theo dõi và không thay công ty xử lý hồ sơ.`,
    report: `Để báo cáo vi phạm:\n1. Ứng viên mở chi tiết tin tuyển dụng.\n2. Chọn Báo cáo tin.\n3. Chọn lý do và mô tả rõ nội dung bất thường.\n4. Gửi báo cáo; admin sẽ xem tại mục Báo cáo vi phạm.\nKhông cung cấp mật khẩu hoặc thông tin nhạy cảm trong phần mô tả.`,
    admin: `Phạm vi của admin:\n1. Quản lý và khóa/mở tài khoản vi phạm.\n2. Theo dõi doanh nghiệp và người dùng.\n3. Duyệt, từ chối hoặc đóng tin tuyển dụng.\n4. Xem báo cáo vi phạm và nhật ký hệ thống.\n5. Chỉ theo dõi hồ sơ ứng tuyển; công ty là bên xử lý.`,
    export: `Để xuất danh sách tin tuyển dụng:\n1. Đăng nhập admin và mở Tin tuyển dụng.\n2. Dùng bộ lọc nếu chỉ muốn xuất một nhóm trạng thái.\n3. Nhấn “Xuất CSV”.\n4. File tải xuống dùng UTF-8 nên hiển thị được tiếng Việt trong Excel hoặc Google Sheets.`,
  };
  return replies[intent] || getSupportChatFallback();
}

function getSupportChatRoleLabel() {
  if (appState.currentUser?.role === "candidate") return "ứng viên";
  if (appState.currentUser?.role === "employer") return "công ty";
  return "quản trị";
}

function getSupportChatFallback() {
  return `Mình chưa xác định được vấn đề cụ thể và không muốn đoán sai. Bạn đang cần hỗ trợ mục nào?\n\n1. Đăng nhập hoặc tài khoản\n2. Tìm việc và ứng tuyển\n3. Đăng tin tuyển dụng\n4. Công ty xử lý hồ sơ\n5. Duyệt tin hoặc quản trị\n6. Báo cáo vi phạm\n\nBạn có thể nhập số hoặc mô tả thêm thông báo lỗi và bước đang thực hiện.`;
}

// Chatbox hỗ trợ nâng cao: giữ toàn bộ xử lý tại trình duyệt để dự án vẫn chạy độc lập.
const JB_SUPPORT_TICKETS_KEY = "jobbridge_support_tickets";
const JB_SUPPORT_CHAT_LIMIT = 40;
const JB_SUPPORT_ACTIONS = {
  candidate: [
    ["Tìm việc", "candidate_jobs"], ["Hồ sơ đã nộp", "candidate_history"], ["CV của tôi", "candidate_profile"],
  ],
  employer: [
    ["Đăng tin", "employer_post"], ["Tin của công ty", "employer_jobs"], ["Hồ sơ ứng viên", "employer_applications"],
  ],
  admin: [
    ["Duyệt tin", "admin_jobs"], ["Người dùng", "admin_users"], ["Báo cáo", "admin_reports"],
  ],
};

function mountSupportChatbox() {
  unmountSupportChatbox();
  const role = appState.currentUser?.role || "candidate";
  const shell = document.createElement("aside");
  shell.id = "supportChatbox";
  shell.className = "support-chatbox";
  shell.innerHTML = `
    <section class="support-chat-panel" id="supportChatPanel" role="dialog" aria-modal="false" aria-labelledby="supportChatTitle" hidden>
      <header class="support-chat-header">
        <div class="support-chat-agent"><span class="support-chat-avatar" aria-hidden="true">JB</span><div><strong id="supportChatTitle">JobBridge hỗ trợ</strong><small>Hỗ trợ theo tài khoản ${escapeHtml(getSupportChatRoleLabel())}</small></div></div>
        <div class="support-chat-header-actions">
          <button data-chat-reset type="button" aria-label="Bắt đầu cuộc trò chuyện mới" title="Làm mới">↻</button>
          <button class="support-chat-close" type="button" aria-label="Đóng hộp chat">×</button>
        </div>
      </header>
      <div class="support-chat-messages" id="supportChatMessages" aria-live="polite">${readSupportChatMessages().map(renderSupportChatMessage).join("")}</div>
      <div class="support-chat-typing" role="status" hidden><span></span><span></span><span></span> JobBridge đang trả lời</div>
      <div class="support-chat-quick" aria-label="Gợi ý nhanh">
        ${(JB_SUPPORT_ACTIONS[role] || []).map(([label, action]) => `<button type="button" data-chat-action="${action}">${escapeHtml(label)}</button>`).join("")}
        <button type="button" data-chat-action="new_ticket">Gửi yêu cầu hỗ trợ</button>
      </div>
      <form class="support-ticket-form" id="supportTicketForm" hidden>
        <strong>Phiếu yêu cầu hỗ trợ</strong>
        <label>Tiêu đề<input name="subject" maxlength="100" required /></label>
        <label>Mức độ<select name="priority"><option>Thông thường</option><option>Quan trọng</option><option>Khẩn cấp</option></select></label>
        <label>Mô tả<textarea name="description" maxlength="1000" required placeholder="Nêu bước đã làm và thông báo lỗi. Không nhập mật khẩu."></textarea></label>
        <label>Ảnh minh họa (không bắt buộc)<input name="screenshot" type="file" accept="image/*" /></label>
        <div><button type="button" data-ticket-cancel>Hủy</button><button type="submit">Lưu phiếu</button></div>
      </form>
      <form class="support-chat-form" id="supportChatForm">
        <label class="sr-only" for="supportChatInput">Nội dung tin nhắn</label>
        <input id="supportChatInput" maxlength="300" autocomplete="off" placeholder="Nhập câu hỏi của bạn..." required />
        <button type="submit" aria-label="Gửi tin nhắn">Gửi</button>
      </form>
      <small class="support-chat-privacy">Không gửi mật khẩu, OTP hoặc dữ liệu nhạy cảm.</small>
    </section>
    <button class="support-chat-launcher" type="button" aria-label="Mở hộp chat hỗ trợ" aria-controls="supportChatPanel" aria-expanded="false"><span aria-hidden="true">💬</span><span>Hỗ trợ</span></button>`;
  document.body.append(shell);
  bindSupportChatbox(shell);
}

function bindSupportChatbox(shell) {
  const panel = shell.querySelector("#supportChatPanel");
  const launcher = shell.querySelector(".support-chat-launcher");
  const input = shell.querySelector("#supportChatInput");
  const ticketForm = shell.querySelector("#supportTicketForm");
  let returnFocus = launcher;
  const toggle = (open) => {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    shell.classList.toggle("open", open);
    if (open) { returnFocus = document.activeElement; scrollSupportChatToEnd(shell); setTimeout(() => input.focus(), 0); }
    else returnFocus?.focus?.();
  };
  launcher.addEventListener("click", () => toggle(panel.hidden));
  shell.querySelector(".support-chat-close").addEventListener("click", () => toggle(false));
  shell.addEventListener("keydown", (event) => { if (event.key === "Escape") toggle(false); });
  shell.querySelector("[data-chat-reset]").addEventListener("click", () => {
    sessionStorage.removeItem(SUPPORT_CHAT_SESSION_KEY);
    sessionStorage.removeItem(SUPPORT_CHAT_CONTEXT_KEY);
    shell.querySelector("#supportChatMessages").innerHTML = readSupportChatMessages().map(renderSupportChatMessage).join("");
    input.focus();
  });
  shell.querySelector("#supportChatForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    appendSupportChatMessage(shell, { sender: "user", text, time: new Date().toISOString(), status: "Đã gửi" });
    input.value = "";
    await showSupportChatTyping(shell);
    appendSupportChatMessage(shell, buildSupportChatResponse(text));
  });
  shell.querySelector(".support-chat-quick").addEventListener("click", (event) => {
    const button = event.target.closest("[data-chat-action]");
    if (button) handleSupportChatAction(shell, button.dataset.chatAction);
  });
  shell.querySelector("#supportChatMessages").addEventListener("click", (event) => {
    const button = event.target.closest("[data-chat-action]");
    if (button) handleSupportChatAction(shell, button.dataset.chatAction);
  });
  shell.querySelector("[data-ticket-cancel]").addEventListener("click", () => { ticketForm.hidden = true; });
  ticketForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(ticketForm);
    const ticket = saveSupportTicket({ subject: data.get("subject"), priority: data.get("priority"), description: data.get("description"), screenshotName: data.get("screenshot")?.name || "" });
    ticketForm.reset(); ticketForm.hidden = true;
    appendSupportChatMessage(shell, { sender: "bot", text: `Đã lưu phiếu ${ticket.id}. Trạng thái: Chờ xử lý. Admin có thể xem phiếu trên trình duyệt này.`, time: new Date().toISOString() });
  });
}

function showSupportChatTyping(shell) {
  const typing = shell.querySelector(".support-chat-typing");
  typing.hidden = false;
  return new Promise((resolve) => setTimeout(() => { typing.hidden = true; resolve(); }, 500));
}

function buildSupportChatResponse(message) {
  const text = normalizeSupportChatText(message);
  const intent = ({ "1": "auth", "2": "candidate_application", "3": "post_job", "4": "employer_application", "5": "admin", "6": "report" })[text] || detectSupportChatIntent(text);
  if (/^(xin chao|chao|hello|hi|alo)$/.test(text)) return supportBotMessage(`Xin chào ${appState.currentUser?.name || "bạn"}! Mình có thể hướng dẫn theo vai trò ${getSupportChatRoleLabel()} hoặc kiểm tra nhanh dữ liệu tài khoản của bạn.`);
  if (/bao nhieu|trang thai|du lieu cua toi|tong quan/.test(text)) return supportBotMessage(getSupportChatDataSummary());
  if (intent) {
    sessionStorage.setItem(SUPPORT_CHAT_CONTEXT_KEY, intent);
    return supportBotMessage(getSupportChatIntentReply(intent), getSupportIntentActions(intent));
  }
  const previous = sessionStorage.getItem(SUPPORT_CHAT_CONTEXT_KEY);
  if (previous && /^(roi sao|sau do|tiep theo|chi tiet hon|van loi|khong duoc)$/.test(text)) return supportBotMessage(`${getSupportChatIntentReply(previous)}\n\nNếu vẫn lỗi, hãy gửi phiếu hỗ trợ kèm bước đang thực hiện và nguyên văn thông báo lỗi.`, [["Gửi phiếu hỗ trợ", "new_ticket"]]);
  return supportBotMessage(getSupportChatFallback(), [["Tài khoản", "ask_auth"], ["Ứng tuyển", "ask_apply"], ["Đăng tin", "ask_post"], ["Gửi phiếu", "new_ticket"]]);
}

function supportBotMessage(text, actions = []) { return { sender: "bot", text, actions, time: new Date().toISOString() }; }

function renderSupportChatMessage(message) {
  const date = new Date(message.time);
  const time = Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const sender = message.sender === "user" ? "user" : "bot";
  const actions = Array.isArray(message.actions) ? `<div class="support-chat-message-actions">${message.actions.map(([label, action]) => `<button type="button" data-chat-action="${escapeHtml(action)}">${escapeHtml(label)}</button>`).join("")}</div>` : "";
  return `<div class="support-chat-message ${sender}"><p>${escapeHtml(message.text)}</p>${actions}<time>${escapeHtml(time)}${message.status ? ` · ${escapeHtml(message.status)}` : ""}</time></div>`;
}

function appendSupportChatMessage(shell, message) {
  const messages = readSupportChatMessages(); messages.push(message);
  sessionStorage.setItem(SUPPORT_CHAT_SESSION_KEY, JSON.stringify(messages.slice(-JB_SUPPORT_CHAT_LIMIT)));
  shell.querySelector("#supportChatMessages").insertAdjacentHTML("beforeend", renderSupportChatMessage(message));
  scrollSupportChatToEnd(shell);
}

function getSupportIntentActions(intent) {
  const role = appState.currentUser?.role;
  if (intent === "candidate_application") return [["Mở lịch sử ứng tuyển", "candidate_history"]];
  if (intent === "post_job") return role === "employer" ? [["Mở trang đăng tin", "employer_post"]] : [];
  if (intent === "employer_application") return role === "employer" ? [["Mở hồ sơ ứng viên", "employer_applications"]] : [];
  if (intent === "admin") return role === "admin" ? [["Mở quản lý người dùng", "admin_users"], ["Mở duyệt tin", "admin_jobs"]] : [];
  if (intent === "report") return role === "admin" ? [["Mở báo cáo", "admin_reports"]] : [];
  return [];
}

function handleSupportChatAction(shell, action) {
  const prompts = { ask_auth: "Tôi gặp lỗi đăng nhập", ask_apply: "Hướng dẫn ứng tuyển", ask_post: "Hướng dẫn đăng tin tuyển dụng" };
  if (prompts[action]) { appendSupportChatMessage(shell, { sender: "user", text: prompts[action], time: new Date().toISOString() }); appendSupportChatMessage(shell, buildSupportChatResponse(prompts[action])); return; }
  if (action === "new_ticket") { shell.querySelector("#supportTicketForm").hidden = false; shell.querySelector("#supportTicketForm input")?.focus(); return; }
  const role = appState.currentUser?.role;
  const allowed = action.startsWith(`${role}_`);
  if (!allowed) { appendSupportChatMessage(shell, supportBotMessage(`Mục này không thuộc quyền của tài khoản ${getSupportChatRoleLabel()}.`)); return; }
  const tab = action.replace(`${role}_`, "");
  if (role === "candidate") showCandidateTab?.(tab === "jobs" ? "jobs" : tab);
  if (role === "employer") { appState.companyTab = tab === "applications" ? "applications" : tab; renderCompanyView?.(); }
  if (role === "admin") showAdminTab?.(tab);
  appendSupportChatMessage(shell, supportBotMessage("Mình đã mở đúng khu vực để bạn tiếp tục thao tác."));
}

function saveSupportTicket(values) {
  let tickets = [];
  try { tickets = JSON.parse(localStorage.getItem(JB_SUPPORT_TICKETS_KEY) || "[]"); } catch {}
  if (!Array.isArray(tickets)) tickets = [];
  const user = appState.currentUser || {};
  const ticket = { id: `JB-${Date.now().toString().slice(-8)}`, userId: user.id, name: user.name, email: user.email, role: user.role, subject: String(values.subject).trim(), priority: values.priority, description: String(values.description).trim(), screenshotName: values.screenshotName, status: "Pending", createdAt: new Date().toISOString() };
  tickets.push(ticket); localStorage.setItem(JB_SUPPORT_TICKETS_KEY, JSON.stringify(tickets.slice(-100)));
  return ticket;
}

function getSupportChatDataSummary() {
  const role = appState.currentUser?.role;
  if (role === "candidate") {
    const applications = appState.applications.filter((item) => Number(item.candidateId) === Number(appState.currentUser.id));
    const cvs = appState.cvs.filter((item) => Number(item.candidateId) === Number(appState.currentUser.id));
    return `Dữ liệu hiện tại của bạn: ${applications.length} hồ sơ ứng tuyển, ${cvs.length} CV và ${appState.jobs.filter((job) => job.status === "Approved").length} tin đang hiển thị.`;
  }
  if (role === "employer") {
    const jobs = typeof companyJobs === "function" ? companyJobs() : [];
    const applications = typeof companyApplications === "function" ? companyApplications() : [];
    return `Công ty hiện có ${jobs.length} tin tuyển dụng (${jobs.filter((job) => job.status === "Pending").length} tin chờ duyệt) và ${applications.length} hồ sơ ứng viên cần theo dõi.`;
  }
  let tickets = []; try { tickets = JSON.parse(localStorage.getItem(JB_SUPPORT_TICKETS_KEY) || "[]"); } catch {}
  return `Hệ thống hiện có ${appState.users.length} người dùng, ${appState.jobs.length} tin tuyển dụng, ${appState.reports.length} báo cáo và ${tickets.filter((item) => item.status === "Pending").length} phiếu hỗ trợ chờ xử lý trên trình duyệt này.`;
}

// So khớp gần đúng giúp nhận diện từ bị gõ sai một ký tự.
function supportChatEditDistance(first, second) {
  const rows = Array.from({ length: second.length + 1 }, (_, index) => [index]);
  rows[0] = Array.from({ length: first.length + 1 }, (_, index) => index);
  for (let row = 1; row <= second.length; row += 1) for (let column = 1; column <= first.length; column += 1) rows[row][column] = Math.min(rows[row - 1][column] + 1, rows[row][column - 1] + 1, rows[row - 1][column - 1] + (second[row - 1] === first[column - 1] ? 0 : 1));
  return rows[second.length][first.length];
}

function supportChatHasPhrase(text, phrase) {
  if (text.includes(phrase)) return true;
  const words = text.split(" ");
  return phrase.split(" ").every((target) => words.some((word) => target.length >= 4 && Math.abs(word.length - target.length) <= 1 && supportChatEditDistance(word, target) <= 1));
}

function detectSupportChatIntent(text) {
  const intents = [
    ["auth", ["dang nhap", "mat khau", "tai khoan", "quen mat khau", "bi khoa"]],
    ["job_visibility", ["khong thay tin", "tin khong hien", "cho duyet", "pending"]],
    ["post_job", ["dang tin", "tao tin", "sua tin", "tuyen dung"]],
    ["candidate_application", ["ung tuyen", "nop ho so", "nop cv", "rut ho so", "tim viec"]],
    ["employer_application", ["xu ly ho so", "xem ung vien", "phong van", "da tuyen"]],
    ["report", ["bao cao", "vi pham", "lua dao", "noi dung sai"]],
    ["admin", ["admin", "quan tri", "quan ly nguoi dung", "khoa tai khoan"]],
    ["export", ["xuat csv", "tai csv", "excel"]],
  ];
  const ranked = intents.map(([name, phrases]) => ({ name, score: phrases.reduce((sum, phrase) => sum + (supportChatHasPhrase(text, phrase) ? phrase.split(" ").length : 0), 0) })).filter((item) => item.score).sort((a, b) => b.score - a.score);
  return !ranked.length || (ranked[1] && ranked[0].score === ranked[1].score) ? null : ranked[0].name;
}
