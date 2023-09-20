import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
//import ProfileForm from "./components/ProfileForm";
import FuelQuotePage from "./pages/FuelQuotePage";
//import FuelQuoteForm from "./components/FuelQuoteForm";


import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <div>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/fuelquote" element={<FuelQuotePage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
