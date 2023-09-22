import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
//import ProfileForm from "./components/ProfileForm";
import FuelQuotePage from "./pages/FuelQuotePage";
//import FuelQuoteForm from "./components/FuelQuoteForm";

import { Route, Routes } from "react-router-dom";



import { useLocation } from "react-router-dom";


function App() {
  const location = useLocation();

  return (
    <div>
      {location.pathname !== "/" && location.pathname !== "/register" ? <Navbar /> : null}
      <div className="container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/fuelquote" element={<FuelQuotePage />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

