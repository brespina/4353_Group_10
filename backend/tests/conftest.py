import pytest
import os
from dotenv import load_dotenv, find_dotenv
from xata import XataClient
from fastapi.testclient import TestClient
from main import app
from app.utils import get_db

load_dotenv(find_dotenv())

XATA_API_KEY: str = os.getenv("XATA_API_KEY")
DB_URL: str = os.getenv("DB_URL")
TEST_BRANCH: str = os.getenv("TEST_BRANCH")
TEST_DB_URL: str = os.getenv("TEST_DB_URL")

db = XataClient(db_url=TEST_DB_URL, api_key=XATA_API_KEY, branch_name=TEST_BRANCH)

@pytest.fixture(scope= "session", autouse=True)
def override_get_db():
    def override():
        return db
    app.dependency_overrides[get_db] = override
    yield db

@pytest.fixture(scope="function", autouse=True)
def cleanup():
    yield
    db.sql().query('DELETE FROM "UserCredentials"')
    db.sql().query('DELETE FROM "ClientInformation"')
    db.sql().query('DELETE FROM "FuelData"')

@pytest.fixture(scope="module", autouse=True)
def client():
    return TestClient(app)
