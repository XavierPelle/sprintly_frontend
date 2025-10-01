<!-- src/views/test/TestListView.vue -->

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Tests récents</h1>
      <p class="mt-1 text-sm text-gray-600">
        Consultez et validez les tests effectués sur les tickets
      </p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <StatCard
        title="Tests en attente"
        :value="stats.pending"
        color="orange"
        :icon="PendingIcon"
      />
      <StatCard
        title="Tests validés"
        :value="stats.validated"
        color="green"
        :icon="ValidatedIcon"
      />
      <StatCard
        title="Tests rejetés"
        :value="stats.rejected"
        color="red"
        :icon="RejectedIcon"
      />
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="flex items-center space-x-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un test..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            @input="filterTests"
          />
        </div>
        <select
          v-model="statusFilter"
          @change="filterTests"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Tous les tests</option>
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

    <!-- Tests List -->
    <div v-else class="space-y-4">
      <div v-if="filteredTests.length > 0">
        <TestItem
          v-for="test in filteredTests"
          :key="test.id"
          :test="test"
          @validate="handleValidateTest"
        />
      </div>
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun test trouvé</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ statusFilter === 'all' ? 'Aucun test pour le moment' : 'Aucun test correspondant aux filtres' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue';
import { testApi } from '@/api/test.api';
import type { Test } from '@/types/ticket.types';
import TestItem from '@/components/features/ticket/TestItem.vue';
import StatCard from '@/components/common/StatCard.vue';

const tests = ref<Test[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const searchQuery = ref('');
const statusFilter = ref<'all' | 'pending' | 'validated' | 'rejected'>('all');

// Icons
const PendingIcon = () => h('svg', {
  class: 'w-6 h-6',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, h('path', {
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'stroke-width': '2',
  d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
}));

const ValidatedIcon = () => h('svg', {
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

const RejectedIcon = () => h('svg', {
  class: 'w-6 h-6',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, h('path', {
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'stroke-width': '2',
  d: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
}));

const stats = computed(() => {
  const pending = tests.value.filter(t => !t.isValidated).length;
  const validated = tests.value.filter(t => t.isValidated).length;
  const rejected = 0; // À implémenter si nécessaire

  return { pending, validated, rejected };
});

const filteredTests = computed(() => {
  let result = tests.value;

  // Filter by status
  if (statusFilter.value === 'pending') {
    result = result.filter(t => !t.isValidated);
  } else if (statusFilter.value === 'validated') {
    result = result.filter(t => t.isValidated);
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(t => 
      t.description.toLowerCase().includes(query) ||
      t.user.firstName.toLowerCase().includes(query) ||
      t.user.lastName.toLowerCase().includes(query)
    );
  }

  return result;
});

async function loadTests() {
  loading.value = true;
  error.value = null;

  try {
    tests.value = await testApi.getAll();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement des tests';
    console.error('Failed to load tests:', err);
  } finally {
    loading.value = false;
  }
}

async function handleValidateTest(test: Test, isValidated: boolean) {
  try {
    await testApi.validate(test.id, { isValidated });

    // Update local test
    const index = tests.value.findIndex(t => t.id === test.id);
    if (index !== -1) {
      tests.value[index].isValidated = isValidated;
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la validation du test';
  }
}

function filterTests() {
  // Trigger computed property recalculation
}

onMounted(() => {
  loadTests();
});
</script>