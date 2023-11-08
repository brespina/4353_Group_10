import { useState, useEffect } from "react";
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

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/api/fuel_quote/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFuelHistoryData(response.data);
      } catch (error) {
        console.error(error);
        setFuelHistoryDataExists(false);
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
    cursor: "not-allowed", // Change cursor to "not-allowed"
  };

  return (
    <>
      {!fuelHistoryDataExists ? (
        <div>
          <p>
            <h2 className="fancy-div-history">You do not have any fuel history</h2>
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
                  <label htmlFor="gallons_requested">Gallons requested:</label>
                  <input
                    style={greyedOutStyle}
                    type="text"
                    value={history.gallons_requested}
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="delivery_date">Delivery Date:</label>
                  <input
                    style={greyedOutStyle}
                    type="text"
                    value={history.delivery_date}
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="delivery_address">Delivery Address</label>
                  <input
                    style={greyedOutStyle}
                    type="text"
                    value={history.delivery_address}
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="suggested_price">Suggested Price</label>
                  <input
                    style={greyedOutStyle}
                    type="text"
                    value={history.suggested_price}
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="total_price">Total Price</label>
                  <input
                    style={greyedOutStyle}
                    type="text"
                    value={history.total_amount_due}
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
