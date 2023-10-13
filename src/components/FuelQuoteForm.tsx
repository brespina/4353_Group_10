// src/components/FuelQuoteForm.tsx
import React, { useState, ChangeEvent, FormEvent, MouseEventHandler } from 'react';
import api from '../components/api';

interface FuelQuoteFormProps {
  deliveryAddr: string;
}


const FuelQuoteForm: React.FC<FuelQuoteFormProps> = ({ deliveryAddr }) => {
    const [formData, setFormData] = useState({
        gallons: 0,
        deliveryDate: '',
        ppg: 3.47,
        grandTotal: 0.00,});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // You can send the form data to your backend or perform validation here
    console.log(formData);
  };

  // handle price
  const handleCalculatePrice = () => {
    const pricePerGallon = formData.ppg;
    const numGallons = formData.gallons;
    const finalPrice = (pricePerGallon * numGallons);

    setFormData({
        ...formData,
        grandTotal: finalPrice,
    });
  };

    // Define CSS styles for greyed out input fields
    const greyedOutStyle: React.CSSProperties = {
        backgroundColor: '#E0E0E0', // Grey background color
        color: '#000', // Grey text color
        cursor: 'not-allowed', // Change cursor to "not-allowed"
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
        <label htmlFor="deliveryAddr">Delivery Address (from clientProfile) (required)</label>
        <input
          type="text"
          id="deliveryAddr"
          name="deliveryAddr"
          value={deliveryAddr}
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
          min={0.00}
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
        >
        </input>  
      </div>
      <button type="button" onClick={handleCalculatePrice}>
          Calculate Price
      </button>
    </form>
  </div>

  )
};

export default FuelQuoteForm;
