import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReturns } from '../../features/orders/orderSlice';
import { RotateCcw, AlertCircle, Package, ChevronRight, Home } from 'lucide-react';

const Returns = () => {
  const dispatch = useDispatch();
  const { returns, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchReturns());
  }, [dispatch]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Refund Completed</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Approved</span>;
      case 'ITEM_RECEIVED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">Item Received</span>;
      case 'REQUESTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Under Review</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Title */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-200 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Returns & Refunds</h1>
          <div className="flex flex-wrap items-center justify-end gap-4">
            <Link to="/orders" className="text-sm text-blue-600 hover:underline font-medium">
              View All Orders &rarr;
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-gray-700 hover:text-amazon-orange font-semibold"
            >
              <Home className="w-4 h-4" /> Back to Store
            </Link>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amazon-orange"></div>
          </div>
        )}

        {!loading && returns.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <RotateCcw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No returns requested</h2>
            <p className="text-gray-500 mb-6">
              You haven't submitted any return requests. Returns can be initiated from your delivered orders page.
            </p>
            <Link
              to="/orders"
              className="inline-block bg-amazon-yellow hover:bg-yellow-400 text-gray-900 font-bold px-6 py-2 rounded-lg text-sm"
            >
              Go to Your Orders
            </Link>
          </div>
        )}

        {!loading && returns.length > 0 && (
          <div className="space-y-4">
            {returns.map((ret) => (
              <div
                key={ret.id}
                className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-gray-900">Return #{ret.id}</span>
                    {getStatusBadge(ret.status)}
                    <span className="text-xs text-gray-400">
                      Requested on {new Date(ret.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 font-medium">
                    Reason: <span className="font-normal text-gray-600">{ret.reason}</span>
                  </div>
                  {ret.details && (
                    <div className="text-xs text-gray-500 mt-1">
                      Details: {ret.details}
                    </div>
                  )}

                  {ret.order && (
                    <div className="text-xs text-gray-500 mt-2">
                      Order #{ret.order.orderNumber} • Total: ${parseFloat(ret.order.totalAmount).toFixed(2)}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <Link
                    to={`/orders/${ret.orderId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                    View Order Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Returns;
