import React, { useState } from "react";
import { OrderCardProps, OrderStatus } from "../types";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51TMMGYRql0zHX54bnEysBZZqIEOa2LNrtRxzbvgzsYAgylVeU0pOIQyEgPlAIYsRpnrn4lk5fHhKkJshh6pVL4CT00S2THplcp");

export default function OrderCard({
  order,
  isAdmin = false,
  isKitchen = false,
  onStatusUpdate,
}: OrderCardProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handlePayment = async () => {
    try {
      setIsRedirecting(true);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderItems: order.orderItems,
          orderId: order.id,
          isNewOrder: order.id === 0
        }),
      });

      const data = await response.json();
      if (data.url) {
        // Redirection to the generated URL directly or using Stripe JS
        const stripe = await stripePromise;
        if (stripe) {
           window.location.href = data.url;
        } else {
           window.location.href = data.url;
        }
      } else {
        alert('Payment session error.');
      }
    } catch (error) {
      console.error('Error during payment processing', error);
      alert('Error during payment processing');
    } finally {
      setIsRedirecting(false);
    }
  };
  const getStatusClass = (status: OrderStatus): string => {
    const statusClasses: Record<OrderStatus, string> = {
      PENDING:
        "bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium",
      PAID:
        "bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium",
      ACCEPTED:
        "bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium",
      PREPARING:
        "bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium",
      READY:
        "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium",
      DELIVERED:
        "bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium",
      REJECTED:
        "bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium",
    };
    return (
      statusClasses[status] ||
      "bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium"
    );
  };

  const getNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    const statusFlow: Record<OrderStatus, OrderStatus[]> = {
      PENDING: [],
      PAID: ["ACCEPTED", "REJECTED"],
      ACCEPTED: ["PREPARING"],
      PREPARING: ["READY"],
      READY: ["DELIVERED"],
      REJECTED: [],
      DELIVERED: [],
    };
    return statusFlow[currentStatus] || [];
  };

  const getStatusIcon = (status: OrderStatus): string => {
    const statusIcons: Record<OrderStatus, string> = {
      PENDING: "⏳",
      PAID: "💰",
      ACCEPTED: "✅",
      PREPARING: "👨‍🍳",
      READY: "📦",
      DELIVERED: "🚚",
      REJECTED: "❌",
    };
    return statusIcons[status] || "📋";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusUpdate = (status: OrderStatus): void => {
    if (onStatusUpdate) {
      onStatusUpdate(order.id, status);
    }
  };

  const getButtonClass = (status: OrderStatus): string => {
    const buttonClasses: Record<OrderStatus, string> = {
      PAID:
        "bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors",
      ACCEPTED:
        "bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors",
      PREPARING:
        "bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors",
      READY:
        "bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors",
      DELIVERED:
        "bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors",
      REJECTED:
        "bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors",
      PENDING:
        "bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors",
    };
    return (
      buttonClasses[status] ||
      "bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
    );
  };

  const getEstimatedTime = (status: OrderStatus): string => {
    const estimatedTimes: Record<OrderStatus, string> = {
      PENDING: "Awaiting payment",
      PAID: "Payment received, awaiting kitchen confirmation",
      ACCEPTED: "Order accepted, preparing soon",
      PREPARING: "15-25 minutes",
      READY: "Ready for pickup/delivery",
      DELIVERED: "Completed",
      REJECTED: "Order cancelled",
    };
    return estimatedTimes[status] || "";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Order #{order.id}
            </h3>
            <span className={getStatusClass(order.status)}>
              {getStatusIcon(order.status)} {order.status}
            </span>
            {order.status === "PAID" && (
              <span className="animate-pulse bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-white rounded-full"></span>
                New Order
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-1">
            Ordered on {formatDate(order.orderDate)}
          </p>
          <p className="text-sm text-blue-600 font-medium">
            {getEstimatedTime(order.status)}
          </p>
          {isAdmin && order.user && (
            <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 italic shadow-sm">
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Customer Details
              </h4>
              <p className="text-base text-blue-900 font-bold font-poppins">
                {`${(order.user as any).firstName || ''} ${(order.user as any).lastName || ''}`.trim() || order.user.username}
              </p>
              {((order.user as any).firstName || (order.user as any).lastName) && (
                <p className="text-xs text-blue-600 font-medium mt-0.5">
                   @{order.user.username}
                </p>
              )}
              {order.user.email && (
                <p className="text-sm text-blue-700">
                  <strong>Email:</strong> {order.user.email}
                </p>
              )}
              {order.user.phone && (
                <p className="text-sm text-blue-700">
                  <strong>Phone:</strong> {order.user.phone}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Order Items:</h4>
        <div className="space-y-3">
          {order.orderItems?.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <span className="font-medium text-gray-900">
                  {item.menuItem?.name || `Item #${item.menuItemId}`}
                </span>
                {item.menuItem?.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {item.menuItem.description}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  ${item.price.toFixed(2)} × {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Information */}
      {order.deliveryAddress && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <h4 className="text-sm font-medium text-green-800 mb-2">
            Delivery Address:
          </h4>
          <p className="text-sm text-green-700">{order.deliveryAddress}</p>
        </div>
      )}

      {/* Special Note */}
      {order.specialNote && (
        <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100 italic">
          <h4 className="text-sm font-medium text-amber-800 mb-1 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Special Instructions:
          </h4>
          <p className="text-sm text-amber-900 leading-relaxed font-medium">"{order.specialNote}"</p>
        </div>
      )}

      {/* Order Summary */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">
            Total Amount:
          </span>
          <span className="text-2xl font-bold text-green-600">
            ${order.totalAmount.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
          <span>Items ({order.orderItems?.length || 0}):</span>
          <span>
            $
            {order.orderItems
              ?.reduce((sum, item) => sum + item.price * item.quantity, 0)
              .toFixed(2)}
          </span>
        </div>
      </div>

      {/* Kitchen/Admin Controls */}
      {(isAdmin || isKitchen) &&
        onStatusUpdate &&
        getNextStatuses(order.status).length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Update Order Status:
            </h4>
            <div className="flex flex-wrap gap-2">
              {getNextStatuses(order.status).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  className={getButtonClass(status)}
                  title={`Mark order as ${status.toLowerCase()}`}
                >
                  {getStatusIcon(status)} Mark as {status.toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        )}

      {/* Status Complete Message */}
      {(order.status === "DELIVERED" || order.status === "REJECTED") &&
        !isAdmin && (
          <div
            className={`p-3 rounded-lg ${
              order.status === "DELIVERED"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p
              className={`text-sm font-medium ${
                order.status === "DELIVERED" ? "text-green-800" : "text-red-800"
              }`}
            >
              {order.status === "DELIVERED"
                ? "🎉 Order delivered successfully! Thank you for your order."
                : "😔 This order was cancelled. Please contact support if you have questions."}
            </p>
          </div>
        )}
        <div>
            {order.status === "PENDING" && !isAdmin && !isKitchen && (
              <div className="flex flex-wrap gap-4 m-5">
                <button
                  onClick={handlePayment}
                  disabled={isRedirecting}
                  className="bg-blue-600 text-white font-bold rounded-lg px-6 py-3 hover:bg-blue-700 transition-colors inline-flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {isRedirecting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                      </svg>
                      PAY NOW
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to cancel this order?")) {
                      handleStatusUpdate("CANCELED");
                    }
                  }}
                  className="bg-white text-red-600 border-2 border-red-600 font-bold rounded-lg px-6 py-3 hover:bg-red-50 transition-colors inline-flex items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  CANCEL ORDER
                </button>
              </div>
            )}
          </div>


    </div>
    
  );
}
