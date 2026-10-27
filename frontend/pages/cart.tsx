import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import CartItem from "../components/CartItem";
import { orderService } from "../services/api";
import { isAuthenticated, getUser } from "../utils/auth";
import { CartItem as CartItemType, OrderStatus } from "../types";
import axios from "axios";

export default function Cart() {
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [specialNote, setSpecialNote] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
      }
    }

    // Load user's address as default
    const user = getUser();
    if (user?.address) {
      setDeliveryAddress(user.address);
    }
  }, [router]);

  const updateCart = (updatedCart: CartItemType[]): void => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleUpdateQuantity = (itemId: number, newQuantity: number): void => {
    const updatedCart = cart.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    updateCart(updatedCart);
  };

  const handleRemoveItem = (itemId: number): void => {
    const updatedCart = cart.filter((item) => item.id !== itemId);
    updateCart(updatedCart);
  };

  const handleClearCart = (): void => {
    updateCart([]);
  };

  const calculateTotal = (): number => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handlePlaceOrder = async (): Promise<void> => {
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    if (!deliveryAddress.trim()) {
      alert("Please enter a delivery address");
      return;
    }

    setLoading(true);
    try {
      const user = getUser();
      if (!user) {
        alert("Please login to place an order");
        router.push("/login");
        return;
      }

      const orderData = {
        userId: user.id,
        orderItems: cart.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
          price: item.price,
          menuItem: item, // Include for display on the Orders page
        })),
        totalAmount: calculateTotal(),
        deliveryAddress: deliveryAddress,
        specialNote: specialNote,
        status: "PENDING" as OrderStatus,
        orderDate: new Date().toISOString(),
      };

      // Stash order in localStorage instead of DB
      localStorage.setItem("stashed_order", JSON.stringify(orderData));

      // Clear cart
      updateCart([]);
      
      // Redirect to Orders page to choose Pay or Cancel
      router.push("/orders?pending=true");
    } catch (error: any) {
      console.error("Error processing order:", error);
      alert("Failed to process order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[75vh] py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">
            Your Cart is Empty
          </h1>
          <p className="text-gray-600 mb-6 font-poppins">
            Add some delicious items to your cart to get started!
          </p>
          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center space-x-2 px-8 py-4 bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded-lg font-semibold font-poppins transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
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
            <span>Browse Menu</span>
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-800 text-sm transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm text-gray-900"
                  >
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-green-600">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="deliveryAddress"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Delivery Address
                </label>
                <textarea
                  id="deliveryAddress"
                  rows={3}
                  className="input-field text-gray-900"
                  placeholder="Enter your delivery address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="specialNote"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Special Note (Optional)
                </label>
                <textarea
                  id="specialNote"
                  rows={2}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 focus:shadow-lg font-poppins resize-none"
                  placeholder="e.g., Low spicy, no onions, etc."
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                />
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className={`w-full py-4 px-8 rounded-lg font-semibold font-poppins transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  loading
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 hover:scale-105 active:scale-95 focus:ring-green-300 shadow-lg hover:shadow-xl"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
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
                    <span>Placing Order...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Place Order</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
