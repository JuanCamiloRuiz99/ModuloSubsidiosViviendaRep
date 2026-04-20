/**
 * API Service - Axios configurado globalmente
 * Centraliza la configuración y lógica de llamadas HTTP
 */

import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import storageService from './storage.service';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    // Interceptor para agregar token en cada petición
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = storageService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para manejar errores globales
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          storageService.clear();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  getInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  // Métodos helper
  get<T>(url: string, config?: any) {
    return this.axiosInstance.get<T>(url, config);
  }

  post<T>(url: string, data?: any, config?: any) {
    return this.axiosInstance.post<T>(url, data, config);
  }

  put<T>(url: string, data?: any, config?: any) {
    return this.axiosInstance.put<T>(url, data, config);
  }

  patch<T>(url: string, data?: any, config?: any) {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  delete<T>(url: string, config?: any) {
    return this.axiosInstance.delete<T>(url, config);
  }
}

export default new ApiService();
