import jwt
import pytz
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordBearer
from xata import XataClient

load_dotenv()
SECRET_KEY: str = os.getenv("SECRET_KEY")
ALGORITHM: list = os.getenv("ALGORITHM").split(",")
EXPIRATION: float = float(os.getenv("EXPIRATION"))
XATA_API_KEY: str = os.getenv("XATA_API_KEY")
XATA_BRANCH: str = os.getenv("XATA_BRANCH")
DB_URL: str = os.getenv("DB_URL")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")

def get_db():
    db = XataClient(db_url=DB_URL, api_key=XATA_API_KEY, branch_name=XATA_BRANCH)
    yield db

# Not implementing it yet
def calculate_price() -> float:  # type: ignore
    pass

def format_datetime(dt: str) -> str:
    dt_obj = datetime.fromisoformat(dt)
    dt_obj = dt_obj.astimezone(pytz.timezone("America/Chicago"))
    return dt_obj.strftime("%m/%d/%Y at %H:%M")


def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=EXPIRATION)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM[0])
    return token


def decode_token(token: str):
    try:
        decode = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM[0])
        username: str = decode.get("user")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    


