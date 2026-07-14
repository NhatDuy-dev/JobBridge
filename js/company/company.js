// Điểm vào độc lập cho phần nhà tuyển dụng của Hoàng.
function renderCompanyView() {
  const root = document.querySelector("#dashboardRoot");
  if (!root) return;
  root.innerHTML = `
    <section class="role-workspace company-workspace">
      <p class="eyebrow">Nhà tuyển dụng</p>
      <h1>Khu vực công ty.</h1>
      <p>Module company đã sẵn sàng để phát triển độc lập trong <code>js/company</code> và <code>css/company</code>.</p>
    </section>
  `;
}
