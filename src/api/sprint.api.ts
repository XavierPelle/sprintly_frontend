import apiClient from './client';
import type { Sprint, SprintDetails, CreateSprintPayload, BurndownData } from '@/types/sprint.types';

export const sprintApi = {
  /**
   * Récupérer tous les sprints
   */
  async getAll(): Promise<Sprint[]> {
    const response = await apiClient.get<Sprint[]>('/sprints');
    return response.data;
  },

  /**
   * Récupérer un sprint par ID
   */
  async getById(id: number): Promise<Sprint> {
    const response = await apiClient.get<Sprint>(`/sprints/${id}`);
    return response.data;
  },

  /**
   * Récupérer les détails d'un sprint avec stats
   */
  async getDetails(id: number): Promise<SprintDetails> {
    const response = await apiClient.get<SprintDetails>(`/sprints/${id}/details`);
    return response.data;
  },

  /**
   * Récupérer les données de burndown
   */
  async getBurndown(id: number): Promise<BurndownData> {
    const response = await apiClient.get<BurndownData>(`/sprints/${id}/burndown`);
    return response.data;
  },

  /**
   * Créer un nouveau sprint
   */
  async create(payload: CreateSprintPayload): Promise<Sprint> {
    const response = await apiClient.post<Sprint>('/sprints', payload);
    return response.data;
  },

  /**
   * Mettre à jour un sprint
   */
  async update(id: number, payload: Partial<CreateSprintPayload>): Promise<Sprint> {
    const response = await apiClient.put<Sprint>(`/sprints/${id}`, payload);
    return response.data;
  },

  /**
   * Ajouter des tickets à un sprint
   */
  async addTickets(sprintId: number, ticketIds: number[]): Promise<{ message: string }> {
    const response = await apiClient.post(`/sprints/${sprintId}/tickets`, { ticketIds });
    return response.data;
  },

  /**
   * Retirer des tickets d'un sprint
   */
  async removeTickets(sprintId: number, ticketIds: number[]): Promise<void> {
    const response = await apiClient.delete(`/sprints/${sprintId}/tickets`, {
      data: { ticketIds }
    })
    return response.data
  },

  /**
   * Clôturer un sprint
   */
  async close(
    sprintId: number, 
    options?: {
      moveIncompleteTo?: number;
      removeIncomplete?: boolean;
    }
  ): Promise<any> {
    const response = await apiClient.post(`/sprints/${sprintId}/close`, options);
    return response.data;
  },

  /**
   * Supprimer un sprint
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/sprints/${id}`);
  }
};

export default sprintApi;