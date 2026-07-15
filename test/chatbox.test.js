import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

function loadChatboxFunctions() {
  const source = readFileSync(new URL("../js/shared/ui.js", import.meta.url), "utf8");
  const sandbox = {
    appState: { currentUser: { id: 1, name: "Người dùng", role: "candidate" } },
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    console,
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  return sandbox;
}

test("chatbox chuẩn hóa câu hỏi tiếng Việt", () => {
  const chatbox = loadChatboxFunctions();
  assert.equal(chatbox.normalizeSupportChatText("Tôi muốn ĐĂNG TIN!"), "toi muon dang tin");
});

test("chatbox nhận diện yêu cầu ứng tuyển", () => {
  const chatbox = loadChatboxFunctions();
  assert.equal(chatbox.detectSupportChatIntent("toi muon nop ho so"), "candidate_application");
});

test("chatbox chịu được lỗi gõ sai một ký tự", () => {
  const chatbox = loadChatboxFunctions();
  assert.equal(chatbox.detectSupportChatIntent("toi quen mat khauu"), "auth");
});

test("chatbox luôn escape nội dung do người dùng nhập", () => {
  const chatbox = loadChatboxFunctions();
  assert.equal(chatbox.escapeHtml("<script>"), "&lt;script&gt;");
});
