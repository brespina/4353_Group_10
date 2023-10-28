import re
from typing import Annotated

from pydantic import BaseModel, StringConstraints, field_validator

states = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA',
           'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME',
           'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM',
           'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX',
           'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY']

class User(BaseModel):
    username: Annotated[str, StringConstraints(min_length=4, max_length=20, strip_whitespace=True)]
    password: Annotated[str, StringConstraints(min_length=8, max_length=50, strip_whitespace=True)]

    @field_validator("username")
    def username_alphanumeric(cls, v):
        if not re.match(r'^[A-z0-9]+(?:[_][A-z0-9]+)*$', v):
            raise ValueError("Username must contain only letters, numbers, and underscores")
        return v

    @field_validator("password")
    def validate_password(cls, v):
        if not re.match(r'^(?=.*\d)(?=.*[@$!%*?&#,])[A-z\d@$!%*?&#,]{8,}$', v):
            raise ValueError("Password must contain at least 1 special character and 1 number")
        return v


class UserDetails(BaseModel):
    full_name: Annotated[str, StringConstraints(min_length=1, max_length=50, strip_whitespace=True)]
    address1: Annotated[str, StringConstraints(min_length=1, max_length=100, strip_whitespace=True)]
    address2: Annotated[str, StringConstraints(max_length=100, strip_whitespace=True)] = ""
    city: Annotated[str, StringConstraints(min_length=1, max_length=100, strip_whitespace=True)]
    state: Annotated[str, StringConstraints(min_length=2, max_length=2, strip_whitespace=True)]
    zipcode: Annotated[str, StringConstraints(min_length=5, max_length=9, strip_whitespace=True)]

    @field_validator("state")
    def validate_state(cls, v):
        if v not in states:
            raise ValueError("Invalid state")
        return v

    @field_validator("full_name")
    def validate_full_name(cls, v):
        # A full name consists of a first name and last name separated by a space
        if not re.match(r'^[A-z]+\s[A-z]+$', v):
            raise ValueError("Please enter a valid name")
        return v



class FuelData(BaseModel):
    gallons_requested: int
    delivery_address: str
    delivery_date: str
    suggested_price: float
    total_amount_due: float
    date_requested: str
    id: int

    @field_validator("gallons_requested")
    def validate_gallons_requested(cls, v):
        if not v > 0:
            raise ValueError("Gallons requested must be greater than 0")
        return v

    @field_validator("delivery_address")
    def validate_delivery_address(cls, v):
        if not len(v) > 0:
            raise ValueError("Delivery address cannot be empty")
        return v


UserCreds_Schema = {
    "columns": [
        # Xata autocreates ID and guarantee uniqueness
        {"name": "password", "type": "string"},
        {"name": "require_details", "type": "bool", "defaultValue": "true"}
    ]
}

ClientInfo_Schema = {
    "columns": [
        # Xata autocreates ID and guarantee uniqueness
        {"name": "full_name", "type": "string"},
        {"name": "address1", "type": "string"},
        {"name": "address2", "type": "string"},
        {"name": "city", "type": "string"},
        {"name": "state", "type": "string"},
        {"name": "zipcode", "type": "string"}
    ]
}

FuelQuote_Schema = {
    "columns": [
        {"name": "username", "type": "string"},
        {"name": "gallons_requested", "type": "int"},
        {"name": "delivery_address", "type": "text"},
        {"name": "delivery_date", "type": "datetime"},
        {"name": "suggested_price", "type": "float"},
        {"name": "total_amount_due", "type": "float"},
        {"name": "date_requested", "type": "datetime"}
    ]
}