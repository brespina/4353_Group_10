import bcrypt
from fastapi import Depends, HTTPException, APIRouter
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm
from xata import XataClient
from ..models import User, UserDetails
from ..utils import create_token, decode_token, get_db, oauth2_scheme

app = APIRouter()

@app.post("/api/register", description="Register a new user")
async def register(user: User, db: XataClient = Depends(get_db)):
    response = db.sql().query(
        'SELECT * FROM "Users" WHERE username = $1', [user.username]
    )

    if len(response) == 1:
        raise HTTPException(status_code=409, detail="Username already registered")

    password = bcrypt.hashpw((user.password).encode(), bcrypt.gensalt())
    password = password.decode()

    db.sql().query(
        'INSERT INTO "Users" (username, password) VALUES ($1, $2)',
        [user.username, password],
    )

    return {"message": "User registered successfully!"}


@app.post("/api/token", description="Get user token")
async def login(data: Annotated[OAuth2PasswordRequestForm, Depends()], db: XataClient = Depends(get_db)):
    response = db.sql().query(
        'SELECT username, password, require_details FROM "Users" WHERE username = $1 LIMIT 1',
        [data.username],
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
    response = db.sql().query(
        'SELECT require_details FROM "Users" WHERE username = $1', [user]
    )
    
    # Covers DB errors and user not registered
    if len(response) != 1:
        raise HTTPException(status_code=400, detail="User not registered")

    if response["records"][0]["require_details"] == False:
        raise HTTPException(status_code=400, detail="User details already registered")

    db.sql().query(
        'UPDATE "Users" SET full_name = $1, address1 = $2, address2 = $3, city = $4, state = $5, zipcode = $6, require_details = FALSE WHERE username = $7',
        [
            details.full_name,
            details.address1,
            details.address2,
            details.city,
            details.state,
            details.zipcode,
            user,
        ],
    )

    return {"message": "User details registered successfully!"}


@app.put("/api/user/", description="Updates user details")
async def update_user_details(
    details: UserDetails, token: str = Depends(oauth2_scheme), db: XataClient = Depends(get_db)
):
    user = decode_token(token)
    response = db.sql().query(
        'SELECT require_details FROM "Users" WHERE username = $1', [user]
    )
    
    # Covers DB errors and user not registered
    if len(response) != 1:
        raise HTTPException(status_code=400, detail="User not registered")

    if response["records"][0]["require_details"] == True:
        raise HTTPException(status_code=400, detail="User details not registered")

    db.sql().query(
        'UPDATE "Users" SET full_name = $1, address1 = $2, address2 = $3, city = $4, state = $5, zipcode = $6 WHERE username = $7',
        [
            details.full_name,
            details.address1,
            details.address2,
            details.city,
            details.state,
            details.zipcode,
            user,
        ],
    )

    return {"message": "User details updated successfully!"}


@app.get("/api/user/", description="Returns user details")
async def get_user_details(token: str = Depends(oauth2_scheme), db: XataClient = Depends(get_db)):
    user = decode_token(token)

    response = db.sql().query(
        'SELECT full_name, address1, address2, city, state, zipcode, require_details FROM "Users" WHERE username = $1',
        [user],
    )

    # Covers DB errors and user not registered
    if len(response) != 1:
        raise HTTPException(status_code=400, detail="User not registered")

    if response["records"][0]["require_details"] == True:
        raise HTTPException(status_code=400, detail="User details not registered")

    record = response["records"][0]

    details = UserDetails(
        full_name=record["full_name"],
        address1=record["address1"],
        address2=record["address2"],
        city=record["city"],
        state=record["state"],
        zipcode=record["zipcode"],
    )

    return details