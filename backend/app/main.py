from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import fuel_enpoint, user_endpoint
from app.utils import buildDB

buildDB()

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

app.include_router(fuel_enpoint.app)
app.include_router(user_endpoint.app)
