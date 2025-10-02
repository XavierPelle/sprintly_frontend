<!-- src/views/backlog/BacklogView.vue -->

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Backlog</h1>
        <p class="mt-1 text-sm text-gray-600">
          Gérez les tickets et sprints à venir
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <BaseButton @click="showCreateSprintModal = true">
          Créer un sprint
        </BaseButton>
        <BaseButton @click="showCreateTicketModal = true">
          Créer un ticket
        </BaseButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            v-model="filters.type"
            @change="loadBacklogTickets"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option :value="null">Tous</option>
            <option value="bug">🐛 Bug</option>
            <option value="feature">✨ Feature</option>
            <option value="task">📋 Tâche</option>
            <option value="improvement">⚡ Amélioration</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Assigné à</label>
          <select
            v-model="filters.assigneeId"
            @change="loadBacklogTickets"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option :value="null">Tous</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.firstName }} {{ user.lastName }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
          <select
            v-model="filters.sortBy"
            @change="loadBacklogTickets"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="createdAt">Date de création</option>
            <option value="difficultyPoints">Points</option>
            <option value="key">Clé</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
          <select
            v-model="filters.sortOrder"
            @change="loadBacklogTickets"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="DESC">Décroissant</option>
            <option value="ASC">Croissant</option>
          </select>
        </div>
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

    <!-- Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Sprints à venir (1/4) -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-4 py-3 border-b border-gray-200">
            <h2 class="font-semibold text-gray-900">Sprints à venir</h2>
          </div>
          <div class="p-4 space-y-3">
            <div
              v-for="sprint in upcomingSprints"
              :key="sprint.id"
              class="p-3 border border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer transition-colors"
              :class="{ 'border-indigo-500 bg-indigo-50': selectedSprintForTickets?.id === sprint.id }"
              @click="selectedSprintForTickets = sprint"
            >
              <h3 class="font-medium text-gray-900 text-sm">{{ sprint.name }}</h3>
              <div class="mt-2 flex items-center justify-between text-xs text-gray-600">
                <span>{{ formatDate(sprint.startDate) }}</span>
                <span>{{ sprint.maxPoints }} pts max</span>
              </div>
            </div>
            <p v-if="upcomingSprints.length === 0" class="text-center text-gray-500 text-sm py-4">
              Aucun sprint à venir
            </p>
          </div>
        </div>
      </div>

      <!-- Tickets du backlog (3/4) -->
      <div class="lg:col-span-3">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">
              Tickets sans sprint ({{ backlogTickets.length }})
            </h2>
            <div v-if="selectedTickets.length > 0" class="flex items-center space-x-3">
              <span class="text-sm text-gray-600">
                {{ selectedTickets.length }} sélectionné(s)
              </span>
              <BaseButton
                size="sm"
                @click="assignTicketsToSprint"
                :disabled="!selectedSprintForTickets || selectedTickets.length === 0"
              >
                Assigner au sprint
              </BaseButton>
            </div>
          </div>

          <!-- Tickets List -->
          <div class="divide-y divide-gray-200">
            <div
              v-for="ticket in backlogTickets"
              :key="ticket.id"
              class="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start space-x-4">
                <!-- Checkbox -->
                <input
                  type="checkbox"
                  :value="ticket.id"
                  v-model="selectedTickets"
                  class="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />

                <!-- Ticket Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-3 mb-2">
                    <span class="text-sm font-mono font-semibold text-indigo-600">
                      {{ ticket.key }}
                    </span>
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      :class="getTypeClass(ticket.type)"
                    >
                      {{ getTypeLabel(ticket.type) }}
                    </span>
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      :class="getStatusClass(ticket.status)"
                    >
                      {{ getStatusLabel(ticket.status) }}
                    </span>
                  </div>

                  <h3
                    class="text-sm font-medium text-gray-900 mb-1 cursor-pointer hover:text-indigo-600"
                    @click="handleTicketClick(ticket)"
                  >
                    {{ ticket.title }}
                  </h3>

                  <div class="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{{ ticket.difficultyPoints }} points</span>
                    <span v-if="ticket.assignee">
                      Assigné à {{ ticket.assignee.firstName }}
                    </span>
                    <span v-else>Non assigné</span>
                    <span>{{ formatDate(ticket.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <p v-if="backlogTickets.length === 0" class="px-6 py-12 text-center text-gray-500">
              Aucun ticket dans le backlog
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Create Sprint -->
    <BaseModal v-model="showCreateSprintModal" title="Créer un sprint" size="md">
      <div class="space-y-4">
        <BaseInput
          v-model="newSprint.name"
          label="Nom du sprint"
          placeholder="Sprint 1"
          required
        />
        <BaseInput
          v-model.number="newSprint.maxPoints"
          type="number"
          label="Points maximum"
          placeholder="100"
          required
        />
        <div class="grid grid-cols-2 gap-4">
          <BaseInput
            v-model="newSprint.startDate"
            type="date"
            label="Date de début"
            required
          />
          <BaseInput
            v-model="newSprint.endDate"
            type="date"
            label="Date de fin"
            required
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <BaseButton variant="secondary" @click="showCreateSprintModal = false">
            Annuler
          </BaseButton>
          <BaseButton @click="handleCreateSprint" :loading="creatingSprint">
            Créer
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Modal Create Ticket - Nouvelle modal améliorée -->
    <CreateTicketModal
      v-model="showCreateTicketModal"
      :users="users"
      :sprints="allSprints"
      @create="handleCreateTicket"
      @saveDraft="handleSaveDraft"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ticketApi } from '@/api/ticket.api';
import { sprintApi } from '@/api/sprint.api';
import { userApi } from '@/api/user.api';
import type { Ticket, TicketType, TicketStatus, CreateTicketPayload } from '@/types/ticket.types';
import type { Sprint, CreateSprintPayload } from '@/types/sprint.types';
import type { AuthUser } from '@/types/auth.types';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import CreateTicketModal from '@/components/features/ticket/CreateTicketModal.vue';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const toast = useToast();

const backlogTickets = ref<Ticket[]>([]);
const allSprints = ref<Sprint[]>([]);
const users = ref<AuthUser[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const selectedTickets = ref<number[]>([]);
const selectedSprintForTickets = ref<Sprint | null>(null);

// Filters
const filters = ref({
  type: null as string | null,
  assigneeId: null as number | null,
  sortBy: 'createdAt' as 'createdAt' | 'difficultyPoints' | 'key',
  sortOrder: 'DESC' as 'ASC' | 'DESC'
});

// Modals
const showCreateSprintModal = ref(false);
const showCreateTicketModal = ref(false);

// Forms
const newSprint = ref<CreateSprintPayload>({
  name: '',
  maxPoints: 100,
  startDate: '',
  endDate: ''
});

const creatingSprint = ref(false);
const creatingTicket = ref(false);

const upcomingSprints = computed(() => {
  const now = new Date();
  return allSprints.value.filter(s => new Date(s.startDate) > now);
});

async function loadBacklogTickets() {
  loading.value = true;
  error.value = null;

  try {
    const response = await ticketApi.search({
      sprintId: undefined, // Tickets sans sprint
      type: filters.value.type as any,
      assigneeId: filters.value.assigneeId || undefined,
      sortBy: filters.value.sortBy,
      sortOrder: filters.value.sortOrder,
      limit: 100
    });

    backlogTickets.value = response.tickets.filter(t => !t.sprint);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement';
  } finally {
    loading.value = false;
  }
}

async function loadSprints() {
  try {
    allSprints.value = await sprintApi.getAll();
  } catch (err) {
    console.error('Failed to load sprints:', err);
  }
}

async function loadUsers() {
  try {
    users.value = await userApi.getAll();
  } catch (err) {
    console.error('Failed to load users:', err);
  }
}

async function handleCreateSprint() {
  creatingSprint.value = true;

  try {
    await sprintApi.create(newSprint.value);

    toast.success('Sprint créé avec succès !');
    showCreateSprintModal.value = false;
    
    newSprint.value = {
      name: '',
      maxPoints: 100,
      startDate: '',
      endDate: ''
    };

    await loadSprints();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la création du sprint';
    toast.error(error.value);
  } finally {
    creatingSprint.value = false;
  }
}

async function handleCreateTicket(data: any) {
  creatingTicket.value = true;
  error.value = null;

  try {
    // Préparer le payload
    const payload: CreateTicketPayload = {
      title: data.title,
      description: data.description,
      type: data.type,
      difficultyPoints: data.difficultyPoints,
      assigneeId: data.assigneeId || undefined,
      sprintId: data.sprintId || undefined
    };

    // Créer le ticket
    const newTicket = await ticketApi.create(payload);

    // TODO: Upload des images si présentes
    // if (data.images && data.images.length > 0) {
    //   await uploadTicketImages(newTicket.id, data.images);
    // }

    toast.success('Ticket créé avec succès !');
    showCreateTicketModal.value = false;

    // Recharger la liste des tickets
    await loadBacklogTickets();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la création du ticket';
    toast.error(error.value);
  } finally {
    creatingTicket.value = false;
  }
}

function handleSaveDraft(data: any) {
  // Sauvegarder le brouillon dans le localStorage
  localStorage.setItem('ticketDraft', JSON.stringify({
    ...data,
    savedAt: new Date().toISOString()
  }));
  
  toast.info('Brouillon enregistré localement');
  showCreateTicketModal.value = false;
}

function handleTicketClick(ticket: Ticket) {
  router.push(`/tickets/${ticket.id}`);
}

function getTypeClass(type: TicketType): string {
  const classes: Record<TicketType, string> = {
    bug: 'bg-red-50 text-red-700 border border-red-200',
    feature: 'bg-blue-50 text-blue-700 border border-blue-200',
    task: 'bg-gray-50 text-gray-700 border border-gray-200',
    improvement: 'bg-green-50 text-green-700 border border-green-200'
  };
  return classes[type];
}

function getTypeLabel(type: TicketType): string {
  const labels: Record<TicketType, string> = {
    bug: '🐛 Bug',
    feature: '✨ Feature',
    task: '📋 Tâche',
    improvement: '⚡ Amélioration'
  };
  return labels[type];
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
  return classes[status];
}

function getStatusLabel(status: TicketStatus): string {
  const labels: Record<TicketStatus, string> = {
    A_FAIRE: 'À faire',
    EN_COURS: 'En cours',
    REVISION: 'Révision',
    DEMANDE_MODIFICATION: 'Modif.',
    TEST: 'Test',
    TEST_KO: 'Test KO',
    TEST_OK: 'Test OK',
    PRODUCTION: 'Production'
  };
  return labels[status];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

const assignTicketsToSprint = async () => {
  if (!selectedSprintForTickets.value || selectedTickets.value.length === 0) {
    toast.warning('Veuillez sélectionner un sprint et des tickets');
    return;
  }

  try {
    await sprintApi.addTickets(
      selectedSprintForTickets.value.id,
      selectedTickets.value
    );

    toast.success(`${selectedTickets.value.length} ticket(s) assigné(s) au sprint ${selectedSprintForTickets.value.name}`);

    selectedTickets.value = [];
    selectedSprintForTickets.value = null;

    await loadBacklogTickets();
  } catch (error: any) {
    console.error('Erreur:', error);
    toast.error(error.response?.data?.message || 'Erreur lors de l\'assignation des tickets');
  }
};

onMounted(async () => {
  await Promise.all([
    loadBacklogTickets(),
    loadSprints(),
    loadUsers()
  ]);
});
</script>