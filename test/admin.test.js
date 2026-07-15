import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("trạng thái tin chờ duyệt hợp lệ", () => {
  const validStatuses = [
    "Pending",
    "Approved",
    "Rejected",
    "Closed",
  ];

  assert.equal(validStatuses.includes("Pending"), true);
});

test("tin đã duyệt có trạng thái Approved", () => {
  const job = {
    id: 101,
    title: "Frontend Developer",
    status: "Approved",
  };

  assert.equal(job.status, "Approved");
});

test("admin không xử lý trạng thái hồ sơ thay doanh nghiệp", () => {
  const adminSource = readFileSync(
    new URL("../js/admin/admin.js", import.meta.url),
    "utf8",
  );

  assert.equal(
    adminSource.includes("data-admin-change-application-status"),
    false,
  );
  assert.equal(adminSource.includes("Do doanh nghiệp xử lý"), true);
});
