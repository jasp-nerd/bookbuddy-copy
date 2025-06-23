import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Book API calls
export const bookAPI = {
  // Get book by ID
  getBook: async (bookId) => {
    const response = await api.get(`/get_book/${bookId}`);
    return response.data;
  },

  // Search books
  searchBooks: async (query, page = 1, orderBy = null, lang = null) => {
    const params = { q: query, page };
    if (orderBy) params.order_by = orderBy;
    if (lang) params.lang = lang;
    
    const response = await api.get('/search', { params });
    return response.data;
  },

  // Get recommendations
  getRecommendations: async (userId) => {
    const response = await api.get(`/recommendations/${userId}`);
    return response.data;
  },

  // Get most favorited books
  getMostFavorites: async () => {
    const response = await api.get('/most_favorites');
    return response.data;
  },
};

// User book lists API calls
export const userListsAPI = {
  // Favorites
  getFavoriteBooks: async (userId) => {
    const response = await api.get(`/favorite_books/${userId}`);
    return response.data;
  },

  addToFavorites: async (userId, bookId) => {
    const response = await api.post(`/favorites/${userId}/add/${bookId}`);
    return response.data;
  },

  removeFromFavorites: async (userId, bookId) => {
    const response = await api.post(`/favorites/${userId}/delete/${bookId}`);
    return response.data;
  },

  // Read books
  getReadBooks: async (userId) => {
    const response = await api.get(`/read_book_objects/${userId}`);
    return response.data;
  },

  addToReadBooks: async (userId, bookId) => {
    const response = await api.post(`/read_books/${userId}/add/${bookId}`);
    return response.data;
  },

  removeFromReadBooks: async (userId, bookId) => {
    const response = await api.post(`/read_books/${userId}/delete/${bookId}`);
    return response.data;
  },

  // Want to read
  getWantToReadBooks: async (userId) => {
    const response = await api.get(`/want_to_read_books/${userId}`);
    return response.data;
  },

  addToWantToRead: async (userId, bookId) => {
    const response = await api.post(`/want_to_reads/${userId}/add/${bookId}`);
    return response.data;
  },

  removeFromWantToRead: async (userId, bookId) => {
    const response = await api.post(`/want_to_reads/${userId}/delete/${bookId}`);
    return response.data;
  },
};

// Reviews API calls
export const reviewsAPI = {
  submitReview: async (bookId, user, rating, message) => {
    const response = await api.post('/submit_review', {
      book_id: bookId,
      user,
      rating,
      message,
    });
    return response.data;
  },

  updateReview: async (reviewId, rating, message) => {
    const response = await api.put(`/update_review/${reviewId}`, {
      rating,
      message,
    });
    return response.data;
  },

  deleteReview: async (user, bookId) => {
    const response = await api.delete('/delete_review', {
      data: { user, book_id: bookId },
    });
    return response.data;
  },

  getBookReviews: async (bookId) => {
    const response = await api.get(`/reviews_book/${bookId}`);
    return response.data;
  },

  getSortedReviews: async (sortBy = 'rating', order = 'desc') => {
    const response = await api.get('/reviews_sorted', {
      params: { sort_by: sortBy, order },
    });
    return response.data;
  },
};

// Chat API calls
export const chatAPI = {
  sendMessage: async (message, userId) => {
    const response = await api.post('/api/chat', {
      message,
      user_id: userId,
    });
    return response.data;
  },
};

export default api; 