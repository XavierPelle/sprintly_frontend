import apiClient from './client';
import type { Test } from '@/types/ticket.types';

export interface CreateTestPayload {
  description: string;
  images: file;
}

export interface UpdateTestPayload {
  description: string;
}

export interface ValidateTestPayload {
  isValidated: boolean;
}

export interface TestWithHistory extends Test {
  history: Test[];
}

export interface TestsResponse {
  ticketId: number;
  tests: TestWithHistory[];
  totalTests: number;
  totalVersions: number;
}

export interface TestHistoryResponse {
  mainTest: Test;
  versions: Test[];
  totalVersions: number;
}

export interface TestStatsResponse {
  totalTests: number;
  totalVersions: number;
  validated: number;
  pending: number;
  validationRate: string;
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
   * Récupérer tous les tests d'un ticket avec historique
   */
  async getTestsForTicket(ticketId: number): Promise<TestsResponse> {
    const response = await apiClient.get<TestsResponse>(`/tests/ticket/${ticketId}`);
    return response.data;
  },

  /**
   * Récupérer l'historique complet d'un test
   */
  async getTestHistory(testId: number): Promise<TestHistoryResponse> {
    const response = await apiClient.get<TestHistoryResponse>(`/tests/${testId}/history`);
    return response.data;
  },

  /**
   * Récupérer les statistiques des tests d'un ticket
   */
  async getTestStats(ticketId: number): Promise<TestStatsResponse> {
    const response = await apiClient.get<TestStatsResponse>(`/tests/ticket/${ticketId}/stats`);
    return response.data;
  },

  /**
   * Créer un test pour un ticket
   */
  async createForTicket(ticketId: number, formData: FormData): Promise<Test> {
      console.log(formData);
      const response = await apiClient.post<Test>(`/tests/ticket/${ticketId}`, formData, {
          headers: {
              'Content-Type': 'multipart/form-data'
          }
      });
      return response.data;
  },

  /**
   * Mettre à jour un test (crée une nouvelle version)
   */
  async update(testId: number, payload: UpdateTestPayload): Promise<Test> {
    const response = await apiClient.put<Test>(`/tests/${testId}`, payload);
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