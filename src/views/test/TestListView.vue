<template>
  <div class="space-y-6">
    <!-- Header avec bouton d'action -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Tests à valider</h1>
        <p class="mt-1 text-sm text-gray-600">
          Validez les tests effectués sur les tickets en statut TEST
        </p>
      </div>
      <button v-if="ticketsWithoutTests.length > 0" @click="navigateToFirstTicket"
        class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Commencer les tests</span>
      </button>
    </div>

    <!-- Success message -->
    <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-4">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-green-800">{{ successMessage }}</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <StatCard title="Tests en attente" :value="stats.pending" color="orange">
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </template>
      </StatCard>
      <StatCard title="Tests validés" :value="stats.validated" color="green">
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </template>
      </StatCard>
      <StatCard title="Tests rejetés" :value="stats.rejected" color="red">
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </template>
      </StatCard>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="flex items-center space-x-4">
        <div class="flex-1">
          <input v-model="searchQuery" type="text" placeholder="Rechercher un ticket..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select v-model="statusFilter"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="validated">Validés</option>
          <option value="rejected">Rejetés</option>
        </select>
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

    <!-- Tickets -->
    <div v-else class="space-y-6">
      <!-- Tickets sans tests (prioritaires) -->
      <div v-if="ticketsWithoutTests.length > 0">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold text-gray-900">
            Tickets en attente de test ({{ ticketsWithoutTests.length }})
          </h2>
          <span class="px-3 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
            Prioritaire
          </span>
        </div>
        <div class="space-y-4">
          <TicketTestCard v-for="ticket in ticketsWithoutTests" :key="ticket.id" :ticket="ticket"
            @validate="handleValidateTest" @refresh="loadTickets" />
        </div>
      </div>

      <!-- Tickets avec tests -->
      <div v-if="filteredTickets.length > 0">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">
          Tickets avec tests ({{ filteredTickets.length }})
        </h2>
        <div class="space-y-4">
          <TicketTestCard v-for="ticket in filteredTickets" :key="ticket.id" :ticket="ticket"
            @validate="handleValidateTest" @refresh="loadTickets" />
        </div>
      </div>

      <!-- Aucun ticket -->
      <div v-if="ticketsWithoutTests.length === 0 && filteredTickets.length === 0"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun ticket à tester</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ statusFilter === 'all' ? 'Tous les tests ont été traités' : 'Aucun test correspondant aux filtres' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ticketApi } from '@/api/ticket.api';
import { testApi } from '@/api/test.api';
import type { Ticket, Test } from '@/types/ticket.types';
import StatCard from '@/components/common/StatCard.vue';
import TicketTestCard from '@/components/features/ticket/TicketTestCard.vue';

interface TicketWithTests extends Ticket {
  tests: Test[];
}

const router = useRouter();
const route = useRoute();

const tickets = ref<TicketWithTests[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const searchQuery = ref('');
const statusFilter = ref<'all' | 'pending' | 'validated' | 'rejected'>('all');

// Gérer le message de succès depuis les query params
onMounted(() => {
  if (route.query.success) {
    successMessage.value = route.query.success as string;
    // Supprimer le message après 5 secondes
    setTimeout(() => {
      successMessage.value = null;
    }, 5000);
    // Nettoyer les query params
    router.replace({ query: {} });
  }
  loadTickets();
});

const stats = computed(() => {
  let pending = 0;
  let validated = 0;
  let rejected = 0;

  tickets.value.forEach(ticket => {
    ticket.tests.forEach(test => {
      if (!test.isValidated) {
        pending++;
      } else {
        validated++;
      }
    });
  });

  return { pending, validated, rejected };
});

const ticketsWithoutTests = computed(() =>
  tickets.value.filter(t => !t.tests || t.tests.length === 0)
);

const filteredTickets = computed(() => {
  let result = tickets.value.filter(t => t.tests && t.tests.length > 0);

  if (statusFilter.value !== 'all') {
    result = result.filter(ticket => {
      return ticket.tests.some(test => {
        if (statusFilter.value === 'pending') return !test.isValidated;
        if (statusFilter.value === 'validated') return test.isValidated;
        return false;
      });
    });
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(ticket =>
      ticket.key.toLowerCase().includes(query) ||
      ticket.title.toLowerCase().includes(query) ||
      ticket.tests.some(test =>
        test.description.toLowerCase().includes(query) ||
        test.user.firstName.toLowerCase().includes(query) ||
        test.user.lastName.toLowerCase().includes(query)
      )
    );
  }

  return result;
});

async function loadTickets() {
  loading.value = true;
  error.value = null;

  try {
    const response = await ticketApi.search({
      status: 'TEST',
      page: 1,
      limit: 100
    });

    const ticketsWithTests = await Promise.all(
      response.tickets.map(async (ticket) => {
        try {
          const details = await ticketApi.getDetails(ticket.id);
          return {
            ...ticket,
            tests: details.tests || []
          };
        } catch (err) {
          console.error(`Failed to load tests for ticket ${ticket.id}:`, err);
          return {
            ...ticket,
            tests: []
          };
        }
      })
    );

    tickets.value = ticketsWithTests;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement des tickets';
    console.error('Failed to load tickets:', err);
  } finally {
    loading.value = false;
  }
}

async function handleValidateTest(testId: number, isValidated: boolean) {
  try {
    await testApi.validate(testId, { isValidated });
    await loadTickets();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la validation du test';
  }
}

function navigateToFirstTicket() {
  if (ticketsWithoutTests.value.length > 0) {
    router.push({
      name: 'test-editor',
      params: { ticketId: ticketsWithoutTests.value[0].id }
    });
  }
}
</script>