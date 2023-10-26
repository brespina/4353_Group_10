from datetime import datetime

import pytz
from fastapi import APIRouter, Depends, HTTPException
from xata import XataClient

from ..models import FuelData, UserDetails
from ..utils import decode_token, format_datetime, get_db, oauth2_scheme

app = APIRouter()

@app.post("/api/fuel_quote/", description="Adds a fuel quote")
async def add_fuel_quote(data: FuelData, token: str = Depends(oauth2_scheme), db: XataClient = Depends(get_db)):
    user = decode_token(token)

    response = db.sql().query (
        'SELECT require_details FROM "UserCredentials" WHERE id = $1', [user]
    )

    # Will prob never execute
    if len(response) != 1:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if response["records"][0]["require_details"] == True:
        raise HTTPException(status_code=400, detail="Add user details first")

    response = db.sql().query(
        'SELECT full_name, address1, address2, city, state, zipcode FROM "ClientInformation" WHERE id = $1',
        [user],
    )

    record = response["records"][0]
    details = UserDetails(
        full_name=record["full_name"],
        address1=record["address1"],
        address2=record["address2"],
        city=record["city"],
        state=record["state"],
        zipcode=record["zipcode"],
    )

    data.delivery_address = (
        details.address1
        + details.address2
        + ", "
        + details.city
        + ", "
        + details.state
        + " "
        + details.zipcode
    )

    cst = pytz.timezone("America/Chicago")
    current_time_cst = datetime.now(cst)
    data.date_requested = current_time_cst.isoformat()

    # later we will use pricing module to determine total_amound_due in backend
    # I am aware that frontend cutting the digits off at 2 decimal but this is rounding but once again will be fixed after pricing module
    total = data.gallons_requested * data.suggested_price
    total = round(total, 2)
    if total != data.total_amount_due:
        print(data.gallons_requested * data.suggested_price)
        raise HTTPException(status_code=422, detail="Invalid total amount due")

    db.sql().query(
        'INSERT INTO "FuelData" (username, gallons_requested, delivery_address, delivery_date, suggested_price, total_amount_due, date_requested) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
            user,
            data.gallons_requested,
            data.delivery_address,
            data.delivery_date,
            data.suggested_price,
            data.total_amount_due,
            data.date_requested,
        ],
    )

    return {"message": "Fuel quote registered successfully!"}


@app.get("/api/fuel_quote/", description="Returns a list of fuel quotes")
async def get_fuel_quote(token: str = Depends(oauth2_scheme), db: XataClient = Depends(get_db)):
    user = decode_token(token)
    details = db.sql().query(
        'SELECT require_details FROM "UserCredentials" WHERE id = $1', [user]
    )
    # Prob never execute
    if len(details) != 1:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if details["records"][0]["require_details"] == True:
        raise HTTPException(status_code=400, detail="Add user details first")

    response = db.sql().query(
        'SELECT gallons_requested, delivery_address, delivery_date, suggested_price, total_amount_due, date_requested FROM "FuelData" WHERE username = $1 ORDER BY date_requested DESC',
        [user],
    )

    if len(response) == 0:
        raise HTTPException(status_code=501, detail="No fuel quotes registered")

    data = []
    num = 0
    for record in response["records"]:
        delivery = format_datetime(record["delivery_date"])
        delivery = delivery.split(" ")[0]
        data.append(
            FuelData(
                gallons_requested=record["gallons_requested"],
                delivery_address=record["delivery_address"],
                delivery_date=delivery,
                suggested_price=record["suggested_price"],
                total_amount_due=record["total_amount_due"],
                date_requested=format_datetime(record["date_requested"]),
                id=num,
            )
        )
        num += 1

    return data