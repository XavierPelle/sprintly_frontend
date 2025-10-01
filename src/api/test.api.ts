import apiClient from './client';
import type { Test } from '@/types/ticket.types';

export interface CreateTestPayload {
  description: string;
}

export interface ValidateTestPayload {
  isValidated: boolean;
}

export const testApi = {
  /**
   * Récupérer tous les tests
   */
  async getAll(): Promise<Test[]> {
    const response = await apiClient.get<Test[]>('/tests');
    return response.data;
  },

  /**
   * Créer un test pour un ticket
   */
  async createForTicket(ticketId: number, payload: CreateTestPayload): Promise<Test> {
    const response = await apiClient.post<Test>(`/tests/ticket/${ticketId}`, payload);
    return response.data;
  },

  /**
   * Valider ou rejeter un test
   */
  async validate(testId: number, payload: ValidateTestPayload): Promise<Test> {
    const response = await apiClient.patch<Test>(`/tests/${testId}/validate`, payload);
    return response.data;
  },

  /**
   * Supprimer un test
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/tests/${id}`);
  }
};

export default testApi;