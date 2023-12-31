from datetime import datetime
from time import sleep

import pytz
from fastapi import APIRouter, Depends, HTTPException
from xata import XataClient

from ..models import FuelData, UserDetails
from ..utils import (
    Cache,
    calculate_price,
    decode_token,
    format_datetime,
    get_db,
    oauth2_scheme,
)

app = APIRouter()

cache = Cache()


@app.post("/api/fuel_quote", description="Adds a fuel quote")
async def add_fuel_quote(
    data: FuelData,
    token: str = Depends(oauth2_scheme),
    db: XataClient = Depends(get_db),
):
    user = decode_token(token)

    response = db.sql().query(
        'SELECT require_details FROM "UserCredentials" WHERE id = $1', [user]
    )

    # Will prob never execute
    if len(response.get("records", [])) == 0:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if response["records"][0]["require_details"] is True:
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
        + ("" if not details.address2 else " " + details.address2)
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

    check_history = db.sql().query(
        'SELECT COUNT(*) FROM "FuelData" WHERE username = $1', [user]
    )

    history = True if check_history["records"][0]["count"] > 0 else False

    data.suggested_price = calculate_price(
        details.state, history, data.gallons_requested
    )

    data.total_amount_due = data.suggested_price * data.gallons_requested

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


@app.get("/api/fuel_quote", description="Returns a list of fuel quotes")
async def get_fuel_quote(
    token: str = Depends(oauth2_scheme), db: XataClient = Depends(get_db)
):
    user = decode_token(token)
    details = db.sql().query(
        'SELECT require_details FROM "UserCredentials" WHERE id = $1', [user]
    )
    # Prob never execute
    if len(details.get("records", [])) == 0:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if details["records"][0]["require_details"] is True:
        raise HTTPException(status_code=400, detail="Add user details first")

    response = db.sql().query(
        'SELECT gallons_requested, delivery_address, delivery_date, suggested_price, total_amount_due, date_requested FROM "FuelData" WHERE username = $1 ORDER BY date_requested DESC',
        [user],
    )

    if len(response.get("records", [])) == 0:
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


@app.get("/api/get_price", description="Return the price of fuel")
async def get_price(gallons: int, token: str = Depends(oauth2_scheme)):
    user = decode_token(token)
    data = cache.get(user)
    retries = 0
    while data is None:
        if retries > 5:
            raise HTTPException(status_code=422, detail="Not allowed")
        sleep(0.1)
        data = cache.get(user)
        # Limit the number of retries
        retries += 1

    price = calculate_price(data["state"], data["history"], gallons)

    return {"ppg": price}
