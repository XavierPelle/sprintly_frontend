import apiClient from './client';
import type { Comment } from '@/types/ticket.types';

export interface CreateCommentPayload {
  description: string;
}

export const commentApi = {
  /**
   * Créer un commentaire sur un ticket
   */
  async createOnTicket(ticketId: number, payload: CreateCommentPayload): Promise<Comment> {
    const response = await apiClient.post<Comment>(`/comments/ticket/${ticketId}`, payload);
    return response.data;
  },

  /**
   * Mettre à jour un commentaire
   */
  async update(id: number, payload: CreateCommentPayload): Promise<Comment> {
    const response = await apiClient.put<Comment>(`/comments/${id}`, payload);
    return response.data;
  },

  /**
   * Supprimer un commentaire
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/comments/${id}`);
  }
};

export default commentApi;