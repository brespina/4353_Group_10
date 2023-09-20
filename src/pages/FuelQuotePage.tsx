import React from "react";
import FuelQuoteForm from "../components/FuelQuoteForm";
import ProfileForm from "../components/ProfileForm";
import Profile from "./Profile";

// const Profile: React.FC = (ProfileForm.FormData.deliveryAddr) => {


// }
const FuelQuotePage= () => {

        return (
            <div>
              <h1>Fuel Quote</h1>
              <FuelQuoteForm deliveryAddr={"111 main st"} />
            </div>
          );
    

};

export default FuelQuotePage;