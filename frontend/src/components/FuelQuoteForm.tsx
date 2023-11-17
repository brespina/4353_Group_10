// src/components/FuelQuoteForm.tsx
import React, {
  useState,
  ChangeEvent,
  FormEvent,
  useEffect,
} from "react";
import api from "../components/api";

const FuelQuoteForm = () => {
  const [formData, setFormData] = useState({
    gallons: 0,
    deliveryDate: "",
    ppg: "",
    grandTotal: "",
    deliveryAddr: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const token = localStorage.getItem("token");

  useEffect(() => {
    api
      .get("/api/user", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        let deliveryAddr = response.data.address1 + ", ";
        if (response.data.address2) {
          deliveryAddr += response.data.address2 + ", ";
        }
        deliveryAddr += response.data.city + ", " + response.data.state + " " + response.data.zipcode;
        setFormData(prevState => ({
          ...prevState,
          deliveryAddr,
        }));
      })
      .catch((error) => {
        console.log(error);
      });
  }, [token]);

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
    if (formData.gallons < 0) {
      setDisplayBox(true);
      setDisplayMessage("Please enter a valid integer.");
      setTimeout(() => {
        setDisplayBox(false);
      }, 2000);
      return;
    }
    try {
      const response = await api.post(
        "/api/fuel_quote",
        {
          gallons_requested: formData.gallons,
          delivery_address: formData.deliveryAddr, // Server will handle
          delivery_date: formData.deliveryDate,
          suggested_price: formData.ppg, // Server will handle
          total_amount_due: formData.grandTotal,
          date_requested: "server will handle",
          id: 0, // Server will handle
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        setFormData(prevState => ({
          ...prevState,
          gallons: 0,
          deliveryDate: "",
        }));
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
  };

  // handle price
  const handleCalculatePrice = async () => {
    const numGallons = formData.gallons;
    try {
      const get_price = await api.get("/api/get_price", {
        params: { gallons: numGallons },
        headers: { Authorization: `Bearer ${token}` },
      });
      const pricePerGallon = get_price.data.ppg;
      const finalPrice = pricePerGallon * numGallons;

      setFormData(prevState => ({
        ...prevState,
        grandTotal: finalPrice.toFixed(2),
        ppg: pricePerGallon,
      }));
    } catch (error) {
      console.error("Can't get price error: ", error);
    }
  };


  useEffect(() => {
    if (formData.gallons >= 0) {
      handleCalculatePrice();
    }
  }, [formData.gallons, token]); // make sure to include token as dependency

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
