/* eslint-disable react-refresh/only-export-components -- context + provider pattern */
import React, { createContext, useEffect, useState, useCallback, useMemo } from 'react';
import authService from '../services/auth.service';
import api from '../services/api';
import { unwrapData, getErrorMessage } from '../lib/http';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');

    if (token) {
      try {
        const userRes = await api.get('/user/profile');
        const user = unwrapData(userRes.data);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch {
        // Token invalid or expired
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  checkAuth();
}, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      
      // authService.login returns res.data directly, so user is at response.user
      if (response?.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        setCurrentUser(response.user);
      }
      
      setIsAuthenticated(true);
      return response; // return the full res.data
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Login failed';
      setError(errorMessage);
      setIsAuthenticated(false);
      throw err;
    } finally {
      setLoading(false);
    }
}, []);

  const signup = useCallback(async (name, email, password, cpassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.signup(name, email, password, cpassword);
      return response;
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOTP = useCallback(async (email, otp) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.verifyOTP(email, otp);
      return response;
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'OTP verification failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Always clear state regardless of API success/failure
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Password reset failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

 const resetPassword = useCallback(async (email, otp, password, cpassword) => {
    setLoading(true);
    setError(null);
    try {
        const response = await authService.resetPassword(email, otp, password, cpassword);
        return response;
    } catch (err) {
        const errorMessage = getErrorMessage(err) || 'Password reset failed';
        setError(errorMessage);
        throw err;
    } finally {
        setLoading(false);
    }
}, []);

  const value = useMemo(() => ({
    currentUser,
    setCurrentUser,
    isAuthenticated,
    loading,
    error,
    setError,
    login,
    logout,
    signup,
    verifyOTP,
    forgotPassword,
    resetPassword,
  }), [
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    signup,
    verifyOTP,
    forgotPassword,
    resetPassword,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
