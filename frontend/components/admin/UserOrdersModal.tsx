import React, { useState, useEffect } from "react";

// Updated type definitions based on your project structure
interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  address?: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
  status?: "ACTIVE" | "BLOCKED";
  created_at: string;
  updated_at: string;
}

interface Order {
  order_id: number;
  id?: number; // Alternative id field
  order_number?: string;
  total_amount: number;
  order_status:
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "COMPLETED"
    | "CANCELLED";
  status?: string; // Alternative status field
  order_date: string;
  created_at?: string; // Alternative date field
  delivery_address: string;
  customer_notes?: string;
  special_instructions?: string;
  order_type: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  phone_number?: string;
  customer_name?: string;
  estimated_delivery_time?: string;
}

interface UserOrdersModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

// Utility functions
const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return dateString;
  }
};

const formatCurrency = (amount: number): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  } catch (error) {
    return `$${amount.toFixed(2)}`;
  }
};

// Simple admin user service
const adminUserService = {
  getUserOrders: async (userId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8082/api/orders/user/${userId}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw error;
    }
  },
};

// Simple toast notification
const toast = {
  error: (message: string) => {
    console.error(message);
    // You can replace this with your actual toast implementation
    alert(`Error: ${message}`);
  },
};

const UserOrdersModal: React.FC<UserOrdersModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "amount" | "status">("date");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user?.user_id) {
      fetchUserOrders();
    }
  }, [isOpen, user?.user_id]);

  const fetchUserOrders = async () => {
    if (!user?.user_id) {
      setError("User ID is missing");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await adminUserService.getUserOrders(user.user_id);
      setOrders(response.data || []);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      setError("Failed to load user orders");
      toast.error("Failed to load user orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Sort and filter orders
  const filteredAndSortedOrders = orders
    .filter((order) => {
      const status = order.order_status || order.status || "";
      return filterStatus === "all" || status === filterStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          const dateA = new Date(a.order_date || a.created_at || "").getTime();
          const dateB = new Date(b.order_date || b.created_at || "").getTime();
          return dateB - dateA;
        case "amount":
          return b.total_amount - a.total_amount;
        case "status":
          const statusA = a.order_status || a.status || "";
          const statusB = b.order_status || b.status || "";
          return statusA.localeCompare(statusB);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "PREPARING":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "READY":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const totalOrderValue = orders.reduce(
    (sum, order) => sum + (order.total_amount || 0),
    0
  );
  const averageOrderValue =
    orders.length > 0 ? totalOrderValue / orders.length : 0;

  const completedOrders = orders.filter((o) => {
    const status = o.order_status || o.status || "";
    return status.toUpperCase() === "COMPLETED";
  }).length;

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-lg font-medium text-blue-700">
                  {user.first_name?.charAt(0) || ""}
                  {user.last_name?.charAt(0) || ""}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.first_name} {user.last_name}'s Orders
                </h2>
                <p className="text-sm text-gray-600">
                  {orders.length} total orders
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Stats Summary */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {orders.length}
                </p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalOrderValue)}
                </p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(averageOrderValue)}
                </p>
                <p className="text-sm text-gray-600">Average Order</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {completedOrders}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Filters and Sort */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="READY">Ready</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort by
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as "date" | "amount" | "status")
                    }
                    className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="date">Date (Newest)</option>
                    <option value="amount">Amount (Highest)</option>
                    <option value="status">Status</option>
                  </select>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredAndSortedOrders.length} of {orders.length}{" "}
                orders
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Loading orders...</span>
              </div>
            ) : filteredAndSortedOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No orders found
                </h3>
                <p className="text-gray-600">
                  {filterStatus === "all"
                    ? "This user hasn't placed any orders yet"
                    : `No orders with status "${filterStatus}"`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedOrders.map((order) => {
                  const orderId = order.order_id || order.id;
                  const orderStatus =
                    order.order_status || order.status || "UNKNOWN";
                  const orderDate = order.order_date || order.created_at || "";

                  return (
                    <div
                      key={orderId}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() =>
                        setSelectedOrder(
                          selectedOrder?.order_id === orderId ? null : order
                        )
                      }
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-gray-900">
                              Order #{order.order_number || orderId}
                            </h3>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                                orderStatus
                              )}`}
                            >
                              {orderStatus}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>📅 {formatDate(orderDate)}</p>
                            <p>📍 {order.delivery_address}</p>
                            {order.order_type && <p>🚚 {order.order_type}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(order.total_amount)}
                          </p>
                          {order.phone_number && (
                            <p className="text-sm text-gray-500">
                              {order.phone_number}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Expanded Order Details */}
                      {selectedOrder?.order_id === orderId && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                Order Details
                              </h4>
                              <div className="space-y-1 text-gray-600">
                                <p>
                                  <span className="font-medium">
                                    Order Type:
                                  </span>{" "}
                                  {order.order_type || "DELIVERY"}
                                </p>
                                {order.phone_number && (
                                  <p>
                                    <span className="font-medium">Phone:</span>{" "}
                                    {order.phone_number}
                                  </p>
                                )}
                                <p>
                                  <span className="font-medium">
                                    Customer Name:
                                  </span>{" "}
                                  {order.customer_name ||
                                    `${user.first_name} ${user.last_name}`}
                                </p>
                                {order.estimated_delivery_time && (
                                  <p>
                                    <span className="font-medium">
                                      Est. Delivery:
                                    </span>{" "}
                                    {formatDate(order.estimated_delivery_time)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                Special Instructions
                              </h4>
                              <p className="text-gray-600 text-sm">
                                {order.special_instructions ||
                                  order.customer_notes ||
                                  "No special instructions"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Click on any order to view more details
              </p>
              <button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOrdersModal;
