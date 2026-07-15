import {
  JOB_STATUSES,
  isValidJobStatus,
  canAdminChangeApplicationStatus,
  getApplicationManagementMessage,
  getJobStatusLabel,
} from "../src/adminRules.js";

describe("Quy tắc quản trị JobBridge", () => {
  test("Pending là trạng thái hợp lệ", () => {
    expect(isValidJobStatus("Pending")).toBe(true);
  });

  test("Approved là trạng thái hợp lệ", () => {
    expect(isValidJobStatus("Approved")).toBe(true);
  });

  test("Rejected là trạng thái hợp lệ", () => {
    expect(isValidJobStatus("Rejected")).toBe(true);
  });

  test("Closed là trạng thái hợp lệ", () => {
    expect(isValidJobStatus("Closed")).toBe(true);
  });

  test("Done không phải trạng thái hợp lệ", () => {
    expect(isValidJobStatus("Done")).toBe(false);
  });

  test("có đúng 4 trạng thái", () => {
    expect(JOB_STATUSES).toHaveLength(4);
  });

  test("admin không được đổi trạng thái hồ sơ", () => {
    expect(canAdminChangeApplicationStatus()).toBe(false);
  });

  test("hiển thị đúng thông báo", () => {
    expect(getApplicationManagementMessage()).toBe(
      "Hồ sơ ứng tuyển do doanh nghiệp xử lý.",
    );
  });

  test("Pending hiển thị Chờ duyệt", () => {
    expect(getJobStatusLabel("Pending")).toBe("Chờ duyệt");
  });

  test("Approved hiển thị Đã duyệt", () => {
    expect(getJobStatusLabel("Approved")).toBe("Đã duyệt");
  });

  test("Rejected hiển thị Bị từ chối", () => {
    expect(getJobStatusLabel("Rejected")).toBe("Bị từ chối");
  });

  test("Closed hiển thị Đã đóng", () => {
    expect(getJobStatusLabel("Closed")).toBe("Đã đóng");
  });

  test("trạng thái lạ trả về Không xác định", () => {
    expect(getJobStatusLabel("ABC")).toBe("Không xác định");
  });
});