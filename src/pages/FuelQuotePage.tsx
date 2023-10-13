import React from "react";
import FuelQuoteForm from "../components/FuelQuoteForm";
import ProfileForm from "../components/ProfileForm";
import Profile from "./Profile";

// const Profile: React.FC = (ProfileForm.FormData.deliveryAddr) => {


// }
const FuelQuotePage= () => {

        return (
            <div>
              <h2>Fuel Quote</h2>
              <FuelQuoteForm />
            </div>
          );
    

};

export default FuelQuotePage;