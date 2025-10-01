<!-- Filter tabs -->

<template>
    <div v-if="!loading && sprints.length > 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center space-x-2 flex-wrap">
          <button
            v-for="filter in sprintFilters"
            :key="filter.value"
            @click="activeFilter = filter.value"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="activeFilter === filter.value 
              ? 'bg-indigo-100 text-indigo-700' 
              : 'text-gray-600 hover:bg-gray-100'"
          >
            {{ filter.label }}
            <span 
              class="ml-2 px-2 py-0.5 rounded-full text-xs"
              :class="activeFilter === filter.value 
                ? 'bg-indigo-200 text-indigo-900' 
                : 'bg-gray-200 text-gray-700'"
            >
              {{ getFilterCount(filter.value) }}
            </span>
          </button>
        </div>
        
        <!-- Sort options -->
        <div class="flex items-center space-x-3">
          <label class="text-sm text-gray-600">Trier par :</label>
          <select
            v-model="sortBy"
            class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="startDate">Date de début</option>
            <option value="name">Nom</option>
            <option value="capacity">Capacité</option>
          </select>
        </div>
      </div>
    </div>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestion des Sprints</h1>
        <p class="mt-1 text-sm text-gray-600">
          Gérez vos sprints et organisez les tickets
        </p>
      </div>
      <BaseButton @click="showCreateSprintModal = true">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Créer un sprint
      </BaseButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
      <BaseButton variant="secondary" size="sm" class="mt-3" @click="loadSprints">
        Réessayer
      </BaseButton>
    </div>

    <!-- Stats Overview -->
    <SprintStats
      v-if="!loading && sprints.length > 0"
      :stats="sprintStats"
      :active-sprints-with-capacity="activeSprintsCapacity"
    />
    <div v-if="!loading && sprints.length > 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
      <div class="flex items-center space-x-2">
        <button
          v-for="filter in sprintFilters"
          :key="filter.value"
          @click="activeFilter = filter.value"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="activeFilter === filter.value 
            ? 'bg-indigo-100 text-indigo-700' 
            : 'text-gray-600 hover:bg-gray-100'"
        >
          {{ filter.label }}
          <span 
            class="ml-2 px-2 py-0.5 rounded-full text-xs"
            :class="activeFilter === filter.value 
              ? 'bg-indigo-200 text-indigo-900' 
              : 'bg-gray-200 text-gray-700'"
          >
            {{ getFilterCount(filter.value) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Sprints Grid -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Sprint Card using the new component -->
      <SprintCard
        v-for="sprint in filteredSprints"
        :key="sprint.id"
        :sprint="sprint"
        :ticket-count="getSprintTickets(sprint.id).length"
        :current-points="getSprintPoints(sprint.id)"
        @click="handleViewSprintDetails"
        @edit="handleEditSprint"
        @delete="handleDeleteSprint"
        @view-details="handleViewSprintDetails"
        @view-kanban="handleViewSprintKanban"
        >
        <!-- Toggle tickets list button -->
        <template #footer>
          <div class="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <button
              @click="toggleSprintExpansion(sprint.id)"
              class="w-full flex items-center justify-center space-x-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <span>
                {{ expandedSprints.has(sprint.id) ? 'Masquer' : 'Voir' }} les tickets 
                ({{ getSprintTickets(sprint.id).length }})
              </span>
              <svg 
                class="w-4 h-4 transition-transform"
                :class="{ 'rotate-180': expandedSprints.has(sprint.id) }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </template>
      </SprintCard>
      
      <!-- Expanded tickets list -->
      <div 
        v-if="expandedSprints.has(sprint.id)" 
        class="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            Tickets de {{ sprint.name }}
          </h3>
          <div class="flex items-center space-x-3">
            <button
              @click="handleAddTicketsToSprint(sprint)"
              class="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Ajouter des tickets
            </button>
            <button
              @click="toggleSprintExpansion(sprint.id)"
              class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Fermer"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6">
          <div v-if="getSprintTickets(sprint.id).length > 0" class="space-y-3">
            <div
              v-for="ticket in getSprintTickets(sprint.id)"
              :key="ticket.id"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all group"
            >
              <div 
                class="flex-1 min-w-0 cursor-pointer" 
                @click="router.push(`/tickets/${ticket.id}`)"
              >
                <div class="flex items-center space-x-2 mb-2">
                  <span class="text-sm font-mono font-semibold text-indigo-600">
                    {{ ticket.key }}
                  </span>
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {{ ticket.type }}
                  </span>
                  <span 
                    v-if="ticket.difficultyPoints" 
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700"
                  >
                    {{ ticket.difficultyPoints }} pts
                  </span>
                </div>
                <p class="text-sm font-medium text-gray-900 mb-1">{{ ticket.title }}</p>
                <div class="flex items-center space-x-4 text-xs text-gray-500">
                  <span v-if="ticket.assignee" class="flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {{ ticket.assignee.firstName }} {{ ticket.assignee.lastName }}
                  </span>
                  <span v-else class="text-gray-400">Non assigné</span>
                  <span class="flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {{ ticket.status }}
                  </span>
                </div>
              </div>
              <button
                @click="handleRemoveTicketFromSprint(sprint, ticket)"
                class="ml-4 p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                title="Retirer du sprint"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div v-else class="text-center py-12">
            <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 class="mt-4 text-sm font-medium text-gray-900">Aucun ticket</h3>
            <p class="mt-2 text-sm text-gray-500">Commencez par ajouter des tickets à ce sprint</p>
            <button
              @click="handleAddTicketsToSprint(sprint)"
              class="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Ajouter des tickets
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="sprints.length === 0" class="col-span-2">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Aucun sprint</h3>
          <p class="mt-2 text-sm text-gray-600">
            Commencez par créer votre premier sprint pour organiser votre travail
          </p>
          <BaseButton class="mt-4" @click="showCreateSprintModal = true">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Créer mon premier sprint
          </BaseButton>
        </div>
      </div>
      
      <!-- No results for filter -->
      <div v-else-if="filteredSprints.length === 0" class="col-span-2">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Aucun résultat</h3>
          <p class="mt-2 text-sm text-gray-600">
            Aucun sprint ne correspond aux filtres sélectionnés
          </p>
          <BaseButton 
            variant="secondary" 
            class="mt-4" 
            @click="activeFilter = 'all'"
          >
            Réinitialiser les filtres
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Modal Create/Edit Sprint -->
    <BaseModal
      v-model="showCreateSprintModal"
      :title="editingSprint ? 'Modifier le sprint' : 'Créer un sprint'"
      size="md"
    >
      <div class="space-y-4">
        <BaseInput
          v-model="sprintForm.name"
          label="Nom du sprint"
          placeholder="Sprint 1"
          required
        />
        <BaseInput
          v-model.number="sprintForm.maxPoints"
          type="number"
          label="Points maximum"
          placeholder="100"
          required
        />
        <div class="grid grid-cols-2 gap-4">
          <BaseInput
            v-model="sprintForm.startDate"
            type="date"
            label="Date de début"
            required
          />
          <BaseInput
            v-model="sprintForm.endDate"
            type="date"
            label="Date de fin"
            required
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <BaseButton variant="secondary" @click="cancelSprintForm">
            Annuler
          </BaseButton>
          <BaseButton
            @click="handleSaveSprint"
            :loading="savingSprint"
          >
            {{ editingSprint ? 'Modifier' : 'Créer' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Modal Add Tickets to Sprint -->
    <BaseModal
      v-model="showAddTicketsModal"
      :title="`Ajouter des tickets à ${selectedSprint?.name}`"
      size="lg"
    >
      <TicketSelector
        :tickets="availableTickets"
        v-model="selectedTicketsForSprint"
        :loading="false"
        empty-message="Aucun ticket disponible dans le backlog"
      />
      
      <template #footer>
        <div class="flex justify-end space-x-3">
          <BaseButton variant="secondary" @click="cancelAddTickets">
            Annuler
          </BaseButton>
          <BaseButton
            @click="handleConfirmAddTickets"
            :disabled="selectedTicketsForSprint.length === 0"
            :loading="addingTickets"
          >
            Ajouter {{ selectedTicketsForSprint.length }} ticket(s)
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { sprintApi } from '@/api/sprint.api';
import { ticketApi } from '@/api/ticket.api';
import type { Sprint, CreateSprintPayload } from '@/types/sprint.types';
import type { Ticket, TicketType } from '@/types/ticket.types';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import SprintCard from './SprintCard.vue';
import SprintStats from './SprintStats.vue';
import TicketSelector from '@/components/features/ticket/TicketSelector.vue';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const toast = useToast();

// State
const sprints = ref<Sprint[]>([]);
const allTickets = ref<Ticket[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const expandedSprints = ref<Set<number>>(new Set());

// Filters
const activeFilter = ref<'all' | 'active' | 'upcoming' | 'completed'>('all');
const sortBy = ref<'startDate' | 'name' | 'capacity'>('startDate');
const sprintFilters = [
  { value: 'all' as const, label: 'Tous' },
  { value: 'active' as const, label: 'Actifs' },
  { value: 'upcoming' as const, label: 'À venir' },
  { value: 'completed' as const, label: 'Terminés' }
];

// Modals
const showCreateSprintModal = ref(false);
const showAddTicketsModal = ref(false);

// Forms
const editingSprint = ref<Sprint | null>(null);
const sprintForm = ref<CreateSprintPayload>({
  name: '',
  maxPoints: 100,
  startDate: '',
  endDate: ''
});
const savingSprint = ref(false);

// Add tickets
const selectedSprint = ref<Sprint | null>(null);
const selectedTicketsForSprint = ref<number[]>([]);
const addingTickets = ref(false);

// Computed
const availableTickets = computed(() => {
  return allTickets.value.filter(ticket => !ticket.sprint);
});

const filteredSprints = computed(() => {
  const now = new Date();
  
  let filtered = sprints.value.filter(sprint => {
    if (activeFilter.value === 'all') return true;
    
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    
    if (activeFilter.value === 'active') {
      return now >= start && now <= end;
    }
    
    if (activeFilter.value === 'upcoming') {
      return now < start;
    }
    
    if (activeFilter.value === 'completed') {
      return now > end;
    }
    
    return true;
  });
  
  // Apply sorting
  filtered.sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name);
    }
    
    if (sortBy.value === 'capacity') {
      const aPoints = getSprintPoints(a.id);
      const bPoints = getSprintPoints(b.id);
      const aCapacity = (aPoints / a.maxPoints) * 100;
      const bCapacity = (bPoints / b.maxPoints) * 100;
      return bCapacity - aCapacity;
    }
    
    // Default: startDate
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });
  
  return filtered;
});

const filteredAvailableTickets = ref<Ticket[]>([]);

// Computed - Stats
const sprintStats = computed(() => {
  const now = new Date();
  
  const active = sprints.value.filter(s => {
    const start = new Date(s.startDate);
    const end = new Date(s.endDate);
    return now >= start && now <= end;
  }).length;
  
  const upcoming = sprints.value.filter(s => {
    const start = new Date(s.startDate);
    return now < start;
  }).length;
  
  const completed = sprints.value.filter(s => {
    const end = new Date(s.endDate);
    return now > end;
  }).length;
  
  const totalTickets = allTickets.value.filter(t => t.sprint).length;
  const totalPoints = allTickets.value
    .filter(t => t.sprint)
    .reduce((sum, t) => sum + (t.difficultyPoints || 0), 0);
  
  const averageTicketsPerSprint = sprints.value.length > 0 
    ? Math.round(totalTickets / sprints.value.length) 
    : 0;
  
  return {
    total: sprints.value.length,
    active,
    upcoming,
    completed,
    totalTickets,
    totalPoints,
    averageTicketsPerSprint
  };
});

const activeSprintsCapacity = computed(() => {
  const now = new Date();
  
  return sprints.value
    .filter(s => {
      const start = new Date(s.startDate);
      const end = new Date(s.endDate);
      return now >= start && now <= end;
    })
    .map(sprint => {
      const currentPoints = getSprintPoints(sprint.id);
      const capacityPercentage = Math.round((currentPoints / sprint.maxPoints) * 100);
      
      return {
        id: sprint.id,
        name: sprint.name,
        currentPoints,
        maxPoints: sprint.maxPoints,
        capacityPercentage,
        isOverCapacity: currentPoints > sprint.maxPoints
      };
    });
});

// Methods
function getFilterCount(filter: 'all' | 'active' | 'upcoming' | 'completed'): number {
  const now = new Date();
  
  if (filter === 'all') return sprints.value.length;
  
  return sprints.value.filter(sprint => {
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    
    if (filter === 'active') return now >= start && now <= end;
    if (filter === 'upcoming') return now < start;
    if (filter === 'completed') return now > end;
    
    return false;
  }).length;
}

// Methods
function getSprintTickets(sprintId: number): Ticket[] {
  return allTickets.value.filter(ticket => ticket.sprint?.id === sprintId);
}

function getSprintPoints(sprintId: number): number {
  return getSprintTickets(sprintId).reduce((sum, ticket) => sum + (ticket.difficultyPoints || 0), 0);
}

async function loadSprints() {
  loading.value = true;
  error.value = null;

  try {
    sprints.value = await sprintApi.getAll();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement des sprints';
    toast.error('Échec du chargement des sprints');
  } finally {
    loading.value = false;
  }
}

async function loadTickets() {
  try {
    const response = await ticketApi.search({ limit: 500 });
    allTickets.value = response.tickets;
  } catch (err) {
    console.error('Failed to load tickets:', err);
  }
}

function handleEditSprint(sprint: Sprint) {
  editingSprint.value = sprint;
  sprintForm.value = {
    name: sprint.name,
    maxPoints: sprint.maxPoints,
    startDate: sprint.startDate.split('T')[0],
    endDate: sprint.endDate.split('T')[0]
  };
  showCreateSprintModal.value = true;
}

async function handleSaveSprint() {
  savingSprint.value = true;

  try {
    if (editingSprint.value) {
      await sprintApi.update(editingSprint.value.id, sprintForm.value);
      toast.success('Sprint modifié avec succès');
    } else {
      await sprintApi.create(sprintForm.value);
      toast.success('Sprint créé avec succès');
    }

    showCreateSprintModal.value = false;
    cancelSprintForm();
    await loadSprints();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la sauvegarde';
    toast.error('Échec de la sauvegarde du sprint');
  } finally {
    savingSprint.value = false;
  }
}

function cancelSprintForm() {
  editingSprint.value = null;
  sprintForm.value = {
    name: '',
    maxPoints: 100,
    startDate: '',
    endDate: ''
  };
  showCreateSprintModal.value = false;
}

async function handleDeleteSprint(sprint: Sprint) {
  if (!confirm(`Voulez-vous vraiment supprimer le sprint "${sprint.name}" ?`)) {
    return;
  }

  try {
    await sprintApi.delete(sprint.id);
    toast.success('Sprint supprimé avec succès');
    await Promise.all([loadSprints(), loadTickets()]);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la suppression';
    toast.error('Échec de la suppression du sprint');
  }
}

function handleAddTicketsToSprint(sprint: Sprint) {
  selectedSprint.value = sprint;
  selectedTicketsForSprint.value = [];
  showAddTicketsModal.value = true;
}

async function handleConfirmAddTickets() {
  if (!selectedSprint.value || selectedTicketsForSprint.value.length === 0) {
    return;
  }

  addingTickets.value = true;

  try {
    await sprintApi.addTickets(selectedSprint.value.id, selectedTicketsForSprint.value);
    
    toast.success(`${selectedTicketsForSprint.value.length} ticket(s) ajouté(s) au sprint`);
    
    cancelAddTickets();
    await loadTickets();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de l\'ajout des tickets';
    toast.error('Échec de l\'ajout des tickets');
  } finally {
    addingTickets.value = false;
  }
}

function cancelAddTickets() {
  selectedSprint.value = null;
  selectedTicketsForSprint.value = [];
  showAddTicketsModal.value = false;
}

async function handleRemoveTicketFromSprint(sprint: Sprint, ticket: Ticket) {
  const pointsLost = ticket.difficultyPoints || 0;
  const message = pointsLost > 0 
    ? `Retirer "${ticket.key}" du sprint "${sprint.name}" ?\n\nCela libérera ${pointsLost} point(s).`
    : `Retirer "${ticket.key}" du sprint "${sprint.name}" ?`;
    
  if (!confirm(message)) {
    return;
  }

  try {
    await sprintApi.removeTickets(sprint.id, [ticket.id]);
    
    toast.success(`Ticket ${ticket.key} retiré du sprint`);
    
    await loadTickets();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du retrait du ticket';
    toast.error('Échec du retrait du ticket');
  }
}

function handleViewSprintDetails(sprint: Sprint) {
  router.push(`/sprint/${sprint.id}/details`);
}

function handleViewSprintKanban(sprint: Sprint) {
  router.push({
    path: '/sprint/kanban',
    query: { sprintId: sprint.id }
  });
}

function toggleSprintExpansion(sprintId: number) {
  if (expandedSprints.value.has(sprintId)) {
    expandedSprints.value.delete(sprintId);
  } else {
    expandedSprints.value.add(sprintId);
  }
}

onMounted(async () => {
  await Promise.all([loadSprints(), loadTickets()]);
});
</script>