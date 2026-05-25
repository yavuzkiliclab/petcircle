import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// iOS simulator → localhost works
// Android emulator → use 10.0.2.2
// Physical device → use your machine's local IP
export const API_URL = 'http://192.168.68.55:3001';

const client = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      AsyncStorage.removeItem('token');
    }
    return Promise.reject(err);
  }
);

export default client;
