import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const r = await client.get('/auth/me');
        setUser(r.data);
      }
    } catch {
      await AsyncStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (login, password) => {
    const r = await client.post('/auth/login', { login, password });
    await AsyncStorage.setItem('token', r.data.token);
    setUser(r.data.user);
    return r.data;
  };

  const register = async (data) => {
    const r = await client.post('/auth/register', data);
    await AsyncStorage.setItem('token', r.data.token);
    setUser(r.data.user);
    return r.data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
