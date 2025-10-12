<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <!-- En-tête du ticket -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="flex items-center space-x-3 mb-2">
          <span class="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
            {{ ticket.key }}
          </span>
          <span class="px-3 py-1 text-sm font-medium rounded-full" :class="getStatusClass(ticket.status)">
            {{ ticket.status }}
          </span>
          <span class="px-3 py-1 text-sm font-medium rounded-full" :class="getPriorityClass(ticket.priority)">
            {{ ticket.priority }}
          </span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900">{{ ticket.title }}</h3>
        <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ ticket.description }}</p>

        <div class="mt-3 flex items-center space-x-4 text-sm text-gray-500">
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{{ ticket.assignee ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}` : 'Non assigné'
            }}</span>
          </div>
          <div v-if="ticket.pullRequestLink" class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <a :href="ticket.pullRequestLink" target="_blank" class="text-indigo-600 hover:text-indigo-800">
              Pull Request
            </a>
          </div>
        </div>
      </div>

      <!-- Bouton rédiger un test -->
      <button @click="navigateToTestEditor"
        class="ml-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span>Rédiger un test</span>
      </button>
    </div>

    <!-- Liste des tests -->
    <div v-if="ticket.tests && ticket.tests.length > 0" class="mt-4 space-y-3">
      <div class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-3">
          Tests effectués ({{ ticket.tests.length }})
        </h4>

        <div class="space-y-3">
          <div v-for="test in ticket.tests" :key="test.id" class="border rounded-lg p-4"
            :class="test.isValidated ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="test.isValidated ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'">
                    {{ test.isValidated ? 'Validé' : 'En attente' }}
                  </span>
                  <span class="text-xs text-gray-500">
                    par {{ test.user.firstName }} {{ test.user.lastName }}
                  </span>
                  <span class="text-xs text-gray-400">•</span>
                  <span class="text-xs text-gray-500">
                    {{ formatDate(test.createdAt) }}
                  </span>
                </div>
                <p class="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                  {{ test.description }}
                </p>

                <!-- Bouton pour voir plus -->
                <button v-if="test.description.length > 150" @click="toggleTestExpanded(test.id)"
                  class="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                  {{ expandedTests.has(test.id) ? 'Voir moins' : 'Voir plus' }}
                </button>
              </div>

              <!-- Actions de validation -->
              <div v-if="!test.isValidated" class="ml-4 flex items-center space-x-2">
                <button @click="handleValidate(test.id, true)"
                  class="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Valider le test">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button @click="handleValidate(test.id, false)"
                  class="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Rejeter le test">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Description complète si étendu -->
            <div v-if="expandedTests.has(test.id)" class="mt-3 pt-3 border-t border-gray-200">
              <p class="text-sm text-gray-700 whitespace-pre-wrap">
                {{ test.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message si aucun test -->
    <div v-else class="mt-4 border-t border-gray-200 pt-4">
      <div class="flex items-center justify-center py-6 text-gray-500">
        <svg class="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span class="text-sm">Aucun test effectué pour ce ticket</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Ticket } from '@/types/ticket.types';

interface Props {
  ticket: Ticket & { tests?: any[] };
}

interface Emits {
  (e: 'validate', testId: number, isValidated: boolean): void;
  (e: 'refresh'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const router = useRouter();

const expandedTests = ref(new Set<number>());

function navigateToTestEditor() {
  router.push({
    name: 'test-editor',
    params: { ticketId: props.ticket.id }
  });
}

function toggleTestExpanded(testId: number) {
  if (expandedTests.value.has(testId)) {
    expandedTests.value.delete(testId);
  } else {
    expandedTests.value.add(testId);
  }
}

function handleValidate(testId: number, isValidated: boolean) {
  emit('validate', testId, isValidated);
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    TODO: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    TEST: 'bg-orange-100 text-orange-800',
    DONE: 'bg-green-100 text-green-800',
    BLOCKED: 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}

function getPriorityClass(priority: string): string {
  const classes: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800'
  };
  return classes[priority] || 'bg-gray-100 text-gray-800';
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>