import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { openDatabase, publicUser, mapJob } from "./src/database.js";
import { createToken, hashPassword, hashToken, verifyPassword } from "./src/auth.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const db = openDatabase(process.env.DB_PATH || undefined);
const port = Number(process.env.PORT || 3000);
const SESSION_DAYS = 7;
const MAX_CV_FILE_SIZE = 5 * 1024 * 1024;
const phoneOtpChallenges = new Map();

const corsHeaders = (req) => {
  const origin = req?.headers?.origin;
  return origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ? { "Access-Control-Allow-Origin": origin, Vary: "Origin", "Access-Control-Allow-Headers": "Content-Type, Authorization", "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS" }
    : {};
};
const json = (res, status, data, req) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*", ...corsHeaders(req) });
  res.end(JSON.stringify(data));
};
const fail = (res, status, message, code = "REQUEST_ERROR") => json(res, status, { error: { code, message } });
const redirect = (res, location, headers = {}) => {
  res.writeHead(302, { Location: location, "Cache-Control": "no-store", ...headers });
  res.end();
};
const publicOrigin = (url) => process.env.PUBLIC_BASE_URL || url.origin;
const oauthRedirectUri = (url, provider) => `${publicOrigin(url)}/api/auth/oauth/${provider}/callback`;
const createOAuthState = () => crypto.randomBytes(24).toString("base64url");
const createPkcePair = () => {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
};
const oauthCookieName = (provider) => `jobbridge_oauth_${provider}`;
const createOAuthCookie = (provider, payload) =>
  `${oauthCookieName(provider)}=${encodeURIComponent(JSON.stringify(payload))}; HttpOnly; SameSite=Lax; Path=/api/auth/oauth/${provider}/callback; Max-Age=600`;
const clearOAuthCookie = (provider) =>
  `${oauthCookieName(provider)}=; HttpOnly; SameSite=Lax; Path=/api/auth/oauth/${provider}/callback; Max-Age=0`;
const parseCookies = (req) =>
  Object.fromEntries(String(req.headers.cookie || "").split(";").map((item) => item.trim()).filter(Boolean).map((item) => {
    const index = item.indexOf("=");
    return index >= 0 ? [item.slice(0, index), decodeURIComponent(item.slice(index + 1))] : [item, ""];
  }));
const oauthPayloadFromCookie = (req, provider) => {
  try {
    return JSON.parse(parseCookies(req)[oauthCookieName(provider)] || "{}");
  } catch {
    return {};
  }
};
const body = async (req) => {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 1_000_000) throw Object.assign(new Error("Dữ liệu quá lớn"), { status: 413 });
  }
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { throw Object.assign(new Error("JSON không hợp lệ"), { status: 400 }); }
};
const binaryBody = async (req, maxBytes) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw Object.assign(new Error("Tệp tải lên quá lớn"), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};
const route = (pattern, pathname) => {
  const keys = [];
  const regex = new RegExp(`^${pattern.replace(/:([A-Za-z]+)/g, (_, key) => { keys.push(key); return "([^/]+)"; })}$`);
  const match = pathname.match(regex);
  return match && Object.fromEntries(keys.map((key, i) => [key, decodeURIComponent(match[i + 1])]));
};
const userByToken = (req) => {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return null;
  return db.prepare(`SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id
    WHERE s.token_hash=? AND s.expires_at > datetime('now')`).get(hashToken(token));
};
const requireUser = (req, res, roles) => {
  const user = userByToken(req);
  if (!user) { fail(res, 401, "Vui lòng đăng nhập", "UNAUTHORIZED"); return null; }
  if (roles && !roles.includes(user.role)) { fail(res, 403, "Bạn không có quyền thực hiện thao tác này", "FORBIDDEN"); return null; }
  return user;
};
const issueSession = (userId) => {
  const token = createToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  db.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')").run();
  db.prepare("INSERT INTO sessions(id,user_id,token_hash,expires_at) VALUES(?,?,?,?)").run(crypto.randomUUID(), userId, hashToken(token), expires);
  return { token, expiresAt: expires };
};
const safeJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");
const oauthSessionPage = (res, provider, session) => {
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "Set-Cookie": clearOAuthCookie(provider),
  });
  res.end(`<!doctype html>
<html lang="vi">
  <head><meta charset="utf-8"><title>Đang đăng nhập JobBridge</title></head>
  <body>
    <script>
      const user = ${safeJson(session.user)};
      const apiToken = ${safeJson(session.token)};
      const usersKey = "jobbridge_spa_users";
      const sessionKey = "jobbridge_spa_session";
      const apiTokenKey = "jobbridge_api_token";
      const users = JSON.parse(localStorage.getItem(usersKey) || "[]");
      const nextUsers = users.some((item) => Number(item.id) === Number(user.id))
        ? users.map((item) => Number(item.id) === Number(user.id) ? { ...item, ...user } : item)
        : [...users, { ...user, password: "" }];
      localStorage.setItem(usersKey, JSON.stringify(nextUsers));
      localStorage.setItem(sessionKey, JSON.stringify(user));
      localStorage.setItem(apiTokenKey, apiToken);
      window.location.replace("/");
    </script>
  </body>
</html>`);
};
const fetchJson = async (url, options) => {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!response.ok || data.error) {
    const message = data.error_description || data.error?.message || data.message || "Không thể hoàn tất OAuth";
    throw Object.assign(new Error(message), { status: 502 });
  }
  return data;
};
const exchangeGoogleProfile = async (url, code) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw Object.assign(new Error("Chưa cấu hình GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET"), { status: 501 });
  const token = await fetchJson("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: oauthRedirectUri(url, "google"),
      grant_type: "authorization_code",
    }),
  });
  const profile = await fetchJson("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  return {
    provider: "google",
    providerId: profile.sub,
    name: profile.name || profile.email || "Người dùng Google",
    email: profile.email || `google-${profile.sub}@jobbridge.local`,
  };
};
const exchangeFacebookProfile = async (url, code) => {
  const clientId = process.env.FACEBOOK_APP_ID;
  const clientSecret = process.env.FACEBOOK_APP_SECRET;
  if (!clientId || !clientSecret) throw Object.assign(new Error("Chưa cấu hình FACEBOOK_APP_ID và FACEBOOK_APP_SECRET"), { status: 501 });
  const tokenUrl = new URL("https://graph.facebook.com/v23.0/oauth/access_token");
  tokenUrl.searchParams.set("client_id", clientId);
  tokenUrl.searchParams.set("client_secret", clientSecret);
  tokenUrl.searchParams.set("redirect_uri", oauthRedirectUri(url, "facebook"));
  tokenUrl.searchParams.set("code", code);
  const token = await fetchJson(tokenUrl);
  const profileUrl = new URL("https://graph.facebook.com/me");
  profileUrl.searchParams.set("fields", "id,name,email");
  profileUrl.searchParams.set("access_token", token.access_token);
  const profile = await fetchJson(profileUrl);
  return {
    provider: "facebook",
    providerId: profile.id,
    name: profile.name || "Người dùng Facebook",
    email: profile.email || `facebook-${profile.id}@jobbridge.local`,
  };
};
const exchangeZaloProfile = async (code, verifier) => {
  const appId = process.env.ZALO_APP_ID;
  const appSecret = process.env.ZALO_APP_SECRET;
  if (!appId || !appSecret) throw Object.assign(new Error("Chưa cấu hình ZALO_APP_ID và ZALO_APP_SECRET"), { status: 501 });
  const params = new URLSearchParams({ app_id: appId, code, grant_type: "authorization_code" });
  if (verifier) params.set("code_verifier", verifier);
  const token = await fetchJson("https://oauth.zaloapp.com/v4/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", secret_key: appSecret },
    body: params,
  });
  const profileUrl = new URL("https://graph.zalo.me/v2.0/me");
  profileUrl.searchParams.set("fields", "id,name,picture,email");
  const profile = await fetchJson(profileUrl, { headers: { access_token: token.access_token } });
  return {
    provider: "zalo",
    providerId: profile.id,
    name: profile.name || "Người dùng Zalo",
    email: profile.email || `zalo-${profile.id}@jobbridge.local`,
  };
};
const upsertOAuthUser = (profile) => {
  const email = String(profile.email || `${profile.provider}-${profile.providerId}@jobbridge.local`).trim().toLowerCase();
  let user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!user) {
    const id = db.prepare("INSERT INTO users(name,email,password_hash,role,desired_title) VALUES(?,?,?,?,?)")
      .run(profile.name, email, hashPassword(createToken()), "candidate", "Ứng viên JobBridge").lastInsertRowid;
    user = db.prepare("SELECT * FROM users WHERE id=?").get(id);
  }
  return user;
};

async function api(req, res, url) {
  const { pathname, searchParams } = url;
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders(req));
    return res.end();
  }
  if (req.method === "GET" && pathname === "/api/health") return json(res, 200, { status: "ok", database: "connected" }, req);

  if (req.method === "GET" && pathname === "/api/auth/oauth/google") {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) return fail(res, 501, "Chưa cấu hình GOOGLE_CLIENT_ID cho đăng nhập Google OAuth", "OAUTH_NOT_CONFIGURED");
    const state = createOAuthState();
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", oauthRedirectUri(url, "google"));
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("prompt", "select_account");
    authUrl.searchParams.set("state", state);
    return redirect(res, authUrl.toString(), { "Set-Cookie": createOAuthCookie("google", { state }) });
  }

  if (req.method === "GET" && pathname === "/api/auth/oauth/facebook") {
    const appId = process.env.FACEBOOK_APP_ID;
    if (!appId) return fail(res, 501, "Chưa cấu hình FACEBOOK_APP_ID cho đăng nhập Facebook OAuth", "OAUTH_NOT_CONFIGURED");
    const state = createOAuthState();
    const authUrl = new URL("https://www.facebook.com/v23.0/dialog/oauth");
    authUrl.searchParams.set("client_id", appId);
    authUrl.searchParams.set("redirect_uri", oauthRedirectUri(url, "facebook"));
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "email,public_profile");
    authUrl.searchParams.set("state", state);
    return redirect(res, authUrl.toString(), { "Set-Cookie": createOAuthCookie("facebook", { state }) });
  }

  if (req.method === "GET" && pathname === "/api/auth/oauth/zalo") {
    const appId = process.env.ZALO_APP_ID;
    if (!appId) return fail(res, 501, "Chưa cấu hình ZALO_APP_ID cho đăng nhập Zalo OAuth", "OAUTH_NOT_CONFIGURED");
    const state = createOAuthState();
    const pkce = createPkcePair();
    const authUrl = new URL("https://oauth.zaloapp.com/v4/permission");
    authUrl.searchParams.set("app_id", appId);
    authUrl.searchParams.set("redirect_uri", oauthRedirectUri(url, "zalo"));
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("code_challenge", pkce.challenge);
    authUrl.searchParams.set("code_challenge_method", "S256");
    return redirect(res, authUrl.toString(), { "Set-Cookie": createOAuthCookie("zalo", { state, verifier: pkce.verifier }) });
  }

  if (req.method === "GET" && /^\/api\/auth\/oauth\/(google|facebook|zalo)\/callback$/.test(pathname)) {
    const provider = pathname.match(/^\/api\/auth\/oauth\/(google|facebook|zalo)\/callback$/)[1];
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const cookiePayload = oauthPayloadFromCookie(req, provider);
    if (!code) return fail(res, 422, "Thiếu mã OAuth từ nhà cung cấp", "OAUTH_CODE_REQUIRED");
    if (!state || state !== cookiePayload.state) return fail(res, 403, "Phiên OAuth không hợp lệ hoặc đã hết hạn", "OAUTH_STATE_INVALID");
    const profile = provider === "google"
      ? await exchangeGoogleProfile(url, code)
      : provider === "facebook"
        ? await exchangeFacebookProfile(url, code)
        : await exchangeZaloProfile(code, cookiePayload.verifier);
    const user = upsertOAuthUser(profile);
    const session = issueSession(user.id);
    return oauthSessionPage(res, provider, { ...session, user: publicUser(db, user) });
  }

  if (req.method === "POST" && pathname === "/api/auth/phone/send-otp") {
    const data = await body(req);
    const phone = String(data.phone || "").replace(/[^\d+]/g, "");
    if (!/^(0|\+84)\d{9,10}$/.test(phone)) return fail(res, 422, "Số điện thoại không hợp lệ", "INVALID_PHONE");
    const otp = process.env.NODE_ENV === "production" ? String(crypto.randomInt(100000, 1000000)) : "123456";
    phoneOtpChallenges.set(phone, { hash: hashToken(otp), expiresAt: Date.now() + 5 * 60_000, attempts: 0 });
    // Tích hợp nhà cung cấp SMS tại đây khi triển khai production.
    return json(res, 200, { sent: true, expiresIn: 300, ...(process.env.NODE_ENV === "production" ? {} : { demoOtp: otp }) }, req);
  }

  if (req.method === "POST" && pathname === "/api/auth/phone/verify-otp") {
    const data = await body(req);
    const phone = String(data.phone || "").replace(/[^\d+]/g, "");
    const challenge = phoneOtpChallenges.get(phone);
    if (!challenge || challenge.expiresAt < Date.now()) {
      phoneOtpChallenges.delete(phone);
      return fail(res, 410, "Mã OTP đã hết hạn, vui lòng gửi lại", "OTP_EXPIRED");
    }
    challenge.attempts += 1;
    if (challenge.attempts > 5 || hashToken(String(data.otp || "")) !== challenge.hash) {
      if (challenge.attempts > 5) phoneOtpChallenges.delete(phone);
      return fail(res, 401, "Mã OTP không đúng", "INVALID_OTP");
    }
    phoneOtpChallenges.delete(phone);
    let user = db.prepare("SELECT * FROM users WHERE phone=?").get(phone);
    if (!user) {
      const id = db.prepare("INSERT INTO users(name,email,password_hash,role,desired_title,phone) VALUES(?,?,?,?,?,?)")
        .run(`Người dùng ${phone.slice(-4)}`, `phone-${phone}@jobbridge.local`, hashPassword(createToken()), "candidate", "Ứng viên JobBridge", phone).lastInsertRowid;
      user = db.prepare("SELECT * FROM users WHERE id=?").get(id);
    }
    return json(res, 200, { ...issueSession(user.id), user: publicUser(db, user) }, req);
  }

  if (req.method === "POST" && pathname === "/api/auth/register") {
    const data = await body(req);
    const name = String(data.name || "").trim(), email = String(data.email || "").trim().toLowerCase(), password = String(data.password || ""), role = data.role;
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6) return fail(res, 422, "Tên, email hợp lệ và mật khẩu tối thiểu 6 ký tự là bắt buộc", "VALIDATION_ERROR");
    if (!['candidate', 'employer'].includes(role)) return fail(res, 422, "Vai trò không hợp lệ", "VALIDATION_ERROR");
    try {
      const id = db.prepare("INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)").run(name, email, hashPassword(password), role).lastInsertRowid;
      const session = issueSession(id), user = db.prepare("SELECT * FROM users WHERE id=?").get(id);
      return json(res, 201, { ...session, user: publicUser(db, user) });
    } catch (error) {
      if (error.code === "ERR_SQLITE_ERROR" && error.message.includes("UNIQUE")) return fail(res, 409, "Email đã được sử dụng", "EMAIL_EXISTS");
      throw error;
    }
  }
  if (req.method === "POST" && pathname === "/api/auth/login") {
    const data = await body(req);
    const user = db.prepare("SELECT * FROM users WHERE email=?").get(String(data.email || "").trim().toLowerCase());
    if (!user || !verifyPassword(String(data.password || ""), user.password_hash)) return fail(res, 401, "Email hoặc mật khẩu không đúng", "INVALID_CREDENTIALS");
    return json(res, 200, { ...issueSession(user.id), user: publicUser(db, user) });
  }
  if (req.method === "POST" && pathname === "/api/auth/logout") {
    const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
    if (token) db.prepare("DELETE FROM sessions WHERE token_hash=?").run(hashToken(token));
    return json(res, 204, null);
  }
  if (req.method === "GET" && pathname === "/api/auth/me") {
    const user = requireUser(req, res); if (!user) return;
    return json(res, 200, { user: publicUser(db, user) });
  }

  if (req.method === "GET" && pathname === "/api/jobs") {
    const current = userByToken(req);
    const clauses = [], values = [];
    if (current?.role !== "admin") clauses.push("status='Approved'");
    if (searchParams.get("status") && current?.role === "admin") { clauses.push("status=?"); values.push(searchParams.get("status")); }
    for (const [query, column] of [["location", "location"], ["type", "type"], ["category", "category"]]) {
      if (searchParams.get(query)) { clauses.push(`${column}=?`); values.push(searchParams.get(query)); }
    }
    if (searchParams.get("q")) { clauses.push("(title LIKE ? OR company LIKE ? OR description LIKE ?)"); values.push(...Array(3).fill(`%${searchParams.get("q")}%`)); }
    const rows = db.prepare(`SELECT * FROM jobs ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""} ORDER BY created_at DESC`).all(...values);
    return json(res, 200, { jobs: rows.map(mapJob), total: rows.length });
  }
  let params = route("/api/jobs/:id", pathname);
  if (req.method === "GET" && params) {
    const job = db.prepare("SELECT * FROM jobs WHERE id=?").get(Number(params.id));
    if (!job || (job.status !== "Approved" && userByToken(req)?.role !== "admin")) return fail(res, 404, "Không tìm thấy việc làm", "NOT_FOUND");
    return json(res, 200, { job: mapJob(job) });
  }
  params = route("/api/jobs/:id/reports", pathname);
  if (req.method === "POST" && params) {
    const user = requireUser(req, res, ["candidate"]); if (!user) return;
    const job = db.prepare("SELECT id FROM jobs WHERE id=? AND status='Approved'").get(Number(params.id));
    if (!job) return fail(res, 404, "Không tìm thấy việc làm", "NOT_FOUND");
    const d = await body(req);
    const reason = String(d.reason || "");
    const details = String(d.details || "").trim();
    if (!["incorrect", "scam", "impersonation", "fee", "other"].includes(reason) || details.length > 1000) {
      return fail(res, 422, "Nội dung báo cáo không hợp lệ", "VALIDATION_ERROR");
    }
    db.prepare(`INSERT INTO job_reports(candidate_id,job_id,reason,details) VALUES(?,?,?,?)
      ON CONFLICT(candidate_id,job_id) DO UPDATE SET reason=excluded.reason,details=excluded.details,status='pending',updated_at=datetime('now')`)
      .run(user.id, job.id, reason, details);
    const report = db.prepare("SELECT id,candidate_id,job_id,reason,details,status,reported_at,updated_at FROM job_reports WHERE candidate_id=? AND job_id=?").get(user.id, job.id);
    return json(res, 201, { report });
  }
  if (req.method === "POST" && pathname === "/api/jobs") {
    const user = requireUser(req, res, ["employer", "admin"]); if (!user) return;
    const d = await body(req);
    for (const key of ["title", "company", "salary", "location", "description"]) if (!String(d[key] || "").trim()) return fail(res, 422, `Thiếu trường ${key}`, "VALIDATION_ERROR");
    const result = db.prepare(`INSERT INTO jobs(employer_id,title,company,salary,min_salary,max_salary,location,type,status,description,category,experience,company_field,job_field,saturday)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(user.id, d.title.trim(), d.company.trim(), d.salary.trim(), Number(d.minSalary || 0), Number(d.maxSalary || d.minSalary || 0), d.location.trim(), d.type || "Full-time", user.role === "admin" ? (d.status || "Approved") : "Pending", d.description.trim(), d.category || "", d.experience || "", d.companyField || "", d.jobField || "", d.saturday || "unknown");
    return json(res, 201, { job: mapJob(db.prepare("SELECT * FROM jobs WHERE id=?").get(result.lastInsertRowid)) });
  }
  params = route("/api/jobs/:id/status", pathname);
  if (req.method === "PATCH" && params) {
    const user = requireUser(req, res, ["admin"]); if (!user) return;
    const d = await body(req);
    if (!["Pending", "Approved", "Rejected", "Closed"].includes(d.status)) return fail(res, 422, "Trạng thái không hợp lệ", "VALIDATION_ERROR");
    const result = db.prepare("UPDATE jobs SET status=?,updated_at=datetime('now') WHERE id=?").run(d.status, Number(params.id));
    if (!result.changes) return fail(res, 404, "Không tìm thấy việc làm", "NOT_FOUND");
    return json(res, 200, { job: mapJob(db.prepare("SELECT * FROM jobs WHERE id=?").get(Number(params.id))) });
  }

  if (req.method === "GET" && pathname === "/api/cvs") {
    const user = requireUser(req, res, ["candidate"]); if (!user) return;
    const cvs = db.prepare("SELECT id,candidate_id,name,source,original_file_name,mime_type,file_size,created_at,updated_at FROM cvs WHERE candidate_id=? ORDER BY updated_at DESC").all(user.id);
    return json(res, 200, { cvs });
  }
  if (req.method === "POST" && pathname === "/api/cvs/from-profile") {
    const user = requireUser(req, res, ["candidate"]); if (!user) return;
    const d = await body(req);
    const name = String(d.name || `CV ${user.desired_title || user.name}`).trim();
    if (!name || name.length > 120) return fail(res, 422, "Tên CV không hợp lệ", "VALIDATION_ERROR");
    const profile = publicUser(db, user);
    const result = db.prepare("INSERT INTO cvs(candidate_id,name,source,profile_snapshot) VALUES(?,?,?,?)")
      .run(user.id, name, "profile", JSON.stringify(profile));
    return json(res, 201, { cv: db.prepare("SELECT id,candidate_id,name,source,original_file_name,mime_type,file_size,created_at,updated_at FROM cvs WHERE id=?").get(result.lastInsertRowid) });
  }
  if (req.method === "POST" && pathname === "/api/cvs/upload") {
    const user = requireUser(req, res, ["candidate"]); if (!user) return;
    const file = await binaryBody(req, MAX_CV_FILE_SIZE);
    const originalFileName = String(searchParams.get("fileName") || "cv.pdf").trim();
    const name = String(searchParams.get("name") || originalFileName.replace(/\.pdf$/i, "")).trim();
    const isPdf = req.headers["content-type"]?.split(";", 1)[0].trim().toLowerCase() === "application/pdf";
    if (!file.length || !isPdf || file.subarray(0, 5).toString("ascii") !== "%PDF-") return fail(res, 422, "Vui lòng tải lên tệp PDF hợp lệ", "INVALID_CV_FILE");
    if (!name || name.length > 120 || originalFileName.length > 255) return fail(res, 422, "Tên CV không hợp lệ", "VALIDATION_ERROR");
    const result = db.prepare(`INSERT INTO cvs(candidate_id,name,source,original_file_name,mime_type,file_size,file_data)
      VALUES(?,?,?,?,?,?,?)`).run(user.id, name, "upload", originalFileName, "application/pdf", file.length, file);
    return json(res, 201, { cv: db.prepare("SELECT id,candidate_id,name,source,original_file_name,mime_type,file_size,created_at,updated_at FROM cvs WHERE id=?").get(result.lastInsertRowid) });
  }
  params = route("/api/cvs/:id/file", pathname);
  if (req.method === "GET" && params) {
    const user = requireUser(req, res, ["candidate"]); if (!user) return;
    const cv = db.prepare("SELECT * FROM cvs WHERE id=? AND candidate_id=? AND source='upload'").get(Number(params.id), user.id);
    if (!cv?.file_data) return fail(res, 404, "Không tìm thấy tệp CV", "NOT_FOUND");
    const safeName = encodeURIComponent(cv.original_file_name || `${cv.name}.pdf`);
    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Length": cv.file_data.length,
      "Content-Disposition": `inline; filename*=UTF-8''${safeName}`,
      "Cache-Control": "private, no-store",
    });
    return res.end(cv.file_data);
  }
  params = route("/api/cvs/:id", pathname);
  if (req.method === "DELETE" && params) {
    const user = requireUser(req, res, ["candidate"]); if (!user) return;
    const result = db.prepare("DELETE FROM cvs WHERE id=? AND candidate_id=?").run(Number(params.id), user.id);
    if (!result.changes) return fail(res, 404, "Không tìm thấy CV", "NOT_FOUND");
    return json(res, 200, { deleted: true });
  }

  if (req.method === "POST" && pathname === "/api/applications") {
    const user = requireUser(req, res, ["candidate"]); if (!user) return;
    const d = await body(req), job = db.prepare("SELECT * FROM jobs WHERE id=? AND status='Approved'").get(Number(d.jobId));
    if (!job) return fail(res, 404, "Việc làm không tồn tại hoặc chưa được duyệt", "NOT_FOUND");
    const cv = db.prepare("SELECT * FROM cvs WHERE id=? AND candidate_id=?").get(Number(d.cvId), user.id);
    if (!cv) return fail(res, 422, "Vui lòng chọn CV hợp lệ", "CV_REQUIRED");
    const coverLetter = String(d.coverLetter || "").trim();
    if (coverLetter.length < 20 || coverLetter.length > 2000) return fail(res, 422, "Thư giới thiệu phải có từ 20 đến 2000 ký tự", "VALIDATION_ERROR");
    try {
      const previous = db.prepare("SELECT * FROM applications WHERE candidate_id=? AND job_id=?").get(user.id, job.id);
      if (previous?.withdrawn_at) {
        db.prepare(`UPDATE applications SET status='Da nop',cover_letter=?,cv_id=?,cv_name=?,withdrawn_at=NULL,applied_at=datetime('now'),updated_at=datetime('now') WHERE id=?`)
          .run(coverLetter, cv.id, cv.name, previous.id);
        return json(res, 200, { application: db.prepare("SELECT * FROM applications WHERE id=?").get(previous.id) });
      }
      const id = db.prepare("INSERT INTO applications(candidate_id,job_id,cover_letter,cv_id,cv_name) VALUES(?,?,?,?,?)").run(user.id, job.id, coverLetter, cv.id, cv.name).lastInsertRowid;
      return json(res, 201, { application: db.prepare("SELECT * FROM applications WHERE id=?").get(id) });
    } catch (error) { if (error.message.includes("UNIQUE")) return fail(res, 409, "Bạn đã ứng tuyển công việc này", "ALREADY_APPLIED"); throw error; }
  }
  if (req.method === "GET" && pathname === "/api/applications") {
    const user = requireUser(req, res); if (!user) return;
    const where = user.role === "candidate" ? "a.candidate_id=?" : user.role === "employer" ? "j.employer_id=? AND a.withdrawn_at IS NULL" : "1=1";
    const args = user.role === "admin" ? [] : [user.id];
    const applications = db.prepare(`SELECT a.*,u.name candidate_name,j.title job_title,j.company FROM applications a JOIN users u ON u.id=a.candidate_id JOIN jobs j ON j.id=a.job_id WHERE ${where} ORDER BY a.applied_at DESC`).all(...args);
    return json(res, 200, { applications });
  }
  params = route("/api/applications/:id/withdraw", pathname);
  if (req.method === "PATCH" && params) {
    const user = requireUser(req, res, ["candidate"]); if (!user) return;
    const application = db.prepare("SELECT * FROM applications WHERE id=? AND candidate_id=?").get(Number(params.id), user.id);
    if (!application) return fail(res, 404, "Không tìm thấy hồ sơ", "NOT_FOUND");
    if (application.withdrawn_at || application.status !== "Da nop") return fail(res, 409, "Chỉ có thể rút hồ sơ khi còn ở trạng thái Đã nộp", "WITHDRAW_NOT_ALLOWED");
    db.prepare("UPDATE applications SET withdrawn_at=datetime('now'),updated_at=datetime('now') WHERE id=?").run(application.id);
    return json(res, 200, { application: db.prepare("SELECT * FROM applications WHERE id=?").get(application.id) });
  }
  params = route("/api/applications/:id/status", pathname);
  if (req.method === "PATCH" && params) {
    const user = requireUser(req, res, ["employer", "admin"]); if (!user) return;
    const d = await body(req);
    if (!["Da nop", "Len lich phong van", "Da tuyen", "Tu choi"].includes(d.status)) return fail(res, 422, "Trạng thái không hợp lệ", "VALIDATION_ERROR");
    const owner = user.role === "admin" ? "" : " AND job_id IN (SELECT id FROM jobs WHERE employer_id=?)";
    const result = db.prepare(`UPDATE applications SET status=?,updated_at=datetime('now') WHERE id=? AND withdrawn_at IS NULL${owner}`).run(d.status, Number(params.id), ...(user.role === "admin" ? [] : [user.id]));
    if (!result.changes) return fail(res, 404, "Không tìm thấy hồ sơ", "NOT_FOUND");
    return json(res, 200, { application: db.prepare("SELECT * FROM applications WHERE id=?").get(Number(params.id)) });
  }

  params = route("/api/saved-jobs/:jobId", pathname);
  if (params && req.method === "POST") {
    const user = requireUser(req, res, ["candidate"]); if (!user) return;
    db.prepare("INSERT OR IGNORE INTO saved_jobs(user_id,job_id) VALUES(?,?)").run(user.id, Number(params.jobId));
    return json(res, 201, { saved: true });
  }
  if (params && req.method === "DELETE") {
    const user = requireUser(req, res, ["candidate"]); if (!user) return;
    db.prepare("DELETE FROM saved_jobs WHERE user_id=? AND job_id=?").run(user.id, Number(params.jobId));
    return json(res, 200, { saved: false });
  }
  if (req.method === "GET" && pathname === "/api/saved-jobs") {
    const user = requireUser(req, res, ["candidate"]); if (!user) return;
    const jobs = db.prepare("SELECT j.* FROM jobs j JOIN saved_jobs s ON s.job_id=j.id WHERE s.user_id=? ORDER BY s.created_at DESC").all(user.id).map(mapJob);
    return json(res, 200, { jobs });
  }

  if (req.method === "PATCH" && pathname === "/api/profile") {
    const user = requireUser(req, res); if (!user) return;
    const d = await body(req);
    const fields = { name: "name", phone: "phone", location: "location", desiredTitle: "desired_title", dateOfBirth: "date_of_birth", gender: "gender", experienceLevel: "experience_level", education: "education", portfolio: "portfolio", summary: "summary" };
    const updates = Object.entries(fields).filter(([key]) => key in d);
    if (updates.length) db.prepare(`UPDATE users SET ${updates.map(([, col]) => `${col}=?`).join(",")},updated_at=datetime('now') WHERE id=?`).run(...updates.map(([key]) => String(d[key] ?? "").trim()), user.id);
    if (Array.isArray(d.skills)) {
      db.prepare("DELETE FROM user_skills WHERE user_id=?").run(user.id);
      for (const skill of [...new Set(d.skills.map((x) => String(x).trim()).filter(Boolean))]) {
        db.prepare("INSERT OR IGNORE INTO skills(name) VALUES(?)").run(skill);
        const skillId = db.prepare("SELECT id FROM skills WHERE name=?").get(skill).id;
        db.prepare("INSERT INTO user_skills(user_id,skill_id) VALUES(?,?)").run(user.id, skillId);
      }
    }
    return json(res, 200, { user: publicUser(db, db.prepare("SELECT * FROM users WHERE id=?").get(user.id)) });
  }
  return fail(res, 404, "API không tồn tại", "NOT_FOUND");
}

function staticFile(req, res, pathname) {
  const aliases = pathname === "/" || /^\/jobs\/\d+\/?$/.test(pathname) ? "/html/index.html" : pathname;
  const file = path.resolve(root, `.${aliases}`);
  if (!file.startsWith(root) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return fail(res, 404, "Không tìm thấy tài nguyên", "NOT_FOUND");
  const type = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".png": "image/png" }[path.extname(file)] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": type });
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  try { if (url.pathname.startsWith("/api/")) await api(req, res, url); else staticFile(req, res, url.pathname); }
  catch (error) { console.error(error); if (!res.headersSent) fail(res, error.status || 500, error.status ? error.message : "Lỗi máy chủ", "INTERNAL_ERROR"); }
});
server.listen(port, () => console.log(`JobBridge: http://localhost:${port}`));

export { server, db };
