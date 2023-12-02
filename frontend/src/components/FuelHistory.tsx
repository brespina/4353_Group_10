import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import api from "../components/api";

interface History {
  id: number;
  gallons_requested: number;
  date_requested: string;
  delivery_date: string;
  delivery_address: string;
  suggested_price: number;
  total_amount_due: number;
}

const FuelHistory = () => {
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [fuelHistoryData, setFuelHistoryData] = useState<History[]>([]);
  const [fuelHistoryDataExists, setFuelHistoryDataExists] = useState(true);
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/api/fuel_quote", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFuelHistoryData(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setFuelHistoryDataExists(false);
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [token]);

  const toggleExpand = (id: number) => {
    if (expandedIds.includes(id)) {
      setExpandedIds(expandedIds.filter((expandedId) => expandedId !== id));
    } else {
      setExpandedIds([...expandedIds, id]);
    }
  };

  const greyedOutStyle: React.CSSProperties = {
    backgroundColor: "#f2f2f2", // Grey background color
    color: "#000", // Grey text color
    cursor: "default", // Change cursor to "default", this stops the mouse from changing when hovering over text
  };

  const standardCursor: React.CSSProperties = {
    cursor: "context-menu",
  };

  return (
    <>
      {isLoading ? (
        <div>{LoadingSpinner()}</div>
      ) : !fuelHistoryDataExists ? (
        <div>
          <p>
            <p className="fancy-div-history">
              You do not have any fuel history.
            </p>
          </p>
        </div>
      ) : (
        fuelHistoryData.map((history) => (
          <div key={history.id} className="client-history-item">
            <button
              className="date"
              onClick={() => toggleExpand(history.id)}
              aria-expanded={expandedIds.includes(history.id)}
              aria-controls={`details-${history.id}`}
            >
              {history.date_requested} Delivers On: {history.delivery_date}
            </button>
            {expandedIds.includes(history.id) && (
              <div className="details">
                <div>
                  <label htmlFor="gallons_requested" style={standardCursor}>
                    Gallons requested:
                  </label>
                  <input
                    style={greyedOutStyle}
                    type="text"
                    value={history.gallons_requested}
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="delivery_date" style={standardCursor}>
                    Delivery Date:
                  </label>
                  <input
                    style={greyedOutStyle}
                    type="text"
                    value={history.delivery_date}
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="delivery_address" style={standardCursor}>
                    Delivery Address
                  </label>
                  <input
                    style={greyedOutStyle}
                    type="text"
                    value={history.delivery_address}
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="suggested_price" style={standardCursor}>
                    Suggested Price
                  </label>
                  <input
                    style={greyedOutStyle}
                    type="text"
                    value={history.suggested_price}
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="total_price" style={standardCursor}>
                    Total Price
                  </label>
                  <input
                    style={greyedOutStyle}
                    type="text"
                    value={history.total_amount_due.toFixed(2)}
                    readOnly
                  />
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </>
  );
};

export default FuelHistory;
