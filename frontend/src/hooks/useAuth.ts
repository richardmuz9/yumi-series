import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

interface ErrorResponse {
  message: string;
  code?: string;
}

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

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    return api
      .post<AuthResponse>('/auth/login', { email, password })
      .then((response) => {
        setAuthToken(response.data.token);
        setToken(response.data.token);
        setIsAuthenticated(true);
      })
      .catch((err: { response?: { data: ErrorResponse } }) => {
        const message = err.response?.data?.message || 'Login failed';
        setError(message);
        throw new Error(message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const logout = () => {
    removeAuthToken();
    setToken(null);
    setIsAuthenticated(false);
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