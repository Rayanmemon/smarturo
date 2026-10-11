import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getSummaryStats = async () => {
  const response = await api.get('/stats/summary');
  return response.data;
};

export const getReadings = async (params = {}) => {
  const response = await api.get('/readings', { params });
  return response.data;
};

export const getReadingById = async (id) => {
  const response = await api.get(`/readings/${id}`);
  return response.data;
};

export const createReading = async (readingData) => {
  const response = await api.post('/readings', readingData);
  return response.data;
};

export const reviewReading = async (id, reviewData = {}) => {
  const response = await api.patch(`/readings/${id}/review`, reviewData);
  return response.data;
};

export default api;
