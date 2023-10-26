
from pydantic import BaseModel, StringConstraints, field_validator
from typing import Annotated

states = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA',
           'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME',
           'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM',
           'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX',
           'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY']

class User(BaseModel):
    username: Annotated[str, StringConstraints(min_length=4, max_length=255)]
    # probably need to hash this or something
    password: Annotated[str, StringConstraints(min_length=8)]

    @field_validator("username")
    def username_alphanumeric(cls, v):
        assert v.isalnum(), "must be alphanumeric"
        return v

class UserDetails(BaseModel):
    full_name: Annotated[str, StringConstraints(min_length=1, max_length=50)]
    address1: Annotated[str, StringConstraints(min_length=1, max_length=100)]
    address2: Annotated[str, StringConstraints(max_length=100)] = ""
    city: Annotated[str, StringConstraints(min_length=1, max_length=100)]
    state: Annotated[str, StringConstraints(min_length=2, max_length=2)]
    zipcode: Annotated[str, StringConstraints(min_length=5, max_length=9)]

    @field_validator("state")
    def validate_state(cls, v):
        if v not in states:
            raise ValueError("Invalid state")
        return v

    @field_validator("full_name")
    def validate_full_name(cls, v):
        if " " not in v:
            raise ValueError("Full name must contain space")
        return v.title()
    

class FuelData(BaseModel):
    gallons_requested: int
    delivery_address: str
    delivery_date: str
    suggested_price: float
    total_amount_due: float
    date_requested: str
    id: int

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