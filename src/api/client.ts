// client.ts

import axios from "axios";

// ✅ Create and export the axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL || "https://api.example.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
