<!-- src/components/features/ticket/TicketsByStatusModal.vue -->
<template>
  <BaseModal
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :title="modalTitle"
    size="full"
  >
    <div class="space-y-4">
      <!-- Header avec statistiques -->
      <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ status ? getStatusLabel(status) : '' }}</h3>
            <p class="text-sm text-gray-600">{{ tickets.length }} ticket(s) dans ce statut</p>
          </div>
          <div class="px-4 py-2 rounded-lg" :class="status ? getStatusBgClass(status) : ''">
            <span class="text-2xl font-bold" :class="status ? getStatusTextClass(status) : ''">
              {{ tickets.length }}
            </span>
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

      <!-- Empty State -->
      <div v-else-if="tickets.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="mt-4 text-gray-500">Aucun ticket dans ce statut</p>
      </div>

      <!-- Tickets List -->
      <div v-else class="space-y-3 max-h-[60vh] overflow-y-auto">
        <div
          v-for="ticket in tickets"
          :key="ticket.id"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer bg-white"
          @click="goToTicket(ticket.id)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-sm font-mono text-indigo-600 font-semibold">{{ ticket.key }}</span>
                <span v-if="ticket.priority" 
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
                  :class="getPriorityBadgeClass(ticket.priority)">
                  {{ getPriorityIcon(ticket.priority) }} {{ getPriorityLabel(ticket.priority) }}
                </span>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  :class="getTypeBadgeClass(ticket.type)">
                  {{ getTypeIcon(ticket.type) }} {{ getTypeLabel(ticket.type) }}
                </span>
              </div>
              
              <h4 class="font-semibold text-gray-900 mb-2">{{ ticket.title }}</h4>
              
              <p class="text-sm text-gray-600 line-clamp-2 mb-3">{{ ticket.description }}</p>
              
              <div class="flex items-center space-x-4 text-sm text-gray-500">
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {{ ticket.difficultyPoints }} pts
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
              </div>
            </div>
            
            <svg class="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <p class="text-sm text-gray-500">
          Cliquez sur un ticket pour voir ses détails
        </p>
        <BaseButton
          variant="secondary"
          @click="$emit('update:modelValue', false)"
        >
          Fermer
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import BaseModal from '@/components/common/BaseModal.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import type { TicketStatus, TicketPriority, TicketType } from '@/types/ticket.types';

interface Ticket {
  id: number;
  key: string;
  title: string;
  description: string;
  status: TicketStatus;
  type: TicketType;
  difficultyPoints: number;
  priority?: TicketPriority;
  assignee?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  sprint?: {
    id: number;
    name: string;
  };
}

interface Props {
  modelValue: boolean;
  status: TicketStatus | null;
  tickets: Ticket[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const router = useRouter();

const modalTitle = computed(() => {
  if (!props.status) return 'Tickets';
  return `Tickets - ${getStatusLabel(props.status)}`;
});

function goToTicket(ticketId: number) {
  router.push(`/tickets/${ticketId}`);
  emit('update:modelValue', false);
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    A_FAIRE: 'À faire',
    EN_COURS: 'En cours',
    REVISION: 'Révision',
    DEMANDE_MODIFICATION: 'Demande de modification',
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

function getTypeBadgeClass(type: string): string {
  const classes: Record<string, string> = {
    bug: 'bg-red-50 text-red-700',
    feature: 'bg-blue-50 text-blue-700',
    task: 'bg-gray-50 text-gray-700',
    improvement: 'bg-green-50 text-green-700'
  };
  return classes[type] || 'bg-gray-50 text-gray-700';
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>