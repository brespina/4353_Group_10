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

    // Fetch these info from DB
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

    return (
        <>
            {fuelHistoryData.map((history) => (
                <div
                    key={history.id}
                    className="client-history-item"
                    onClick={() => toggleExpand(history.id)}
                >
                    <div className="date">{history.date_requested}</div>

                    {expandedIds.includes(history.id) && (
                        <div className="details">
                            <div>Gallons Requested: {history.gallons}</div>
                            <div>Delivery Address: {history.delivery_address}</div>
                            <div>Delivery Date: {history.delivery_date}</div>
                            <div>Suggested Price/Gallon: ${history.suggested_price}</div>
                        </div>
                    )}
                </div>
            ))}
        </>
    );
};

export default FuelHistory;