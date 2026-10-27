import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import OrderCard from "../components/OrderCard";
import { orderService, menuService } from "../services/api";
import { isAuthenticated, getUser } from "../utils/auth";
import { Order } from "../types";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stashedOrder, setStashedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isProcessingNewOrder, setIsProcessingNewOrder] = useState(false);
  const router = useRouter();

  const fetchOrders = async () => {
    const user = getUser();
    if (!isAuthenticated() || !user || !user.id) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const { success, order_id } = router.query;

      // 1. Handle return from Stripe for a NEW stashed order
      const stashedData = localStorage.getItem("stashed_order");
      if (success === "true" && stashedData && !isProcessingNewOrder) {
        setIsProcessingNewOrder(true);
        const orderData = JSON.parse(stashedData);
        orderData.status = "PAID"; // Mark as paid before saving
        
        await orderService.createOrder(orderData);
        
        localStorage.removeItem("stashed_order");
        alert("Payment successful! Your order has been placed.");
        router.replace("/orders", undefined, { shallow: true });
      }

      // 2. Handle existing orders arriving from Stripe (if any)
      if (success === "true" && order_id && order_id !== "0") {
        try {
          await orderService.updateOrderStatus(Number(order_id), "PAID");
          router.replace("/orders", undefined, { shallow: true });
        } catch (err) {
          console.error("Error updating existing order:", err);
        }
      }

      // 3. Load regular orders from DB
      const [ordersResponse, menuResponse] = await Promise.all([
        orderService.getUserOrders(user.id),
        menuService.getMenuItems()
      ]);

      const menuItemsMap = new Map(menuResponse.data.map(item => [item.id, item]));
      const userOrders = ordersResponse.data.map((order: Order) => ({
        ...order,
        orderItems: order.orderItems.map(item => ({
          ...item,
          menuItem: menuItemsMap.get(item.menuItemId)
        }))
      }));

      // 4. Check for current stashed order in browser (not yet paid/saved)
      if (stashedData) {
        const parsedStashed = JSON.parse(stashedData);
        // We set a fake ID for display purposes
        parsedStashed.id = 0; 
        setStashedOrder(parsedStashed);
      } else {
        setStashedOrder(null);
      }

      setOrders(userOrders.sort((a, b) => b.id - a.id));
    } catch (error: any) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      fetchOrders();
    }
  }, [router.isReady, router.query.success]);

  const handleStatusUpdate = async (orderId: number, status: string) => {
    // If it's the stashed order (ID 0), "Cancel" means delete from localStorage
    if (orderId === 0 && status === "CANCELED") {
      localStorage.removeItem("stashed_order");
      setStashedOrder(null);
      alert("Order discarded.");
      return;
    }

    try {
      await orderService.updateOrderStatus(orderId, status);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update status.");
    }
  };

  if (loading && orders.length === 0 && !stashedOrder) {
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
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>

        <div className="grid grid-cols-1 gap-6">
          {/* Display stashed order first */}
          {stashedOrder && (
            <div className="relative">
               <div className="absolute -top-3 left-6 z-10 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  DRAFT ORDER (UNSAVED)
               </div>
               <OrderCard 
                  order={stashedOrder} 
                  onStatusUpdate={handleStatusUpdate} 
               />
            </div>
          )}

          {orders.length === 0 && !stashedOrder ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-gray-500">You haven't placed any orders yet.</p>
              <button onClick={() => router.push("/")} className="mt-4 text-green-600 font-semibold hover:underline">
                Go to Menu
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <OrderCard key={order.id} order={order} onStatusUpdate={handleStatusUpdate} />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
