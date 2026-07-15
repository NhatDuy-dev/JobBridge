// Xác thực dùng chung cho candidate, employer và admin.
const AUTH_SERVICE_URL = window.JOBBRIDGE_AUTH_SERVICE_URL || "http://localhost:8000";
function renderLogin() {
  const isRegister = appState.authMode === "register";

  app.innerHTML = `
    <main class="spa-login-screen">
      <section class="auth-shell" aria-label="Xác thực JobBridge">
        <div class="auth-visual">
          <div class="spa-login-brand">
            ${renderBrandLogo()}
            <div>
              <strong>JobBridge</strong>
              <span>Nền tảng tuyển dụng & ứng tuyển việc làm</span>
            </div>
          </div>
          <div class="auth-copy">
            <p class="eyebrow">JobBridge</p>
            <h1>Đăng nhập để mở ra những cơ hội mới.</h1>
            <p>Kết nối nhanh chóng với công việc phù hợp hoặc tìm kiếm những ứng viên tiềm năng cùng JobBridge.</p>
          </div>
          <div class="auth-benefits">
            <span>Gợi ý việc làm theo hồ sơ</span>
            <span>Quản lý ứng tuyển và tin tuyển dụng</span>
            <span>Bộ lọc ngành nghề, kinh nghiệm, địa điểm</span>
          </div>
        </div>

        <section class="spa-login-card auth-card">
          <div class="auth-tabs" role="tablist" aria-label="Chọn chế độ xác thực">
            <button class="${!isRegister ? "active" : ""}" data-auth-mode="login" type="button">Đăng nhập</button>
            <button class="${isRegister ? "active" : ""}" data-auth-mode="register" type="button">Đăng ký</button>
          </div>

          <div class="spa-login-heading">
            <h2>${isRegister ? "Tạo tài khoản mới" : "Chào mừng quay lại"}</h2>
            <p>${isRegister ? "Điền thông tin bên dưới để tạo tài khoản và vào hệ thống ngay." : "Dùng email hoặc chọn phương thức đăng nhập phù hợp với bạn."}</p>
          </div>

          ${isRegister ? renderRegisterForm() : renderLoginForm()}

          ${!isRegister ? renderQuickLoginMethods() : ""}
        </section>
      </section>
    </main>
  `;

  bindAuthScreen();
}

function renderLoginForm() {
  return `
    <form id="loginForm" class="spa-login-form" novalidate>
      <label>
        Email
        <input id="loginEmail" type="email" placeholder="ban@email.com" autocomplete="email" />
      </label>
      <label>
        Mật khẩu
        <input id="loginPassword" type="password" placeholder="Nhập mật khẩu" autocomplete="current-password" />
      </label>
      <button class="primary-button full-button" type="submit">Đăng nhập</button>
      <div id="authMessage" class="auth-message" aria-live="polite"></div>
    </form>
  `;
}

function renderQuickLoginMethods() {
  return `
    <div class="auth-divider"><span>Hoặc đăng nhập nhanh</span></div>
    <div class="auth-methods" aria-label="Phương thức đăng nhập nhanh">
      <button class="auth-method auth-method-google" data-oauth-provider="google" type="button">
        <span class="auth-method-icon" aria-hidden="true">${renderGoogleIcon()}</span>
        <span>Tiếp tục với Google</span>
      </button>
      <button class="auth-method auth-method-zalo" data-oauth-provider="zalo" type="button">
        <span class="auth-method-icon auth-method-icon-zalo" aria-hidden="true">Zalo</span>
        <span>Tiếp tục với Zalo</span>
      </button>
      <button class="auth-method auth-method-phone" data-phone-login-toggle type="button" aria-expanded="false" aria-controls="phoneLoginPanel">
        <span class="auth-method-icon" aria-hidden="true">${renderPhoneIcon()}</span>
        <span>Đăng nhập bằng số điện thoại</span>
      </button>
    </div>
    <form id="phoneLoginPanel" class="phone-login-panel" hidden novalidate>
      <label>
        Số điện thoại
        <input id="phoneLoginNumber" type="tel" inputmode="tel" autocomplete="tel" placeholder="VD: 0901234567" />
      </label>
      <button class="secondary-button full-button" data-send-otp type="submit">Gửi mã OTP</button>
      <div class="otp-step" hidden>
        <label>
          Mã OTP
          <input id="phoneLoginOtp" type="text" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="Nhập 6 chữ số" />
        </label>
        <button class="primary-button full-button" data-verify-otp type="submit">Xác thực OTP</button>
      </div>
      <div id="phoneAuthMessage" class="auth-message" aria-live="polite"></div>
    </form>
  `;
}

function renderGoogleIcon() {
  return `<svg viewBox="0 0 24 24" focusable="false"><path fill="#4285f4" d="M23.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h6.5c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7c2.2-2 3.6-4.9 3.6-8.2Z"/><path fill="#34a853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.8c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v2.9C3.7 21.4 7.5 24 12 24Z"/><path fill="#fbbc05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V7.3H1.8C1 8.9.5 10.6.5 12.5s.5 3.6 1.3 5.2l3.8-2.9Z"/><path fill="#ea4335" d="M12 5.5c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 2.1 15.1 1 12 1 7.5 1 3.7 3.6 1.8 7.3l3.8 2.9C6.5 7.5 9 5.5 12 5.5Z"/></svg>`;
}

function renderPhoneIcon() {
  return `<svg viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 3v14h10V5H7Zm4 15h2v1h-2v-1Z"/></svg>`;
}

function renderRegisterForm() {
  return `
    <form id="registerForm" class="spa-login-form" novalidate>
      <div class="auth-role-grid">
        <label class="auth-role-card">
          <input name="registerRole" type="radio" value="candidate" checked />
          <span>
            <strong>Ứng viên</strong>
            <small>Tìm việc, lưu việc, ứng tuyển</small>
          </span>
        </label>
        <label class="auth-role-card">
          <input name="registerRole" type="radio" value="employer" />
          <span>
            <strong>Nhà tuyển dụng</strong>
            <small>Đăng tin và quản lý hồ sơ</small>
          </span>
        </label>
      </div>

      <label>
        Họ tên / Tên công ty
        <input id="registerName" type="text" placeholder="VD: Nguyễn Minh Anh" autocomplete="name" />
      </label>
      <label>
        Email
        <input id="registerEmail" type="email" placeholder="ban@email.com" autocomplete="email" />
      </label>
      <div class="form-grid auth-password-grid">
        <label>
          Mật khẩu
          <input id="registerPassword" type="password" placeholder="Tối thiểu 3 ký tự" autocomplete="new-password" />
        </label>
        <label>
          Nhập lại mật khẩu
          <input id="registerConfirmPassword" type="password" placeholder="Nhập lại mật khẩu" autocomplete="new-password" />
        </label>
      </div>
      <button class="primary-button full-button" type="submit">Tạo tài khoản</button>
      <div id="authMessage" class="auth-message" aria-live="polite"></div>
    </form>
  `;
}

function bindAuthScreen() {
  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      appState.authMode = button.dataset.authMode;
      renderLogin();
    });
  });

  document.querySelector("#loginForm")?.addEventListener("submit", handleLogin);
  document.querySelector("#registerForm")?.addEventListener("submit", handleRegister);

  document.querySelectorAll("[data-oauth-provider]").forEach((button) => {
    button.addEventListener("click", () => window.location.assign(`${AUTH_SERVICE_URL}/auth/oauth/${button.dataset.oauthProvider}`));
  });

  document.querySelector("[data-phone-login-toggle]")?.addEventListener("click", (event) => {
    const panel = document.querySelector("#phoneLoginPanel");
    panel.hidden = !panel.hidden;
    event.currentTarget.setAttribute("aria-expanded", String(!panel.hidden));
    if (!panel.hidden) document.querySelector("#phoneLoginNumber")?.focus();
  });

  document.querySelector("#phoneLoginPanel")?.addEventListener("submit", handlePhoneLogin);
}

async function handlePhoneLogin(event) {
  event.preventDefault();
  const panel = event.currentTarget;
  const phoneInput = panel.querySelector("#phoneLoginNumber");
  const otpInput = panel.querySelector("#phoneLoginOtp");
  const otpStep = panel.querySelector(".otp-step");
  const phone = phoneInput.value.trim();
  if (!/^(0|\+84)\d{9,10}$/.test(phone.replace(/\s/g, ""))) {
    return showInlineMessage("#phoneAuthMessage", "Số điện thoại không hợp lệ.", "error");
  }
  try {
    if (otpStep.hidden) {
      const result = await authApi("/auth/phone/send-otp", { phone });
      otpStep.hidden = false;
      panel.querySelector("[data-send-otp]").hidden = true;
      phoneInput.readOnly = true;
      showInlineMessage("#phoneAuthMessage", result.demoOtp ? `Mã OTP demo: ${result.demoOtp}` : "Mã OTP đã được gửi.", "success");
      otpInput.focus();
      return;
    }
    const result = await authApi("/auth/phone/verify-otp", { phone, otp: otpInput.value.trim() });
    completeApiLogin(result);
  } catch (error) {
    showInlineMessage("#phoneAuthMessage", error.message, "error");
  }
}

async function authApi(path, payload) {
  const response = await fetch(`${AUTH_SERVICE_URL}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error?.message || "Không thể kết nối máy chủ xác thực.");
  return result;
}

async function consumeOAuthCallback() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("auth_code");
  if (!code) return false;
  url.searchParams.delete("auth_code");
  history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/auth/exchange/${encodeURIComponent(code)}`, { method: "POST" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.detail || "Không thể hoàn tất đăng nhập OAuth.");
    completeApiLogin(result);
    return true;
  } catch (error) {
    renderLogin();
    showInlineMessage("#authMessage", error.message, "error");
    return true;
  }
}

function completeApiLogin(result) {
  const index = appState.users.findIndex((item) => Number(item.id) === Number(result.user.id));
  const existingUser = index >= 0 ? appState.users[index] : {};
  const user = normalizeUser({ ...existingUser, ...result.user });
  if (index >= 0) appState.users[index] = user;
  else appState.users.push(user);
  appState.currentUser = createSessionUser(user);
  writeStorage(STORAGE_KEYS.users, appState.users);
  writeStorage(STORAGE_KEYS.session, appState.currentUser);
  localStorage.setItem("jobbridge_api_token", result.token);
  renderDashboard();
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.querySelector("#loginEmail").value.trim().toLowerCase();
  const password = document.querySelector("#loginPassword").value;
  if (!email || !password) return showInlineMessage("#authMessage", "Vui lòng nhập email và mật khẩu.", "error");
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error?.message || "Email hoặc mật khẩu không đúng.");
    const localUser = appState.users.find((item) => item.email.toLowerCase() === email);
    if (localUser) localUser.password = password;
    completeApiLogin(result);
  } catch (error) {
    showInlineMessage("#authMessage", error.message, "error");
  }
}

function handleRegister(event) {
  event.preventDefault();
  const name = document.querySelector("#registerName").value.trim();
  const email = document.querySelector("#registerEmail").value.trim().toLowerCase();
  const password = document.querySelector("#registerPassword").value;
  const confirmPassword = document.querySelector("#registerConfirmPassword").value;
  const role = document.querySelector('input[name="registerRole"]:checked')?.value || "candidate";

  if (!name || !email || !password || !confirmPassword) {
    showInlineMessage("#authMessage", "Vui lòng nhập đầy đủ thông tin đăng ký.", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showInlineMessage("#authMessage", "Email chưa đúng định dạng.", "error");
    return;
  }

  if (password.length < 3) {
    showInlineMessage("#authMessage", "Mật khẩu cần tối thiểu 3 ký tự.", "error");
    return;
  }

  if (password !== confirmPassword) {
    showInlineMessage("#authMessage", "Mật khẩu nhập lại chưa khớp.", "error");
    return;
  }

  if (appState.users.some((user) => user.email.toLowerCase() === email)) {
    showInlineMessage("#authMessage", "Email này đã được đăng ký.", "error");
    return;
  }

  const newUser = normalizeUser({
    id: getNextUserId(),
    name,
    email,
    password,
    role,
    avatar: getInitials(name),
    desiredTitle: role === "candidate" ? "Ứng viên JobBridge" : "",
    skills: [],
    savedJobs: [],
    appliedJobs: [],
  });

  appState.users.push(newUser);
  appState.currentUser = createSessionUser(newUser);
  writeStorage(STORAGE_KEYS.users, appState.users);
  writeStorage(STORAGE_KEYS.session, appState.currentUser);
  renderDashboard();
  showToast("Tạo tài khoản thành công", "success");
}

function loginDemoAccount(email) {
  const user = appState.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    showInlineMessage("#authMessage", "Không tìm thấy tài khoản mẫu.", "error");
    return;
  }

  if (user.locked) {
    showInlineMessage("#authMessage", "Tài khoản đã bị quản trị viên khóa.", "error");
    return;
  }

  appState.currentUser = createSessionUser(user);
  writeStorage(STORAGE_KEYS.session, appState.currentUser);
  renderDashboard();
}

function getNextUserId() {
  return Math.max(0, ...appState.users.map((user) => Number(user.id) || 0)) + 1;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function logout() {
  stopRealtimeUpdates();
  if (typeof clearApiToken === "function") clearApiToken();
  localStorage.removeItem(STORAGE_KEYS.session);
  appState.currentUser = null;
  appState.authMode = "login";
  syncRoleStylesheet(null);
  renderLogin();
}
