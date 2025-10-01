<!-- src/components/features/sprint/SprintCard.vue -->

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center space-x-3">
            <h3 
              class="text-lg font-semibold text-gray-900 cursor-pointer hover:text-indigo-600"
              @click="$emit('click', sprint)"
            >
              {{ sprint.name }}
            </h3>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="statusClass"
            >
              {{ statusLabel }}
            </span>
          </div>
          <p class="mt-1 text-sm text-gray-600">
            {{ formatDateRange(sprint.startDate, sprint.endDate) }}
          </p>
          
          <!-- Days remaining/elapsed -->
          <div class="mt-2 flex items-center text-xs text-gray-500">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ daysInfo }}
          </div>
        </div>
        
        <!-- Actions -->
        <div v-if="showActions" class="flex items-center space-x-2">
          <button
            @click="$emit('edit', sprint)"
            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="Modifier"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            @click="$emit('delete', sprint)"
            class="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            title="Supprimer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ ticketCount }}</p>
          <p class="text-xs text-gray-600">Tickets</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-indigo-600">{{ currentPoints }}</p>
          <p class="text-xs text-gray-600">Points</p>
        </div>
        <div>
          <p 
            class="text-2xl font-bold"
            :class="isOverCapacity ? 'text-red-600' : 'text-green-600'"
          >
            {{ sprint.maxPoints }}
          </p>
          <p class="text-xs text-gray-600">Max points</p>
        </div>
      </div>
      
      <!-- Progress bar -->
      <div class="mt-4">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs text-gray-600">Capacité</span>
          <span 
            class="text-xs font-medium"
            :class="isOverCapacity ? 'text-red-600' : 'text-gray-900'"
          >
            {{ capacityPercentage }}%
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="h-2 rounded-full transition-all duration-500"
            :class="isOverCapacity ? 'bg-red-600' : 'bg-indigo-600'"
            :style="{ width: `${Math.min(capacityPercentage, 100)}%` }"
          ></div>
        </div>
      </div>

      <!-- Over capacity warning -->
      <div v-if="isOverCapacity" class="mt-3 flex items-center text-xs text-red-600">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Sprint sur-chargé ({{ currentPoints - sprint.maxPoints }} pts au-dessus)
      </div>
    </div>

    <!-- Footer actions -->
    <div v-if="showFooter" class="px-6 py-4 flex items-center justify-between">
      <div class="text-sm text-gray-600">
        {{ ticketCount }} ticket(s)
      </div>
      <div class="flex items-center space-x-2">
        <button
          @click="$emit('view-details', sprint)"
          class="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Voir détails
        </button>
        <span class="text-gray-300">•</span>
        <button
          @click="$emit('view-kanban', sprint)"
          class="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Kanban
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Sprint } from '@/types/sprint.types';

interface Props {
  sprint: Sprint;
  ticketCount: number;
  currentPoints: number;
  showActions?: boolean;
  showFooter?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  showFooter: true
});

defineEmits<{
  click: [sprint: Sprint];
  edit: [sprint: Sprint];
  delete: [sprint: Sprint];
  'view-details': [sprint: Sprint];
  'view-kanban': [sprint: Sprint];
}>();

const isOverCapacity = computed(() => props.currentPoints > props.sprint.maxPoints);

const capacityPercentage = computed(() => 
  Math.round((props.currentPoints / props.sprint.maxPoints) * 100)
);

const sprintStatus = computed(() => {
  const now = new Date();
  const start = new Date(props.sprint.startDate);
  const end = new Date(props.sprint.endDate);

  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'active';
});

const statusClass = computed(() => {
  const classes = {
    upcoming: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800'
  };
  return classes[sprintStatus.value];
});

const statusLabel = computed(() => {
  const labels = {
    upcoming: 'À venir',
    active: 'Actif',
    completed: 'Terminé'
  };
  return labels[sprintStatus.value];
});

const daysInfo = computed(() => {
  const now = new Date();
  const start = new Date(props.sprint.startDate);
  const end = new Date(props.sprint.endDate);

  if (sprintStatus.value === 'upcoming') {
    const daysUntilStart = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return `Débute dans ${daysUntilStart} jour(s)`;
  }

  if (sprintStatus.value === 'completed') {
    const daysSinceEnd = Math.ceil((now.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
    return `Terminé depuis ${daysSinceEnd} jour(s)`;
  }

  // Active
  const daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = totalDays - daysRemaining;
  
  return `Jour ${daysElapsed}/${totalDays} - ${daysRemaining} jour(s) restant(s)`;
});

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const formatOptions: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'short',
    year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined
  };
  
  return `${start.toLocaleDateString('fr-FR', formatOptions)} - ${end.toLocaleDateString('fr-FR', formatOptions)}`;
}
</script>