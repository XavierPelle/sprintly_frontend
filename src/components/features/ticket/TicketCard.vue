<template>
  <router-link
      :to="`/tickets/${ticket.id}`"
      class="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-indigo-300 transition-all"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-2 mb-2">
          <span class="text-xs font-mono font-medium text-gray-500">{{ ticket.key }}</span>
          <span
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              :class="getTypeClass(ticket.type)"
          >
            {{ getTypeLabel(ticket.type) }}
          </span>
          <span
              v-if="ticket.isBlocked"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700"
          >
            🔒 Bloqué
          </span>
        </div>

        <h3 class="text-sm font-medium text-gray-900 truncate mb-2">
          {{ ticket.title }}
        </h3>

        <div v-if="ticket.tags && ticket.tags.length > 0" class="flex flex-wrap gap-1 mb-2">
          <span
              v-for="tag in ticket.tags"
              :key="tag.id"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              :style="{ backgroundColor: getPastelColor(tag.color), color: getTextColor(tag.color) }"
          >
            {{ tag.name || tag.content }}
          </span>
        </div>

        <div class="flex items-center space-x-2">
          <span
              class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
              :class="getStatusClass(ticket.status)"
          >
            {{ getStatusLabel(ticket.status) }}
          </span>
          <span v-if="ticket.difficultyPoints" class="text-xs text-gray-500">
            {{ ticket.difficultyPoints }} pts
          </span>
        </div>
      </div>

      <div v-if="ticket.assignee" class="ml-3">
        <div
            class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
            :title="`${ticket.assignee.firstName} ${ticket.assignee.lastName}`"
        >
          {{ ticket.assignee.firstName[0] }}{{ ticket.assignee.lastName[0] }}
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import type { Ticket, TicketStatus, TicketType } from '@/types/ticket.types';

interface Props {
  ticket: Ticket | any;
}

defineProps<Props>();

function getPastelColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const pastelR = Math.floor((r + 255 * 2) / 3);
  const pastelG = Math.floor((g + 255 * 2) / 3);
  const pastelB = Math.floor((b + 255 * 2) / 3);

  return `#${pastelR.toString(16).padStart(2, '0')}${pastelG.toString(16).padStart(2, '0')}${pastelB.toString(16).padStart(2, '0')}`;
}

function getTextColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1f2937' : '#374151';
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
  return classes[status] || 'bg-gray-100 text-gray-800';
}

function getStatusLabel(status: TicketStatus): string {
  const labels: Record<TicketStatus, string> = {
    A_FAIRE: 'À faire',
    EN_COURS: 'En cours',
    REVISION: 'Révision',
    DEMANDE_MODIFICATION: 'Modif. demandée',
    TEST: 'Test',
    TEST_KO: 'Test KO',
    TEST_OK: 'Test OK',
    PRODUCTION: 'Production'
  };
  return labels[status] || status;
}

function getTypeClass(type: TicketType): string {
  const classes: Record<TicketType, string> = {
    bug: 'bg-red-50 text-red-700 border border-red-200',
    feature: 'bg-blue-50 text-blue-700 border border-blue-200',
    task: 'bg-gray-50 text-gray-700 border border-gray-200',
    improvement: 'bg-green-50 text-green-700 border border-green-200'
  };
  return classes[type] || 'bg-gray-50 text-gray-700';
}

function getTypeLabel(type: TicketType): string {
  const labels: Record<TicketType, string> = {
    bug: '🐛 Bug',
    feature: '✨ Feature',
    task: '📋 Tâche',
    improvement: '⚡ Amélioration'
  };
  return labels[type] || type;
}
</script>
