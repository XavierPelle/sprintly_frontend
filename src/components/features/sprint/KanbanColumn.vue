<template>
  <div class="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2">
        <div
          class="w-3 h-3 rounded-full"
          :style="{ backgroundColor: color }"
        ></div>
        <h3 class="font-semibold text-gray-900">{{ title }}</h3>
        <span class="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full">
          {{ tickets.length }}
        </span>
      </div>
    </div>

    <!-- Drop zone -->
    <div
      @dragover="handleDragOver"
      @drop="handleDrop"
      class="space-y-3 min-h-[200px] transition-colors"
      :class="{ 'bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-lg': isDragOver }"
    >
      <KanbanCard
        v-for="ticket in tickets"
        :key="ticket.id"
        :ticket="ticket"
        :is-dragging="draggedTicketId === ticket.id"
        @dragstart="handleDragStart(ticket)"
        @dragend="handleDragEnd"
        @click="$emit('ticket-click', ticket)"
      />

      <div v-if="tickets.length === 0" class="text-center py-8 text-gray-400 text-sm">
        Aucun ticket
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Ticket, TicketStatus } from '@/types/ticket.types';
import KanbanCard from '../ticket/KanbanCard.vue';

interface Props {
  status: TicketStatus;
  title: string;
  color: string;
  tickets: Ticket[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'ticket-drop': [ticket: Ticket, newStatus: TicketStatus];
  'ticket-click': [ticket: Ticket];
}>();

const draggedTicketId = ref<number | null>(null);
const isDragOver = ref(false);

function handleDragStart(ticket: Ticket) {
  draggedTicketId.value = ticket.id;
}

function handleDragEnd() {
  draggedTicketId.value = null;
  isDragOver.value = false;
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = true;
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = false;
  
  const ticket = props.tickets.find(t => t.id === draggedTicketId.value);
  if (!ticket) {
    // Le ticket vient d'une autre colonne
    // On émet l'événement avec le status de cette colonne
    return;
  }
}

// Exposer pour utilisation depuis le parent
defineExpose({
  handleDrop: (ticket: Ticket) => {
    emit('ticket-drop', ticket, props.status);
  }
});
</script>