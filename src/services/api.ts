import axios from 'axios';

// Create axios instances for each service
const eventServiceApi = axios.create({
  baseURL: process.env.REACT_APP_EVENT_SERVICE_URL || 'http://localhost:5075/api',
});

const userServiceApi = axios.create({
  baseURL: process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:35501/api',
});

const bookingServiceApi = axios.create({
  baseURL: process.env.REACT_APP_BOOKING_SERVICE_URL || 'http://localhost:5003/api',
});

// Add request interceptor to each service for authentication
[eventServiceApi, userServiceApi, bookingServiceApi].forEach(api => {
  api.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );
});

// Add auth token to requests (legacy function kept for compatibility)
const addAuthToken = (token: string) => {
  eventServiceApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  userServiceApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  bookingServiceApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Remove auth token from requests
const removeAuthToken = () => {
  delete eventServiceApi.defaults.headers.common['Authorization'];
  delete userServiceApi.defaults.headers.common['Authorization'];
  delete bookingServiceApi.defaults.headers.common['Authorization'];
};

export { eventServiceApi, userServiceApi, bookingServiceApi, addAuthToken, removeAuthToken }; 
