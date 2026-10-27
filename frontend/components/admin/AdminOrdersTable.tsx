// components/admin/AdminOrdersTable.tsx
import { useState } from "react";
import { Order, OrderStatus } from "../../types";

interface AdminOrdersTableProps {
  orders: Order[];
  onStatusUpdate: (orderId: number, status: OrderStatus) => void;
  loading?: boolean;
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-purple-100 text-purple-800",
  READY: "bg-green-100 text-green-800",
  DELIVERED: "bg-gray-100 text-gray-800",
  REJECTED: "bg-red-100 text-red-800",
};

const statusOptions: OrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "DELIVERED",
  "REJECTED",
];

export default function AdminOrdersTable({
  orders,
  onStatusUpdate,
  loading,
}: AdminOrdersTableProps) {
  const [updatingOrders, setUpdatingOrders] = useState<Set<number>>(new Set());

  const handleStatusChange = async (
    orderId: number,
    newStatus: OrderStatus
  ) => {
    setUpdatingOrders((prev) => new Set(prev).add(orderId));
    try {
      await onStatusUpdate(orderId, newStatus);
    } finally {
      setUpdatingOrders((prev) => {
        const updated = new Set(prev);
        updated.delete(orderId);
        return updated;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {`${(order.user as any)?.firstName || ''} ${(order.user as any)?.lastName || ''}`.trim() || order.user?.username || `User ${order.userId}`}
                  </div>
                  {((order.user as any)?.firstName || (order.user as any)?.lastName) && (
                    <div className="text-xs text-gray-500">
                      @{order.user?.username}
                    </div>
                  )}
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {order.deliveryAddress}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {order.orderItems.length} item(s)
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.orderItems
                      .slice(0, 2)
                      .map(
                        (item) =>
                          item.menuItem?.name || `Item ${item.menuItemId}`
                      )
                      .join(", ")}
                    {order.orderItems.length > 2 && "..."}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${order.totalAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      statusColors[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.orderDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(
                        order.id,
                        e.target.value as OrderStatus
                      )
                    }
                    disabled={updatingOrders.has(order.id)}
                    className="block w-full px-3 py-1 text-sm border text-gray-500 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  {updatingOrders.has(order.id) && (
                    <div className="mt-1 text-xs text-blue-600">
                      Updating...
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-500">
            Orders will appear here when customers place them.
          </p>
        </div>
      )}
    </div>
  );
}
