<!-- src/views/sprint/SprintDetailsView.vue -->

<template>
  <div class="space-y-6">
    <!-- Breadcrumb -->
    <nav class="flex" aria-label="Breadcrumb">
      <ol class="flex items-center space-x-2 text-sm">
        <li>
          <router-link to="/sprint/kanban" class="text-gray-500 hover:text-gray-700">
            Sprints
          </router-link>
        </li>
        <li>
          <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </li>
        <li class="text-gray-900 font-medium">
          {{ sprint?.name || 'Chargement...' }}
        </li>
      </ol>
    </nav>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <!-- Sprint Content -->
    <div v-else-if="sprint">
      <!-- Header Card -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-start justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ sprint.name }}</h1>
            <p class="mt-1 text-sm text-gray-600">
              Du {{ formatDateLong(sprint.startDate) }} au {{ formatDateLong(sprint.endDate) }}
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <BaseButton variant="secondary" size="sm">
              Modifier
            </BaseButton>
            <BaseButton variant="danger" size="sm" @click="handleCloseSprint">
              Clôturer
            </BaseButton>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Progression</span>
            <span class="text-sm font-medium text-indigo-600">
              {{ sprint.stats.progressPercentage }}%
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div
              class="bg-indigo-600 h-3 rounded-full transition-all"
              :style="{ width: `${sprint.stats.progressPercentage}%` }"
            ></div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <p class="text-2xl font-bold text-gray-900">{{ sprint.stats.totalTickets }}</p>
            <p class="text-sm text-gray-600">Tickets</p>
          </div>
          <div class="text-center p-4 bg-indigo-50 rounded-lg">
            <p class="text-2xl font-bold text-indigo-600">{{ sprint.stats.totalPoints }}</p>
            <p class="text-sm text-gray-600">Points totaux</p>
          </div>
          <div class="text-center p-4 bg-green-50 rounded-lg">
            <p class="text-2xl font-bold text-green-600">{{ sprint.stats.completedPoints }}</p>
            <p class="text-sm text-gray-600">Points terminés</p>
          </div>
          <div class="text-center p-4 bg-orange-50 rounded-lg">
            <p class="text-2xl font-bold text-orange-600">{{ sprint.stats.remainingPoints }}</p>
            <p class="text-sm text-gray-600">Points restants</p>
          </div>
        </div>

        <!-- Capacity Warning -->
        <div v-if="sprint.stats.isOverCapacity" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p class="text-sm text-red-800">
              <strong>Attention :</strong> Le sprint dépasse sa capacité maximale de {{ sprint.maxPoints }} points
            </p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px">
            <button
              @click="activeTab = 'tickets'"
              class="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
              :class="activeTab === 'tickets' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'"
            >
              Tickets ({{ sprint.tickets?.length || 0 }})
            </button>
            <button
              @click="activeTab = 'burndown'"
              class="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
              :class="activeTab === 'burndown' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'"
            >
              Burndown Chart
            </button>
            <button
              @click="activeTab = 'stats'"
              class="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
              :class="activeTab === 'stats' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'"
            >
              Statistiques
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Tickets Tab -->
          <div v-if="activeTab === 'tickets'">
            <div v-if="sprint.tickets && sprint.tickets.length > 0" class="space-y-3">
              <TicketCard
                v-for="ticket in sprint.tickets"
                :key="ticket.id"
                :ticket="ticket"
              />
            </div>
            <p v-else class="text-center text-gray-500 py-8">
              Aucun ticket dans ce sprint
            </p>
          </div>

          <!-- Burndown Tab -->
          <div v-if="activeTab === 'burndown'">
            <div v-if="burndownLoading" class="flex items-center justify-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
            <div v-else-if="burndown" class="space-y-6">
              <!-- Summary -->
              <div class="grid grid-cols-3 gap-4">
                <div class="p-4 bg-gray-50 rounded-lg">
                  <p class="text-sm text-gray-600 mb-1">Vélocité moyenne</p>
                  <p class="text-2xl font-bold text-gray-900">
                    {{ burndown.summary.averageVelocity }} pts/jour
                  </p>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg">
                  <p class="text-sm text-gray-600 mb-1">Jours écoulés / restants</p>
                  <p class="text-2xl font-bold text-gray-900">
                    {{ burndown.summary.daysElapsed }} / {{ burndown.summary.daysRemaining }}
                  </p>
                </div>
                <div class="p-4 rounded-lg" :class="burndown.summary.isOnTrack ? 'bg-green-50' : 'bg-red-50'">
                  <p class="text-sm mb-1" :class="burndown.summary.isOnTrack ? 'text-green-600' : 'text-red-600'">
                    Statut
                  </p>
                  <p class="text-2xl font-bold" :class="burndown.summary.isOnTrack ? 'text-green-900' : 'text-red-900'">
                    {{ burndown.summary.isOnTrack ? 'Sur la bonne voie ✓' : 'En retard ⚠️' }}
                  </p>
                </div>
              </div>

              <!-- Chart placeholder -->
              <div class="border border-gray-200 rounded-lg p-8 text-center">
                <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p class="mt-4 text-gray-600">Graphique de burndown</p>
                <p class="text-sm text-gray-500">Fonctionnalité à venir (intégration Chart.js)</p>
              </div>
            </div>
          </div>

          <!-- Stats Tab -->
          <div v-if="activeTab === 'stats'">
            <div class="grid grid-cols-2 gap-6">
              <!-- By Status -->
              <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="text-sm font-semibold text-gray-900 mb-4">Tickets par statut</h3>
                <div class="space-y-2">
                  <div v-for="(count, status) in sprint.stats.ticketsByStatus" :key="status" class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">{{ getStatusLabel(status) }}</span>
                    <span class="text-sm font-medium text-gray-900">{{ count }}</span>
                  </div>
                </div>
              </div>

              <!-- By Type -->
              <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="text-sm font-semibold text-gray-900 mb-4">Tickets par type</h3>
                <div class="space-y-2">
                  <div v-for="(count, type) in sprint.stats.ticketsByType" :key="type" class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">{{ getTypeLabel(type) }}</span>
                    <span class="text-sm font-medium text-gray-900">{{ count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { sprintApi } from '@/api/sprint.api';
import type { SprintDetails, BurndownData } from '@/types/sprint.types';
import type { TicketStatus, TicketType } from '@/types/ticket.types';
import BaseButton from '@/components/common/BaseButton.vue';
import TicketCard from '@/components/features/ticket/TicketCard.vue';

const route = useRoute();

const sprint = ref<SprintDetails | null>(null);
const burndown = ref<BurndownData | null>(null);
const loading = ref(true);
const burndownLoading = ref(false);
const error = ref<string | null>(null);
const activeTab = ref<'tickets' | 'burndown' | 'stats'>('tickets');

async function loadSprint() {
  loading.value = true;
  error.value = null;

  try {
    const sprintId = parseInt(route.params.id as string);
    sprint.value = await sprintApi.getDetails(sprintId);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement du sprint';
  } finally {
    loading.value = false;
  }
}

async function loadBurndown() {
  if (!sprint.value) return;

  burndownLoading.value = true;

  try {
    burndown.value = await sprintApi.getBurndown(sprint.value.id);
  } catch (err) {
    console.error('Failed to load burndown:', err);
  } finally {
    burndownLoading.value = false;
  }
}

function handleCloseSprint() {
  if (confirm('Voulez-vous vraiment clôturer ce sprint ?')) {
    // TODO: Implement close sprint
    alert('Fonctionnalité à venir');
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    A_FAIRE: 'À faire',
    EN_COURS: 'En cours',
    REVISION: 'Révision',
    DEMANDE_MODIFICATION: 'Modif. demandée',
    TEST: 'Test',
    TEST_KO: 'Test KO',
    TEST_OK: 'Test OK',
    PRODUCTION: 'Production'
  };
  return labels[status] || status;
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    bug: '🐛 Bug',
    feature: '✨ Feature',
    task: '📋 Tâche',
    improvement: '⚡ Amélioration'
  };
  return labels[type] || type;
}

function formatDateLong(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
}

onMounted(async () => {
  await loadSprint();
  if (activeTab.value === 'burndown') {
    await loadBurndown();
  }
});

// Load burndown when switching to that tab
const unwatchTab = ref<any>();
onMounted(() => {
  unwatchTab.value = () => {
    if (activeTab.value === 'burndown' && !burndown.value) {
      loadBurndown();
    }
  };
});
</script>