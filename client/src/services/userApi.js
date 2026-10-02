import api from './api';

export const userApi = {
  getAddresses: async () => {
    const response = await api.get('/users/addresses');
    return response.data;
  },
  createAddress: async (addressData) => {
    const response = await api.post('/users/addresses', addressData);
    return response.data;
  },
  updateAddress: async (id, addressData) => {
    const response = await api.put(`/users/addresses/${id}`, addressData);
    return response.data;
  },
  deleteAddress: async (id) => {
    const response = await api.delete(`/users/addresses/${id}`);
    return response.data;
  },
  getRecentlyViewed: async () => {
    const response = await api.get('/users/recently-viewed');
    return response.data;
  },
  trackRecentlyViewed: async (productId) => {
    const response = await api.post('/users/recently-viewed', { productId });
    return response.data;
  },
};
