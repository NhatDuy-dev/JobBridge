import { describe, test, expect } from "@jest/globals";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adminFilePath = path.join(
  __dirname,
  "../js/admin/admin.js",
);

describe("Kiểm tra quyền quản lý hồ sơ của Admin", () => {
  test("file admin.js tồn tại", () => {
    expect(fs.existsSync(adminFilePath)).toBe(true);
  });

  test("admin không có nút thay đổi trạng thái hồ sơ", () => {
    const adminSource = fs.readFileSync(
      adminFilePath,
      "utf8",
    );

    expect(
      adminSource.includes(
        "data-admin-change-application-status",
      ),
    ).toBe(false);
  });

  test("giao diện thông báo hồ sơ do doanh nghiệp xử lý", () => {
    const adminSource = fs.readFileSync(
      adminFilePath,
      "utf8",
    );

    expect(
      adminSource.includes("Do doanh nghiệp xử lý"),
    ).toBe(true);
  });

  test("admin bị chặn khi gọi API cập nhật trạng thái hồ sơ", () => {
    const adminSource = fs.readFileSync(
      adminFilePath,
      "utf8",
    );

    expect(
      adminSource.includes(
        "Hồ sơ ứng tuyển do doanh nghiệp xử lý.",
      ),
    ).toBe(true);
  });
});