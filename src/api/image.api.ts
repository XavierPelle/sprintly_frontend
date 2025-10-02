// src/api/image.api.ts

import apiClient from './client';

export interface UploadImageResponse {
    id: number;
    url: string;
    filename: string;
    displayOrder: number;
    type: string;
    ticketId: number;
    uploadedAt: string;
}

export const imageApi = {
    /**
     * Upload une image pour un ticket
     */
    async uploadForTicket(ticketId: number, files: File[], type: string): Promise<UploadImageResponse[]> {
        const formData = new FormData();
        formData.append('entityId', ticketId.toString());
        formData.append('type', type);
        files.forEach(file => formData.append('files', file));

        const response = await apiClient.post<UploadImageResponse[]>(
            `/images/upload`,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' }
            }
        );
        return response.data;
    },



    /**
     * Supprimer une image
     */
    async delete(imageId: number): Promise<void> {
        await apiClient.delete(`/images/${imageId}`);
    },

    /**
     * Réorganiser les images (changer l'ordre d'affichage)
     */
    async reorder(ticketId: number, imageOrders: { imageId: number; displayOrder: number }[]): Promise<void> {
        await apiClient.put(`/tickets/${ticketId}/images/reorder`, {
            orders: imageOrders
        });
    },

    /**
     * Télécharger une image
     */
    getDownloadUrl(imageId: number): string {
        return `${apiClient.defaults.baseURL}/images/${imageId}/download`;
    }
};

export default imageApi;