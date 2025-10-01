<template>
  <div
    draggable="true"
    @dragstart="$emit('dragstart', ticket)"
    @dragend="$emit('dragend')"
    class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-move hover:shadow-md hover:border-indigo-300 transition-all"
    :class="{ 'opacity-50': isDragging }"
  >
    <!-- Header avec Key et Type -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center space-x-2">
        <span class="text-xs font-mono font-semibold text-indigo-600">
          {{ ticket.key }}
        </span>
        <span
          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
          :class="getTypeClass(ticket.type)"
        >
          {{ getTypeIcon(ticket.type) }}
        </span>
      </div>
      
      <!-- Points -->
      <span v-if="ticket.difficultyPoints" class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
        {{ ticket.difficultyPoints }} pts
      </span>
    </div>

    <!-- Titre -->
    <h3 
      class="text-sm font-medium text-gray-900 mb-3 line-clamp-2 cursor-pointer hover:text-indigo-600"
      @click="$emit('click', ticket)"
    >
      {{ ticket.title }}
    </h3>

    <!-- Footer -->
    <div class="flex items-center justify-between">
      <!-- Assigné -->
      <div v-if="ticket.assignee" class="flex items-center space-x-2">
        <div
          class="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-medium"
          :title="`${ticket.assignee.firstName} ${ticket.assignee.lastName}`"
        >
          {{ ticket.assignee.firstName[0] }}{{ ticket.assignee.lastName[0] }}
        </div>
        <span class="text-xs text-gray-600">
          {{ ticket.assignee.firstName }}
        </span>
      </div>
      <div v-else class="text-xs text-gray-400">
        Non assigné
      </div>

      <!-- Actions rapides -->
      <div class="flex items-center space-x-1">
        <button
          v-if="ticket.comments && ticket.comments.length > 0"
          class="p-1 hover:bg-gray-100 rounded"
          :title="`${ticket.comments.length} commentaires`"
        >
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
        <button
          v-if="ticket.images && ticket.images.length > 0"
          class="p-1 hover:bg-gray-100 rounded"
          :title="`${ticket.images.length} images`"
        >
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ticket, TicketType } from '@/types/ticket.types';

interface Props {
  ticket: Ticket;
  isDragging?: boolean;
}

defineProps<Props>();

defineEmits<{
  dragstart: [ticket: Ticket];
  dragend: [];
  click: [ticket: Ticket];
}>();

function getTypeClass(type: TicketType): string {
  const classes: Record<TicketType, string> = {
    bug: 'bg-red-50 text-red-700 border border-red-200',
    feature: 'bg-blue-50 text-blue-700 border border-blue-200',
    task: 'bg-gray-50 text-gray-700 border border-gray-200',
    improvement: 'bg-green-50 text-green-700 border border-green-200'
  };
  return classes[type] || 'bg-gray-50 text-gray-700';
}

function getTypeIcon(type: TicketType): string {
  const icons: Record<TicketType, string> = {
    bug: '🐛',
    feature: '✨',
    task: '📋',
    improvement: '⚡'
  };
  return icons[type] || '📋';
}
</script>