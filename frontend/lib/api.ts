import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { email: string; password: string; name: string; phone: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) =>
    api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/password', data),
};

export const listingsApi = {
  search: (params: {
    q?: string;
    categoryId?: string;
    subcategoryId?: string;
    locationId?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) => api.get('/listings/search', { params }),
  getById: (id: string) => api.get(`/listings/${id}`),
  getFeatured: () => api.get('/listings/featured'),
  getMyListings: (params?: { page?: number; limit?: number }) =>
    api.get('/listings/my', { params }),
  create: (data: any) => api.post('/listings', data),
  update: (id: string, data: any) => api.put(`/listings/${id}`, data),
  delete: (id: string) => api.delete(`/listings/${id}`),
};

export const favoritesApi = {
  getAll: (params?: { page?: number; limit?: number }) => api.get('/favorites', { params }),
  add: (listingId: string) => api.post(`/favorites/${listingId}`),
  remove: (listingId: string) => api.delete(`/favorites/${listingId}`),
  check: (listingId: string) => api.get(`/favorites/${listingId}/check`),
};

export const chatApi = {
  getConversations: () => api.get('/chat'),
  getConversation: (id: string) => api.get(`/chat/${id}`),
  createConversation: (data: { listingId: string; receiverId: string }) =>
    api.post('/chat', data),
  sendMessage: (data: { conversationId: string; content: string }) =>
    api.post('/chat/message', data),
  getUnreadCount: () => api.get('/chat/unread'),
};

export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
  getBySlug: (slug: string) => api.get(`/categories/slug/${slug}`),
};

export const locationsApi = {
  getAll: (search?: string) => api.get('/locations', { params: { search } }),
  getById: (id: string) => api.get(`/locations/${id}`),
};

export const reportsApi = {
  create: (data: { listingId: string; reason: string; description?: string }) =>
    api.post('/reports', data),
};

export const paymentApi = {
  createPayment: (data: { listingId?: string; paymentType: string }) =>
    api.post('/payment/create', data),
  getHistory: () => api.get('/payment/history'),
  getSubscription: () => api.get('/payment/subscription'),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: { page?: number; limit?: number; role?: string; search?: string }) =>
    api.get('/admin/users', { params }),
  updateUserRole: (id: string, data: { role: string }) => api.put(`/admin/users/${id}/role`, data),
  banUser: (id: string) => api.delete(`/admin/users/${id}`),
  getListings: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    api.get('/admin/listings', { params }),
  updateListingStatus: (id: string, data: { status: string }) =>
    api.put(`/admin/listings/${id}/status`, data),
  getReports: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/admin/reports', { params }),
  updateReportStatus: (id: string, data: { status: string }) =>
    api.put(`/admin/reports/${id}/status`, data),
  getRevenueStats: (period?: string) => api.get('/admin/revenue', { params: { period } }),
};
