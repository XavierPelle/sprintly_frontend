<template>
  <div class="space-y-6">
    <!-- Header avec salutation dynamique -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          {{ getGreeting() }}, {{ authStore.currentUser?.firstName }} 👋
        </h1>
        <p class="mt-2 text-sm text-gray-600">
          {{ getCurrentDate() }}
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <BaseButton variant="secondary" @click="loadDashboard">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </BaseButton>
        <router-link to="/backlog">
          <BaseButton>
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nouveau ticket
          </BaseButton>
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-4 text-sm text-gray-600">Chargement de votre tableau de bord...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-800">{{ error }}</p>
      </div>
      <button @click="loadDashboard" class="mt-3 text-sm text-red-600 hover:text-red-700 font-medium">
        Réessayer
      </button>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="dashboard">
      <!-- Stats Cards - Version améliorée -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Mes tickets" :value="dashboard.assignedTickets.total"
          :subtitle="`${getInProgressCount()} en cours`" color="blue" :icon="TicketIcon" :trend="{
            value: `${dashboard.stats.completionRate}%`,
            label: 'de complétion',
            isPositive: dashboard.stats.completionRate >= 50
          }" />
        <StatCard title="Points complétés" :value="getCompletedPoints()"
          :subtitle="`sur ${getTotalAssignedPoints()} pts`" color="green" :icon="TrophyIcon" :trend="{
            value: getVelocityText(),
            label: 'cette semaine',
            isPositive: true
          }" />
        <StatCard title="Tests à valider" :value="dashboard.testsToValidate.total"
          :subtitle="dashboard.testsToValidate.total > 0 ? 'Action requise' : 'Tout est à jour'"
          :color="dashboard.testsToValidate.total > 0 ? 'orange' : 'green'" :icon="TestIcon" />
        <StatCard title="Activité" :value="dashboard.stats.totalComments" subtitle="commentaires" color="purple"
          :icon="ActivityIcon" :trend="{
            value: `${dashboard.stats.totalTests}`,
            label: 'tests réalisés',
            isPositive: true
          }" />
      </div>

      <!-- Statistiques détaillées par statut -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Répartition de mes tickets</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <button
          v-for="(count, status) in dashboard.assignedTickets.byStatus"
          :key="status"
          @click="openStatusModal(status as TicketStatus)"
          class="text-center p-3 rounded-lg transition-all hover:shadow-lg hover:scale-105 cursor-pointer"
          :class="getStatusBgClass(status)"
        >
          <p class="text-2xl font-bold" :class="getStatusTextClass(status)">
            {{ count }}
          </p>
          <p class="text-xs mt-1" :class="getStatusTextClass(status)">
            {{ getStatusLabel(status) }}
          </p>
        </button>
      </div>
    </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Colonne principale (2/3) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Tickets prioritaires MODIFIÉ -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                  <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Tickets prioritaires
                </h2>
                <p class="text-sm text-gray-600">
                  {{ dashboard.assignedTickets.urgent.length }} tickets HIGH/CRITICAL nécessitent votre attention
                </p>
              </div>
              <router-link to="/tickets">
                <button class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  Voir tous →
                </button>
              </router-link>
            </div>
            <div class="p-6">
              <div v-if="dashboard.assignedTickets.urgent.length > 0" class="space-y-3">
                <div v-for="ticket in dashboard.assignedTickets.urgent" :key="ticket.id"
                  class="border-l-4 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                  :class="getPriorityBorderClass(ticket.priority)" @click="$router.push(`/tickets/${ticket.id}`)">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center space-x-2 mb-2">
                        <span class="inline-flex items-center px-2 py-1 rounded text-xs font-semibold"
                          :class="getPriorityBadgeClass(ticket.priority)">
                          {{ getPriorityIcon(ticket.priority) }}
                          {{ getPriorityLabel(ticket.priority) }}
                        </span>
                        <span class="text-sm font-mono text-gray-600">{{ ticket.key }}</span>
                      </div>
                      <h3 class="font-semibold text-gray-900 mb-1">{{ ticket.title }}</h3>
                      <div class="flex items-center space-x-4 text-sm text-gray-600">
                        <span class="flex items-center">
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {{ ticket.difficultyPoints }} pts
                        </span>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          :class="getStatusBadgeClass(ticket.status)">
                          {{ getStatusLabel(ticket.status) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="mt-4 text-gray-500">Aucun ticket prioritaire ! 🎉</p>
                <p class="text-sm text-gray-400 mt-1">Pas de tickets HIGH ou CRITICAL assignés</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne latérale (1/3) -->
        <div class="space-y-6">
          <!-- Tests à valider - Version améliorée -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">Tests à valider</h2>
                  <p class="text-sm text-gray-600">Action requise</p>
                </div>
                <span v-if="dashboard.testsToValidate.total > 0"
                  class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold bg-orange-100 text-orange-800">
                  {{ dashboard.testsToValidate.total }}
                </span>
              </div>
            </div>
            <div class="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              <router-link v-for="test in dashboard.testsToValidate.tests.slice(0, 5)" :key="test.id"
                :to="`/tickets/${test.ticketKey.split('-')[1]}`"
                class="block px-6 py-4 hover:bg-orange-50 transition-colors">
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 mb-1">
                      {{ test.ticketKey }} - {{ test.ticketTitle }}
                    </p>
                    <p class="text-xs text-gray-600 line-clamp-2 mb-2">
                      {{ test.description }}
                    </p>
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-gray-500 flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {{ test.createdBy }}
                      </span>
                      <span class="text-gray-400">{{ formatDate(test.createdAt) }}</span>
                    </div>
                  </div>
                </div>
              </router-link>
              <div v-if="dashboard.testsToValidate.tests.length === 0" class="px-6 py-12 text-center">
                <svg class="mx-auto h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-gray-500 text-sm mt-2">Aucun test en attente</p>
              </div>
            </div>
            <div v-if="dashboard.testsToValidate.total > 5" class="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <router-link to="/tests" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                Voir tous les tests ({{ dashboard.testsToValidate.total }}) →
              </router-link>
            </div>
          </div>

          <!-- Activité récente améliorée -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Mon activité</h2>
            </div>
            <div class="p-6 space-y-4">
              <!-- Dernière activité -->
              <div class="flex items-center p-3 bg-blue-50 rounded-lg">
                <div class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div class="ml-3 flex-1">
                  <p class="text-sm font-medium text-gray-900">Dernier commentaire</p>
                  <p class="text-xs text-gray-600">
                    {{ dashboard.recentActivity.lastCommentDate
                      ? formatDateRelative(dashboard.recentActivity.lastCommentDate)
                      : 'Aucune activité' }}
                  </p>
                </div>
              </div>

              <div class="flex items-center p-3 bg-green-50 rounded-lg">
                <div class="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="ml-3 flex-1">
                  <p class="text-sm font-medium text-gray-900">Dernier test</p>
                  <p class="text-xs text-gray-600">
                    {{ dashboard.recentActivity.lastTestDate
                      ? formatDateRelative(dashboard.recentActivity.lastTestDate)
                      : 'Aucun test' }}
                  </p>
                </div>
              </div>

              <!-- Stats d'activité -->
              <div class="pt-4 border-t border-gray-200 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Total commentaires</span>
                  <span class="text-sm font-semibold text-gray-900">{{ dashboard.stats.totalComments }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Total tests</span>
                  <span class="text-sm font-semibold text-gray-900">{{ dashboard.stats.totalTests }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Taux de complétion</span>
                  <span class="text-sm font-semibold text-indigo-600">{{ dashboard.stats.completionRate }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Vue rapide des types de tickets -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Répartition par type</h2>
            </div>
            <div class="p-6">
              <div class="space-y-3">
                <div v-for="type in ['bug', 'feature', 'task', 'improvement']" :key="type"
                  class="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-gray-50">
                  <div class="flex items-center space-x-3">
                    <span class="text-2xl">{{ getTypeIcon(type) }}</span>
                    <span class="text-sm font-medium text-gray-700">{{ getTypeLabel(type) }}</span>
                  </div>
                  <span class="text-sm font-bold text-gray-900">
                    {{ getTicketCountByType(type) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <TicketsByStatusModal
      v-model="showStatusModal"
      :status="selectedStatus"
      :tickets="filteredTickets"
      :loading="loadingTickets"
    />
</template>

<script setup lang="ts">
import { ref, onMounted, h, computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { userApi } from '@/api/user.api';
import type { UserDashboard } from '@/types/dashboard.types';
import type { TicketPriority, TicketStatus, TicketType } from '@/types/ticket.types';
import StatCard from '@/components/common/StatCard.vue';
import TicketCard from '@/components/features/ticket/TicketCard.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import TicketsByStatusModal from '@/components/features/ticket/TicketsByStatusModal.vue';
import ticketApi from '@/api/ticket.api';

const authStore = useAuthStore();

const dashboard = ref<UserDashboard | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const showStatusModal = ref(false);
const selectedStatus = ref<TicketStatus | null>(null);
const allTickets = ref<any[]>([]);
const loadingTickets = ref(false);

// Tickets filtrés par statut
const filteredTickets = computed(() => {
  if (!selectedStatus.value) return [];
  return allTickets.value.filter(ticket => ticket.status === selectedStatus.value);
});


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

const TrophyIcon = () => h('svg', {
  class: 'w-6 h-6',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, h('path', {
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'stroke-width': '2',
  d: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
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

const ActivityIcon = () => h('svg', {
  class: 'w-6 h-6',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, h('path', {
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'stroke-width': '2',
  d: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
}));

function getPriorityLabel(priority: TicketPriority): string {
  const labels: Record<TicketPriority, string> = {
    LOW: 'Basse',
    MEDIUM: 'Moyenne',
    HIGH: 'Haute',
    CRITICAL: 'Critique'
  };
  return labels[priority] || priority;
}

function getPriorityIcon(priority: TicketPriority): string {
  const icons: Record<TicketPriority, string> = {
    LOW: '🔽',
    MEDIUM: '➡️',
    HIGH: '⬆️',
    CRITICAL: '🔥'
  };
  return icons[priority] || '';
}

function getPriorityBadgeClass(priority: TicketPriority): string {
  const classes: Record<TicketPriority, string> = {
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    CRITICAL: 'bg-red-100 text-red-700'
  };
  return classes[priority] || 'bg-gray-100 text-gray-700';
}

function getPriorityBorderClass(priority: TicketPriority): string {
  const classes: Record<TicketPriority, string> = {
    LOW: 'border-gray-300 bg-gray-50',
    MEDIUM: 'border-blue-400 bg-blue-50',
    HIGH: 'border-orange-400 bg-orange-50',
    CRITICAL: 'border-red-500 bg-red-50'
  };
  return classes[priority] || 'border-gray-300 bg-gray-50';
}

function getStatusBadgeClass(status: TicketStatus): string {
  const classes: Record<TicketStatus, string> = {
    A_FAIRE: 'bg-gray-100 text-gray-800',
    EN_COURS: 'bg-blue-100 text-blue-800',
    REVISION: 'bg-purple-100 text-purple-800',
    DEMANDE_MODIFICATION: 'bg-orange-100 text-orange-800',
    TEST: 'bg-yellow-100 text-yellow-800',
    TEST_KO: 'bg-red-100 text-red-800',
    TEST_OK: 'bg-green-100 text-green-800',
    PRODUCTION: 'bg-emerald-100 text-emerald-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}

async function loadDashboard() {
  loading.value = true;
  error.value = null;

  try {
    dashboard.value = await userApi.getDashboard();
    await loadAllTickets();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement du dashboard';
    console.error('Failed to load dashboard:', err);
  } finally {
    loading.value = false;
  }
}
async function loadAllTickets() {
  try {
    loadingTickets.value = true;
    const response = await ticketApi.search({
      assignee: authStore.currentUser?.id,
      limit: 1000
    });
    allTickets.value = response.tickets || [];
  } catch (err) {
    console.error('Failed to load tickets:', err);
  } finally {
    loadingTickets.value = false;
  }
}
function openStatusModal(status: TicketStatus) {
  selectedStatus.value = status;
  showStatusModal.value = true;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function getCurrentDate(): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return new Date().toLocaleDateString('fr-FR', options);
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

function formatDateRelative(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
  return date.toLocaleDateString('fr-FR');
}

function getInProgressCount(): number {
  if (!dashboard.value) return 0;
  return dashboard.value.assignedTickets.byStatus['EN_COURS'] || 0;
}

function getCompletedPoints(): number {
  if (!dashboard.value) return 0;
  const completedStatuses: TicketStatus[] = ['TEST_OK' as TicketStatus, 'PRODUCTION' as TicketStatus];
  let total = 0;
  for (const status of completedStatuses) {
    total += dashboard.value.assignedTickets.byStatus[status] || 0;
  }
  return total;
}

function getTotalAssignedPoints(): number {
  if (!dashboard.value) return 0;
  return Object.values(dashboard.value.assignedTickets.byStatus).reduce((sum, count) => sum + count, 0);
}

function getVelocityText(): string {
  if (!dashboard.value) return '0 pts';
  const completed = getCompletedPoints();
  return `${completed} pts`;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    A_FAIRE: 'À faire',
    EN_COURS: 'En cours',
    REVISION: 'Révision',
    DEMANDE_MODIFICATION: 'Modif.',
    TEST: 'Test',
    TEST_KO: 'Test KO',
    TEST_OK: 'Test OK',
    PRODUCTION: 'Production'
  };
  return labels[status] || status;
}

function getStatusBgClass(status: string): string {
  const classes: Record<string, string> = {
    A_FAIRE: 'bg-gray-100',
    EN_COURS: 'bg-blue-100',
    REVISION: 'bg-purple-100',
    DEMANDE_MODIFICATION: 'bg-orange-100',
    TEST: 'bg-yellow-100',
    TEST_KO: 'bg-red-100',
    TEST_OK: 'bg-green-100',
    PRODUCTION: 'bg-emerald-100'
  };
  return classes[status] || 'bg-gray-100';
}

function getStatusTextClass(status: string): string {
  const classes: Record<string, string> = {
    A_FAIRE: 'text-gray-700',
    EN_COURS: 'text-blue-700',
    REVISION: 'text-purple-700',
    DEMANDE_MODIFICATION: 'text-orange-700',
    TEST: 'text-yellow-700',
    TEST_KO: 'text-red-700',
    TEST_OK: 'text-green-700',
    PRODUCTION: 'text-emerald-700'
  };
  return classes[status] || 'text-gray-700';
}

function getSprintStatusClass(percentage: number): string {
  if (percentage >= 80) return 'bg-green-100 text-green-800';
  if (percentage >= 50) return 'bg-blue-100 text-blue-800';
  if (percentage >= 25) return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
}

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    bug: '🐛',
    feature: '✨',
    task: '📋',
    improvement: '⚡'
  };
  return icons[type] || '📋';
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    bug: 'Bug',
    feature: 'Feature',
    task: 'Tâche',
    improvement: 'Amélioration'
  };
  return labels[type] || type;
}

function getTicketCountByType(type: string): number {
  if (!dashboard.value) return 0;
  // Cette fonction devrait idéalement utiliser des données du dashboard
  // Pour l'instant, on retourne 0 car ces données ne sont pas dans le type UserDashboard
  // Vous pouvez ajouter cette information au backend si nécessaire
  return 0;
}

onMounted(() => {
  loadDashboard();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>