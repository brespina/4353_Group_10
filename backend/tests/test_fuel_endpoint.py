from .helper import *


def test_add_new_fuel_quote():
    register()
    token = login().json()["access_token"]
    user_details = {
        "full_name": "John Doe",
        "address1": "123 Main St",
        "city": "Los Angeles",
        "state": "CA",
        "zipcode": "12345",
    }
    add_details(token, user_details)
    fuel_details = {
        "gallons_requested": 200,
        "delivery_address": "Not Required",
        "delivery_date": "10/20/2023",
        "suggested_price": 2.75,
        "total_amount_due": 550.0,
        "date_requested": "10/12/2023",
        "id": 1,
    }
    response = add_fuelquote(token, fuel_details)
    assert response.status_code == 200
    assert response.json() == {"message": "Fuel quote registered successfully!"}


def test_get_fuel_quotes():
    register()
    token = login().json()["access_token"]
    user_details = {
        "full_name": "John Doe",
        "address1": "123 Main St",
        "city": "Los Angeles",
        "state": "CA",
        "zipcode": "12345",
    }
    add_details(token, user_details)
    fuel_details = {
        "gallons_requested": 200,
        "delivery_address": "Not Required",
        "delivery_date": "10/20/2023",
        "suggested_price": 2.75,
        "total_amount_due": 550.0,
        "date_requested": "10/12/2023",
        "id": 1,
    }
    add_fuelquote(token, fuel_details)
    response = get_fuelquote(token)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0


def test_get_fuel_quote_wo_user_details():
    register()
    token = login().json()["access_token"]
    response = get_fuelquote(token)
    assert response.status_code == 400
    assert response.json() == {"detail": "Add user details first"}


def test_add_fuel_quote_wo_user_details():
    register()
    token = login().json()["access_token"]
    response = add_fuelquote(token)
    assert response.status_code == 400
    assert response.json() == {"detail": "Add user details first"}


def test_get_quote_wo_fuel_history():
    register()
    token = login().json()["access_token"]
    add_details(token)
    response = get_fuelquote(token)
    assert response.status_code == 501
    assert response.json() == {"detail": "No fuel quotes registered"}


def test_invalid_fuel_quote_post():
    register()
    token = login().json()["access_token"]
    add_details(token)
    fuel_details = {
        "gallons_requested": 10000,
        "delivery_address": "Not Required",
        "delivery_date": "10/20/2023",
        "suggested_price": 2.75,
        "total_amount_due": 0,
        "date_requested": "10/12/2023",
        "id": 1,
    }
    response = add_fuelquote(token, fuel_details)
    assert response.status_code == 422
    assert response.json() == {"detail": "Invalid total amount due"}
