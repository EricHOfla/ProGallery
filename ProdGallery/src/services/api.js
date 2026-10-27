// API Configuration and Base Setup
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_BASE_URL = configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:8000/api' : '');

const assertApiConfigured = () => {
  if (!API_BASE_URL) throw new Error('API is not configured. Set VITE_API_URL to your deployed Laravel API URL.');
};

// Helper function to get auth token
const getAuthToken = () => {
  const user = localStorage.getItem('prodgallery_user');
  if (user) {
    try { const userData = JSON.parse(user); return userData?.token || null; }
    catch { localStorage.removeItem('prodgallery_user'); }
  }
  return null;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  assertApiConfigured();
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return await handleResponse(response);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: async (data) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  getUser: async () => {
    return apiRequest('/auth/user');
  },

  changePassword: async (data) => {
    return apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  forgotPassword: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (data) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Photos API
export const photosAPI = {
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.min_price) queryParams.append('min_price', params.min_price);
    if (params.max_price) queryParams.append('max_price', params.max_price);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/photos?${queryString}` : '/photos';
    const response = await apiRequest(endpoint);
    return Array.isArray(response) ? response : response?.data || [];
  },

  getPage: async (params = {}) => {
    const queryParams = new URLSearchParams();
    ['search', 'min_price', 'max_price', 'sort_by', 'sort_order', 'category', 'page', 'per_page'].forEach((key) => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') queryParams.set(key, String(value));
    });
    const queryString = queryParams.toString();
    return apiRequest(queryString ? `/photos?${queryString}` : '/photos');
  },

  getById: async (id) => {
    return apiRequest(`/photos/${id}`);
  },

  getByCategory: async (category) => {
    return apiRequest(`/photos?category=${category}`);
  },

  // Admin endpoints
  create: async (formData) => {
    assertApiConfigured();
    const token = getAuthToken();
    
    const headers = {
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/admin/photos`, {
      method: 'POST',
      headers,
      body: formData, // FormData handles multipart/form-data
    });

    return await handleResponse(response);
  },

  update: async (id, formData) => {
    assertApiConfigured();
    const token = getAuthToken();
    
    const headers = {
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/admin/photos/${id}`, {
      method: 'POST', // Laravel uses POST with _method for file uploads
      headers: {
        ...headers,
        'X-HTTP-Method-Override': 'PUT',
      },
      body: formData,
    });

    return await handleResponse(response);
  },

  delete: async (id) => {
    return apiRequest(`/admin/photos/${id}`, {
      method: 'DELETE',
    });
  },
};

// Cart API
export const cartAPI = {
  getCart: async () => {
    return apiRequest('/cart');
  },

  addItem: async (photoId, quantity = 1, licenseType = 'personal') => {
    return apiRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ photo_id: photoId, quantity, license_type: licenseType }),
    });
  },

  updateItem: async (itemId, quantity) => {
    return apiRequest(`/cart/update/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  removeItem: async (itemId) => {
    return apiRequest(`/cart/remove/${itemId}`, {
      method: 'DELETE',
    });
  },

  clearCart: async () => {
    return apiRequest('/cart/clear', {
      method: 'DELETE',
    });
  },
};

// Orders API
export const ordersAPI = {
  getAll: async () => {
    const response = await apiRequest('/orders');
    return Array.isArray(response) ? response : response?.data || [];
  },

  getById: async (orderId) => {
    return apiRequest(`/orders/${orderId}`);
  },

  getInvoiceHtml: async (orderId) => {
    assertApiConfigured();
    const token = getAuthToken();

    const headers = {
      'Accept': 'text/html',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/invoice`, {
      headers,
    });

    if (!response.ok) {
      const error = await response.text().catch(() => 'Failed to load invoice');
      throw new Error(error);
    }

    return response.text();
  },

  downloadImages: async (orderId) => {
    assertApiConfigured();
    const token = getAuthToken();

    const headers = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/download-images`, {
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to download images' }));
      throw new Error(error.message || 'Failed to download images');
    }

    return response.blob();
  },

  createPaymentSession: async (orderId) => apiRequest('/orders/' + orderId + '/payment-session', { method: 'POST' }),

  create: async (orderData) => {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  updateStatus: async (orderId, status) => {
    return apiRequest(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  refund: async (orderId) => apiRequest(`/admin/orders/${orderId}/refund`, {
    method: 'POST',
    body: JSON.stringify({}),
  }),

  // Admin endpoints
  getAllOrders: async () => {
    const response = await apiRequest('/admin/orders');
    return Array.isArray(response) ? response : response?.data || [];
  },

  getAdminOrderById: async (orderId) => {
    return apiRequest(`/admin/orders/${orderId}`);
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    return apiRequest('/categories');
  },

  getById: async (id) => {
    return apiRequest(`/categories/${id}`);
  },

  create: async (data) => {
    return apiRequest('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return apiRequest(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return apiRequest(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

 // Favorites API
export const favoritesAPI = {
  getAll: async () => {
    const response = await apiRequest('/favorites');
    return Array.isArray(response) ? response : response?.data || [];
  },
  add: async (photoId) => apiRequest('/favorites', { method: 'POST', body: JSON.stringify({ photo_id: photoId }) }),
  remove: async (photoId) => apiRequest('/favorites/' + photoId, { method: 'DELETE' }),
};

// Contact API
export const contactAPI = {
  submit: async (data) => {
    return apiRequest('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Admin dashboard API
export const dashboardAPI = {
  getStats: async () => {
    return apiRequest('/admin/stats');
  },
};

// Reviews API
export const reviewsAPI = {
  getByPhoto: async (photoId) => {
    const response = await apiRequest(`/photos/${photoId}/reviews`);
    return Array.isArray(response) ? response : response?.data || [];
  },

  create: async (data) => {
    return apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return apiRequest(`/reviews/${id}`, {
      method: 'DELETE',
    });
  },
};

// Contact Messages API (Admin)
export const contactMessagesAPI = {
  getAll: async () => {
    const response = await apiRequest('/admin/contact-messages');
    return Array.isArray(response) ? response : response?.data || [];
  },

  getById: async (id) => {
    return apiRequest(`/admin/contact-messages/${id}`);
  },

  delete: async (id) => {
    return apiRequest(`/admin/contact-messages/${id}`, {
      method: 'DELETE',
    });
  },
};

// Analytics API (Admin)
export const analyticsAPI = {
  getRevenue: async () => {
    return apiRequest('/admin/analytics/revenue');
  },

  getTopPhotos: async () => {
    return apiRequest('/admin/analytics/top-photos');
  },

  getOrderStatus: async () => {
    return apiRequest('/admin/analytics/order-status');
  },

  getSalesByCategory: async () => {
    return apiRequest('/admin/analytics/sales-by-category');
  },
};

// Users API (Admin)
export const usersAPI = {
  getAll: async () => {
    const response = await apiRequest('/admin/users');
    return Array.isArray(response) ? response : response?.data || [];
  },

  create: async (userData) => {
    return apiRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  update: async (id, userData) => {
    return apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  delete: async (id) => {
    return apiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },
};

export default {
  authAPI,
  photosAPI,
  cartAPI,
  ordersAPI,
  categoriesAPI,
  contactAPI,
  dashboardAPI,
  reviewsAPI,
  favoritesAPI,
  contactMessagesAPI,
  analyticsAPI,
  usersAPI,
};


// Admin store configuration
export const storeSettingsAPI = {
  getPublic: () => apiRequest('/store-settings'),
  get: () => apiRequest('/admin/settings'),
  update: (settings) => apiRequest('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  }),
  refundOrder: (orderId, reason) => apiRequest(`/admin/orders/${orderId}/refund`, {
    method: 'POST',
    body: JSON.stringify(reason ? { reason } : {}),
  }),
};
