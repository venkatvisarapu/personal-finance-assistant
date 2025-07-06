// this file sets up our connection to the backend API
import axios from 'axios';

// In production, it uses the live URL from Vercel's environment variables.
// In development, it uses the proxy we set up in vite.config.js.
const baseURL = import.meta.env.PROD 
    ? `${import.meta.env.VITE_API_BASE_URL}/api` 
    : '/api';

const API = axios.create({ baseURL });

API.interceptors.request.use((req) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    req.headers.Authorization = `Bearer ${JSON.parse(userInfo).token}`;
  }
  return req;
});

export default API;
