import api from './api';

export const cartApi = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },
  addItem: async (itemData) => {
    const response = await api.post('/cart/items', itemData);
    return response.data;
  },
  updateQuantity: async (itemId, quantity) => {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },
  removeItem: async (itemId) => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  },
  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  },
};
