import os
from datetime import datetime, timedelta, timezone

import jwt
import pytz
from dotenv import load_dotenv
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordBearer
from xata import XataClient

from .models import ClientInfo_Schema, FuelQuote_Schema, UserCreds_Schema

load_dotenv()
SECRET_KEY: str = os.getenv("SECRET_KEY")
ALGORITHM: list = os.getenv("ALGORITHM").split(",")
EXPIRATION: float = float(os.getenv("EXPIRATION"))
XATA_API_KEY: str = os.getenv("XATA_API_KEY")
XATA_BRANCH: str = os.getenv("XATA_BRANCH")
DB_URL: str = os.getenv("DB_URL")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")


global_db = None

# Use 1 instance to reduce overhead
def intialize_db():
    global global_db
    if global_db is None:
        global_db = XataClient(api_key=XATA_API_KEY, branch_name=XATA_BRANCH, db_url=DB_URL)
    return global_db

def get_db():
    db = intialize_db()
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


def buildDB():
    db = intialize_db()

    # Create the UserCredentials table
    db.table().create("UserCredentials")
    db.table().set_schema("UserCredentials", UserCreds_Schema)

    # Create the ClientInformation table
    db.table().create("ClientInformation")
    db.table().set_schema("ClientInformation", ClientInfo_Schema)

    # Create the FuelData table
    db.table().create("FuelData")
    db.table().set_schema("FuelData", FuelQuote_Schema)
