import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api"
    : "https://certificate-sender-api.onrender.com/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Keep sending cookies for manual login
});

// Add interceptor to attach Google OAuth token if present
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt"); // Google OAuth token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
