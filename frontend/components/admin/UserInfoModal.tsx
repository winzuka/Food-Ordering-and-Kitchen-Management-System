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
}

interface UserInfoModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

// Utility functions (create these if they don't exist)
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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

// Simple admin user service (create this if it doesn't exist)
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

const UserInfoModal: React.FC<UserInfoModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"info" | "orders">("info");
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === "orders" && user?.user_id) {
      fetchUserOrders();
    }
  }, [isOpen, activeTab, user?.user_id]);

  const fetchUserOrders = async () => {
    if (!user?.user_id) {
      setError("User ID is missing");
      return;
    }

    try {
      setLoadingOrders(true);
      setError(null);
      const response = await adminUserService.getUserOrders(user.user_id);
      setUserOrders(response.data || []);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      setError("Failed to load user orders");
      setUserOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

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
        <div className="relative bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
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
                  {user.first_name} {user.last_name}
                </h2>
                <p className="text-sm text-gray-600">{user.email}</p>
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

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("info")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "info"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                User Information
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "orders"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Order History
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {activeTab === "info" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Personal Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <p className="text-sm text-gray-900">
                      {user.first_name} {user.last_name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-sm text-gray-900">{user.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <p className="text-sm text-gray-900">
                      {user.phone_number || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <p className="text-sm text-gray-900">
                      {user.address || "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Account Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User ID
                    </label>
                    <p className="text-sm text-gray-900">{user.user_id}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700 border-purple-200"
                          : user.role === "STAFF"
                          ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                          : "bg-blue-100 text-blue-700 border-blue-200"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                        (user.status || "ACTIVE") === "ACTIVE"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      }`}
                    >
                      {user.status || "ACTIVE"}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Since
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(user.created_at)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Updated
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(user.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Order History
                </h3>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                {loadingOrders ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">
                      Loading orders...
                    </span>
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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
                      This user hasn't placed any orders yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <div
                        key={order.order_id || order.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              Order #
                              {order.order_number || order.order_id || order.id}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(
                                order.order_date || order.created_at || ""
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {formatCurrency(order.total_amount)}
                            </p>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                                (order.order_status || order.status) ===
                                "COMPLETED"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : (order.order_status || order.status) ===
                                    "CANCELLED"
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : "bg-yellow-100 text-yellow-700 border-yellow-200"
                              }`}
                            >
                              {order.order_status || order.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Delivery: {order.delivery_address}</p>
                          {(order.customer_notes ||
                            order.special_instructions) && (
                            <p>
                              Notes:{" "}
                              {order.customer_notes ||
                                order.special_instructions}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoModal;
