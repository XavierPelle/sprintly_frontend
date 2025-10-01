<!-- src/components/features/ticket/CommentItem.vue -->

<template>
  <div class="flex space-x-3 py-4">
    <!-- Avatar -->
    <div class="flex-shrink-0">
      <div class="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
        {{ comment.user.firstName[0] }}{{ comment.user.lastName[0] }}
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-sm font-medium text-gray-900">
            {{ comment.user.firstName }} {{ comment.user.lastName }}
          </span>
          <span class="ml-2 text-xs text-gray-500">
            {{ formatDate(comment.createdAt) }}
          </span>
        </div>
        
        <!-- Actions (si c'est notre commentaire) -->
        <div v-if="canEdit" class="flex items-center space-x-2">
          <button
            @click="$emit('edit', comment)"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            title="Modifier"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            @click="$emit('delete', comment)"
            class="text-red-400 hover:text-red-600 transition-colors"
            title="Supprimer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <p class="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
        {{ comment.description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import type { Comment } from '@/types/ticket.types';

interface Props {
  comment: Comment;
}

const props = defineProps<Props>();

defineEmits<{
  edit: [comment: Comment];
  delete: [comment: Comment];
}>();

const authStore = useAuthStore();

const canEdit = computed(() => {
  return authStore.currentUser?.id === props.comment.user.id;
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