// src/api/auth.api.ts

import axios from 'axios';
import type {
  LoginCredentials,
  RegisterCredentials,
  LoginResponse,
  RegisterResponse,
  RefreshTokenResponse
} from '@/types/auth.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Instance spéciale sans intercepteur pour l'auth
const authClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const authApi = {
  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await authClient.post<LoginResponse>('/users/login', credentials);
    return response.data;
  },

  /**
   * Inscription utilisateur
   */
  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    const response = await authClient.post<RegisterResponse>('/users/register', credentials);
    return response.data;
  },

  /**
   * Rafraîchir le token d'accès
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await authClient.post<RefreshTokenResponse>('/users/refresh-token', {
      refreshToken
    });
    return response.data;
  }
};

export default authApi;