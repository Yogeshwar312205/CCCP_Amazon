import api from './api';

export const categoryApi = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  getCategoryBySlug: async (slug) => {
    const response = await api.get(`/categories/${slug}`);
    return response.data;
  },
};
