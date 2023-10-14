// src/components/ProfileForm.tsx
import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError, isAxiosError } from "axios";
import api from "../components/api";

interface FormData {
  full_name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipcode: string;
}

const ProfileForm = () => {
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipcode: "",
  });

  const navigate = useNavigate();
  const [displayBox, setDisplayBox] = useState(false);
  const [displayMessage, setDisplayMessage] = useState("");

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/user/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        navigate("/home");
      }
    } catch (error) {
      // console.log(error);
      if (isAxiosError(error)) {
        const err = error as AxiosError;
        if (err.response?.status === 422) {
          const errorMessage = error.response?.data.detail[0].msg;
          setDisplayBox(true);
          setDisplayMessage(errorMessage);
          setTimeout(() => {
            setDisplayBox(false);
          }, 2000);
        }
      } else {
        setDisplayMessage("Something went wrong. Please try again.");
        setDisplayBox(true);
        setTimeout(() => {
          setDisplayBox(false);
        }, 2000);
      }
    }
  };

  return (
    <div>
      <h2>Complete your profile</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="full_name">Full Name (required)</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            minLength={1}
            maxLength={50}
          />
        </div>
        <div>
          <label htmlFor="address1">Address 1 (required)</label>
          <input
            type="text"
            id="address1"
            name="address1"
            value={formData.address1}
            onChange={handleChange}
            required
            minLength={1}
            maxLength={100}
          />
        </div>
        <div>
          <label htmlFor="address2">Address 2 (optional)</label>
          <input
            type="text"
            id="address2"
            name="address2"
            value={formData.address2}
            onChange={handleChange}
            maxLength={100}
          />
        </div>
        <div>
          <label htmlFor="city">City (required)</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            minLength={1}
            maxLength={100}
          />
        </div>
        <div>
          <label htmlFor="state">State (required)</label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
          >
            <option value="">Select State</option>
            <option value="AL">Alabama</option>
            <option value="AK">Alaska</option>
            <option value="AZ">Arizona</option>
            <option value="AR">Arkansas</option>
            <option value="CA">California</option>
            <option value="CO">Colorado</option>
            <option value="CT">Connecticut</option>
            <option value="DE">Delaware</option>
            <option value="FL">Florida</option>
            <option value="GA">Georgia</option>
            <option value="HI">Hawaii</option>
            <option value="ID">Idaho</option>
            <option value="IL">Illinois</option>
            <option value="IN">Indiana</option>
            <option value="IA">Iowa</option>
            <option value="KS">Kansas</option>
            <option value="KY">Kentucky</option>
            <option value="LA">Louisiana</option>
            <option value="ME">Maine</option>
            <option value="MD">Maryland</option>
            <option value="MA">Massachusetts</option>
            <option value="MI">Michigan</option>
            <option value="MN">Minnesota</option>
            <option value="MS">Mississippi</option>
            <option value="MO">Missouri</option>
            <option value="MT">Montana</option>
            <option value="NE">Nebraska</option>
            <option value="NV">Nevada</option>
            <option value="NH">New Hampshire</option>
            <option value="NJ">New Jersey</option>
            <option value="NM">New Mexico</option>
            <option value="NY">New York</option>
            <option value="NC">North Carolina</option>
            <option value="ND">North Dakota</option>
            <option value="OH">Ohio</option>
            <option value="OK">Oklahoma</option>
            <option value="OR">Oregon</option>
            <option value="PA">Pennsylvania</option>
            <option value="RI">Rhode Island</option>
            <option value="SC">South Carolina</option>
            <option value="SD">South Dakota</option>
            <option value="TN">Tennessee</option>
            <option value="TX">Texas</option>
            <option value="UT">Utah</option>
            <option value="VT">Vermont</option>
            <option value="VA">Virginia</option>
            <option value="WA">Washington</option>
            <option value="WV">West Virginia</option>
            <option value="WI">Wisconsin</option>
            <option value="WY">Wyoming</option>
          </select>
        </div>
        <div>
          <label htmlFor="zipcode">
            Zipcode (required, at least 5 characters)
          </label>
          <input
            type="text"
            id="zipcode"
            name="zipcode"
            value={formData.zipcode}
            onChange={handleChange}
            required
            minLength={5}
            maxLength={9}
          />
        </div>
        <button type="submit">Save</button>
      </form>
      {displayBox && (
        <div
          className="error-box"
          onClick={() => setDisplayBox(false)}
          style={{ marginTop: "10px" }}
        >
          {displayMessage}
        </div>
      )}
    </div>
  );
};

export default ProfileForm;
