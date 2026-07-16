import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";

const integrationDatabaseUrl = process.env.TEST_DATABASE_URL;

test("nhà tuyển dụng đổi trạng thái sẽ tạo thông báo cho đúng ứng viên", {
  skip: !integrationDatabaseUrl,
}, async (t) => {
  process.env.DATABASE_URL = integrationDatabaseUrl;
  process.env.PORT = "0";
  const { server, db } = await import(`../server.js?notification-test=${Date.now()}`);
  if (!server.listening) await once(server, "listening");
  t.after(() => {
    server.close();
    db.close();
  });

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const login = async (email) => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "123" }),
    });
    assert.equal(response.status, 200);
    return response.json();
  };

  const employer = await login("congty@test.com");
  const candidate = await login("ungvien@test.com");
  const employerApplicationsResponse = await fetch(`${baseUrl}/api/applications`, {
    headers: { Authorization: `Bearer ${employer.token}` },
  });
  const { applications } = await employerApplicationsResponse.json();
  const application = applications.find((item) => Number(item.job_id) === 101);
  assert.ok(application);

  const updateResponse = await fetch(`${baseUrl}/api/applications/${application.id}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${employer.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "Da tuyen" }),
  });
  assert.equal(updateResponse.status, 200);

  const notificationResponse = await fetch(`${baseUrl}/api/notifications`, {
    headers: { Authorization: `Bearer ${candidate.token}` },
  });
  assert.equal(notificationResponse.status, 200);
  const payload = await notificationResponse.json();
  assert.equal(payload.unreadCount, 1);
  assert.equal(payload.notifications[0].type, "hired");
  assert.equal(payload.notifications[0].candidateId, candidate.user.id);

  const readResponse = await fetch(`${baseUrl}/api/notifications/${payload.notifications[0].id}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${candidate.token}` },
  });
  assert.equal(readResponse.status, 200);
  assert.ok((await readResponse.json()).notification.readAt);
});
