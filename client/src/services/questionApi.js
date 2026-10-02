import api from './api';

export const questionApi = {
  getQuestions: async (productId) => {
    const response = await api.get(`/products/${productId}/questions`);
    return response.data;
  },
  askQuestion: async (productId, questionText) => {
    const response = await api.post(`/products/${productId}/questions`, { question: questionText });
    return response.data;
  },
  answerQuestion: async (questionId, answerText) => {
    const response = await api.post(`/products/0/questions/${questionId}/answers`, { answer: answerText });
    return response.data;
  },
};
