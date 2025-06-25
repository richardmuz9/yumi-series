import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  name?: string;
  billing?: {
    hasAccessToImageGen: boolean;
  };
}

const TOKEN_KEY = 'auth_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  useEffect(() => {
    // Check if user is logged in
    api.get('/api/auth/me')
      .then(response => {
        setUser(response.data);
        setError(null);
      })
      .catch(err => {
        setUser(null);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = (newToken: string) => {
    setAuthToken(newToken);
    setToken(newToken);
  };

  const logout = () => {
    removeAuthToken();
    setToken(null);
  };

  return {
    token,
    isAuthenticated,
    login,
    logout,
    user,
    loading,
    error
  };
};

export default useAuth; 