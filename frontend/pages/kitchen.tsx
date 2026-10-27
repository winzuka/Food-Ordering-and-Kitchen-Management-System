import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import OrderCard from "../components/OrderCard";
import { orderService, menuService } from "../services/api";
import { isAuthenticated, getUser } from "../utils/auth";
import { Order, OrderStatus, MenuItem } from "../types";

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"orders" | "inventory">("orders");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const fetchOrders = async () => {
    const user = getUser();

    if (!isAuthenticated() || !user || user.role !== "KITCHEN") {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      // Fetch both orders and menu items
      const [ordersResponse, menuResponse] = await Promise.all([
        orderService.getAllOrders(),
        menuService.getMenuItems()
      ]);

      const currentMenuItems = menuResponse.data;
      setMenuItems(currentMenuItems);
      
      const menuItemsMap = new Map(currentMenuItems.map(item => [item.id, item]));
      
      // Kitchen only sees PAID, ACCEPTED, PREPARING, READY orders
      const kitchenStatuses: OrderStatus[] = ["PAID", "ACCEPTED", "PREPARING", "READY"];
      
      const kitchenOrders = ordersResponse.data
        .filter((order: Order) => kitchenStatuses.includes(order.status))
        .map((order: Order) => ({
          ...order,
          orderItems: order.orderItems.map(item => ({
            ...item,
            menuItem: menuItemsMap.get(item.menuItemId)
          }))
        }));
      
      // Sort orders
      const statusPriority: Record<string, number> = {
        PAID: 0,
        ACCEPTED: 1,
        PREPARING: 2,
        READY: 3
      };

      kitchenOrders.sort((a, b) => {
        if (statusPriority[a.status] !== statusPriority[b.status]) {
          return statusPriority[a.status] - statusPriority[b.status];
        }
        return b.id - a.id;
      });

      setOrders(kitchenOrders);
    } catch (err: any) {
      console.error("Error fetching kitchen data:", err);
      setError("Failed to load kitchen data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      if (activeTab === "orders") fetchOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleStatusUpdate = async (orderId: number, status: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      await fetchOrders();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update order status.");
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await menuService.updateMenuItem(item.id, { 
        ...item,
        available: !item.available 
      });
      await fetchOrders();
    } catch (err) {
      console.error("Error toggling availability:", err);
      alert("Failed to update item availability.");
    }
  };

  if (loading && orders.length === 0 && menuItems.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-poppins">Kitchen Dashboard</h1>
              <p className="text-gray-500 mt-1 font-poppins">Manage incoming orders and live stock availability</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
               <span className="text-sm font-medium text-gray-600 mr-4">Live Updating</span>
            </div>
          </div>

          <div className="flex border-b border-gray-100 mt-6">
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-4 px-6 text-sm font-semibold transition-colors relative ${
                activeTab === "orders" ? "text-green-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Active Orders ({orders.length})
              {activeTab === "orders" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`pb-4 px-6 text-sm font-semibold transition-colors relative ${
                activeTab === "inventory" ? "text-green-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Inventory Control
              {activeTab === "inventory" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600"></div>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {activeTab === "orders" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Orders</h2>
                <p className="text-gray-500">New orders will appear here automatically.</p>
              </div>
            ) : (
              orders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  isKitchen={true} 
                  onStatusUpdate={handleStatusUpdate} 
                />
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {menuItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.imageUrl || "/images/menu/default-food.jpg"} 
                            alt={item.name} 
                            className="h-10 w-10 rounded-lg object-cover" 
                            onError={(e) => {
                              e.currentTarget.src = "/images/menu/default-food.jpg";
                            }}
                          />
                          <span className="font-semibold text-gray-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{item.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          item.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          <span className={`h-2 w-2 rounded-full ${item.available ? "bg-green-600" : "bg-red-600"}`}></span>
                          {item.available ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleAvailability(item)}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            item.available 
                              ? "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md" 
                              : "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md"
                          }`}
                        >
                          {item.available ? "Mark Out of Stock" : "Mark In Stock"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
