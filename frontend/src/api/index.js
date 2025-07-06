// this file sets up our connection to the backend API
import axios from 'axios';

// since we're using a proxy (in vite.config.js), we just use '/api' here
const API = axios.create({ baseURL: '/api' });

// this runs before every request we make (get, post, etc.)
API.interceptors.request.use((req) => {
  // check if user is logged in and has a token
  const userInfo = localStorage.getItem('userInfo');

  if (userInfo) {
    // attach the token to the request headers so backend knows who we are
    req.headers.Authorization = `Bearer ${JSON.parse(userInfo).token}`;
  }

  return req;
});

export default API;
