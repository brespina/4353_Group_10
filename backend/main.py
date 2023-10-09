from typing import Annotated

from fastapi import FastAPI, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


fake_users_db = {
    "superlongusername": {
        "username": "superlongusername",
        "password": "Pas$$word123",
        "full_name": "Jing Yuan",
        "address1": "1034 Seat of Divine Foresight",
        "city": "Luofu",
        "state": "OH",
        "zipcode": 12345,
    },
    "singh": {
        "username": "singh",
        "password": "fuelfuel61",
        "full_name": "Professor Singh",
        "address1": "3455 Cullen Blvd",
        "address2": "McMurdo Station",
        "city": "Houston",
        "state": "TX",
        "zipcode": 77204,
    },
}


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


class User(BaseModel):
    username: str
    password: str  # probably need to hash this or something
    full_name: str
    address1: str
    address2: str | None = None  # optional
    city: str
    state: str
    zipcode: int


@app.get("/")
async def get_root():
    return {"hello": "there"}


@app.post("/login/")
async def login():
    return {}


@app.get("/profile/")
async def get_profile():
    return {}


# TODO: EXAMPLE STUFF BELOW, REMOVE LATER
class Figure(BaseModel):
    name: str
    price: float


special_data = []


@app.post("/figures/{figure_number}")
async def add_figure(
    figure_number: Annotated[
        int, Path(title="Figure ID", description="ID of the figure to get")
    ],
    year: Annotated[
        str | None,
        Query(
            title="Year Query",
            description="Figure's year to be added in database",
            min_length=1,
        ),
    ] = None,
):
    special_data.append(figure_number)
    return {"figure_name": figure_number, "special_data": special_data}
