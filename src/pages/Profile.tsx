import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { AxiosError, isAxiosError } from "axios";
import api from "../components/api";

interface ProfileData {
  full_name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipcode: string;
}

const Profile = () => {
  const [formData, setFormData] = useState<ProfileData>({
    full_name: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipcode: "",
  });
  const [isEditable, setIsEditable] = useState(false);
  const [displayBox, setDisplayBox] = useState(false);
  const [displayMessage, setDisplayMessage] = useState("");

  const greyedOutStyle: React.CSSProperties = {
    backgroundColor: "#E0E0E0", // Grey background color
    color: "#000", // Grey text color
    cursor: "not-allowed", // Change cursor to "not-allowed"
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/api/user/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setFormData(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEdit = () => {
    setIsEditable(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await api.put("/api/user/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setDisplayMessage("Profile saved successfully!");
        setDisplayBox(true);
        setIsEditable(false);
        setTimeout(() => {
          setDisplayBox(false);
        }, 1500);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        const err = error as AxiosError;
        if (err.response?.status === 422) {
          //const errorMessage = error.response?.data.detail[0].msg.split(", ")[0];
          const errorMessage = error.response?.data.detail[0].msg;
          setDisplayMessage(errorMessage);
          setDisplayBox(true);
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
      <h2>Edit your profile</h2>
      <form onSubmit={handleSave}>
        <div>
          <label htmlFor="full_name">Full Name</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            disabled={!isEditable}
            minLength={1}
            maxLength={50}
            style={isEditable ? undefined : greyedOutStyle}
          />
        </div>
        <div>
          <label htmlFor="address1">Address 1</label>
          <input
            type="text"
            id="address1"
            name="address1"
            value={formData.address1}
            onChange={handleChange}
            disabled={!isEditable}
            minLength={1}
            maxLength={100}
            style={isEditable ? undefined : greyedOutStyle}
          />
        </div>
        <div>
          <label htmlFor="address2">Address 2</label>
          <input
            type="text"
            id="address2"
            name="address2"
            value={formData.address2}
            onChange={handleChange}
            disabled={!isEditable}
            maxLength={100}
            style={isEditable ? undefined : greyedOutStyle}
          />
        </div>
        <div>
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            disabled={!isEditable}
            minLength={1}
            maxLength={100}
            style={isEditable ? undefined : greyedOutStyle}
          />
        </div>
        <div>
          <label htmlFor="state">State</label>
          <select
            id="state"
            name="state"
            style={isEditable ? undefined : greyedOutStyle}
            value={formData.state}
            onChange={handleChange}
            required
            disabled={!isEditable}
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
          <label htmlFor="zipcode">Zipcode</label>
          <input
            type="text"
            id="zipcode"
            name="zipcode"
            value={formData.zipcode}
            onChange={handleChange}
            disabled={!isEditable}
            minLength={5}
            maxLength={9}
            style={isEditable ? undefined : greyedOutStyle}
          />
        </div>
        {!isEditable && (
          <button type="button" onClick={handleEdit}>
            Edit profile
          </button>
        )}
        {isEditable && <button type="submit">Save profile</button>}
      </form>
      {displayBox && (
        <div
          className={`notification-box ${
            displayMessage === "Profile saved successfully!"
              ? "success-box"
              : "error-box"
          }`}
          onClick={() => setDisplayBox(false)}
          style={{ marginTop: "20px" }}
        >
          {displayMessage}
        </div>
      )}
    </div>
  );
};

export default Profile;
