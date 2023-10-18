import os
from datetime import datetime, timedelta, timezone
from typing import Annotated

import bcrypt
import jwt
import pytz
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, StringConstraints, field_validator
from xata import XataClient

load_dotenv()
SECRET_KEY: str = os.getenv("SECRET_KEY")
ALGORITHM: list = os.getenv("ALGORITHM").split(',')
EXPIRATION: float = float(os.getenv("EXPIRATION"))
XATA_API_KEY: str = os.getenv("XATA_API_KEY")
XATA_BRANCH: str = os.getenv("XATA_BRANCH")
DB_URL: str = os.getenv("DB_URL")

# Loading DB
#db = XataClient(db_url=DB_URL, api_key=XATA_API_KEY, branch_name=XATA_BRANCH)
app = FastAPI()

# Allow CORS
origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

states = [ 'AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA',
           'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME',
           'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM',
           'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX',
           'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY']

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")


class User(BaseModel):
    username: str
    # probably need to hash this or something
    password: Annotated[str, StringConstraints(min_length=8)]

    @field_validator("username")
    def username_alphanumeric(cls, v):
        assert v.isalnum(), "must be alphanumeric"
        return v


class UserDetails(BaseModel):
    full_name: Annotated[str, StringConstraints(min_length=1, max_length=50)]
    address1: Annotated[str, StringConstraints(min_length=1, max_length=100)]
    address2: Annotated[str, StringConstraints(max_length=100)] = ""
    city: Annotated[str, StringConstraints(min_length=1, max_length=100)]
    state: Annotated[str, StringConstraints(min_length=2, max_length=2)]
    zipcode: Annotated[str, StringConstraints(min_length=5, max_length=9)]

    @field_validator("state")
    def validate_state(cls, v):
        if v not in states:
            raise ValueError("Invalid state")
        return v

    @field_validator("full_name")
    def validate_full_name(cls, v):
        if ' ' not in v:
            raise ValueError("Full name must contain space")
        return v.title()


class FuelData(BaseModel):
    gallons_requested: int
    delivery_address: str
    delivery_date: str
    suggested_price: float
    total_amount_due: float
    date_requested: str
    id: int


def get_db():
    db = XataClient(db_url=DB_URL, api_key=XATA_API_KEY)
    yield db


# Not implementing it yet
def calculate_price() -> float: # type: ignore
    pass


def format_datetime(dt: datetime) -> str:
    dt = datetime.fromisoformat(dt)
    dt = dt.astimezone(pytz.timezone("America/Chicago"))
    return dt.strftime("%m/%d/%Y at %H:%M")


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


@app.post("/api/register", description="Register a new user")
async def register(user: User, db: XataClient = Depends(get_db)):
    # Check if the user exists
    response = db.sql().query(
        "SELECT * FROM \"Users\" WHERE username = $1", [user.username]
    )

    if len(response) == 1:
        raise HTTPException(status_code=400, detail="Username already registered")

    password = bcrypt.hashpw((user.password).encode(), bcrypt.gensalt())
    password = password.decode()

    db.sql().query(
        "INSERT INTO \"Users\" (username, password) VALUES ($1, $2)",
        [user.username, password]
    )

    return {"message": "User registered successfully!"}


@app.post("/api/token", description="Get user token")
async def login(data: Annotated[OAuth2PasswordRequestForm, Depends()], db: XataClient = Depends(get_db)):
    response = db.sql().query(
        "SELECT username, password, require_details FROM \"Users\" WHERE username = $1 LIMIT 1",
        [data.username]
    )

    if len(response) != 1:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    stored_pass = response["records"][0]["password"]

    checkpass = bcrypt.checkpw((data.password).encode(), stored_pass.encode())

    if data.username == response["records"][0]["username"] and checkpass:
        token = create_token(data={"user": data.username})
        return {
            "access_token": token,
            "token_type": "bearer",
            "require_details": response["records"][0]["require_details"],
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid username or password")


@app.post("/api/user/", description="Adds user details")
async def add_user_details(details: UserDetails, token: str = Depends(oauth2_scheme), db: XataClient = Depends(get_db)):
    user = decode_token(token)
    response = db.sql().query("SELECT require_details FROM \"Users\" WHERE username = $1", [user])
    if len(response) != 1:
        return HTTPException(status_code=400, detail="User not registered")

    if response["records"][0]["require_details"] == False:
        raise HTTPException(status_code=400, detail="User details already registered")

    db.sql().query(
        "UPDATE \"Users\" SET full_name = $1, address1 = $2, address2 = $3, city = $4, state = $5, zipcode = $6, require_details = FALSE WHERE username = $7",
        [details.full_name, details.address1, details.address2, details.city, details.state, details.zipcode, user]
    )

    return {"message": "User details registered successfully!"}


@app.put("/api/user/", description="Updates user details")
async def update_user_details(
    details: UserDetails, token: str = Depends(oauth2_scheme), db: XataClient = Depends(get_db)
):
    user = decode_token(token)
    response = db.sql().query("SELECT require_details FROM \"Users\" WHERE username = $1", [user])
    if len(response) != 1:
        return HTTPException(status_code=400, detail="User not registered")

    db.sql().query(
        "UPDATE \"Users\" SET full_name = $1, address1 = $2, address2 = $3, city = $4, state = $5, zipcode = $6 WHERE username = $7",
        [details.full_name, details.address1, details.address2, details.city, details.state, details.zipcode, user]
    )

    return {"message": "User details updated successfully!", "lmao": XATA_BRANCH}


@app.get("/api/user/", description="Returns user details")
async def get_user_details(token: str = Depends(oauth2_scheme), db: XataClient = Depends(get_db)):
    user = decode_token(token)

    response = db.sql().query("SELECT full_name, address1, address2, city, state, zipcode FROM \"Users\" WHERE username = $1", [user])
    record = response["records"][0]

    details = UserDetails(
        full_name=record["full_name"],
        address1=record["address1"],
        address2=record["address2"],
        city=record["city"],
        state=record["state"],
        zipcode=record["zipcode"]
    )

    return details


@app.post("/api/fuel_quote/", description="Adds a fuel quote")
async def add_fuel_quote(data: FuelData, token: str = Depends(oauth2_scheme), db: XataClient = Depends(get_db)):
    user = decode_token(token)
    response = db.sql().query(
        "SELECT full_name, address1, address2, city, state, zipcode, require_details FROM \"Users\" WHERE username = $1", [user]
        )

    if response["records"][0]["require_details"] == True:
        raise HTTPException(status_code=400, detail="Add user details first")


    record = response["records"][0]
    details = UserDetails(
        full_name=record["full_name"],
        address1=record["address1"],
        address2=record["address2"],
        city=record["city"],
        state=record["state"],
        zipcode=record["zipcode"]
    )

    data.delivery_address = (
        details.address1 + details.address2 + ", " + details.city + ", " + details.state + " " + details.zipcode
    )
    cst = pytz.timezone("America/Chicago")
    current_time_cst = datetime.now(cst)
    data.date_requested = current_time_cst.isoformat()

    # later we will use pricing module to determine total_amound_due in backend
    # I am aware that frontend cutting the digits off at 2 decimal but this is rounding but once again will be fixed after pricing module
    total = data.gallons_requested * data.suggested_price
    total = round(total, 2)
    if total != data.total_amount_due:
        print(data.gallons_requested * data.suggested_price)
        raise HTTPException(status_code=422, detail="Invalid total amount due")

    db.sql().query(
        "INSERT INTO \"FuelData\" (username, gallons_requested, delivery_addr, delivery_date, ppg, total_cost, date_requested) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [user, data.gallons_requested, data.delivery_address, data.delivery_date, data.suggested_price, data.total_amount_due, data.date_requested]
    )

    return {"message": "Fuel quote registered successfully!"}


@app.get("/api/fuel_quote/", description="Returns a list of fuel quotes")
async def get_fuel_quote(token: str = Depends(oauth2_scheme), db: XataClient = Depends(get_db)):
    user = decode_token(token)
    details = db.sql().query("SELECT require_details FROM \"Users\" WHERE username = $1", [user])
    if details["records"][0]["require_details"] == True:
        raise HTTPException(status_code=400, detail="Add user details first")

    response = db.sql().query("SELECT gallons_requested, delivery_addr, delivery_date, ppg, total_cost, date_requested FROM \"FuelData\" WHERE username = $1", [user])

    records = response["records"]
    if len(records) == 0:
        raise HTTPException(status_code=501, detail="No fuel quotes registered")

    data = []
    num = 0
    for record in response["records"]:
        data.append(
            FuelData(
                gallons_requested=record["gallons_requested"],
                delivery_address=record["delivery_addr"],
                delivery_date=format_datetime(record["delivery_date"]),
                suggested_price=record["ppg"],
                total_amount_due=record["total_cost"],
                date_requested=format_datetime(record["date_requested"]),
                id = num
            )
        )
        num += 1

    return data
