// src/components/ProfileForm.tsx
import { AxiosError, isAxiosError } from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../components/api";
import { profileSchema } from "../components/validationSchema";

const ProfileForm = () => {
  const navigate = useNavigate();
  const [displayBox, setDisplayBox] = useState(false);
  const [displayMessage, setDisplayMessage] = useState("");
  const formik = useFormik({
    initialValues: {
      full_name: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zipcode: "",
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      const token = localStorage.getItem("token");
      try {
        const response = await api.post("/api/user", values, {
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
    },
  });

  return (
    <div>
      <h2>Complete your profile</h2>
      <form onSubmit={formik.handleSubmit}>
        <div>
          <label htmlFor="full_name">Full Name (required)</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formik.values.full_name}
            onChange={formik.handleChange}
            required
            minLength={1}
            maxLength={50}
            onBlur={formik.handleBlur}
          />
          {formik.touched.full_name && formik.errors.full_name ? (
            <div className="error">{formik.errors.full_name}</div>
          ) : null}
        </div>
        <div>
          <label htmlFor="address1">Address 1 (required)</label>
          <input
            type="text"
            id="address1"
            name="address1"
            value={formik.values.address1}
            onChange={formik.handleChange}
            required
            minLength={1}
            maxLength={100}
            onBlur={formik.handleBlur}
          />
          {formik.touched.address1 && formik.errors.address1 ? (
            <div className="error">{formik.errors.address1}</div>
          ) : null}
        </div>
        <div>
          <label htmlFor="address2">Address 2 (optional)</label>
          <input
            type="text"
            id="address2"
            name="address2"
            value={formik.values.address2}
            onChange={formik.handleChange}
            maxLength={100}
            onBlur={formik.handleBlur}
          />
          {formik.touched.address2 && formik.errors.address2 ? (
            <div className="error">{formik.errors.address2}</div>
          ) : null}
        </div>
        <div>
          <label htmlFor="city">City (required)</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formik.values.city}
            onChange={formik.handleChange}
            required
            minLength={1}
            maxLength={100}
            onBlur={formik.handleBlur}
          />
          {formik.touched.city && formik.errors.city ? (
            <div className="error">{formik.errors.city}</div>
          ) : null}{" "}
        </div>
        <div>
          <label htmlFor="state">State (required)</label>
          <select
            id="state"
            name="state"
            value={formik.values.state}
            onChange={formik.handleChange}
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
            value={formik.values.zipcode}
            onChange={formik.handleChange}
            required
            minLength={5}
            maxLength={9}
            onBlur={formik.handleBlur}
          />
          {formik.touched.zipcode && formik.errors.zipcode ? (
            <div className="error">{formik.errors.zipcode}</div>
          ) : null}{" "}
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
