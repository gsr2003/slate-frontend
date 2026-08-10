import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Request ke saath token automatically bhejne ke liye
API.interceptors.request.use((config) => {
  const user = localStorage.getItem("user");
  if (user) {
    const { token } = JSON.parse(user);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;