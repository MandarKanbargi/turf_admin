import axios from "axios";

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_API_URL}/v1`,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    // BetterAuth will handle token injection automatically
    // If you need manual token handling, add it here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Handle unauthorized - BetterAuth will handle this
    }
    return Promise.reject(error);
  },
);

export default apiClient;
