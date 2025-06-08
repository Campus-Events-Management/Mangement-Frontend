import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, LoginCredentials, RegisterData, AuthState } from '../types';
import { UserService } from '../services/userService';
import { addAuthToken, removeAuthToken } from '../services/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
        return;
      }

      try {
        addAuthToken(token);
        const user = await UserService.getCurrentUser();
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false
        });
      } catch (error) {
        localStorage.removeItem('token');
        removeAuthToken();
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const { user, token } = await UserService.login(credentials);
      localStorage.setItem('token', token);
      addAuthToken(token);
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const { user, token } = await UserService.register(data);
      localStorage.setItem('token', token);
      addAuthToken(token);
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    removeAuthToken();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 