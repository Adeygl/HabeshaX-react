import React, { useState } from "react";
import axios from "axios";

const API = axios.create({
  baseURL: "https://habeshaxnode-9821a8586656.herokuapp.com/api",
});

interface Order {
  order_id: string;
  telegram_id: string;
  game: string;
  sell_price: number;
  status: string;
  payment_status: string;
  topup_status: string;
}

const Order: React.FC = () => {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/orders/${orderId}`, {
        headers: { Authorization: "Bearer " + token },
      });
      setOrder(res.data);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Order not found");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const completeOrder = async () => {
    try {
      await API.post(
        "/orders/approve",
        { order_id: order?.order_id },
        { headers: { Authorization: "Bearer " + token } }
      );

      alert("Order completed");
      fetchOrder();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error completing order");
    }
  };

  const declineOrder = async () => {
    const reason = prompt("Enter decline reason:");
    if (!reason) return;

    try {
      await API.post(
        "/orders/decline",
        { order_id: order?.order_id, reason },
        { headers: { Authorization: "Bearer " + token } }
      );

      alert("Order declined");
      fetchOrder();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error declining order");
    }
  };

  const canProcess =
    order &&
    order.payment_status === "paid" &&
    order.topup_status !== "delivered" &&
    order.status !== "declined" &&
    order.status !== "delivered";

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Order Management</h1>

      {/* SEARCH */}
      <div className="flex gap-2 mb-4">
        <input
          placeholder="Enter Order ID"
          className="border p-2 w-full"
          onChange={(e) => setOrderId(e.target.value)}
        />
        <button
          onClick={fetchOrder}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {/* LOADING */}
      {loading && <p>Loading...</p>}

      {/* ORDER INFO */}
      {order && (
        <div className="border p-4 rounded bg-gray-50">
          <p><b>Order ID:</b> {order.order_id}</p>
          <p><b>Telegram:</b> {order.telegram_id}</p>
          <p><b>Game:</b> {order.game}</p>
          <p><b>Amount:</b> {order.sell_price} ETB</p>
          <p><b>Payment:</b> {order.payment_status}</p>
          <p><b>Topup Status:</b> {order.topup_status}</p>
          <p><b>Status:</b> {order.status}</p>

          {/* ACTION BUTTONS */}
          {canProcess && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={completeOrder}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Complete
              </button>

              <button
                onClick={declineOrder}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Decline
              </button>
            </div>
          )}

          {!canProcess && (
            <p className="text-gray-500 mt-3">
              This order cannot be processed.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Order;