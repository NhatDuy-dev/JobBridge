// tests/job.test.js

function isValidStatus(status) {
  return ["Pending", "Approved", "Rejected"].includes(status);
}

describe("Job Status Test", () => {
  test("status hợp lệ", () => {
    expect(isValidStatus("Pending")).toBe(true);
  });

  test("status sai", () => {
    expect(isValidStatus("Done")).toBe(false);
  });
});