// components/admin/OrderStatusSummary.tsx
import { Order, OrderStatus } from "../../types";

interface OrderStatusSummaryProps {
  orders: Order[];
}

export default function OrderStatusSummary({
  orders,
}: OrderStatusSummaryProps) {
  const getOrderCountByStatus = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status).length;
  };

  const getTotalRevenue = () => {
    return orders
      .filter((order) => order.status === "DELIVERED")
      .reduce((total, order) => total + order.totalAmount, 0);
  };

  const statusCards = [
    {
      title: "Pending Orders",
      count: getOrderCountByStatus("PENDING"),
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Preparing",
      count: getOrderCountByStatus("PREPARING"),
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Ready",
      count: getOrderCountByStatus("READY"),
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Delivered",
      count: getOrderCountByStatus("DELIVERED"),
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {statusCards.map((card) => (
        <div key={card.title} className={`${card.bgColor} p-6 rounded-lg`}>
          <div className="flex items-center">
            <div className={`${card.color} rounded-md p-3`}>
              <div className="w-6 h-6 text-white flex items-center justify-center font-bold">
                {card.count}
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">
                {card.title}
              </h3>
              <p className={`text-2xl font-bold ${card.textColor}`}>
                {card.count}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Revenue Card */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center">
          <div className="bg-gray-500 rounded-md p-3">
            <div className="w-6 h-6 text-white flex items-center justify-center font-bold">
              $
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-900">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-600">
              ${getTotalRevenue().toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
