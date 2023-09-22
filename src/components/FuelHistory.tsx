import { useState } from "react";

interface History {
    id: number;
    gallons: number;
    date_requested: string;
    delivery_date: string;
    delivery_address: string;
    suggested_price: string;
}

const FuelHistory = () => {
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    // we'll fetch these info from DB later
    const fuelHistoryData: History[] = [
        {
            id: 1,
            gallons: 50,
            date_requested: "09/20/2023",
            delivery_date: "01/01/2024",
            delivery_address: "123 Main St, Houston TX 77001",
            suggested_price: "3.14",
        },
        {
            id: 2,
            gallons: 100,
            date_requested: "09/21/2023",
            delivery_date: "01/12/2024",
            delivery_address: "123 Main St, New York City NY 10001",
            suggested_price: "3.14",
        },
        {
            id: 3,
            gallons: 150,
            date_requested: "09/26/2023",
            delivery_date: "11/23/2023",
            delivery_address: "123 Main St, Houston TX 77001",
            suggested_price: "3.14",
        },
    ];
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
            {fuelHistoryData.map((history) => (
                <div key={history.id} className="client-history-item">
                    <button
                        className="date"
                        onClick={() => toggleExpand(history.id)}
                        aria-expanded={expandedIds.includes(history.id)}
                        aria-controls={`details-${history.id}`}
                    >
                        {history.date_requested}
                    </button>
                    {expandedIds.includes(history.id) && (
                        <div className="details">
                            <div>
                                <label htmlFor="gallons">Gallons requested:</label>
                                <input
                                    style={greyedOutStyle}
                                    type="text"
                                    value={history.gallons}
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
                        </div>
                    )}
                </div>
            ))}
        </>
    );
};

export default FuelHistory;
