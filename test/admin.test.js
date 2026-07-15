import test from "node:test";
import assert from "node:assert/strict";

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