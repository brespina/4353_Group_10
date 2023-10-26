import pytest
from main import app
from fastapi.testclient import TestClient


client = TestClient(app)


user_details = {
    "full_name": "John Doe",
    "address1": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "zipcode": "12345",
}

fuel_details = {
    "gallons_requested": 200,
    "delivery_address": "Not Required",
    "delivery_date": "10/20/2023",
    "suggested_price": 2.75,
    "total_amount_due": 550.0,
    "date_requested": "10/12/2023",
    "id": 1,
}

def register(username = "testuser", password = "testpass,1"):
    return client.post(
        "/api/register", json={"username": username, "password": password}
    )


def login(username = "testuser", password = "testpass,1"):
    return client.post("/api/token", data={"username": username, "password": password})


def add_details(token, details = user_details):
    return client.post(
        "/api/user/", headers={"Authorization": f"Bearer {token}"}, json=details
    )


def get_details(token):
    return client.get("/api/user/", headers={"Authorization": f"Bearer {token}"})


def update_details(token, details = user_details):
    return client.put(
        "/api/user/", headers={"Authorization": f"Bearer {token}"}, json=details
    )


def add_fuelquote(token, details = fuel_details):
    return client.post(
        "/api/fuel_quote/", headers={"Authorization": f"Bearer {token}"}, json=details
    )

def get_fuelquote(token):
    return client.get("/api/fuel_quote/", headers={"Authorization": f"Bearer {token}"})