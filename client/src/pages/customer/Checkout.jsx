import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, clearCart } from '../../features/cart/cartSlice';
import { placeOrder } from '../../features/orders/orderSlice';
import { userApi } from '../../services/userApi';
import { orderApi } from '../../services/orderApi';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Tag,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Plus,
  ArrowLeft,
  Home,
} from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, subtotal } = useSelector((state) => state.cart);
  const { checkoutLoading, checkoutError } = useSelector((state) => state.orders);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Local page error
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    dispatch(fetchCart());
    loadAddresses();
  }, [dispatch]);

  const loadAddresses = async () => {
    try {
      const res = await userApi.getAddresses();
      const addrList = res.data?.addresses || (Array.isArray(res.data) ? res.data : []);
      setAddresses(addrList);
      const defaultAddr = addrList.find((a) => a.isDefaultShipping || a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else if (addrList.length > 0) {
        setSelectedAddressId(addrList[0].id);
      }
    } catch (err) {
      console.error('Failed to load addresses', err);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');
    setValidatingCoupon(true);

    try {
      const res = await orderApi.validateCoupon(couponCode.trim().toUpperCase(), subtotal);
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.error?.message || err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Calculations
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingFee = subtotal > 100 || subtotal === 0 ? 0 : 10;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = parseFloat((taxableAmount * 0.08).toFixed(2));
  const finalTotal = parseFloat((taxableAmount + shippingFee + taxAmount).toFixed(2));

  const updatePaymentDetail = (field, value) => {
    setPaymentDetails((current) => ({ ...current, [field]: value }));
  };

  const formatCardNumber = (value) =>
    value
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, '$1 ');

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setLocalError('Please select or add a shipping address.');
      return;
    }
    if (!items || items.length === 0) {
      setLocalError('Your cart is empty.');
      return;
    }

    if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') {
      const cardNumber = paymentDetails.cardNumber.replace(/\s/g, '');
      if (
        !paymentDetails.cardholderName.trim() ||
        !/^\d{16}$/.test(cardNumber) ||
        !/^\d{2}\/\d{2}$/.test(paymentDetails.expiryDate) ||
        !/^\d{3,4}$/.test(paymentDetails.cvv)
      ) {
        setLocalError('Enter valid demo card details: name, 16-digit card number, MM/YY expiry, and CVV.');
        return;
      }
    }

    if (paymentMethod === 'UPI' && !/^[\w.-]+@[\w.-]+$/.test(paymentDetails.upiId.trim())) {
      setLocalError('Enter a valid demo UPI ID, for example demo@upi.');
      return;
    }

    setLocalError('');

    const checkoutData = {
      shippingAddressId: selectedAddressId,
      billingAddressId: selectedAddressId,
      couponCode: appliedCoupon ? appliedCoupon.coupon.code : undefined,
      paymentMethod,
      simulateFailure,
    };

    const action = await dispatch(placeOrder(checkoutData));
    if (placeOrder.fulfilled.match(action)) {
      if (action.payload.paymentStatus === 'FAILED') {
        setLocalError(
          'Demo payment was declined. Your order is pending and no charge was made. You can try checkout again.'
        );
        return;
      }
      dispatch(clearCart());
      navigate(`/orders/${action.payload.orderId}?success=true`);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Your Shopping Cart is empty</h2>
        <p className="text-gray-600 mb-6">Add items to your cart before proceeding to checkout.</p>
        <Link
          to="/cart"
          className="inline-block bg-amazon-yellow hover:bg-yellow-400 text-gray-900 font-semibold px-6 py-2 rounded-lg"
        >
          Back to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-300 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/cart"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-amazon-orange"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Cart
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-amazon-orange"
            >
              <Home className="w-4 h-4" /> Store Home
            </Link>
            <div className="flex items-center text-sm text-gray-600">
              <ShieldCheck className="w-5 h-5 text-green-600 mr-1" />
              <span>Secure 256-Bit SSL Checkout</span>
            </div>
          </div>
        </div>

        {(localError || checkoutError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{localError || checkoutError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Address */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amazon-orange text-white text-xs mr-2">
                    1
                  </span>
                  Select a Delivery Address
                </h2>
                <Link
                  to="/addresses"
                  className="text-xs text-blue-600 hover:underline flex items-center font-medium"
                >
                  <Plus className="w-3.5 h-3.5 mr-0.5" /> Manage / Add Address
                </Link>
              </div>

              {addresses.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                  You do not have any saved delivery addresses.{' '}
                  <Link to="/addresses" className="font-semibold underline">
                    Add an address now
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedAddressId === addr.id
                          ? 'border-amazon-orange bg-orange-50/30'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shippingAddress"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 text-amazon-orange focus:ring-amazon-orange"
                      />
                      <div className="ml-3 text-sm">
                        <div className="font-semibold text-gray-800 flex items-center gap-2">
                          {addr.fullName}
                          {addr.isDefault && (
                            <span className="text-[11px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-gray-600 mt-0.5">
                          {addr.streetAddress}
                          {addr.apartmentSuite ? `, ${addr.apartmentSuite}` : ''}
                        </div>
                        <div className="text-gray-600">
                          {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
                        </div>
                        {addr.phone && <div className="text-gray-500 mt-1">Phone: {addr.phone}</div>}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amazon-orange text-white text-xs mr-2">
                  2
                </span>
                Payment Method (Mock Simulation)
              </h2>

              <div className="space-y-3">
                {[
                  { id: 'CREDIT_CARD', label: 'Credit Card (Mock Visa / MasterCard / Amex)' },
                  { id: 'DEBIT_CARD', label: 'Debit Card (Instant mock settlement)' },
                  { id: 'UPI', label: 'UPI / Instant QR (Simulated)' },
                  { id: 'NET_BANKING', label: 'Net Banking (Demo authorization)' },
                  { id: 'WALLET', label: 'Amazon Pay Balance / Wallet' },
                ].map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      paymentMethod === pm.id
                        ? 'border-amazon-orange bg-orange-50/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={pm.id}
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id)}
                      className="text-amazon-orange focus:ring-amazon-orange"
                    />
                    <CreditCard className="w-4 h-4 text-gray-500 ml-3 mr-2" />
                    <span className="text-sm font-medium text-gray-800">{pm.label}</span>
                  </label>
                ))}
              </div>

              {(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && (
                <div className="mt-4 p-4 rounded-lg border border-blue-200 bg-blue-50 space-y-3">
                  <div className="flex items-start gap-2 text-xs text-blue-800">
                    <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Demo payment only.</strong> No real charge will be made. Use
                      4111 1111 1111 1111, any future MM/YY date, and any 3-digit CVV.
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Cardholder name"
                    value={paymentDetails.cardholderName}
                    onChange={(e) => updatePaymentDetail('cardholderName', e.target.value)}
                    autoComplete="cc-name"
                    className="w-full text-sm px-3 py-2 border rounded-md focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Card number"
                    value={paymentDetails.cardNumber}
                    onChange={(e) => updatePaymentDetail('cardNumber', formatCardNumber(e.target.value))}
                    autoComplete="cc-number"
                    className="w-full text-sm px-3 py-2 border rounded-md focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/YY"
                      value={paymentDetails.expiryDate}
                      onChange={(e) => updatePaymentDetail('expiryDate', e.target.value.replace(/[^\d/]/g, '').slice(0, 5))}
                      autoComplete="cc-exp"
                      className="text-sm px-3 py-2 border rounded-md focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                    />
                    <input
                      type="password"
                      inputMode="numeric"
                      placeholder="CVV"
                      value={paymentDetails.cvv}
                      onChange={(e) => updatePaymentDetail('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      autoComplete="cc-csc"
                      className="text-sm px-3 py-2 border rounded-md focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div className="mt-4 p-4 rounded-lg border border-blue-200 bg-blue-50 space-y-3">
                  <div className="flex items-start gap-2 text-xs text-blue-800 select-none">
                    <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Demo UPI payment.</strong> No real payment request is sent.
                      Enter a demo UPI ID below, such as <code>demo@upi</code>.
                    </span>
                  </div>
                  <label htmlFor="demo-upi-id" className="block text-xs font-semibold text-gray-700">
                    Demo UPI ID
                  </label>
                  <input
                    id="demo-upi-id"
                    name="demoUpiId"
                    type="text"
                    inputMode="email"
                    autoComplete="off"
                    spellCheck="false"
                    aria-label="Demo UPI ID"
                    placeholder="demo@upi"
                    value={paymentDetails.upiId}
                    onChange={(e) => updatePaymentDetail('upiId', e.target.value)}
                    onInput={(e) => updatePaymentDetail('upiId', e.currentTarget.value)}
                    readOnly={false}
                    disabled={false}
                    tabIndex={0}
                    className="relative z-10 block w-full bg-white text-gray-900 text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-amazon-orange pointer-events-auto"
                  />
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center">
                <input
                  type="checkbox"
                  id="simulateFailure"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 mr-2"
                />
                <label htmlFor="simulateFailure" className="text-xs text-gray-600 cursor-pointer">
                  Test a declined demo payment (the order remains pending and no charge is made)
                </label>
              </div>
            </div>

            {/* Step 3: Review Items */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amazon-orange text-white text-xs mr-2">
                  3
                </span>
                Review Items and Delivery
              </h2>

              <div className="divide-y divide-gray-100">
                {items.map((item) => {
                  const product = item.product || {};
                  const variant = item.variant;
                  const itemPrice = variant?.price || product.salePrice || product.basePrice || 0;
                  const primaryImg = product.images?.find((img) => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;

                  return (
                    <div key={item.id} className="py-3 flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded border flex items-center justify-center overflow-hidden flex-shrink-0">
                        {primaryImg ? (
                          <img src={primaryImg} alt={product.title} className="object-contain max-h-full" />
                        ) : (
                          <div className="text-xs text-gray-400">No Image</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{product.title}</div>
                        {variant && (
                          <div className="text-xs text-gray-500">Variant: {variant.variantName}</div>
                        )}
                        <div className="text-xs text-gray-500">Quantity: {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">
                          ${(parseFloat(itemPrice) * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">${parseFloat(itemPrice).toFixed(2)} each</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Coupon */}
          <div className="space-y-6">
            {/* Order Summary Box */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <button
                onClick={handlePlaceOrder}
                disabled={checkoutLoading || !selectedAddressId}
                className="w-full bg-amazon-yellow hover:bg-yellow-400 disabled:opacity-60 text-gray-900 font-bold py-3 px-4 rounded-lg shadow transition mb-4 text-center cursor-pointer"
              >
                {checkoutLoading ? 'Processing Order...' : 'Place Your Order'}
              </button>

              <p className="text-[11px] text-gray-500 text-center mb-4">
                By placing your order, you agree to Amazon Clone's privacy notice and conditions of use.
              </p>

              <hr className="my-4 border-gray-200" />

              <h3 className="font-bold text-gray-900 mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Items ({items.length}):</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon ({appliedCoupon.coupon.code}):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping & handling:</span>
                  <span>{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
              </div>

              <hr className="my-4 border-gray-200" />

              <div className="flex justify-between items-center text-lg font-bold text-red-700">
                <span>Order Total:</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon Code Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-sm text-gray-900 flex items-center mb-3">
                <Tag className="w-4 h-4 mr-1.5 text-amazon-orange" />
                Apply Coupon / Promo Code
              </h3>

              {appliedCoupon ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between text-sm">
                  <div>
                    <div className="font-semibold text-green-800">{appliedCoupon.coupon.code} Applied</div>
                    <div className="text-xs text-green-700">You saved ${discountAmount.toFixed(2)}!</div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 text-sm uppercase px-3 py-2 border rounded-md focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                    />
                    <button
                      type="submit"
                      disabled={validatingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-xs font-semibold rounded-md"
                    >
                      {validatingCoupon ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-600">{couponError}</p>}
                  <p className="text-[11px] text-gray-500">
                    Try demo codes: <span className="font-mono font-bold">WELCOME10</span> or <span className="font-mono font-bold">SAVEMORE20</span>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
