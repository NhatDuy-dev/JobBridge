import base64
import hashlib
import json
import os
import secrets
import sqlite3
import time
from pathlib import Path
from urllib.parse import urlencode

import httpx
from dotenv import load_dotenv
from fastapi import Cookie, FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
DATABASE_PATH = Path(os.getenv("DATABASE_PATH", "../data/jobbridge.db"))
if not DATABASE_PATH.is_absolute():
    DATABASE_PATH = (ROOT / DATABASE_PATH).resolve()

app = FastAPI(title="JobBridge Authentication Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

otp_challenges: dict[str, dict] = {}
oauth_exchanges: dict[str, dict] = {}


class PhonePayload(BaseModel):
    phone: str


class OtpPayload(PhonePayload):
    otp: str


def database():
    connection = sqlite3.connect(DATABASE_PATH, timeout=5)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def token_hash(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def new_password_hash() -> str:
    salt = secrets.token_bytes(16)
    password = secrets.token_bytes(32)
    digest = hashlib.scrypt(password, salt=salt, n=16384, r=8, p=1, dklen=64)
    return f"scrypt${salt.hex()}${digest.hex()}"


def public_user(connection, user):
    skills = [row[0] for row in connection.execute("SELECT s.name FROM skills s JOIN user_skills us ON us.skill_id=s.id WHERE us.user_id=? ORDER BY s.name", (user["id"],))]
    saved = [row[0] for row in connection.execute("SELECT job_id FROM saved_jobs WHERE user_id=?", (user["id"],))]
    applied = [row[0] for row in connection.execute("SELECT job_id FROM applications WHERE candidate_id=?", (user["id"],))]
    return {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"], "phone": user["phone"], "location": user["location"], "desiredTitle": user["desired_title"], "skills": skills, "savedJobs": saved, "appliedJobs": applied}


def issue_session(connection, user):
    token = secrets.token_urlsafe(32)
    expires_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() + 7 * 86400))
    connection.execute("DELETE FROM sessions WHERE expires_at <= datetime('now')")
    connection.execute("INSERT INTO sessions(id,user_id,token_hash,expires_at) VALUES(?,?,?,?)", (secrets.token_hex(16), user["id"], token_hash(token), expires_at))
    connection.commit()
    return {"token": token, "expiresAt": expires_at, "user": public_user(connection, user)}


def upsert_oauth_user(profile):
    email = (profile.get("email") or f'{profile["provider"]}-{profile["id"]}@jobbridge.local').lower()
    with database() as connection:
        user = connection.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        if not user:
            cursor = connection.execute("INSERT INTO users(name,email,password_hash,role,desired_title) VALUES(?,?,?,?,?)", (profile["name"], email, new_password_hash(), "candidate", "Ứng viên JobBridge"))
            connection.commit()
            user = connection.execute("SELECT * FROM users WHERE id=?", (cursor.lastrowid,)).fetchone()
        if user["status"] == "Locked":
            raise HTTPException(403, "Tài khoản đã bị khóa")
        return issue_session(connection, user)


def oauth_cookie(provider: str, state: str, verifier: str = "") -> str:
    payload = base64.urlsafe_b64encode(json.dumps({"state": state, "verifier": verifier}).encode()).decode()
    return payload


def parse_oauth_cookie(value: str | None):
    try:
        return json.loads(base64.urlsafe_b64decode(value or ""))
    except Exception:
        return {}


@app.get("/health")
def health():
    return {"status": "ok", "service": "authentication"}


@app.get("/auth/oauth/{provider}")
def oauth_start(provider: str):
    state = secrets.token_urlsafe(24)
    callback = f"http://localhost:8000/auth/oauth/{provider}/callback"
    if provider == "google":
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        if not client_id:
            raise HTTPException(501, "Chưa cấu hình GOOGLE_CLIENT_ID")
        params = {"client_id": client_id, "redirect_uri": callback, "response_type": "code", "scope": "openid email profile", "prompt": "select_account", "state": state}
        target = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)
        verifier = ""
    elif provider == "zalo":
        client_id = os.getenv("ZALO_APP_ID")
        if not client_id:
            raise HTTPException(501, "Chưa cấu hình ZALO_APP_ID")
        verifier = secrets.token_urlsafe(32)
        challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip("=")
        params = {"app_id": client_id, "redirect_uri": callback, "state": state, "code_challenge": challenge, "code_challenge_method": "S256"}
        target = "https://oauth.zaloapp.com/v4/permission?" + urlencode(params)
    else:
        raise HTTPException(404, "Nhà cung cấp OAuth không được hỗ trợ")
    response = RedirectResponse(target)
    response.set_cookie("jobbridge_oauth", oauth_cookie(provider, state, verifier), max_age=600, httponly=True, samesite="lax")
    return response


@app.get("/auth/oauth/{provider}/callback")
async def oauth_callback(provider: str, code: str, state: str, jobbridge_oauth: str | None = Cookie(None)):
    saved = parse_oauth_cookie(jobbridge_oauth)
    if not state or state != saved.get("state"):
        raise HTTPException(403, "Phiên OAuth không hợp lệ hoặc đã hết hạn")
    callback = f"http://localhost:8000/auth/oauth/{provider}/callback"
    async with httpx.AsyncClient(timeout=15) as client:
        if provider == "google":
            token_response = await client.post("https://oauth2.googleapis.com/token", data={"client_id": os.getenv("GOOGLE_CLIENT_ID"), "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"), "code": code, "redirect_uri": callback, "grant_type": "authorization_code"})
            token_response.raise_for_status()
            profile_response = await client.get("https://openidconnect.googleapis.com/v1/userinfo", headers={"Authorization": f'Bearer {token_response.json()["access_token"]}'})
            profile_response.raise_for_status()
            data = profile_response.json()
            profile = {"provider": provider, "id": data["sub"], "name": data.get("name") or data.get("email"), "email": data.get("email")}
        elif provider == "zalo":
            token_response = await client.post("https://oauth.zaloapp.com/v4/access_token", data={"app_id": os.getenv("ZALO_APP_ID"), "code": code, "grant_type": "authorization_code", "code_verifier": saved.get("verifier", "")}, headers={"secret_key": os.getenv("ZALO_APP_SECRET", "")})
            token_response.raise_for_status()
            token = token_response.json()["access_token"]
            profile_response = await client.get("https://graph.zalo.me/v2.0/me?fields=id,name,picture,email", headers={"access_token": token})
            profile_response.raise_for_status()
            data = profile_response.json()
            profile = {"provider": provider, "id": data["id"], "name": data.get("name") or "Người dùng Zalo", "email": data.get("email")}
        else:
            raise HTTPException(404, "Nhà cung cấp OAuth không được hỗ trợ")
    exchange_code = secrets.token_urlsafe(32)
    oauth_exchanges[exchange_code] = {"session": upsert_oauth_user(profile), "expires": time.time() + 60}
    response = RedirectResponse(f"{FRONTEND_URL}/?auth_code={exchange_code}")
    response.delete_cookie("jobbridge_oauth")
    return response


@app.post("/auth/exchange/{code}")
def exchange(code: str):
    entry = oauth_exchanges.pop(code, None)
    if not entry or entry["expires"] < time.time():
        raise HTTPException(410, "Mã đăng nhập đã hết hạn")
    return entry["session"]


@app.post("/auth/phone/send-otp")
def send_otp(payload: PhonePayload):
    phone = "".join(payload.phone.split())
    if not ((phone.startswith("0") and phone[1:].isdigit()) or (phone.startswith("+84") and phone[3:].isdigit())) or len(phone) not in (10, 11, 12):
        raise HTTPException(422, "Số điện thoại không hợp lệ")
    otp = os.getenv("DEMO_OTP", "123456")
    otp_challenges[phone] = {"hash": token_hash(otp), "expires": time.time() + 300, "attempts": 0}
    return {"sent": True, "expiresIn": 300, "demoOtp": otp}


@app.post("/auth/phone/verify-otp")
def verify_otp(payload: OtpPayload):
    phone = "".join(payload.phone.split())
    challenge = otp_challenges.get(phone)
    if not challenge or challenge["expires"] < time.time():
        otp_challenges.pop(phone, None)
        raise HTTPException(410, "Mã OTP đã hết hạn")
    challenge["attempts"] += 1
    if challenge["attempts"] > 5 or not secrets.compare_digest(token_hash(payload.otp), challenge["hash"]):
        raise HTTPException(401, "Mã OTP không đúng")
    otp_challenges.pop(phone, None)
    with database() as connection:
        user = connection.execute("SELECT * FROM users WHERE phone=?", (phone,)).fetchone()
        if not user:
            cursor = connection.execute("INSERT INTO users(name,email,password_hash,role,desired_title,phone) VALUES(?,?,?,?,?,?)", (f"Người dùng {phone[-4:]}", f"phone-{phone}@jobbridge.local", new_password_hash(), "candidate", "Ứng viên JobBridge", phone))
            connection.commit()
            user = connection.execute("SELECT * FROM users WHERE id=?", (cursor.lastrowid,)).fetchone()
        if user["status"] == "Locked":
            raise HTTPException(403, "Tài khoản đã bị khóa")
        return issue_session(connection, user)

