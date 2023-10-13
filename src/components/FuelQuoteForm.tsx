// src/components/FuelQuoteForm.tsx
import React, {
  useState,
  ChangeEvent,
  FormEvent,
  MouseEventHandler,
  useEffect,
} from "react";
import api from "../components/api";

const FuelQuoteForm = () => {
  const [formData, setFormData] = useState({
    gallons: 0,
    deliveryDate: "",
    ppg: 3.47,
    grandTotal: 0.0,
    deliveryAddr: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const token = localStorage.getItem("token");

  useEffect(() => {
    api
      .get("/api/user/", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        setFormData({
          ...formData,
          deliveryAddr:
            response.data.address1 +
            " " +
            response.data.address2 +
            ", " +
            response.data.city +
            ", " +
            response.data.state +
            " " +
            response.data.zipcode,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const [displayBox, setDisplayBox] = useState(false);
  const [displayMessage, setDisplayMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.deliveryDate || formData.gallons === 0) {
      setDisplayBox(true);
      setDisplayMessage("All fields must be filled out.");
      setTimeout(() => {
        setDisplayBox(false);
      }, 2000);
      return;
    }
    try {
      const response = await api.post(
        "/api/fuel_quote/",
        {
          gallons_requested: formData.gallons,
          delivery_address: formData.deliveryAddr, // Server will handle
          delivery_date: formData.deliveryDate,
          suggested_price: formData.ppg,
          total_amount_due: formData.grandTotal,
          date_requested: "server will handle",
          id: 0, // Server will handle
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        formData.gallons = 0;
        formData.deliveryDate = "";
        setDisplayBox(true);
        setDisplayMessage("Quote submitted sucessfully!");
        setTimeout(() => {
          setDisplayBox(false);
        }, 1500);
      }
    } catch (error) {
      setDisplayBox(true);
      setDisplayMessage("Something went wrong. Try again.");
      setTimeout(() => {
        setDisplayBox(false);
      }, 2000);
    }
    console.log(formData);
  };

  // handle price
  const handleCalculatePrice = () => {
    const pricePerGallon = formData.ppg;
    const numGallons = formData.gallons;
    const finalPrice = pricePerGallon * numGallons;

    setFormData({
      ...formData,
      grandTotal: Number(finalPrice.toFixed(2)),
    });
  };

  useEffect(() => {
    handleCalculatePrice();
  }, [formData.gallons]);

  // Define CSS styles for greyed out input fields
  const greyedOutStyle: React.CSSProperties = {
    backgroundColor: "#E0E0E0", // Grey background color
    color: "#000", // Grey text color
    cursor: "not-allowed", // Change cursor to "not-allowed"
  };

  return (
    <div>
      {/* <h2>Fuel Quote Form</h2> */}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="gallons">Gallons Requested (required)</label>
          <input
            type="number"
            id="gallons"
            name="gallons"
            value={formData.gallons}
            onChange={handleChange}
            required
            min={1}
            max={100}
          />
        </div>
        <div>
          <label htmlFor="deliveryAddr">
            Delivery Address (from clientProfile) (required)
          </label>
          <input
            type="text"
            id="deliveryAddr"
            name="deliveryAddr"
            value={formData.deliveryAddr}
            onChange={handleChange}
            readOnly
            maxLength={100}
            style={greyedOutStyle}
          />
        </div>
        <div>
          <label htmlFor="deliveryDate">Delivery Date (required)</label>
          <input
            type="date"
            id="deliveryDate"
            name="deliveryDate"
            value={formData.deliveryDate}
            onChange={handleChange}
            required
            maxLength={100}
            max={"9999-12-31"}
          />
        </div>
        <div>
          <label htmlFor="ppg">Suggested Price (required)</label>
          <input
            type="number"
            id="ppg"
            name="ppg"
            value={formData.ppg}
            onChange={handleChange}
            readOnly
            min={0.0}
            style={greyedOutStyle}
            //maxLength={100}
          />
        </div>
        <div>
          <label htmlFor="grandTotal">Grand Total</label>
          <input
            type="number"
            id="grandTotal"
            name="grandTotal"
            value={formData.grandTotal}
            onChange={handleChange}
            readOnly
            style={greyedOutStyle}
          ></input>
        </div>
        <button type="button" onClick={handleSubmit}>
          Submit Quote
        </button>
      </form>
      {displayBox && (
        <div
          className={`notification-box ${
            displayMessage === "Quote submitted sucessfully!"
              ? "success-box"
              : "error-box"
          }`}
          style={{ marginTop: "20px" }}
          onClick={() => setDisplayBox(false)}
        >
          {displayMessage}
        </div>
      )}
    </div>
  );
};

export default FuelQuoteForm;
