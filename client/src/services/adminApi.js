import api from './api';

export const adminApi = {
  // Analytics
  getOverview: async () => {
    const res = await api.get('/admin/analytics/overview');
    return res.data;
  },
  getSalesChart: async (days = 14) => {
    const res = await api.get(`/admin/analytics/sales-chart?days=${days}`);
    return res.data;
  },
  getTopProducts: async (limit = 5) => {
    const res = await api.get(`/admin/analytics/top-products?limit=${limit}`);
    return res.data;
  },

  // Products
  getProducts: async (params = {}) => {
    const res = await api.get('/admin/products', { params });
    return res.data;
  },
  createProduct: async (productData) => {
    const res = await api.post('/admin/products', productData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  updateProduct: async (id, updateData) => {
    const res = await api.put(`/admin/products/${id}`, updateData);
    return res.data;
  },
  toggleProductStatus: async (id) => {
    const res = await api.patch(`/admin/products/${id}/toggle-status`);
    return res.data;
  },

  // Inventory
  getInventory: async (params = {}) => {
    const res = await api.get('/admin/inventory', { params });
    return res.data;
  },
  adjustStock: async (id, adjustData) => {
    const res = await api.post(`/admin/inventory/${id}/adjust`, adjustData);
    return res.data;
  },
  getInventoryHistory: async (id) => {
    const res = await api.get(`/admin/inventory/${id}/history`);
    return res.data;
  },

  // Orders
  getOrders: async (params = {}) => {
    const res = await api.get('/admin/orders', { params });
    return res.data;
  },
  getOrderById: async (id) => {
    const res = await api.get(`/admin/orders/${id}`);
    return res.data;
  },
  updateOrderStatus: async (id, statusData) => {
    const res = await api.put(`/admin/orders/${id}/status`, statusData);
    return res.data;
  },

  // Returns
  getReturns: async (params = {}) => {
    const res = await api.get('/admin/returns', { params });
    return res.data;
  },
  processReturn: async (id, processData) => {
    const res = await api.put(`/admin/returns/${id}`, processData);
    return res.data;
  },

  // Coupons
  getCoupons: async () => {
    const res = await api.get('/admin/coupons');
    return res.data;
  },
  createCoupon: async (couponData) => {
    const res = await api.post('/admin/coupons', couponData);
    return res.data;
  },
  toggleCouponStatus: async (id) => {
    const res = await api.patch(`/admin/coupons/${id}/toggle-status`);
    return res.data;
  },

  // Categories
  getCategories: async (params = {}) => {
    const res = await api.get('/admin/categories', { params });
    return res.data;
  },
  createCategory: async (categoryData) => {
    const res = await api.post('/admin/categories', categoryData);
    return res.data;
  },
  updateCategory: async (id, updateData) => {
    const res = await api.put(`/admin/categories/${id}`, updateData);
    return res.data;
  },
  toggleCategoryStatus: async (id) => {
    const res = await api.patch(`/admin/categories/${id}/toggle-status`);
    return res.data;
  },
  deleteCategory: async (id) => {
    const res = await api.delete(`/admin/categories/${id}`);
    return res.data;
  },

  // Audit Logs (SUPER_ADMIN)
  getAuditLogs: async (params = {}) => {
    const res = await api.get('/admin/audit-logs', { params });
    return res.data;
  },
};

export default adminApi;
