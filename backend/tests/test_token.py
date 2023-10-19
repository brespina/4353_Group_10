import pytest
from .helper import *
from main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_register_new_user():
    response = register("testuser", "testpass")
    assert response.status_code == 200
    assert response.json() == {"message": "User registered successfully!"}


def test_register_existing_user():
    register("testuser2", "testpass")
    response = register("testuser2", "testpass")
    assert response.status_code == 409
    assert response.json() == {"detail": "Username already registered"}


def test_login_valid_user():
    register("testuser3", "testpass")
    response = login("testuser3", "testpass")
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_invalid_user():
    response = login("invaliduser", "invalidpass")
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid username or password"}

def test_valid_username_wrong_pass():
    register("testuser", "testpass")
    response = login("testuser", "wrongpass")
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid username or password"}

