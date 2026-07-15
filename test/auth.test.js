import {
  hashPassword,
  verifyPassword,
  createToken,
  hashToken,
} from "../src/auth.js";

describe("Kiểm tra chức năng xác thực", () => {
  describe("hashPassword và verifyPassword", () => {
    test("mật khẩu đúng phải xác thực thành công", () => {
      const password = "MatKhau123!";
      const storedPassword = hashPassword(password);

      expect(verifyPassword(password, storedPassword)).toBe(true);
    });

    test("mật khẩu sai phải xác thực thất bại", () => {
      const storedPassword = hashPassword("MatKhauDung123!");

      expect(
        verifyPassword("MatKhauSai123!", storedPassword),
      ).toBe(false);
    });

    test("mật khẩu đã mã hóa phải bắt đầu bằng scrypt", () => {
      const storedPassword = hashPassword("MatKhau123!");

      expect(storedPassword.startsWith("scrypt$")).toBe(true);
    });

    test("cùng một mật khẩu phải tạo ra hai chuỗi hash khác nhau", () => {
      const firstHash = hashPassword("MatKhau123!");
      const secondHash = hashPassword("MatKhau123!");

      expect(firstHash).not.toBe(secondHash);
    });

    test("chuỗi lưu trữ sai định dạng phải trả về false", () => {
      expect(
        verifyPassword("MatKhau123!", "du-lieu-khong-hop-le"),
      ).toBe(false);
    });

    test("thuật toán không phải scrypt phải trả về false", () => {
      const invalidStored =
        "sha256$0123456789abcdef$0123456789abcdef";

      expect(
        verifyPassword("MatKhau123!", invalidStored),
      ).toBe(false);
    });

    test("thiếu salt phải trả về false", () => {
      expect(
        verifyPassword("MatKhau123!", "scrypt$$abcdef"),
      ).toBe(false);
    });

    test("thiếu hash phải trả về false", () => {
      expect(
        verifyPassword("MatKhau123!", "scrypt$abcdef$"),
      ).toBe(false);
    });
  });

  describe("createToken", () => {
    test("phải tạo ra token dạng chuỗi", () => {
      const token = createToken();

      expect(typeof token).toBe("string");
    });

    test("token không được rỗng", () => {
      const token = createToken();

      expect(token.length).toBeGreaterThan(0);
    });

    test("mỗi lần tạo token phải cho kết quả khác nhau", () => {
      const firstToken = createToken();
      const secondToken = createToken();

      expect(firstToken).not.toBe(secondToken);
    });
  });

  describe("hashToken", () => {
    test("cùng một token phải tạo ra cùng một hash", () => {
      const token = "token-demo";

      expect(hashToken(token)).toBe(hashToken(token));
    });

    test("hai token khác nhau phải tạo ra hai hash khác nhau", () => {
      expect(hashToken("token-1")).not.toBe(
        hashToken("token-2"),
      );
    });

    test("hash SHA-256 phải có độ dài 64 ký tự hex", () => {
      const result = hashToken("token-demo");

      expect(result).toMatch(/^[a-f0-9]{64}$/);
    });
  });
});