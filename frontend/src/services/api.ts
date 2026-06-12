import axios from 'axios';
import { User, Prediction, Report, ChatMessage, Settings, DashboardStats } from '../types';

const api = axios.create({
  baseURL: '', // Handled by Vite proxy in development
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cardio_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/api/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('cardio_token', response.data.access_token);
    }
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
  getMe: async (): Promise<User> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
  updateProfile: async (profileData: any): Promise<User> => {
    const response = await api.put('/api/auth/profile', profileData);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('cardio_token');
  }
};

// Predictions Services
export const predictionsService = {
  uploadScan: async (file: File, imageType: string, onUploadProgress?: (progressEvent: any) => void): Promise<Prediction> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('image_type', imageType);

    const response = await api.post('/api/predictions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },
  getPredictions: async (): Promise<Prediction[]> => {
    const response = await api.get('/api/predictions');
    return response.data;
  },
  getPrediction: async (id: number): Promise<Prediction> => {
    const response = await api.get(`/api/predictions/${id}`);
    return response.data;
  },
  deletePrediction: async (id: number): Promise<void> => {
    await api.delete(`/api/predictions/${id}`);
  }
};

// Chatbot Services
export const chatbotService = {
  sendMessage: async (message: string): Promise<ChatMessage> => {
    const response = await api.post('/api/chatbot/', { message });
    return response.data;
  },
  getHistory: async (): Promise<ChatMessage[]> => {
    const response = await api.get('/api/chatbot/history');
    return response.data;
  },
  clearHistory: async (): Promise<void> => {
    await api.delete('/api/chatbot/clear');
  }
};

// Reports Services
export const reportsService = {
  getReports: async (): Promise<Report[]> => {
    const response = await api.get('/api/reports/');
    return response.data;
  },
  downloadReportUrl: (reportId: number) => {
    const token = localStorage.getItem('cardio_token');
    return `/api/reports/${reportId}/download?token=${token}`;
  },
  deleteReport: async (id: number): Promise<void> => {
    await api.delete(`/api/reports/${id}`);
  }
};

// Settings Services
export const settingsService = {
  getSettings: async (): Promise<Settings> => {
    const response = await api.get('/api/settings/');
    return response.data;
  },
  updateSettings: async (settingsData: Partial<Settings>): Promise<Settings> => {
    const response = await api.put('/api/settings/', settingsData);
    return response.data;
  }
};

// Dashboard Services
export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  }
};

export default api;
