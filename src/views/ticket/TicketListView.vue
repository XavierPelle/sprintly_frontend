<!-- src/views/ticket/TicketListView.vue -->

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Tous les tickets</h1>
        <p class="mt-1 text-sm text-gray-600">
          {{ pagination.total }} ticket(s) au total
        </p>
      </div>
      <router-link to="/backlog">
        <BaseButton>
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Créer un ticket
        </BaseButton>
      </router-link>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
      <!-- Search Bar -->
      <div class="flex items-center space-x-4">
        <div class="flex-1 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher par titre, clé ou description..."
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            @input="debouncedSearch"
          />
        </div>
        <BaseButton
          variant="secondary"
          @click="handleSearch"
          :loading="loading"
        >
          Rechercher
        </BaseButton>
        <BaseButton
          variant="ghost"
          @click="handleResetFilters"
          title="Réinitialiser les filtres"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </BaseButton>
      </div>

      <!-- Advanced Filters -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select
            v-model="filters.status"
            @change="handleSearch"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option :value="null">Tous les statuts</option>
            <option value="A_FAIRE">À faire</option>
            <option value="EN_COURS">En cours</option>
            <option value="REVISION">Révision</option>
            <option value="DEMANDE_MODIFICATION">Modif. demandée</option>
            <option value="TEST">Test</option>
            <option value="TEST_KO">Test KO</option>
            <option value="TEST_OK">Test OK</option>
            <option value="PRODUCTION">Production</option>
          </select>
        </div>

        <!-- Type Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            v-model="filters.type"
            @change="handleSearch"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option :value="null">Tous les types</option>
            <option value="bug">🐛 Bug</option>
            <option value="feature">✨ Feature</option>
            <option value="task">📋 Tâche</option>
            <option value="improvement">⚡ Amélioration</option>
          </select>
        </div>

        <!-- Sprint Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sprint</label>
          <select
            v-model="filters.sprintId"
            @change="handleSearch"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option :value="null">Tous les sprints</option>
            <option :value="0">Sans sprint</option>
            <option v-for="sprint in sprints" :key="sprint.id" :value="sprint.id">
              {{ sprint.name }}
            </option>
          </select>
        </div>

        <!-- Assignee Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Assigné à</label>
          <select
            v-model="filters.assignee"
            @change="handleSearch"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option :value="null">Tous</option>
            <option :value="currentUser?.id">Mes tickets</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.firstName }} {{ user.lastName }}
            </option>
          </select>
        </div>
      </div>

      <!-- Sort Options -->
      <div class="flex items-center justify-between pt-4 border-t border-gray-200">
        <div class="flex items-center space-x-4">
          <label class="text-sm font-medium text-gray-700">Trier par :</label>
          <select
            v-model="filters.sortBy"
            @change="handleSearch"
            class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="createdAt">Date de création</option>
            <option value="updatedAt">Dernière modification</option>
            <option value="difficultyPoints">Points</option>
            <option value="key">Clé</option>
          </select>
          <select
            v-model="filters.sortOrder"
            @change="handleSearch"
            class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="DESC">Décroissant</option>
            <option value="ASC">Croissant</option>
          </select>
        </div>

        <!-- View Toggle -->
        <div class="flex items-center space-x-2">
          <button
            @click="viewMode = 'grid'"
            :class="[
              'p-2 rounded-lg transition-colors',
              viewMode === 'grid' 
                ? 'bg-indigo-100 text-indigo-600' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            ]"
            title="Vue grille"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            @click="viewMode = 'list'"
            :class="[
              'p-2 rounded-lg transition-colors',
              viewMode === 'list' 
                ? 'bg-indigo-100 text-indigo-600' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            ]"
            title="Vue liste"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-4 text-sm text-gray-600">Chargement des tickets...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
      <BaseButton
        variant="secondary"
        size="sm"
        class="mt-3"
        @click="handleSearch"
      >
        Réessayer
      </BaseButton>
    </div>

    <!-- Tickets List/Grid -->
    <div v-else-if="tickets.length > 0">
      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TicketCard
          v-for="ticket in tickets"
          :key="ticket.id"
          :ticket="ticket"
        />
      </div>

      <!-- List View -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="divide-y divide-gray-200">
          <div
            v-for="ticket in tickets"
            :key="ticket.id"
            class="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
            @click="handleTicketClick(ticket)"
          >
            <div class="flex items-start justify-between">
              <!-- Left side -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-3 mb-2">
                  <span class="text-sm font-mono font-semibold text-indigo-600">
                    {{ ticket.key }}
                  </span>
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    :class="getTypeClass(ticket.type)"
                  >
                    {{ getTypeLabel(ticket.type) }}
                  </span>
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    :class="getStatusClass(ticket.status)"
                  >
                    {{ getStatusLabel(ticket.status) }}
                  </span>
                </div>

                <h3 class="text-sm font-medium text-gray-900 mb-1">
                  {{ ticket.title }}
                </h3>

                <div class="flex items-center space-x-4 text-xs text-gray-500">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {{ ticket.difficultyPoints }} points
                  </span>
                  <span v-if="ticket.assignee" class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {{ ticket.assignee.firstName }} {{ ticket.assignee.lastName }}
                  </span>
                  <span v-if="ticket.sprint" class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {{ ticket.sprint.name }}
                  </span>
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ formatDate(ticket.createdAt) }}
                  </span>
                </div>
              </div>

              <!-- Right side - Avatar -->
              <div v-if="ticket.assignee" class="ml-4">
                <div
                  class="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium"
                  :title="`${ticket.assignee.firstName} ${ticket.assignee.lastName}`"
                >
                  {{ ticket.assignee.firstName[0] }}{{ ticket.assignee.lastName[0] }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            Affichage de {{ (pagination.page - 1) * pagination.limit + 1 }} à 
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} 
            sur {{ pagination.total }} résultats
          </div>

          <div class="flex items-center space-x-2">
            <BaseButton
              variant="secondary"
              size="sm"
              :disabled="!pagination.hasPrev"
              @click="handlePreviousPage"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </BaseButton>

            <div class="flex items-center space-x-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="handlePageChange(page)"
                :class="[
                  'px-3 py-1 text-sm rounded-md transition-colors',
                  page === pagination.page
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                {{ page }}
              </button>
            </div>

            <BaseButton
              variant="secondary"
              size="sm"
              :disabled="!pagination.hasNext"
              @click="handleNextPage"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">Aucun ticket trouvé</h3>
      <p class="mt-2 text-sm text-gray-600">
        Essayez de modifier vos critères de recherche ou créez un nouveau ticket
      </p>
      <router-link to="/backlog">
        <BaseButton class="mt-4">
          Créer un ticket
        </BaseButton>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { ticketApi } from '@/api/ticket.api';
import { sprintApi } from '@/api/sprint.api';
import { userApi } from '@/api/user.api';
import type { Ticket, TicketStatus, TicketType } from '@/types/ticket.types';
import type { Sprint } from '@/types/sprint.types';
import type { AuthUser } from '@/types/auth.types';
import BaseButton from '@/components/common/BaseButton.vue';
import TicketCard from '@/components/features/ticket/TicketCard.vue';

const router = useRouter();
const authStore = useAuthStore();

// State
const tickets = ref<Ticket[]>([]);
const sprints = ref<Sprint[]>([]);
const users = ref<AuthUser[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const viewMode = ref<'grid' | 'list'>('list');

const searchQuery = ref('');
const filters = ref({
  status: null as TicketStatus | null,
  type: null as string | null,
  sprintId: null as number | null,
  assignee: null as number | null,
  sortBy: 'createdAt' as 'createdAt' | 'updatedAt' | 'difficultyPoints' | 'key',
  sortOrder: 'DESC' as 'ASC' | 'DESC'
});

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false
});

const currentUser = computed(() => authStore.currentUser);

const visiblePages = computed(() => {
  const current = pagination.value.page;
  const total = pagination.value.totalPages;
  const pages: number[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, -1, total);
    } else if (current >= total - 2) {
      pages.push(1, -1, total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, -1, current - 1, current, current + 1, -1, total);
    }
  }

  return pages;
});

// Debounced search
let searchTimeout: NodeJS.Timeout;
function debouncedSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    handleSearch();
  }, 500);
}

async function loadSprints() {
  try {
    sprints.value = await sprintApi.getAll();
  } catch (err) {
    console.error('Failed to load sprints:', err);
  }
}

async function loadUsers() {
  try {
    users.value = await userApi.getAll();
  } catch (err) {
    console.error('Failed to load users:', err);
  }
}

async function handleSearch() {
  loading.value = true;
  error.value = null;

  try {
    const response = await ticketApi.search({
      query: searchQuery.value || undefined,
      status: filters.value.status || undefined,
      type: filters.value.type || undefined,
      sprintId: filters.value.sprintId === 0 ? undefined : filters.value.sprintId || undefined,
      assignee: filters.value.assignee || undefined,
      sortBy: filters.value.sortBy,
      sortOrder: filters.value.sortOrder,
      page: pagination.value.page,
      limit: pagination.value.limit
    });

    tickets.value = response.tickets;
    pagination.value = response.pagination;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la recherche';
    console.error('Failed to search tickets:', err);
  } finally {
    loading.value = false;
  }
}

function handleResetFilters() {
  searchQuery.value = '';
  filters.value = {
    status: null,
    type: null,
    sprintId: null,
    assignee: null,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  };
  pagination.value.page = 1;
  handleSearch();
}

function handlePreviousPage() {
  if (pagination.value.hasPrev) {
    pagination.value.page--;
    handleSearch();
  }
}

function handleNextPage() {
  if (pagination.value.hasNext) {
    pagination.value.page++;
    handleSearch();
  }
}

function handlePageChange(page: number) {
  if (page > 0 && page !== pagination.value.page) {
    pagination.value.page = page;
    handleSearch();
  }
}

function handleTicketClick(ticket: Ticket) {
  router.push(`/tickets/${ticket.id}`);
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

function getTypeLabel(type: TicketType): string {
  const labels: Record<TicketType, string> = {
    bug: '🐛 Bug',
    feature: '✨ Feature',
    task: '📋 Tâche',
    improvement: '⚡ Amélioration'
  };
  return labels[type];
}

function getStatusClass(status: TicketStatus): string {
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
  return classes[status];
}

function getStatusLabel(status: TicketStatus): string {
  const labels: Record<TicketStatus, string> = {
    A_FAIRE: 'À faire',
    EN_COURS: 'En cours',
    REVISION: 'Révision',
    DEMANDE_MODIFICATION: 'Modif.',
    TEST: 'Test',
    TEST_KO: 'Test KO',
    TEST_OK: 'Test OK',
    PRODUCTION: 'Production'
  };
  return labels[status];
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
    return `Il y a ${diffDays}j`;
  } else {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
}

onMounted(async () => {
  await Promise.all([
    loadSprints(),
    loadUsers(),
    handleSearch()
  ]);
});
</script>