import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def get_access_token(username="testuser", password="testpassword"):
    response = client.post(
        "/api/token", data={"username": username, "password": password}
    )
    return response.json()["access_token"]


# Test registration and token generation
def test_register_user(username="testuser", password="testpassword"):
    response = client.post(
        "/api/register", json={"username": username, "password": password}
    )
    assert response.status_code == 200
    assert response.json() == {"message": "User registered successfully!"}


def test_register_user_short_password(username="testuser", password="t"):
    response = client.post(
        "/api/register", json={"username": username, "password": password}
    )
    assert response.status_code == 422
    assert (
        response.json()["detail"][0]["msg"]
        == "String should have at least 8 characters"
    )


def test_register_existing_user():
    response = client.post(
        "/api/register", json={"username": "testuser", "password": "testpassword"}
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "Username already registered"}


def test_login(username="testuser", password="testpassword"):
    response = client.post(
        "/api/token", data={"username": username, "password": password}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "token_type" in response.json()
    assert "require_details" in response.json()


def test_login_invalid_credentials():
    response = client.post(
        "/api/token", data={"username": "testuser", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid username or password"}


# Test user details endpoints
def test_add_user_details():
    access_token = get_access_token()
    response = client.post(
        "/api/user/",
        json={
            "full_name": "John Doe",
            "address1": "123 Main St",
            "city": "Los Angeles",
            "state": "CA",
            "zipcode": "12345",
        },
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 200
    assert response.json() == {"message": "User details registered successfully!"}


def test_add_user_details_existing_user():
    access_token = get_access_token()
    response = client.post(
        "/api/user/",
        json={
            "full_name": "John Doe",
            "address1": "123 NY St",
            "city": "NYC",
            "state": "NY",
            "zipcode": "10001",
        },
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "User details already registered"}


def test_get_user_details():
    access_token = get_access_token()
    response = client.get(
        "/api/user/", headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200
    assert "full_name" in response.json()
    assert "address1" in response.json()
    assert "city" in response.json()
    assert "state" in response.json()
    assert "zipcode" in response.json()


def test_get_user_details_not_registered():
    token = "faketoken"
    response = client.get("/api/user/", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid token"}


def test_get_user_details_wo_user_details():
    response = client.post(
        "/api/register", json={"username": "testuser2", "password": "testpassword"}
    )
    token = get_access_token("testuser2", "testpassword")
    response = client.get("/api/user/", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 400
    assert response.json() == {"detail": "User details not registered"}


def test_add_new_fuel_quote():
    token = get_access_token()
    response = client.post(
        "/api/fuel_quote/",
        json={
            "gallons_requested": 200,
            "delivery_address": "Not Required",
            "delivery_date": "10/20/2023",
            "suggested_price": 2.75,
            "total_amount_due": 550.0,
            "date_requested": "10/12/2023",
            "id": 1,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Fuel quote registered successfully!"}


def test_double_add_fuel_quote():
    test_add_new_fuel_quote()


def test_get_fuel_quotes():
    token = get_access_token()
    response = client.get(
        "/api/fuel_quote/", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0


def test_get_fuel_quote_wo_user_details():
    response = client.post(
        "/api/register", json={"username": "testuser2", "password": "testpassword"}
    )
    token = get_access_token("testuser2", "testpassword")
    response = client.get(
        "/api/fuel_quote/", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "Add user details first"}


def test_add_fuel_quote_wo_user_details():
    response = client.post(
        "/api/register", json={"username": "testuser3", "password": "testpassword"}
    )
    token = get_access_token("testuser3", "testpassword")
    response = client.post(
        "/api/fuel_quote/",
        json={
            "gallons_requested": 222,
            "delivery_address": "Not Required",
            "delivery_date": "10/20/2023",
            "suggested_price": 2.75,
            "total_amount_due": 550.0,
            "date_requested": "10/12/2023",
            "id": 1,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "Add user details first"}


def test_get_quote_wo_fuel_history():
    test_register_user("testuser4", "testpassword")
    test_login("testuser4", "testpassword")
    token = get_access_token("testuser4", "testpassword")
    response = client.post(
        "/api/user/",
        json={
            "full_name": "Test Four",
            "address1": "123 Main St",
            "city": "Los Angeles",
            "state": "CA",
            "zipcode": "12345",
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    response = client.get(
        "/api/fuel_quote/", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 501
    assert response.json() == {"detail": "No fuel quotes registered"}


# Test change pofile endpoint
def test_change_profile():
    token = get_access_token()
    response = client.put(
        "/api/user/",
        json={
            "full_name": "John Doe",
            "address1": "123 Main St",
            "city": "Los Angeles",
            "state": "CA",
            "zipcode": "12345",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json() == {"message": "User details updated successfully!"}


def test_change_profile_wo_user_details():
    token = get_access_token("testuser2", "testpassword")
    response = client.put(
        "/api/user/",
        json={
            "full_name": "John Doe",
            "address1": "123 Main St",
            "city": "Los Angeles",
            "state": "CA",
            "zipcode": "12345",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "User details not registered"}


def test_add_user_details_invalid_full_name_and_state():
    access_token = get_access_token()
    response = client.put(
        "/api/user/",
        json={
            "full_name": "JohnDoe",
            "address1": "123 Main St",
            "city": "Los Angeles",
            "state": "CA",
            "zipcode": "12345",
        },
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 422
    assert (
        response.json()["detail"][0]["msg"]
        == "Value error, Full name must contain space"
    )

    response = client.put(
        "/api/user/",
        json={
            "full_name": "John Doe",
            "address1": "123 Main St",
            "city": "Los Angeles",
            "state": "NA",
            "zipcode": "12345",
        },
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 422
    assert response.json()["detail"][0]["msg"] == "Value error, Invalid state"


def test_invalid_fuel_quote_post():
    access_token = get_access_token()
    response = client.post(
        "/api/fuel_quote",
        json={
            "gallons_requested": 10000,
            "delivery_address": "Not Required",
            "delivery_date": "10/20/2023",
            "suggested_price": 2.75,
            "total_amount_due": 0,
            "date_requested": "10/12/2023",
            "id": 1,
        },
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 422
    assert response.json() == {"detail": "Value error, Invalid state"}
