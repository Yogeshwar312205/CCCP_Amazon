import api from './api';

export const wishlistApi = {
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data;
  },
  addItem: async (productId) => {
    const response = await api.post('/wishlist/items', { productId });
    return response.data;
  },
  removeItem: async (productId) => {
    const response = await api.delete(`/wishlist/items/${productId}`);
    return response.data;
  },
};
