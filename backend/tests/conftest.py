import pytest
from xata import XataClient
from fastapi.testclient import TestClient
from main import app
from app.utils import get_db

db = XataClient(branch_name="test")


@pytest.fixture(scope="session", autouse=True)
def override_get_db():
    def override():
        return db
    app.dependency_overrides[get_db] = override
    yield db


@pytest.fixture(scope="function", autouse=True)
def cleanup():
    yield
    db.sql().query("DELETE FROM \"Users\"")
    db.sql().query("DELETE FROM \"FuelData\"")


@pytest.fixture(scope="module", autouse=True)
def client():
    return TestClient(app)
