declare const process: any;

import axios from "axios";

const API_BASE_URL =
  process.env.UMI_APP_API_BASE_URL || "https://learning-dinosaur-personal.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("learning_dinosaur_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("learning_dinosaur_token");
      localStorage.removeItem("learning_dinosaur_user");
    }
    return Promise.reject(error);
  },
);

export default api;
