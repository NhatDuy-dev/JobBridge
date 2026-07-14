// Điểm vào độc lập cho phần quản trị của Thiện.
function renderAdminView() {
  const root = document.querySelector("#dashboardRoot");
  if (!root) return;
  root.innerHTML = `
    <section class="role-workspace admin-workspace">
      <p class="eyebrow">Quản trị viên</p>
      <h1>Khu vực quản trị</h1>
      <p>Module admin đã sẵn sàng để phát triển độc lập trong <code>js/admin</code> và <code>css/admin</code>.</p>
    </section>
  `;
}
