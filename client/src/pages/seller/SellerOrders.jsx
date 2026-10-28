import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ShoppingBag, ChevronDown, Truck, PackageCheck, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const STATUS_COLORS = {
  PROCESSING: 'bg-yellow-100 text-yellow-700',
  PACKED: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  RETURN_REQUESTED: 'bg-orange-100 text-orange-700',
  REFUNDED: 'bg-gray-100 text-gray-600',
};

const NEXT_STATUS = {
  PROCESSING: 'PACKED',
  PACKED: 'SHIPPED',
  SHIPPED: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
};

const SellerOrders = () => {
  const token = useSelector((state) => state.auth.token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [trackingInputs, setTrackingInputs] = useState({});

  const fetchOrders = () => {
    setLoading(true);
    axios
      .get(`${API}/seller/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setOrders(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(fetchOrders, [token]);

  const advance = async (orderId, currentStatus) => {
    const nextStatus = NEXT_STATUS[currentStatus];
    if (!nextStatus) return;
    setUpdating(orderId);
    try {
      await axios.put(
        `${API}/seller/orders/${orderId}/status`,
        { status: nextStatus, trackingNumber: trackingInputs[orderId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amazon-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <ShoppingBag className="w-7 h-7 text-amazon-orange" />
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No orders yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const masterOrder = order.masterOrder;
            const addr = masterOrder?.shippingAddressSnapshot || {};
            return (
              <div key={order.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">#{masterOrder?.orderNumber}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {addr.fullName} · {addr.city}, {addr.country}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-bold text-green-700">${parseFloat(order.sellerEarnings).toFixed(2)}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-100 mb-3">
                  {(order.items || []).map((item) => (
                    <div key={item.id} className="flex justify-between py-2 text-xs text-gray-600">
                      <span className="font-medium">{item.productName} {item.variant ? `(${item.variant.variantName})` : ''}</span>
                      <span>×{item.quantity} · ${parseFloat(item.subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Advance Status */}
                {NEXT_STATUS[order.status] && (
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="text"
                      placeholder="Tracking number (optional)"
                      className="flex-1 border border-gray-300 rounded-lg text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                      value={trackingInputs[order.id] || ''}
                      onChange={(e) => setTrackingInputs((p) => ({ ...p, [order.id]: e.target.value }))}
                    />
                    <button
                      onClick={() => advance(order.id, order.status)}
                      disabled={updating === order.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-amazon-orange text-white text-xs font-bold rounded-lg hover:bg-orange-600 disabled:opacity-60 transition"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Mark as {NEXT_STATUS[order.status].replace(/_/g, ' ')}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
