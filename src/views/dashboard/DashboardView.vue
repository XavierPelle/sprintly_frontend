<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Bienvenue, {{ authStore.currentUser?.firstName }} 👋
      </h1>
      <p class="mt-1 text-sm text-gray-600">
        Voici un aperçu de votre activité et de vos tâches en cours
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
      <button
        @click="loadDashboard"
        class="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
      >
        Réessayer
      </button>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="dashboard">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tickets assignés"
          :value="dashboard.assignedTickets.total"
          :subtitle="`${dashboard.stats.completionRate}% terminés`"
          color="blue"
          :icon="TicketIcon"
        />
        <StatCard
          title="Tickets créés"
          :value="dashboard.createdTickets.total"
          color="purple"
          :icon="CreateIcon"
        />
        <StatCard
          title="Commentaires"
          :value="dashboard.stats.totalComments"
          color="green"
          :icon="CommentIcon"
        />
        <StatCard
          title="Tests réalisés"
          :value="dashboard.stats.totalTests"
          color="orange"
          :icon="TestIcon"
        />
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column (2/3) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Tickets urgents -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Tickets urgents</h2>
              <p class="text-sm text-gray-600">Vos tickets en cours et à faire</p>
            </div>
            <div class="p-6">
              <div v-if="dashboard.assignedTickets.urgent.length > 0" class="space-y-3">
                <TicketCard
                  v-for="ticket in dashboard.assignedTickets.urgent"
                  :key="ticket.id"
                  :ticket="ticket"
                />
              </div>
              <p v-else class="text-center text-gray-500 py-8">
                Aucun ticket urgent pour le moment 🎉
              </p>
            </div>
          </div>

          <!-- Sprints actifs -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Sprints actifs</h2>
            </div>
            <div class="p-6">
              <div v-if="dashboard.activeSprints.length > 0" class="space-y-4">
                <div
                  v-for="sprint in dashboard.activeSprints"
                  :key="sprint.id"
                  class="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                >
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-medium text-gray-900">{{ sprint.name }}</h3>
                    <span class="text-sm text-gray-500">
                      {{ sprint.progressPercentage }}%
                    </span>
                  </div>
                  
                  <!-- Progress bar -->
                  <div class="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      class="bg-indigo-600 h-2 rounded-full transition-all"
                      :style="{ width: `${sprint.progressPercentage}%` }"
                    ></div>
                  </div>

                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-600">
                      {{ sprint.userTicketsCount }} tickets
                      ({{ sprint.userTicketsPoints }}/{{ sprint.totalPoints }} pts)
                    </span>
                    <span class="text-gray-500">
                      {{ formatDate(sprint.endDate) }}
                    </span>
                  </div>
                </div>
              </div>
              <p v-else class="text-center text-gray-500 py-8">
                Aucun sprint actif
              </p>
            </div>
          </div>
        </div>

        <!-- Right Column (1/3) -->
        <div class="space-y-6">
          <!-- Tests à valider -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900">Tests à valider</h2>
                <span
                  v-if="dashboard.testsToValidate.total > 0"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                >
                  {{ dashboard.testsToValidate.total }}
                </span>
              </div>
            </div>
            <div class="divide-y divide-gray-200">
              <div
                v-for="test in dashboard.testsToValidate.tests.slice(0, 5)"
                :key="test.id"
                class="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <p class="text-sm font-medium text-gray-900 mb-1">
                  {{ test.ticketKey }}
                </p>
                <p class="text-xs text-gray-600 line-clamp-2 mb-2">
                  {{ test.description }}
                </p>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-500">{{ test.createdBy }}</span>
                  <span class="text-gray-400">{{ formatDate(test.createdAt) }}</span>
                </div>
              </div>
              <div v-if="dashboard.testsToValidate.tests.length === 0" class="px-6 py-8 text-center">
                <p class="text-gray-500 text-sm">Aucun test en attente</p>
              </div>
            </div>
          </div>

          <!-- Activité récente -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Activité récente</h2>
            </div>
            <div class="p-6 space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Dernier commentaire</span>
                <span class="text-sm font-medium text-gray-900">
                  {{ dashboard.recentActivity.lastCommentDate 
                    ? formatDate(dashboard.recentActivity.lastCommentDate)
                    : 'Aucun' }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Dernier test</span>
                <span class="text-sm font-medium text-gray-900">
                  {{ dashboard.recentActivity.lastTestDate 
                    ? formatDate(dashboard.recentActivity.lastTestDate)
                    : 'Aucun' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Tickets récents créés -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Récemment créés</h2>
            </div>
            <div class="p-6">
              <div v-if="dashboard.createdTickets.recent.length > 0" class="space-y-3">
                <TicketCard
                  v-for="ticket in dashboard.createdTickets.recent.slice(0, 3)"
                  :key="ticket.id"
                  :ticket="ticket"
                />
              </div>
              <p v-else class="text-center text-gray-500 py-8 text-sm">
                Aucun ticket créé récemment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { userApi } from '@/api/user.api';
import type { UserDashboard } from '@/types/dashboard.types';
import StatCard from '@/components/common/StatCard.vue';
import TicketCard from '@/components/features/ticket/TicketCard.vue';

const authStore = useAuthStore();

const dashboard = ref<UserDashboard | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// Icons
const TicketIcon = () => h('svg', {
  class: 'w-6 h-6',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, h('path', {
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'stroke-width': '2',
  d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
}));

const CreateIcon = () => h('svg', {
  class: 'w-6 h-6',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, h('path', {
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'stroke-width': '2',
  d: 'M12 4v16m8-8H4'
}));

const CommentIcon = () => h('svg', {
  class: 'w-6 h-6',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, h('path', {
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'stroke-width': '2',
  d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
}));

const TestIcon = () => h('svg', {
  class: 'w-6 h-6',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, h('path', {
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'stroke-width': '2',
  d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
}));

async function loadDashboard() {
  loading.value = true;
  error.value = null;

  try {
    dashboard.value = await userApi.getDashboard();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement du dashboard';
    console.error('Failed to load dashboard:', err);
  } finally {
    loading.value = false;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Aujourd'hui";
  } else if (diffDays === 1) {
    return 'Hier';
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jours`;
  } else {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
}

onMounted(() => {
  loadDashboard();
});
</script>