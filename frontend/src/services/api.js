// src/services/api.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Upload CSV file
  uploadIncome: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/income/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Generate forecast (Prophet + Monte Carlo)
  generateForecast: async (userId = 'demo_user') => {
    const response = await apiClient.post('/forecast/generate', {
      user_id: userId,
    });
    return response.data;
  },
  
  // Simulate "What If" action
  simulateAction: async (action, userId = 'demo_user') => {
    const response = await apiClient.post('/simulate', {
      user_id: userId,
      action: action,
    });
    return response.data;
  },
};

export default api;