import jwt
from typing import Annotated
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from datetime import timezone
from collections import defaultdict
import pytz

users = {}
user_details = {}
fuel_history = defaultdict(list)

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

SECRET_KEY = "RUHqtDiJSJVAoyVtrSH9bbk1pQqEME7gUiYfLjveXGVlObYhYeqKJB07jvf38nC" # Ideally we want in a .env file but its ok :)
ALGORITHM = "HS256"
EXPIRATION = 24


class User(BaseModel):
    username: str
    password: str  # probably need to hash this or something

class UserDetails(BaseModel):
    full_name: str
    address1: str
    address2: str | None = None
    city: str
    state: str
    zipcode: int

class FuelData(BaseModel):
    gallons_requested: int
    delivery_address: str
    delivery_date: str
    suggested_price: float
    total_amount_due: float
    date_requested: str
    id: int


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")


def format_datetime(dt: datetime) -> str:
    return dt.strftime('%m/%d/%Y %H:%M:%S')

def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=EXPIRATION)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

def decode_token(token: str):
    try:
        decode = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
        username: str = decode.get("user")
        if username not in users:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/api/register", description="Register a new user")
async def register(user: User):
    # Check if the user exists
    if user.username in users:
        raise HTTPException(status_code=400, detail="Username already registered")

    # We will implement hashing to store the pass to db later
    users[user.username] = user.password
    return {"message": "User registered successfully!"}

@app.post("/api/token", description="Get user token")
async def login(data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    if data.username in users and users[data.username] == data.password:
        token = create_token(data={"user": data.username})
        require_details = 0
        if data.username not in user_details:
            require_details = 1
        return {"access_token": token, "token_type": "bearer", "require_details": require_details}
    else:
        raise HTTPException(status_code=401, detail="Invalid username or password")

@app.post("/api/user/", description="Adds user details")
async def add_user_details(details: UserDetails, token: str = Depends(oauth2_scheme)):
    user = decode_token(token)
    if user in user_details:
        raise HTTPException(status_code=400, detail="User details already registered")
    
    user_details[user] = details
    return {"message": "User details registered successfully!"}

@app.get("/api/user/", description="Returns user details")
async def get_user_details(token: str = Depends(oauth2_scheme)):
    user = decode_token(token)
    if user not in user_details:
        raise HTTPException(status_code=400, detail="User details not registered")
    
    return user_details[user]

@app.post("/api/fuel_quote/", description="Adds a fuel quote")
async def add_fuel_quote(data: FuelData, token: str = Depends(oauth2_scheme)):
    user = decode_token(token)
    if user not in user_details:
        raise HTTPException(status_code=400, detail="Add user details first")
    
    data.delivery_address = user_details[user].address1 # We'll change this once we change frontend
    if user not in fuel_history:
        data.id = 1
    else:
        data.id = len(fuel_history[user]) + 1
    cst = pytz.timezone('America/Chicago')
    current_time_cst = datetime.now(cst)    
    data.date_requested = format_datetime(current_time_cst)

    fuel_history[user].append(data)
    return {"message": "Fuel quote registered successfully!"}

@app.get("/api/fuel_quote/", description="Returns a list of fuel quotes")
async def get_fuel_quote(token: str = Depends(oauth2_scheme)):
    user = decode_token(token)
    if user not in user_details:
        raise HTTPException(status_code=400, detail="Add user details first")
    if user not in fuel_history:
        raise HTTPException(status_code=204, detail="No fuel quotes registered")
    return fuel_history[user]

