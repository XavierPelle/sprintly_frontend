<!-- src/components/features/ticket/TicketSelector.vue -->

<template>
  <div class="space-y-4">
    <!-- Search and filters -->
    <div class="space-y-3">
      <!-- Search bar -->
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="searchPlaceholder"
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          @input="handleSearch"
        />
      </div>

      <!-- Filters -->
      <div v-if="showFilters" class="grid grid-cols-2 gap-3">
        <select
          v-model="filterType"
          @change="handleFilterChange"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option :value="null">Tous les types</option>
          <option value="bug">🐛 Bug</option>
          <option value="feature">✨ Feature</option>
          <option value="task">📋 Tâche</option>
          <option value="improvement">⚡ Amélioration</option>
        </select>

        <select
          v-model="sortBy"
          @change="handleFilterChange"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="createdAt">Plus récent</option>
          <option value="difficultyPoints">Points</option>
          <option value="key">Clé</option>
        </select>
      </div>
    </div>

    <!-- Selection summary -->
    <div 
      v-if="selectedTickets.length > 0" 
      class="bg-indigo-50 border border-indigo-200 rounded-lg p-3"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <span class="text-sm font-medium text-indigo-900">
            {{ selectedTickets.length }} sélectionné(s)
          </span>
          <span class="text-sm font-medium text-indigo-900">
            {{ selectedPoints }} points
          </span>
        </div>
        <button
          @click="clearSelection"
          class="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Tout désélectionner
        </button>
      </div>
    </div>

    <!-- Tickets list -->
    <div class="max-h-96 overflow-y-auto space-y-2">
      <div
        v-for="ticket in filteredTickets"
        :key="ticket.id"
        class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer transition-colors"
        :class="{ 
          'bg-indigo-50 border-indigo-300': isSelected(ticket.id),
          'opacity-50': isDisabled(ticket)
        }"
        @click="!isDisabled(ticket) && toggleSelection(ticket.id)"
      >
        <!-- Checkbox -->
        <input
          type="checkbox"
          :checked="isSelected(ticket.id)"
          :disabled="isDisabled(ticket)"
          class="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          @click.stop="!isDisabled(ticket) && toggleSelection(ticket.id)"
        />

        <!-- Ticket info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2 mb-1 flex-wrap">
            <span class="text-xs font-mono font-semibold text-indigo-600">
              {{ ticket.key }}
            </span>
            <span
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              :class="getTypeClass(ticket.type)"
            >
              {{ getTypeIcon(ticket.type) }}
            </span>
            <span class="text-xs font-medium text-gray-500">
              {{ ticket.difficultyPoints }} pts
            </span>
            <span
              v-if="ticket.assignee"
              class="inline-flex items-center text-xs text-gray-500"
            >
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {{ ticket.assignee.firstName }}
            </span>
          </div>
          <p class="text-sm text-gray-900">{{ ticket.title }}</p>
          
          <!-- Additional info -->
          <div v-if="showAdditionalInfo" class="mt-1 flex items-center space-x-3 text-xs text-gray-500">
            <span v-if="ticket.sprint" class="flex items-center">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {{ ticket.sprint.name }}
            </span>
            <span class="flex items-center">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ formatDate(ticket.createdAt) }}
            </span>
          </div>
        </div>

        <!-- Disabled indicator -->
        <div v-if="isDisabled(ticket)" class="flex-shrink-0">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredTickets.length === 0" class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-2 text-sm text-gray-500">
          {{ emptyMessage }}
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-2 text-sm text-gray-500">Chargement...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Ticket, TicketType } from '@/types/ticket.types';

interface Props {
  tickets: Ticket[];
  modelValue: number[];
  loading?: boolean;
  showFilters?: boolean;
  showAdditionalInfo?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabledTicketIds?: number[];
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showFilters: true,
  showAdditionalInfo: true,
  searchPlaceholder: 'Rechercher un ticket...',
  emptyMessage: 'Aucun ticket trouvé',
  disabledTicketIds: () => []
});

const emit = defineEmits<{
  'update:modelValue': [value: number[]];
}>();

// Local state
const searchQuery = ref('');
const filterType = ref<TicketType | null>(null);
const sortBy = ref<'createdAt' | 'difficultyPoints' | 'key'>('createdAt');

// Computed
const selectedTickets = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const selectedPoints = computed(() => {
  return props.tickets
    .filter(ticket => selectedTickets.value.includes(ticket.id))
    .reduce((sum, ticket) => sum + (ticket.difficultyPoints || 0), 0);
});

const filteredTickets = computed(() => {
  let result = [...props.tickets];

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(ticket => 
      ticket.key.toLowerCase().includes(query) ||
      ticket.title.toLowerCase().includes(query) ||
      ticket.description.toLowerCase().includes(query)
    );
  }

  // Type filter
  if (filterType.value) {
    result = result.filter(ticket => ticket.type === filterType.value);
  }

  // Sort
  result.sort((a, b) => {
    if (sortBy.value === 'difficultyPoints') {
      return (b.difficultyPoints || 0) - (a.difficultyPoints || 0);
    }
    if (sortBy.value === 'key') {
      return a.key.localeCompare(b.key);
    }
    // createdAt
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return result;
});

// Methods
function isSelected(ticketId: number): boolean {
  return selectedTickets.value.includes(ticketId);
}

function isDisabled(ticket: Ticket): boolean {
  return props.disabledTicketIds.includes(ticket.id);
}

function toggleSelection(ticketId: number) {
  const index = selectedTickets.value.indexOf(ticketId);
  const newSelection = [...selectedTickets.value];
  
  if (index === -1) {
    newSelection.push(ticketId);
  } else {
    newSelection.splice(index, 1);
  }
  
  selectedTickets.value = newSelection;
}

function clearSelection() {
  selectedTickets.value = [];
}

function handleSearch() {
  // Search is reactive through computed property
}

function handleFilterChange() {
  // Filter is reactive through computed property
}

function getTypeClass(type: TicketType): string {
  const classes: Record<TicketType, string> = {
    bug: 'bg-red-50 text-red-700 border border-red-200',
    feature: 'bg-blue-50 text-blue-700 border border-blue-200',
    task: 'bg-gray-50 text-gray-700 border border-gray-200',
    improvement: 'bg-green-50 text-green-700 border border-green-200'
  };
  return classes[type];
}

function getTypeIcon(type: TicketType): string {
  const icons: Record<TicketType, string> = {
    bug: '🐛',
    feature: '✨',
    task: '📋',
    improvement: '⚡'
  };
  return icons[type];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
</script>