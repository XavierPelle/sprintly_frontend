<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Vue d'ensemble</h3>
    
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <!-- Total sprints -->
      <div class="text-center p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-center mb-2">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
        <p class="text-xs text-gray-600 mt-1">Total sprints</p>
      </div>

      <!-- Active sprints -->
      <div class="text-center p-4 bg-green-50 rounded-lg">
        <div class="flex items-center justify-center mb-2">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-2xl font-bold text-green-600">{{ stats.active }}</p>
        <p class="text-xs text-gray-600 mt-1">Actifs</p>
      </div>

      <!-- Upcoming sprints -->
      <div class="text-center p-4 bg-blue-50 rounded-lg">
        <div class="flex items-center justify-center mb-2">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="text-2xl font-bold text-blue-600">{{ stats.upcoming }}</p>
        <p class="text-xs text-gray-600 mt-1">À venir</p>
      </div>

      <!-- Completed sprints -->
      <div class="text-center p-4 bg-purple-50 rounded-lg">
        <div class="flex items-center justify-center mb-2">
          <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p class="text-2xl font-bold text-purple-600">{{ stats.completed }}</p>
        <p class="text-xs text-gray-600 mt-1">Terminés</p>
      </div>
    </div>

    <!-- Additional stats -->
    <div class="mt-6 pt-6 border-t border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-indigo-100 rounded-lg">
              <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-600">Total tickets</p>
              <p class="text-lg font-bold text-gray-900">{{ stats.totalTickets }}</p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-indigo-100 rounded-lg">
              <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-600">Total points</p>
              <p class="text-lg font-bold text-gray-900">{{ stats.totalPoints }}</p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-600">Moy. par sprint</p>
              <p class="text-lg font-bold text-gray-900">{{ stats.averageTicketsPerSprint }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Capacity overview for active sprints -->
    <div v-if="stats.active > 0" class="mt-6 pt-6 border-t border-gray-200">
      <h4 class="text-sm font-semibold text-gray-900 mb-3">Capacité des sprints actifs</h4>
      <div class="space-y-3">
        <div 
          v-for="sprint in activeSprintsWithCapacity" 
          :key="sprint.id"
          class="flex items-center space-x-3"
        >
          <div class="flex-1">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-gray-700">{{ sprint.name }}</span>
              <span 
                class="text-xs font-medium"
                :class="sprint.isOverCapacity ? 'text-red-600' : 'text-gray-600'"
              >
                {{ sprint.currentPoints }}/{{ sprint.maxPoints }} pts
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all"
                :class="sprint.isOverCapacity ? 'bg-red-600' : 'bg-indigo-600'"
                :style="{ width: `${Math.min(sprint.capacityPercentage, 100)}%` }"
              ></div>
            </div>
          </div>
          <span 
            class="text-xs font-medium px-2 py-1 rounded"
            :class="sprint.isOverCapacity 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'"
          >
            {{ sprint.capacityPercentage }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Sprint } from '@/types/sprint.types';

interface SprintStats {
  total: number;
  active: number;
  upcoming: number;
  completed: number;
  totalTickets: number;
  totalPoints: number;
  averageTicketsPerSprint: number;
}

interface SprintWithCapacity {
  id: number;
  name: string;
  currentPoints: number;
  maxPoints: number;
  capacityPercentage: number;
  isOverCapacity: boolean;
}

interface Props {
  stats: SprintStats;
  activeSprintsWithCapacity: SprintWithCapacity[];
}

defineProps<Props>();
</script>