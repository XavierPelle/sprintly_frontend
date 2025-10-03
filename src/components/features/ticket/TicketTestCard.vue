<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <!-- Ticket Header -->
    <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <span class="text-sm font-mono font-semibold text-indigo-600">
            {{ ticket.key }}
          </span>
          <h3 class="text-lg font-medium text-gray-900">
            {{ ticket.title }}
          </h3>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="getStatusColor(ticket.status)"
          >
            {{ getStatusLabel(ticket.status) }}
          </span>
        </div>
        
        <div class="flex items-center space-x-2 text-sm text-gray-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>{{ ticket.tests.length }} test{{ ticket.tests.length > 1 ? 's' : '' }}</span>
        </div>
      </div>
    </div>

    <!-- Tests List -->
    <div class="divide-y divide-gray-200">
      <div
        v-for="test in ticket.tests"
        :key="test.id"
        class="px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- Test Author -->
            <div class="flex items-center space-x-3 mb-2">
              <div class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {{ test.user?.firstName?.[0] }}{{ test.user?.lastName?.[0] }}
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ test.user?.firstName }} {{ test.user?.lastName }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ formatDate(test.createdAt) }}
                </p>
              </div>
            </div>

            <!-- Test Description -->
            <p class="text-sm text-gray-700 whitespace-pre-wrap mb-3 ml-11">
              {{ test.description }}
            </p>

            <!-- Test Status -->
            <div class="ml-11">
              <span
                v-if="test.isValidated"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Validé
              </span>
              <span
                v-else
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                En attente de validation
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="canValidate(test) && !test.isValidated" class="flex flex-col space-y-2 ml-4">
            <button
              @click="handleValidate(test.id, true)"
              :disabled="validating"
              class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Valider
            </button>
            <button
              @click="handleValidate(test.id, false)"
              :disabled="validating"
              class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Rejeter
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer with Ticket Info -->
    <div class="bg-gray-50 px-6 py-3 border-t border-gray-200">
      <div class="flex items-center justify-between text-sm text-gray-600">
        <div class="flex items-center space-x-4">
          <span v-if="ticket.assignee">
            <span class="text-gray-500">Assigné à: </span>
            <span class="font-medium">{{ ticket.assignee.firstName }} {{ ticket.assignee.lastName }}</span>
          </span>
          <span>
            <span class="text-gray-500">Points: </span>
            <span class="font-medium">{{ ticket.difficultyPoints }}</span>
          </span>
        </div>
        <router-link
          :to="`/tickets/${ticket.id}`"
          class="text-indigo-600 hover:text-indigo-900 font-medium"
        >
          Voir le ticket →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import type { Ticket, Test } from '@/types/ticket.types';

interface Props {
  ticket: Ticket & { tests: Test[] };
}

const props = defineProps<Props>();

const emit = defineEmits<{
  validate: [testId: number, isValidated: boolean];
  refresh: [];
}>();

const authStore = useAuthStore();
const validating = ref(false);

const canValidate = (test: Test) => {
  // Un utilisateur peut valider un test s'il n'est pas le créateur du test
  return authStore.currentUser?.id !== test.user.id;
};

async function handleValidate(testId: number, isValidated: boolean) {
  validating.value = true;
  try {
    emit('validate', testId, isValidated);
  } finally {
    validating.value = false;
  }
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'A_FAIRE': 'bg-gray-100 text-gray-800',
    'EN_COURS': 'bg-blue-100 text-blue-800',
    'REVISION': 'bg-purple-100 text-purple-800',
    'DEMANDE_MODIFICATION': 'bg-orange-100 text-orange-800',
    'TEST': 'bg-yellow-100 text-yellow-800',
    'TEST_KO': 'bg-red-100 text-red-800',
    'TEST_OK': 'bg-green-100 text-green-800',
    'PRODUCTION': 'bg-indigo-100 text-indigo-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'A_FAIRE': 'À faire',
    'EN_COURS': 'En cours',
    'REVISION': 'Révision',
    'DEMANDE_MODIFICATION': 'Modif. demandée',
    'TEST': 'Test',
    'TEST_KO': 'Test KO',
    'TEST_OK': 'Test OK',
    'PRODUCTION': 'Production'
  };
  return labels[status] || status;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return "À l'instant";
  } else if (diffMins < 60) {
    return `Il y a ${diffMins} min`;
  } else if (diffHours < 24) {
    return `Il y a ${diffHours}h`;
  } else if (diffDays < 7) {
    return `Il y a ${diffDays}j`;
  } else {
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}
</script>