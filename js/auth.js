// Xác thực dùng chung cho candidate, employer và admin.
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
            <p class="eyebrow">Welcome back</p>
            <h1>${isRegister ? "Tạo tài khoản JobBridge" : "Đăng nhập JobBridge"}</h1>
            <p>${isRegister ? "Tạo hồ sơ ứng viên hoặc tài khoản nhà tuyển dụng để bắt đầu quản lý công việc trong một nơi." : "Vào dashboard phù hợp với vai trò của bạn và tiếp tục tìm việc, đăng tin hoặc duyệt hệ thống."}</p>
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
            <p>${isRegister ? "Điền thông tin bên dưới để tạo tài khoản và vào hệ thống ngay." : "Dùng tài khoản đã có hoặc chọn nhanh tài khoản mẫu."}</p>
          </div>

          ${isRegister ? renderRegisterForm() : renderLoginForm()}

          <div class="auth-divider"><span>Hoặc dùng tài khoản mẫu</span></div>
          <div class="demo-accounts">
            <button data-demo-login="ungvien@test.com" type="button">Ứng viên</button>
            <button data-demo-login="congty@test.com" type="button">Công ty</button>
            <button data-demo-login="admin@test.com" type="button">Admin</button>
          </div>
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
        <input id="loginEmail" type="email" value="ungvien@test.com" autocomplete="email" />
      </label>
      <label>
        Mật khẩu
        <input id="loginPassword" type="password" value="123" autocomplete="current-password" />
      </label>
      <button class="primary-button full-button" type="submit">Đăng nhập</button>
      <div id="authMessage" class="auth-message" aria-live="polite"></div>
    </form>
  `;
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

  document.querySelectorAll("[data-demo-login]").forEach((button) => {
    button.addEventListener("click", () => loginDemoAccount(button.dataset.demoLogin));
  });
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.querySelector("#loginEmail").value.trim().toLowerCase();
  const password = document.querySelector("#loginPassword").value;
  const user = appState.users.find(
    (item) => item.email.toLowerCase() === email && item.password === password,
  );

  if (!user) {
    showInlineMessage("#authMessage", "Email hoặc mật khẩu không đúng.", "error");
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
  localStorage.removeItem(STORAGE_KEYS.session);
  appState.currentUser = null;
  appState.authMode = "login";
  syncRoleStylesheet(null);
  renderLogin();
}
