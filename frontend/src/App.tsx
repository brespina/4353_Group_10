import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import FuelHistoryPage from "./pages/FuelHistoryPage";
import FuelQuotePage from "./pages/FuelQuotePage";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

function ProtectedRoute({ children, validPaths }: any) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  // Go to login if no token
  if (!token) {
    if (location.pathname === "/" || location.pathname === "/register") {
      return children;
    }
    return <Navigate to="/" />;
  }
  // If logged in but the path isn't valid, redirect to /home
  else if (validPaths && !validPaths.includes(location.pathname)) {
    return <Navigate to="/home" />;
  }
  return children;
}

function App() {
  const location = useLocation();
  const loggedInValidPaths = ["/fuelquote", "/profile", "/history", "/home"];

  return (
    <div>
      {location.pathname !== "/" && location.pathname !== "/register" && (
        <Navbar />
      )}
      <div className="container">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute validPaths={loggedInValidPaths}>
                <Login />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register"
            element={
              <ProtectedRoute validPaths={loggedInValidPaths}>
                <Register />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute validPaths={loggedInValidPaths}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fuelquote"
            element={
              <ProtectedRoute validPaths={loggedInValidPaths}>
                <FuelQuotePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute validPaths={loggedInValidPaths}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute validPaths={loggedInValidPaths}>
                <FuelHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={<ProtectedRoute validPaths={loggedInValidPaths} />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
