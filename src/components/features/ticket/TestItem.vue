<!-- src/components/features/ticket/TestItem.vue -->

<template>
  <div class="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <!-- Header -->
        <div class="flex items-center space-x-3 mb-2">
          <div class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {{ test.user?.firstName[0] }}{{ test.user?.lastName[0] }}
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

        <!-- Description -->
        <p class="text-sm text-gray-700 whitespace-pre-wrap mb-3">
          {{ test.description }}
        </p>

        <!-- Status -->
        <div class="flex items-center space-x-2">
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
            En attente
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="canValidate && !test.isValidated" class="flex flex-col space-y-2 ml-4">
        <button
          @click="$emit('validate', test, true)"
          class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 transition-colors"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Valider
        </button>
        <button
          @click="$emit('validate', test, false)"
          class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Rejeter
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import type { Test } from '@/types/ticket.types';

interface Props {
  test: Test;
}

const props = defineProps<Props>();

defineEmits<{
  validate: [test: Test, isValidated: boolean];
}>();

const authStore = useAuthStore();

const canValidate = computed(() => {
  // Un utilisateur peut valider un test s'il n'est pas le créateur
  return authStore.currentUser?.id !== props.test.user.id;
});

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