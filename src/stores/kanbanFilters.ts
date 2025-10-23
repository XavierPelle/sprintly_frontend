// stores/kanbanFilters.ts
import { defineStore } from 'pinia';
import type { TicketType } from '@/types/ticket.types';

const FILTERS_STORAGE_KEY = 'kanban-filters';

interface KanbanFilters {
    types: TicketType[];
    assigneeIds: number[];
    points: number[];
    tags: number[];
    search: string;
}

export const useKanbanFiltersStore = defineStore('kanbanFilters', {
    state: (): KanbanFilters => {
        // Charger depuis localStorage au démarrage
        try {
            const stored = localStorage.getItem(FILTERS_STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Erreur chargement filtres:', error);
        }

        return {
            types: [],
            assigneeIds: [],
            points: [],
            tags: [],
            search: ''
        };
    },

    actions: {
        toggleType(type: TicketType) {
            const index = this.types.indexOf(type);
            if (index > -1) {
                this.types.splice(index, 1);
            } else {
                this.types.push(type);
            }
            this.save();
        },

        toggleAssignee(id: number) {
            const index = this.assigneeIds.indexOf(id);
            if (index > -1) {
                this.assigneeIds.splice(index, 1);
            } else {
                this.assigneeIds.push(id);
            }
            this.save();
        },

        togglePoints(points: number) {
            const index = this.points.indexOf(points);
            if (index > -1) {
                this.points.splice(index, 1);
            } else {
                this.points.push(points);
            }
            this.save();
        },

        toggleTag(tagId: number) {
            const index = this.tags.indexOf(tagId);
            if (index > -1) {
                this.tags.splice(index, 1);
            } else {
                this.tags.push(tagId);
            }
            this.save();
        },

        clearTags() {
            this.tags = [];
            this.save();
        },

        reset() {
            this.$patch({
                types: [],
                assigneeIds: [],
                points: [],
                tags: [],
                search: ''
            });
            this.save();
        },

        save() {
            try {
                localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(this.$state));
            } catch (error) {
                console.error('Erreur sauvegarde filtres:', error);
            }
        }
    },

    getters: {
        hasActiveFilters: (state) => {
            return state.types.length > 0 ||
                state.assigneeIds.length > 0 ||
                state.points.length > 0 ||
                state.tags.length > 0 ||
                state.search !== '';
        }
    }
});
