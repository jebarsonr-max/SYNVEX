import os
import hashlib
import hmac
from datetime import datetime, timedelta
from typing import Optional, Any
from jose import jwt, JWTError
from app.core.config import settings

ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    pw_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt.hex() + ":" + pw_hash.hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt_hex, pw_hash_hex = hashed_password.split(":")
        salt = bytes.fromhex(salt_hex)
        expected_hash = bytes.fromhex(pw_hash_hex)
        new_hash = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, 100000)
        return hmac.compare_digest(new_hash, expected_hash)
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
