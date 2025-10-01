<!-- src/views/sprint/KanbanView.vue -->

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Kanban - Sprint en cours</h1>
        <p class="mt-1 text-sm text-gray-600">
          Glissez-déposez les tickets pour changer leur statut
        </p>
      </div>

      <!-- Filtres et actions -->
      <div class="flex items-center space-x-3">
        <select
          v-model="selectedSprintId"
          @change="loadSprintTickets"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option :value="null">Tous les sprints</option>
          <option v-for="sprint in sprints" :key="sprint.id" :value="sprint.id">
            {{ sprint.name }}
          </option>
        </select>

        <BaseButton @click="handleRefresh" :loading="loading">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </BaseButton>
      </div>
    </div>

    <!-- Stats rapides -->
    <div v-if="currentSprint" class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="grid grid-cols-5 gap-4">
        <div class="text-center">
          <p class="text-2xl font-bold text-gray-900">{{ stats.totalTickets }}</p>
          <p class="text-sm text-gray-600">Tickets</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-indigo-600">{{ stats.totalPoints }}</p>
          <p class="text-sm text-gray-600">Points totaux</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-green-600">{{ stats.completedPoints }}</p>
          <p class="text-sm text-gray-600">Points terminés</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-orange-600">{{ stats.remainingPoints }}</p>
          <p class="text-sm text-gray-600">Points restants</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-purple-600">{{ stats.progressPercentage }}%</p>
          <p class="text-sm text-gray-600">Progression</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <!-- Kanban Board -->
    <div v-else class="overflow-x-auto pb-4">
      <div class="flex space-x-4 min-w-max">
        <KanbanColumn
          ref="columnRefs"
          v-for="column in columns"
          :key="column.status"
          :status="column.status"
          :title="column.title"
          :color="column.color"
          :tickets="getTicketsByStatus(column.status)"
          @ticket-drop="handleTicketDrop"
          @ticket-click="handleTicketClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ticketApi } from '@/api/ticket.api';
import { sprintApi } from '@/api/sprint.api';
import type { Ticket, TicketStatus } from '@/types/ticket.types';
import type { Sprint } from '@/types/sprint.types';
import KanbanColumn from '@/components/features/sprint/KanbanColumn.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const router = useRouter();

const tickets = ref<Ticket[]>([]);
const sprints = ref<Sprint[]>([]);
const currentSprint = ref<Sprint | null>(null);
const selectedSprintId = ref<number | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const columnRefs = ref<any[]>([]);

// Configuration des colonnes
const columns = [
  { status: 'A_FAIRE' as TicketStatus, title: 'À faire', color: '#6B7280' },
  { status: 'EN_COURS' as TicketStatus, title: 'En cours', color: '#3B82F6' },
  { status: 'REVISION' as TicketStatus, title: 'Révision', color: '#8B5CF6' },
  { status: 'DEMANDE_MODIFICATION' as TicketStatus, title: 'Modif. demandée', color: '#F97316' },
  { status: 'TEST' as TicketStatus, title: 'Test', color: '#EAB308' },
  { status: 'TEST_KO' as TicketStatus, title: 'Test KO', color: '#EF4444' },
  { status: 'TEST_OK' as TicketStatus, title: 'Test OK', color: '#10B981' },
  { status: 'PRODUCTION' as TicketStatus, title: 'Production', color: '#059669' }
];

const stats = computed(() => {
  const totalTickets = tickets.value.length;
  const totalPoints = tickets.value.reduce((sum, t) => sum + (t.difficultyPoints || 0), 0);
  
  const completedStatuses: TicketStatus[] = ['TEST_OK' as TicketStatus, 'PRODUCTION' as TicketStatus];
  const completedTickets = tickets.value.filter(t => completedStatuses.includes(t.status));
  const completedPoints = completedTickets.reduce((sum, t) => sum + (t.difficultyPoints || 0), 0);
  
  const remainingPoints = totalPoints - completedPoints;
  const progressPercentage = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  return {
    totalTickets,
    totalPoints,
    completedPoints,
    remainingPoints,
    progressPercentage
  };
});

function getTicketsByStatus(status: TicketStatus): Ticket[] {
  return tickets.value.filter(ticket => ticket.status === status);
}

async function loadSprints() {
  try {
    sprints.value = await sprintApi.getAll();
    
    // Trouver le sprint actif
    const now = new Date();
    const activeSprint = sprints.value.find(s => 
      new Date(s.startDate) <= now && new Date(s.endDate) >= now
    );
    
    if (activeSprint) {
      selectedSprintId.value = activeSprint.id;
      currentSprint.value = activeSprint;
    }
  } catch (err) {
    console.error('Failed to load sprints:', err);
  }
}

async function loadSprintTickets() {
  loading.value = true;
  error.value = null;

  try {
    if (selectedSprintId.value) {
      const response = await ticketApi.search({
        sprintId: selectedSprintId.value,
        limit: 100
      });
      tickets.value = response.tickets;
      
      currentSprint.value = sprints.value.find(s => s.id === selectedSprintId.value) || null;
    } else {
      const response = await ticketApi.search({ limit: 100 });
      tickets.value = response.tickets;
      currentSprint.value = null;
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement des tickets';
    console.error('Failed to load tickets:', err);
  } finally {
    loading.value = false;
  }
}

async function handleTicketDrop(ticket: Ticket, newStatus: TicketStatus) {
  if (ticket.status === newStatus) {
    return;
  }

  try {
    await ticketApi.changeStatus(ticket.id, newStatus);
    
    // Mettre à jour localement
    const index = tickets.value.findIndex(t => t.id === ticket.id);
    if (index !== -1) {
      tickets.value[index].status = newStatus;
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du changement de statut';
    console.error('Failed to update ticket status:', err);
    
    // Recharger les tickets en cas d'erreur
    await loadSprintTickets();
  }
}

function handleTicketClick(ticket: Ticket) {
  router.push(`/tickets/${ticket.id}`);
}

async function handleRefresh() {
  await loadSprintTickets();
}

onMounted(async () => {
  await loadSprints();
  await loadSprintTickets();
});

// Gestionnaire global de drag & drop entre colonnes
let draggedTicket: Ticket | null = null;

document.addEventListener('dragstart', (e: any) => {
  if (e.target.draggable) {
    const ticketId = parseInt(e.target.dataset?.ticketId);
    if (ticketId) {
      draggedTicket = tickets.value.find(t => t.id === ticketId) || null;
    }
  }
});

document.addEventListener('drop', (e: any) => {
  const columnElement = e.target.closest('[data-column-status]');
  if (columnElement && draggedTicket) {
    const newStatus = columnElement.dataset.columnStatus as TicketStatus;
    handleTicketDrop(draggedTicket, newStatus);
  }
  draggedTicket = null;
});
</script>