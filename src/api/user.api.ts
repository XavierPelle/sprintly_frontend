import apiClient from './client';
import type { UserDashboard } from '@/types/dashboard.types';
import type { AuthUser } from '@/types/auth.types';

export const userApi = {
  /**
   * Récupérer le dashboard de l'utilisateur connecté
   */
  async getDashboard(): Promise<UserDashboard> {
    const response = await apiClient.get<UserDashboard>('/users/dashboard');
    return response.data;
  },

  /**
   * Récupérer un utilisateur par ID
   */
  async getById(id: number): Promise<AuthUser> {
    const response = await apiClient.get<AuthUser>(`/users/${id}`);
    return response.data;
  },

  /**
   * Récupérer un utilisateur par email
   */
  async getByEmail(email: string): Promise<AuthUser> {
    const response = await apiClient.get<AuthUser>(`/users/email/${email}`);
    return response.data;
  },

  /**
   * Mettre à jour le mot de passe
   */
  async updatePassword(
    userId: number,
    payload: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }
  ): Promise<{ message: string; updatedAt: string }> {
    const response = await apiClient.patch(`/users/${userId}/password`, payload);
    return response.data;
  },

  /**
   * Récupérer tous les utilisateurs
   */
  async getAll(): Promise<AuthUser[]> {
    const response = await apiClient.get<AuthUser[]>('/users');
    return response.data;
  }
};

export default userApi;