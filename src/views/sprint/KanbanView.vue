<!-- src/views/sprint/KanbanView.vue -->

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Kanban Board</h1>
        <p v-if="currentSprint" class="text-xs text-gray-600">
          {{ currentSprint.name }} - {{ formatDate(currentSprint.startDate) }} au {{ formatDate(currentSprint.endDate) }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center space-x-2">
        <!-- Toggle compact mode -->
        <button
          @click="compactMode = !compactMode"
          class="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          :class="compactMode ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white text-gray-700'"
        >
          {{ compactMode ? 'Vue normale' : 'Vue compacte' }}
        </button>

        <!-- Sélecteur de sprint -->
        <select
          v-model="selectedSprintId"
          @change="handleSprintChange"
          class="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option :value="null">Sélectionner un sprint</option>
          <optgroup label="Sprints actifs">
            <option
              v-for="sprint in activeSprints"
              :key="sprint.id"
              :value="sprint.id"
            >
              {{ sprint.name }}
            </option>
          </optgroup>
          <optgroup v-if="upcomingSprints.length > 0" label="Sprints à venir">
            <option
              v-for="sprint in upcomingSprints"
              :key="sprint.id"
              :value="sprint.id"
            >
              {{ sprint.name }}
            </option>
          </optgroup>
        </select>

        <!-- Bouton refresh -->
        <BaseButton
          variant="secondary"
          size="sm"
          @click="loadTickets"
          :loading="loading"
          title="Actualiser"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </BaseButton>
      </div>
    </div>

    <!-- Sprint Stats - Version normale avec gros header -->
    <div v-if="currentSprint && tickets.length > 0 && !compactMode" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="grid grid-cols-5 gap-4 mb-4">
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
      
      <!-- Progress bar -->
      <div class="w-full bg-gray-200 rounded-full h-3">
        <div
          class="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
          :style="{ width: `${stats.progressPercentage}%` }"
        ></div>
      </div>
    </div>

    <!-- Sprint Stats - Version compacte -->
    <div v-else-if="currentSprint && tickets.length > 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div class="flex items-center justify-between text-xs">
        <div class="flex items-center space-x-6">
          <div>
            <span class="text-gray-600">Tickets:</span>
            <span class="ml-1 font-semibold text-gray-900">{{ stats.totalTickets }}</span>
          </div>
          <div>
            <span class="text-gray-600">Points:</span>
            <span class="ml-1 font-semibold text-indigo-600">{{ stats.completedPoints }}/{{ stats.totalPoints }}</span>
          </div>
          <div>
            <span class="text-gray-600">Progression:</span>
            <span class="ml-1 font-semibold text-purple-600">{{ stats.progressPercentage }}%</span>
          </div>
        </div>
        <div class="w-48">
          <div class="w-full bg-gray-200 rounded-full h-1.5">
            <div
              class="bg-gradient-to-r from-indigo-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
              :style="{ width: `${stats.progressPercentage}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !tickets.length" class="flex items-center justify-center py-8">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-2 text-xs text-gray-600">Chargement...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
      <div class="flex items-center text-sm">
        <svg class="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-800">{{ error }}</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!selectedSprintId" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
      <h3 class="mt-3 text-sm font-medium text-gray-900">Aucun sprint sélectionné</h3>
      <p class="mt-1 text-xs text-gray-600">
        Sélectionnez un sprint dans la liste ci-dessus
      </p>
    </div>

    <!-- No tickets State -->
    <div v-else-if="tickets.length === 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <h3 class="mt-3 text-sm font-medium text-gray-900">Aucun ticket</h3>
      <p class="mt-1 text-xs text-gray-600">
        Commencez par ajouter des tickets depuis le backlog
      </p>
      <router-link to="/backlog">
        <BaseButton size="sm" class="mt-3">
          Aller au Backlog
        </BaseButton>
      </router-link>
    </div>

    <!-- Kanban Columns - Vue compacte ou normale -->
    <div v-else class="overflow-x-auto pb-2">
      <div class="inline-flex space-x-2 min-h-[500px]">
        <!-- Colonne pour chaque statut -->
        <div
          v-for="column in columns"
          :key="column.status"
          class="flex-shrink-0"
          :class="compactMode ? 'w-56' : 'w-64'"
        >
          <div class="bg-gray-50 rounded-lg h-full flex flex-col">
            <!-- Column Header -->
            <div class="border-b border-gray-200" :class="compactMode ? 'px-2 py-2' : 'px-3 py-2'">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-1.5">
                  <div
                    class="w-2 h-2 rounded-full flex-shrink-0"
                    :style="{ backgroundColor: column.color }"
                  ></div>
                  <h3 class="font-semibold text-gray-900 truncate" :class="compactMode ? 'text-xs' : 'text-sm'">
                    {{ column.title }}
                  </h3>
                </div>
                <span class="font-medium text-gray-500 bg-white rounded-full" :class="compactMode ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5'">
                  {{ getTicketsByStatus(column.status).length }}
                </span>
              </div>
            </div>

            <!-- Drop Zone -->
            <div
              class="flex-1 overflow-y-auto custom-scrollbar"
              :class="[
                compactMode ? 'p-1.5 space-y-1.5' : 'p-2 space-y-2',
                {
                  'bg-indigo-50 ring-2 ring-indigo-300 ring-inset rounded': dragOverColumn === column.status
                }
              ]"
              @dragover="handleDragOver"
              @drop="handleDrop($event, column.status)"
              @dragenter="handleDragEnter(column.status)"
              @dragleave="handleDragLeave"
            >
              <!-- Ticket Cards -->
              <div
                v-for="ticket in getTicketsByStatus(column.status)"
                :key="ticket.id"
                draggable="true"
                @dragstart="handleDragStart(ticket)"
                @dragend="handleDragEnd"
                @click="handleTicketClick(ticket)"
                class="bg-white rounded border border-gray-200 cursor-move hover:shadow-md hover:border-indigo-300 transition-all"
                :class="[
                  compactMode ? 'p-2' : 'p-2.5',
                  {
                    'opacity-50 scale-95': draggedTicket?.id === ticket.id
                  }
                ]"
              >
                <!-- Ticket Header -->
                <div class="flex items-start justify-between" :class="compactMode ? 'mb-1' : 'mb-2'">
                  <div class="flex items-center space-x-1 min-w-0 flex-1">
                    <span class="font-mono font-semibold text-indigo-600 truncate" :class="compactMode ? 'text-[10px]' : 'text-[11px]'">
                      {{ ticket.key }}
                    </span>
                    <span class="flex-shrink-0" :class="compactMode ? 'text-[10px]' : 'text-xs'">
                      {{ getTypeIcon(ticket.type) }}
                    </span>
                  </div>
                  <span
                    v-if="ticket.difficultyPoints"
                    class="font-medium text-gray-500 bg-gray-100 rounded flex-shrink-0 ml-1"
                    :class="compactMode ? 'text-[9px] px-1 py-0.5' : 'text-[10px] px-1.5 py-0.5'"
                  >
                    {{ ticket.difficultyPoints }}
                  </span>
                </div>

                <!-- Ticket Title -->
                <h4
                  class="font-medium text-gray-900"
                  :class="compactMode ? 'text-[11px] mb-1.5 line-clamp-2' : 'text-xs mb-2 line-clamp-2'"
                  :title="ticket.title"
                >
                  {{ ticket.title }}
                </h4>

                <!-- Ticket Footer -->
                <div class="flex items-center justify-between">
                  <!-- Assignee -->
                  <div v-if="ticket.assignee" class="flex items-center space-x-1 min-w-0">
                    <div
                      class="bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0"
                      :class="compactMode ? 'w-4 h-4 text-[8px]' : 'w-5 h-5 text-[9px]'"
                      :title="`${ticket.assignee.firstName} ${ticket.assignee.lastName}`"
                    >
                      {{ ticket.assignee.firstName[0] }}{{ ticket.assignee.lastName[0] }}
                    </div>
                    <span class="text-[10px] text-gray-600 truncate">
                      {{ ticket.assignee.firstName }}
                    </span>
                  </div>
                  <div v-else class="text-gray-400" :class="compactMode ? 'text-[9px]' : 'text-[10px]'">
                    -
                  </div>

                  <!-- Meta icons -->
                  <div class="flex items-center space-x-0.5 flex-shrink-0">
                    <span
                      v-if="ticket.comments && ticket.comments.length > 0"
                      class="text-gray-500"
                      :class="compactMode ? 'text-[9px]' : 'text-[10px]'"
                      :title="`${ticket.comments.length} commentaires`"
                    >
                      💬{{ ticket.comments.length }}
                    </span>
                    <span
                      v-if="ticket.tests && ticket.tests.length > 0"
                      class="text-gray-500"
                      :class="compactMode ? 'text-[9px]' : 'text-[10px]'"
                      :title="`${ticket.tests.length} tests`"
                    >
                      ✓{{ ticket.tests.length }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Empty column message -->
              <div
                v-if="getTicketsByStatus(column.status).length === 0"
                class="text-center text-gray-400"
                :class="compactMode ? 'py-4 text-[10px]' : 'py-6 text-xs'"
              >
                Vide
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ticketApi } from '@/api/ticket.api';
import { sprintApi } from '@/api/sprint.api';
import type { Ticket, TicketStatus, TicketType } from '@/types/ticket.types';
import type { Sprint } from '@/types/sprint.types';
import BaseButton from '@/components/common/BaseButton.vue';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const toast = useToast();

// State
const tickets = ref<Ticket[]>([]);
const allSprints = ref<Sprint[]>([]);
const selectedSprintId = ref<number | null>(null);
const currentSprint = ref<Sprint | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const compactMode = ref(true); // Mode compact par défaut

// Drag & Drop State
const draggedTicket = ref<Ticket | null>(null);
const dragOverColumn = ref<TicketStatus | null>(null);

// Kanban Columns Configuration
const columns = [
  { status: 'A_FAIRE' as TicketStatus, title: 'À faire', color: '#6B7280' },
  { status: 'EN_COURS' as TicketStatus, title: 'En cours', color: '#3B82F6' },
  { status: 'REVISION' as TicketStatus, title: 'Révision', color: '#8B5CF6' },
  { status: 'DEMANDE_MODIFICATION' as TicketStatus, title: 'Modif.', color: '#F97316' },
  { status: 'TEST' as TicketStatus, title: 'Test', color: '#EAB308' },
  { status: 'TEST_KO' as TicketStatus, title: 'Test KO', color: '#EF4444' },
  { status: 'TEST_OK' as TicketStatus, title: 'Test OK', color: '#10B981' },
  { status: 'PRODUCTION' as TicketStatus, title: 'Production', color: '#059669' }
];

// Computed
const activeSprints = computed(() => {
  const now = new Date();
  return allSprints.value.filter(s =>
    new Date(s.startDate) <= now && new Date(s.endDate) >= now
  );
});

const upcomingSprints = computed(() => {
  const now = new Date();
  return allSprints.value.filter(s => new Date(s.startDate) > now);
});

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

// Methods
function getTicketsByStatus(status: TicketStatus): Ticket[] {
  return tickets.value.filter(ticket => ticket.status === status);
}

async function loadSprints() {
  try {
    allSprints.value = await sprintApi.getAll();

    // Auto-select active sprint
    if (activeSprints.value.length > 0 && !selectedSprintId.value) {
      selectedSprintId.value = activeSprints.value[0].id;
      currentSprint.value = activeSprints.value[0];
      await loadTickets();
    }
  } catch (err) {
    console.error('Failed to load sprints:', err);
  }
}

async function loadTickets() {
  if (!selectedSprintId.value) {
    tickets.value = [];
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await ticketApi.search({
      sprintId: selectedSprintId.value,
      limit: 200
    });

    tickets.value = response.tickets;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement des tickets';
    console.error('Failed to load tickets:', err);
  } finally {
    loading.value = false;
  }
}

async function handleSprintChange() {
  currentSprint.value = allSprints.value.find(s => s.id === selectedSprintId.value) || null;
  await loadTickets();
}

// Drag & Drop Handlers
function handleDragStart(ticket: Ticket) {
  draggedTicket.value = ticket;
}

function handleDragEnd() {
  draggedTicket.value = null;
  dragOverColumn.value = null;
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
}

function handleDragEnter(status: TicketStatus) {
  dragOverColumn.value = status;
}

function handleDragLeave() {
  dragOverColumn.value = null;
}

async function handleDrop(event: DragEvent, newStatus: TicketStatus) {
  event.preventDefault();
  dragOverColumn.value = null;

  if (!draggedTicket.value || draggedTicket.value.status === newStatus) {
    handleDragEnd();
    return;
  }

  const ticket = draggedTicket.value;
  const oldStatus = ticket.status;

  try {
    // Optimistic update
    const index = tickets.value.findIndex(t => t.id === ticket.id);
    if (index !== -1) {
      tickets.value[index].status = newStatus;
    }

    // API call
    await ticketApi.changeStatus(ticket.id, newStatus);
    toast.success(`${ticket.key} déplacé vers "${columns.find(c => c.status === newStatus)?.title}"`);
  } catch (err: any) {
    // Revert on error
    const index = tickets.value.findIndex(t => t.id === ticket.id);
    if (index !== -1) {
      tickets.value[index].status = oldStatus;
    }
    toast.error(`Échec du changement de statut`);
    error.value = err.response?.data?.message || 'Erreur lors du changement de statut';
    console.error('Failed to update ticket status:', err);
  } finally {
    handleDragEnd();
  }
}

function handleTicketClick(ticket: Ticket) {
  router.push(`/tickets/${ticket.id}`);
}

function getTypeIcon(type: TicketType): string {
  const icons: Record<TicketType, string> = {
    bug: '🐛',
    feature: '✨',
    task: '📋',
    improvement: '⚡'
  };
  return icons[type] || '📋';
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

onMounted(async () => {
  await loadSprints();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>