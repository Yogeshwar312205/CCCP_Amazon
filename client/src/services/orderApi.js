import api from './api';

export const orderApi = {
  // Validate coupon
  validateCoupon: async (code, subtotal) => {
    const response = await api.post('/coupons/validate', { code, subtotal });
    return response.data;
  },

  // Checkout / Place order
  checkout: async (checkoutData) => {
    const response = await api.post('/orders/checkout', checkoutData);
    return response.data;
  },

  // Get user orders list
  getOrders: async (page = 1, limit = 10) => {
    const response = await api.get(`/orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get order details by ID
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    const response = await api.post(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  // Submit return request
  requestReturn: async (returnData) => {
    const response = await api.post('/returns', returnData);
    return response.data;
  },

  // Get user returns list
  getReturns: async () => {
    const response = await api.get('/returns');
    return response.data;
  },
};

export default orderApi;
