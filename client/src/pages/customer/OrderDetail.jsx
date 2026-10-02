import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetail, cancelOrder, submitReturn } from '../../features/orders/orderSlice';
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  CreditCard,
  FileText,
  RotateCcw,
} from 'lucide-react';

const OrderDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const showSuccessBanner = searchParams.get('success') === 'true';

  const dispatch = useDispatch();
  const { currentOrder, loading, error } = useSelector((state) => state.orders);

  // Cancellation modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // Return modal
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnDetails, setReturnDetails] = useState('');
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState('');
  const [returnError, setReturnError] = useState('');

  useEffect(() => {
    dispatch(fetchOrderDetail(id));
  }, [dispatch, id]);

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    setCancelLoading(true);
    setCancelError('');

    const action = await dispatch(cancelOrder({ orderId: id, reason: cancelReason }));
    setCancelLoading(false);
    if (cancelOrder.fulfilled.match(action)) {
      setShowCancelModal(false);
      setCancelReason('');
    } else {
      setCancelError(action.payload || 'Failed to cancel order');
    }
  };

  const handleRequestReturn = async (e) => {
    e.preventDefault();
    if (!returnReason.trim()) return;
    setReturnLoading(true);
    setReturnError('');

    const action = await dispatch(
      submitReturn({
        orderId: parseInt(id),
        reason: returnReason,
        details: returnDetails,
      })
    );
    setReturnLoading(false);
    if (submitReturn.fulfilled.match(action)) {
      setReturnSuccess('Return request submitted successfully!');
      setShowReturnModal(false);
    } else {
      setReturnError(action.payload || 'Failed to submit return request');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amazon-orange"></div>
      </div>
    );
  }

  if (error || !currentOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
        <p className="text-gray-600 mb-6">{error || 'Could not load details for this order.'}</p>
        <Link
          to="/orders"
          className="inline-block bg-amazon-yellow hover:bg-yellow-400 text-gray-900 font-bold px-6 py-2 rounded-lg text-sm"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'PENDING', label: 'Order Placed' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'PROCESSING':
        return 1;
      case 'SHIPPED':
        return 2;
      case 'DELIVERED':
        return 3;
      default:
        return -1;
    }
  };

  const currentStep = getStepIndex(currentOrder.status);
  const isCancelled = currentOrder.status === 'CANCELLED';
  const isReturned = currentOrder.status === 'RETURNED';

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Success Banner */}
        {showSuccessBanner && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold">Thank you, your order has been placed!</h3>
              <p className="text-sm text-green-700">
                An email confirmation has been sent and your order is currently being processed.
              </p>
            </div>
          </div>
        )}

        {returnSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-sm font-medium">{returnSuccess}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-200 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Order #{currentOrder.orderNumber}
              </h1>
              {isCancelled && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                  CANCELLED
                </span>
              )}
              {isReturned && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                  RETURNED
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Placed on {new Date(currentOrder.placedAt || currentOrder.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {['PENDING', 'PROCESSING'].includes(currentOrder.status) && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition"
              >
                Cancel Order
              </button>
            )}
            {currentOrder.status === 'DELIVERED' && (
              <button
                onClick={() => setShowReturnModal(true)}
                className="px-4 py-2 border border-purple-300 text-purple-700 hover:bg-purple-50 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Return / Refund Items
              </button>
            )}
            <Link
              to="/orders"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-lg"
            >
              All Orders
            </Link>
          </div>
        </div>

        {/* Status Stepper (if not cancelled) */}
        {!isCancelled && !isReturned && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-6">
              Delivery Progress
            </h2>
            <div className="relative flex items-center justify-between max-w-3xl mx-auto">
              {/* Connecting line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 z-0 transition-all duration-500"
                style={{
                  width: `${(Math.max(0, currentStep) / (steps.length - 1)) * 100}%`,
                }}
              />

              {steps.map((step, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                        isPassed
                          ? 'bg-green-600 text-white shadow'
                          : 'bg-gray-200 text-gray-500 border border-gray-300'
                      }`}
                    >
                      {isPassed ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        isCurrent ? 'text-green-700 font-bold' : isPassed ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-amazon-orange" />
                Items Ordered ({currentOrder.items?.length || 0})
              </h2>

              <div className="divide-y divide-gray-100">
                {currentOrder.items?.map((item) => {
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
                          <Link
                            to={`/products/${product.slug || item.productId}`}
                            className="text-sm font-semibold text-gray-900 hover:text-amazon-orange line-clamp-2"
                          >
                            {item.productName}
                          </Link>
                          <div className="text-xs text-gray-500 mt-1">
                            Quantity: <span className="font-semibold text-gray-800">{item.quantity}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-base font-bold text-gray-900">
                          ${parseFloat(item.subtotal).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${parseFloat(item.unitPrice).toFixed(2)} each
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-1.5 text-amazon-orange" />
                  Delivery Address
                </h3>
                {currentOrder.shippingAddressSnapshot ? (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-semibold text-gray-900">
                      {currentOrder.shippingAddressSnapshot.fullName}
                    </p>
                    <p>
                      {currentOrder.shippingAddressSnapshot.streetAddress}
                      {currentOrder.shippingAddressSnapshot.apartmentSuite
                        ? `, ${currentOrder.shippingAddressSnapshot.apartmentSuite}`
                        : ''}
                    </p>
                    <p>
                      {currentOrder.shippingAddressSnapshot.city},{' '}
                      {currentOrder.shippingAddressSnapshot.state}{' '}
                      {currentOrder.shippingAddressSnapshot.postalCode}
                    </p>
                    <p>{currentOrder.shippingAddressSnapshot.country}</p>
                    {currentOrder.shippingAddressSnapshot.phone && (
                      <p className="text-xs text-gray-500 pt-1">
                        Phone: {currentOrder.shippingAddressSnapshot.phone}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Address snapshot not available</p>
                )}
              </div>

              {/* Payment Details */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                  <CreditCard className="w-4 h-4 mr-1.5 text-amazon-orange" />
                  Payment Information
                </h3>
                <div className="text-sm text-gray-600 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Method:</span>
                    <span className="font-medium text-gray-800">
                      {currentOrder.payment?.paymentMethod || 'Mock Payment'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Status:</span>
                    <span
                      className={`font-bold text-xs uppercase px-2 py-0.5 rounded ${
                        currentOrder.payment?.status === 'SUCCESS'
                          ? 'bg-green-100 text-green-800'
                          : currentOrder.payment?.status === 'REFUNDED'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {currentOrder.payment?.status || 'PENDING'}
                    </span>
                  </div>
                  {currentOrder.payment?.transactionId && (
                    <div className="text-xs text-gray-500 pt-1 break-all">
                      Transaction: {currentOrder.payment.transactionId}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Invoice / Pricing Breakdown */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-4 h-4 mr-1.5 text-amazon-orange" />
                Order Summary
              </h2>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span>${parseFloat(currentOrder.subtotalAmount).toFixed(2)}</span>
                </div>
                {parseFloat(currentOrder.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Coupon Discount:</span>
                    <span>-${parseFloat(currentOrder.discountAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping & Handling:</span>
                  <span>
                    {parseFloat(currentOrder.shippingFee) === 0
                      ? 'FREE'
                      : `$${parseFloat(currentOrder.shippingFee).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%):</span>
                  <span>${parseFloat(currentOrder.taxAmount).toFixed(2)}</span>
                </div>
              </div>

              <hr className="my-4 border-gray-200" />

              <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                <span>Total Amount:</span>
                <span className="text-red-700">${parseFloat(currentOrder.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Cancel Order</h3>
              <p className="text-xs text-gray-500 mb-4">
                Are you sure you want to cancel order #{currentOrder.orderNumber}? Any reserved stock
                will be restocked and payment will be refunded.
              </p>

              {cancelError && <p className="text-xs text-red-600 mb-3">{cancelError}</p>}

              <form onSubmit={handleCancelOrder} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Reason for cancellation *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="e.g., Ordered by mistake, found better price, etc."
                    className="w-full text-sm border rounded-lg p-2.5 focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Keep Order
                  </button>
                  <button
                    type="submit"
                    disabled={cancelLoading || !cancelReason.trim()}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow"
                  >
                    {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Return Modal */}
        {showReturnModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Request Return / Refund</h3>
              <p className="text-xs text-gray-500 mb-4">
                Submit a return request for order #{currentOrder.orderNumber}. Our team will review
                your request shortly.
              </p>

              {returnError && <p className="text-xs text-red-600 mb-3">{returnError}</p>}

              <form onSubmit={handleRequestReturn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Reason for return *
                  </label>
                  <input
                    type="text"
                    required
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="e.g., Defective item, wrong size, item not as described"
                    className="w-full text-sm border rounded-lg p-2.5 focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={returnDetails}
                    onChange={(e) => setReturnDetails(e.target.value)}
                    placeholder="Provide any additional details or context..."
                    className="w-full text-sm border rounded-lg p-2.5 focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReturnModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={returnLoading || !returnReason.trim()}
                    className="px-4 py-2 bg-amazon-yellow hover:bg-yellow-400 disabled:opacity-50 text-gray-900 text-xs font-bold rounded-lg shadow"
                  >
                    {returnLoading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
