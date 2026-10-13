import api from './api';

export const categoryApi = {
  getCategories: async (params = {}) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },
  getCategoryBySlug: async (slug) => {
    const response = await api.get(`/categories/${slug}`);
    return response.data;
  },
};
