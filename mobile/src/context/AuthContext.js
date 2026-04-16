import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      const token = await AsyncStorage.getItem('wms_token');
      const savedUser = await AsyncStorage.getItem('wms_user');
      if (token && savedUser) setUser(JSON.parse(savedUser));
      setLoading(false);
    };
    restore();
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    await AsyncStorage.setItem('wms_token', data.token);
    await AsyncStorage.setItem('wms_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('wms_token');
    await AsyncStorage.removeItem('wms_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
