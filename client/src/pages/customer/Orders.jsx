import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../features/orders/orderSlice';
import { Package, Clock, AlertCircle, ChevronRight } from 'lucide-react';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Delivered</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Shipped</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Processing</span>;
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">Payment Pending</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Cancelled</span>;
      case 'RETURNED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">Returned</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb / Title */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-200 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
          <Link
            to="/returns"
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            View Returns & Refunds &rarr;
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amazon-orange"></div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center mb-6">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No orders placed yet</h2>
            <p className="text-gray-500 mb-6">You haven't placed any orders in the past.</p>
            <Link
              to="/"
              className="inline-block bg-amazon-yellow hover:bg-yellow-400 text-gray-900 font-bold px-6 py-2 rounded-lg text-sm"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:border-gray-300 transition"
              >
                {/* Order Top Bar */}
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600">
                  <div className="flex flex-wrap items-center gap-8">
                    <div>
                      <span className="block text-gray-500 uppercase font-semibold text-[10px]">ORDER PLACED</span>
                      <span className="font-medium text-gray-800">
                        {new Date(order.placedAt || order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-500 uppercase font-semibold text-[10px]">TOTAL</span>
                      <span className="font-bold text-gray-900">${parseFloat(order.totalAmount).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 uppercase font-semibold text-[10px]">STATUS</span>
                      <div className="mt-0.5">{getStatusBadge(order.status)}</div>
                    </div>
                  </div>
                  <div>
                    <span className="block text-gray-500 uppercase font-semibold text-[10px]">ORDER # {order.orderNumber}</span>
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-blue-600 hover:underline font-semibold flex items-center gap-0.5 mt-0.5"
                    >
                      View order details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="p-6 divide-y divide-gray-100">
                  {order.items?.map((item) => {
                    const product = item.product || {};
                    const primaryImg = product.images?.find((img) => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;

                    return (
                      <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-20 h-20 bg-gray-50 border rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                            {primaryImg ? (
                              <img src={primaryImg} alt={item.productName} className="object-contain max-h-full" />
                            ) : (
                              <Package className="w-6 h-6 text-gray-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {item.productName}
                            </h3>
                            <div className="text-xs text-gray-500 mt-1">
                              Qty: {item.quantity} × ${parseFloat(item.unitPrice).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</div>
                          </div>
                        </div>

                        <div className="flex-shrink-0 flex items-center gap-3">
                          <Link
                            to={`/orders/${order.id}`}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-3 py-1.5 rounded border border-gray-300"
                          >
                            Track package
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
