import jwt
from typing import Annotated
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta


users = {}
user_details = {}

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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")

def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=EXPIRATION)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

def decode_token(token: str):
    try:
        decode = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
        username: str = decode.get("user")
        return username
    except jwt.PyJWTError as p:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/api/register")
async def register(user: User):
    # Check if the user exists
    if user.username in users:
        raise HTTPException(status_code=400, detail="Username already registered")

    # We will implement hashing to store the pass to db later
    users[user.username] = user.password
    return {"message": "User registered successfully!"}

@app.post("/api/token")
async def login(data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    if data.username in users and users[data.username] == data.password:
        token = create_token(data={"user": data.username})
        require_details = 0
        if data.username not in user_details:
            require_details = 1
        return {"access_token": token, "token_type": "bearer", "require_details": require_details}
    else:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    

@app.post("/api/user/")
async def add_user_details(details: UserDetails, token: str = Depends(oauth2_scheme)):
    user = decode_token(token)
    if user in user_details:
        raise HTTPException(status_code=400, detail="User details already registered")
    
    user_details[user] = details
    return {"message": "User details registered successfully!"}

@app.get("/api/user/")
async def get_user_details(token: str = Depends(oauth2_scheme)):
    user = decode_token(token)
    if user not in user_details:
        return {"message": "User details not registered"}
    return user_details[user]
