// src/api/ticket.api.ts

import apiClient from './client';
import type { Ticket, TicketDetails, CreateTicketPayload, TicketStatus } from '@/types/ticket.types';

export interface SearchTicketsParams {
    query?: string;
    status?: TicketStatus;
    type?: string;
    assignee?: number;
    creatorId?: number;
    sprintId?: number;
    minPoints?: number;
    maxPoints?: number;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    sortBy?: 'createdAt' | 'updatedAt' | 'difficultyPoints' | 'key';
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
}

export interface TagSuggestion {
    content: string;
    color: string;
    count: number;
}

export interface SearchTicketsResponse {
    tickets: Ticket[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface Tag {
    id: number;
    content: string;
    color: string;
    createdAt: Date;
}

export interface AddTagResponse {
    ticketId: number;
    ticketKey: string;
    tag: Tag;
    message: string;
}

export interface RemoveTagResponse {
    ticketId: number;
    ticketKey: string;
    tagId: number;
    tagContent: string;
    message: string;
}

export const ticketApi = {
    /**
     * Récupérer tous les tickets
     */
    async getAll(): Promise<Ticket[]> {
        const response = await apiClient.get<Ticket[]>('/tickets');
        return response.data;
    },

    /**
     * Rechercher des tickets avec filtres
     */
    async search(params: SearchTicketsParams): Promise<SearchTicketsResponse> {
        const response = await apiClient.get<SearchTicketsResponse>('/tickets/search', { params });
        return response.data;
    },

    /**
     * Récupérer un ticket par ID
     */
    async getById(id: number): Promise<Ticket> {
        const response = await apiClient.get<Ticket>(`/tickets/${id}`);
        return response.data;
    },

    /**
     * Récupérer les détails complets d'un ticket
     */
    async getDetails(id: number): Promise<TicketDetails> {
        const response = await apiClient.get<TicketDetails>(`/tickets/${id}/details`);
        return response.data;
    },

    /**
     * Créer un nouveau ticket
     */
    async create(payload: CreateTicketPayload): Promise<Ticket> {
        const response = await apiClient.post<Ticket>('/tickets/create', payload);
        return response.data;
    },

    /**
     * Mettre à jour un ticket
     */
    async update(id: number, payload: Partial<CreateTicketPayload>): Promise<Ticket> {
        const response = await apiClient.put<Ticket>(`/tickets/${id}`, payload);
        return response.data;
    },

    /**
     * Assigner un ticket à un utilisateur
     */
    async assign(ticketId: number, userId: number | null): Promise<{ message: string }> {
        const response = await apiClient.put(`/tickets/${ticketId}/assign`, { userId });
        return response.data;
    },

    /**
     * Ajouter des tickets à un sprint
     */
    async addToSprint(sprintId: number, ticketIds: number[]): Promise<{ message: string }> {
        const response = await apiClient.post(`/sprints/${sprintId}/tickets`, { ticketIds });
        return response.data;
    },

    /**
     * Changer le statut d'un ticket
     */
    async changeStatus(ticketId: number, status: TicketStatus): Promise<{ message: string }> {
        const response = await apiClient.patch(`/tickets/${ticketId}/status`, { status });
        return response.data;
    },

    /**
     * Ajouter un tag à un ticket
     */
    async addTag(ticketId: number, content: string, color: string): Promise<AddTagResponse> {
        const response = await apiClient.post<AddTagResponse>(`/tickets/${ticketId}/tags`, {
            content,
            color
        });
        return response.data;
    },

    /**
     * Supprimer un tag d'un ticket
     */
    async removeTag(ticketId: number, tagId: number): Promise<RemoveTagResponse> {
        const response = await apiClient.delete<RemoveTagResponse>(`/tickets/${ticketId}/tags/${tagId}`);
        return response.data;
    },

    /**
     * Supprimer un ticket
     */
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/tickets/${id}`);
    },

    /**
     * Bloquer un ticket
     */
    async blockTicket(ticketId: number, reason: string): Promise<Ticket> {
        const response = await apiClient.put<Ticket>(`/tickets/${ticketId}`, {
            isBlocked: true,
            blockedReason: reason
        });
        return response.data;
    },

    /**
     * Débloquer un ticket
     */
    async unblockTicket(ticketId: number): Promise<Ticket> {
        const response = await apiClient.put<Ticket>(`/tickets/${ticketId}`, {
            isBlocked: false,
            blockedReason: ''
        });
        return response.data;
    },

    /**
     * Récupérer tous les tags existants
     */
    async getAllTags(): Promise<TagSuggestion[]> {
        const response = await apiClient.get<TagSuggestion[]>('/tickets/tags');
        return response.data;
    }
};

export default ticketApi;
