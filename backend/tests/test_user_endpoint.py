from .helper import *


def test_add_user_details():
    register()
    token = login().json()["access_token"]
    details = {
        "full_name": "John Doe",
        "address1": "123 Main St",
        "city": "Los Angeles",
        "state": "CA",
        "zipcode": "12345",
    }
    response = add_details(token, details)
    assert response.status_code == 200
    assert response.json() == {"message": "User details registered successfully!"}


def test_add_user_details_existing_user():
    register()
    token = login().json()["access_token"]
    details = {
        "full_name": "John Doe",
        "address1": "123 Main St",
        "city": "Los Angeles",
        "state": "CA",
        "zipcode": "12345",
    }
    add_details(token, details)
    response = add_details(token, details)
    assert response.status_code == 400
    assert response.json() == {"detail": "User details already registered"}


def test_get_user_details():
    register()
    token = login().json()["access_token"]
    details = {
        "full_name": "John Doe",
        "address1": "123 Main St",
        "address2": "",
        "city": "Los Angeles",
        "state": "CA",
        "zipcode": "12345",
    }
    add_details(token, details)
    response = get_details(token)
    assert response.status_code == 200
    assert response.json() == details


def test_get_user_details_not_registered():
    token = "faketoken"
    response = get_details(token)
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid token"}


def test_get_user_details_wo_user_details():
    register()
    token = login().json()["access_token"]
    response = get_details(token)
    assert response.status_code == 400
    assert response.json() == {"detail": "User details not registered"}


def test_change_profile():
    register()
    token = login().json()["access_token"]
    details = {
        "full_name": "John Doe",
        "address1": "123 Main St",
        "city": "Los Angeles",
        "state": "CA",
        "zipcode": "12345",
    }
    add_details(token, details)
    new_details = {
        "full_name": "Clown Man",
        "address1": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "zipcode": "12345",
    }
    response = update_details(token, new_details)
    assert response.status_code == 200
    assert response.json() == {"message": "User details updated successfully!"}


def test_change_profile_wo_user_details():
    register()
    token = login().json()["access_token"]
    details = {
        "full_name": "John Doe",
        "address1": "123 Main St",
        "city": "Los Angeles",
        "state": "CA",
        "zipcode": "12345",
    }
    update_details(token, details)
    response = update_details(token, details)
    assert response.status_code == 400
    assert response.json() == {"detail": "User details not registered"}


def test_add_user_details_invalid_full_name():
    register()
    token = login().json()["access_token"]
    details = {
        "full_name": "John",
        "address1": "123 Main St",
        "city": "Los Angeles",
        "state": "TX",
        "zipcode": "12345",
    }
    response = add_details(token, details)
    assert response.status_code == 422
    assert (
        response.json()["detail"][0]["msg"] == "Value error, Please enter a valid name"
    )


def test_add_user_details_invalid_whitespace_full_name():
    register()
    token = login().json()["access_token"]
    details = {
        "full_name": "  ",
        "address1": "123 Main St",
        "city": "Los Angeles",
        "state": "TX",
        "zipcode": "12345",
    }
    response = add_details(token, details)
    assert response.status_code == 422
    assert (
        response.json()["detail"][0]["msg"] == "String should have at least 1 character"
    )


def test_add_user_details_invalid_state():
    register()
    token = login().json()["access_token"]
    details = {
        "full_name": "John Doe",
        "address1": "123 Main St",
        "city": "Los Angeles",
        "state": "HR",
        "zipcode": "12345",
    }
    response = add_details(token, details)
    assert response.status_code == 422
    assert response.json()["detail"][0]["msg"] == "Value error, Invalid state"
