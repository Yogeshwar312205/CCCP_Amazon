import api from './api';

export const productApi = {
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  getFeaturedProducts: async () => {
    const response = await api.get('/products/featured');
    return response.data;
  },
  getProductBySlug: async (slug) => {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  },
};
