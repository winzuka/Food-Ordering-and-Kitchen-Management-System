import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import OrderCard from "../../components/OrderCard";
import AdminOrdersTable from "../../components/admin/AdminOrdersTable";
import OrderStatusSummary from "../../components/admin/OrderStatusSummary";
import { orderService, menuService } from "../../services/api";
import adminUserService from "../../services/adminUserService";
import { isAuthenticated, isAdmin } from "../../utils/auth";
import { Order, OrderStatus, MenuItem } from "../../types";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    if (!isAdmin()) {
      router.push("/");
      return;
    }

    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError("");

      const [ordersResponse, menuResponse, usersResponse] = await Promise.all([
        orderService.getAllOrders(),
        menuService.getMenuItems(),
        adminUserService.getAllUsers({ limit: 1000 }),
      ]);

      const currentMenuItems = menuResponse.data;
      const allUsers = usersResponse.data;

      const enrichedOrders = ordersResponse.data.map((order: Order) => {
        // Find the user for this order
        const orderUser = allUsers.find((u: any) => (u.id || u.user_id) === order.userId);

        return {
          ...order,
          user: orderUser || order.user, // Attach full user object
          orderItems: order.orderItems.map((item: any) => ({
            ...item,
            menuItem: currentMenuItems.find((m) => m.id === item.menuItemId) || item.menuItem
          }))
        };
      });

      setOrders(enrichedOrders);
      setMenuItems(currentMenuItems);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    orderId: number,
    newStatus: OrderStatus
  ): Promise<void> => {
    try {
      setOrdersLoading(true);
      const response = await orderService.updateOrderStatus(orderId, newStatus);

      // Update the order in the local state with the full response
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? response.data : order
        )
      );

      console.log(`Order ${orderId} status updated to ${newStatus}`);
    } catch (error: any) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    } finally {
      setOrdersLoading(false);
    }
  };

  const getStatusCount = (status: OrderStatus): number => {
    return orders.filter((order) => order.status === status).length;
  };

  const filteredOrders = orders.filter((order) => {
    // 1. Filter by Status
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    // 2. Filter by Search Term
    if (!searchTerm) return matchesStatus;

    const lowerSearch = searchTerm.toLowerCase();
    const orderIdMatch = order.id.toString().includes(lowerSearch);
    const dateMatch = new Date(order.orderDate)
      .toLocaleDateString()
      .toLowerCase()
      .includes(lowerSearch);

    // Customer Name search (username, firstName, lastName)
    const usernameMatch = order.user?.username
      ?.toLowerCase()
      .includes(lowerSearch);
    const firstNameMatch = (order.user as any)?.firstName
      ?.toLowerCase()
      .includes(lowerSearch);
    const lastNameMatch = (order.user as any)?.lastName
      ?.toLowerCase()
      .includes(lowerSearch);

    const matchesSearch =
      orderIdMatch ||
      dateMatch ||
      usernameMatch ||
      firstNameMatch ||
      lastNameMatch;

    return matchesStatus && matchesSearch;
  });

  const sortedOrders = filteredOrders.sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
  );

  const statusOptions: OrderStatus[] = [
    "PENDING",
    "ACCEPTED",
    "PREPARING",
    "READY",
    "DELIVERED",
    "REJECTED",
  ];

  // Calculate statistics
  const todayOrders = orders.filter((order) => {
    const orderDate = new Date(order.orderDate);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });

  const totalRevenue = orders
    .filter((order) => order.status === "DELIVERED")
    .reduce((total, order) => total + order.totalAmount, 0);

  const todayRevenue = todayOrders
    .filter((order) => order.status === "DELIVERED" || order.status === "PAID")
    .reduce((total, order) => total + order.totalAmount, 0);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 via-gray-50 to-white min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/50 animate-in fade-in-0 slide-in-from-top-4 duration-700 hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-baseline space-x-3">
              <h1 className="text-5xl font-extrabold text-red-600 font-poppins tracking-tighter">
                BurgerCrust
              </h1>
              <div className="relative w-16 h-16">
                <img
                  src="/images/logo-BC.png"
                  alt="BurgerCrust Logo"
                  className="object-contain"
                />
              </div>
            </div>
            <div className="border-l-2 border-gray-200 h-10 mx-4"></div>
            <div>
              <p className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent font-poppins">
                Admin Panel
              </p>
              <p className="text-gray-500 text-sm font-poppins">
                Managing restaurant operations
              </p>
            </div>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300/50 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-poppins shadow-xl hover:shadow-2xl"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Refresh Data</span>
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200/60 rounded-3xl p-8 shadow-xl animate-in fade-in-0 slide-in-from-top-4 duration-500 delay-100 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <svg
                className="w-6 h-6 text-red-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <p className="text-red-700 font-poppins text-lg font-medium">
                {error}
              </p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="mt-4 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 focus:outline-none focus:ring-4 focus:ring-red-300/50 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 font-poppins shadow-lg"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-in fade-in-0 slide-in-from-bottom-8 duration-700 delay-200">
          <div className="group bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/50 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 font-poppins uppercase tracking-wider">
                  Total Orders
                </h3>
                <p className="text-4xl font-bold text-gray-900 mt-3 font-poppins group-hover:scale-110 transition-transform duration-300">
                  {orders.length}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/50 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 font-poppins uppercase tracking-wider">
                  Today's Orders
                </h3>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mt-3 font-poppins group-hover:scale-110 transition-transform duration-300">
                  {todayOrders.length}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-cyan-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/50 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 font-poppins uppercase tracking-wider">
                  Today's Revenue
                </h3>
                <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent mt-3 font-poppins group-hover:scale-110 transition-transform duration-300">
                  ${todayRevenue.toFixed(2)}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-200 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/50 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 font-poppins uppercase tracking-wider">
                  Total Revenue
                </h3>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent mt-3 font-poppins group-hover:scale-110 transition-transform duration-300">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Summary */}
        <div className="bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/50 animate-in fade-in-0 slide-in-from-left-8 duration-700 delay-300 hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center space-x-3 mb-6">
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent font-poppins">
              Order Status Overview
            </h2>
          </div>
          <OrderStatusSummary orders={orders} />
        </div>


        {/* View Mode Toggle and Filter */}
        <div className="bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/50 animate-in fade-in-0 slide-in-from-bottom-8 duration-700 delay-500 hover:shadow-3xl transition-all duration-500 space-y-6">
          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search orders by #ID, customer name, or date..."
              className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 font-poppins text-lg outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span className="text-lg font-semibold text-gray-700 font-poppins">
                  View:
                </span>
              </div>
              <div className="flex rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`flex items-center space-x-2 px-6 py-3 text-base font-semibold transition-all duration-300 font-poppins ${
                    viewMode === "cards"
                      ? "bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v2a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2"
                    />
                  </svg>
                  <span>Cards</span>
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`flex items-center space-x-2 px-6 py-3 text-base font-semibold transition-all duration-300 font-poppins ${
                    viewMode === "table"
                      ? "bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0a2 2 0 012 2v6a2 2 0 01-2 2m-6 0a2 2 0 002 2h2a2 2 0 002-2"
                    />
                  </svg>
                  <span>Table</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setStatusFilter("all")}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-110 active:scale-95 font-poppins shadow-lg ${
                  statusFilter === "all"
                    ? "bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-2xl"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>All Orders ({orders.length})</span>
              </button>
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-110 active:scale-95 font-poppins shadow-lg ${
                    statusFilter === status
                      ? "bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-2xl"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
                  }`}
                >
                  {status} ({getStatusCount(status)})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Display */}
        {sortedOrders.length === 0 ? (
          <div className="text-center py-16 bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 animate-in fade-in-0 zoom-in-95 duration-700 delay-600 hover:shadow-3xl transition-all duration-500">
            <div className="flex flex-col items-center space-y-4">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent font-poppins">
                No orders found
              </h2>
              <p className="text-gray-600 font-poppins text-lg">
                {statusFilter === "all"
                  ? "No orders have been placed yet."
                  : `No orders with status "${statusFilter}" found.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/50 animate-in fade-in-0 slide-in-from-left-8 duration-700 delay-600 hover:shadow-3xl transition-all duration-500">
            {viewMode === "table" ? (
              <AdminOrdersTable
                orders={sortedOrders}
                onStatusUpdate={handleStatusUpdate}
                loading={ordersLoading}
              />
            ) : (
              <div className="space-y-6">
                {sortedOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isAdmin={true}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in-0 slide-in-from-bottom-8 duration-700 delay-700">
          <div className="group bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/50 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="flex items-center space-x-3 mb-6">
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <h3 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent font-poppins">
                Quick Actions
              </h3>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => router.push("/admin/menu")}
                className="w-full flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300/50 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 font-poppins shadow-xl hover:shadow-2xl"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span>Manage Menu Items</span>
              </button>
              <button
                onClick={() => {
                  const pendingCount = getStatusCount("PENDING");
                  alert(`You have ${pendingCount} pending orders to review.`);
                }}
                className="w-full flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300/50 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 font-poppins shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Review Pending Orders ({getStatusCount("PENDING")})</span>
              </button>
            </div>
          </div>

          <div className="group bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/50 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="flex items-center space-x-3 mb-6">
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent font-poppins">
                Menu Summary
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <span className="font-poppins text-gray-700 font-semibold">
                    Total Menu Items:
                  </span>
                </div>
                <span className="font-bold font-poppins text-gray-900 text-xl">
                  {menuItems.length}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl border border-green-200 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-poppins text-green-700 font-semibold">
                    Available Items:
                  </span>
                </div>
                <span className="font-bold text-green-700 font-poppins text-xl">
                  {menuItems.filter((item) => item.available).length}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-50 to-pink-100 rounded-2xl border border-red-200 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <svg
                    className="w-5 h-5 text-red-600"
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
                  <span className="font-poppins text-red-700 font-semibold">
                    Out of Stock:
                  </span>
                </div>
                <span className="font-bold text-red-700 font-poppins text-xl">
                  {menuItems.filter((item) => !item.available).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
