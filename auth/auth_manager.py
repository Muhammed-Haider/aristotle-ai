"""
Auth Manager - Aristotle AI
Handles registration, login, and session persistence.
All data stored locally in data/users.json — no internet required.
"""

import json
import re
from datetime import datetime
from pathlib import Path

import bcrypt

DATA_DIR   = Path("./data")
USERS_FILE = DATA_DIR / "users.json"
SESSION_FILE = DATA_DIR / "session.json"


def _load_users() -> dict:
    if not USERS_FILE.exists():
        return {}
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_users(users: dict) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)


def register(email: str, password: str) -> tuple[bool, str]:
    """Create a new user account. Returns (success, message)."""
    email = email.strip().lower()

    if not re.match(r"^[^@]+@[^@]+\.[^@]+$", email):
        return False, "Enter a valid email address"
    if len(password) < 8:
        return False, "Password must be at least 8 characters"

    users = _load_users()
    if email in users:
        return False, "An account with this email already exists"

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    users[email] = {
        "password": hashed,
        "created_at": datetime.utcnow().isoformat(),
        "profile": {},
        "onboarding_done": False,
    }
    _save_users(users)
    return True, "Account created"


def login(email: str, password: str) -> tuple[bool, str]:
    """Verify credentials. Returns (success, message)."""
    email = email.strip().lower()
    users = _load_users()

    if email not in users:
        return False, "Invalid email or password"

    stored = users[email]["password"].encode("utf-8")
    if bcrypt.checkpw(password.encode("utf-8"), stored):
        _save_session(email)
        return True, "Login successful"

    return False, "Invalid email or password"


def change_password(email: str, old_password: str, new_password: str) -> tuple[bool, str]:
    """Change password after verifying the old one."""
    success, msg = login(email, old_password)
    if not success:
        return False, "Current password is incorrect"
    if len(new_password) < 8:
        return False, "New password must be at least 8 characters"

    users = _load_users()
    hashed = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    users[email]["password"] = hashed
    _save_users(users)
    return True, "Password updated"


def delete_account(email: str) -> None:
    users = _load_users()
    users.pop(email, None)
    _save_users(users)
    clear_session()


def is_onboarding_done(email: str) -> bool:
    users = _load_users()
    return users.get(email, {}).get("onboarding_done", False)


def mark_onboarding_done(email: str) -> None:
    users = _load_users()
    if email in users:
        users[email]["onboarding_done"] = True
        _save_users(users)


def save_profile(email: str, profile: dict) -> None:
    users = _load_users()
    if email in users:
        users[email]["profile"] = profile
        _save_users(users)


def get_profile(email: str) -> dict:
    users = _load_users()
    return users.get(email, {}).get("profile", {})


# ------------------------------------------------------------------ session

def _save_session(email: str) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    with open(SESSION_FILE, "w", encoding="utf-8") as f:
        json.dump({"email": email, "logged_in_at": datetime.utcnow().isoformat()}, f)


def get_session() -> str | None:
    """Return the logged-in email if a session exists, else None."""
    if not SESSION_FILE.exists():
        return None
    with open(SESSION_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("email")


def clear_session() -> None:
    if SESSION_FILE.exists():
        SESSION_FILE.unlink()
