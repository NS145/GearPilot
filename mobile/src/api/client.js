import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Pointing to your Vercel production backend
const BASE_URL = 'https://gear-pilot.vercel.app/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('wms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('wms_token');
      await AsyncStorage.removeItem('wms_user');
    }
    return Promise.reject(error);
  }
);

export default api;
