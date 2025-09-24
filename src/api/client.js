// src/api/client.js
import axios from "axios";
import storage from "../utils/storage";

// Define your backend server's address ONCE.
// Change this depending on your backend hosting.
const API_BASE_URL = "http://localhost:3001"; 
// 👉 For production, you’ll likely replace with https://yourdomain.com/api

// Create a special, pre-configured instance of axios.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// This interceptor runs automatically BEFORE any API request is sent.
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // 1. Get the user's token from storage.
      const token = await storage.get("userToken");

      // 2. If token exists, attach it to the Authorization header.
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error("Error fetching token from storage:", err);
    }

    // 3. Return the updated request config so the call can proceed.
    return config;
  },
  (error) => {
    // Handle errors before the request is sent
    return Promise.reject(error);
  }
);

// Export base URL (useful for images, file paths, etc.)
export { API_BASE_URL };

// Export the configured axios client
export default apiClient;
