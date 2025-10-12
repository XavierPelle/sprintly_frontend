<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <!-- Header compact -->
    <div class="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm px-6 py-4 flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-6">
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Sprint Planning
            </h1>
            <p class="text-sm text-gray-600 mt-0.5">Organisez votre backlog efficacement</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
              <div class="flex items-center space-x-3 text-sm">
                <div class="flex items-center space-x-1.5">
                  <span class="text-2xl">🎫</span>
                  <span class="font-bold text-indigo-600">{{ backlogTickets.length }}</span>
                  <span class="text-gray-600">tickets</span>
                </div>
                <div class="w-px h-4 bg-indigo-200"></div>
                <div class="flex items-center space-x-1.5">
                  <span class="text-2xl">⚡</span>
                  <span class="font-bold text-blue-600">{{ totalBacklogPoints }}</span>
                  <span class="text-gray-600">points</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <BaseButton size="sm" variant="secondary" @click="showCreateSprintModal = true">
            <span class="mr-1">📅</span> Nouveau sprint
          </BaseButton>
          <router-link to="/tickets/create">
            <BaseButton size="sm">
              <span class="mr-1">✨</span> Nouveau ticket
            </BaseButton>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Filters avec style moderne -->
    <div class="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 px-6 py-3 flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <select v-model="filters.type" @change="loadBacklogTickets"
            class="text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm hover:border-indigo-300 transition-all">
            <option :value="null">🎯 Tous les types</option>
            <option value="bug">🐛 Bug</option>
            <option value="feature">✨ Feature</option>
            <option value="task">📋 Tâche</option>
            <option value="improvement">⚡ Amélioration</option>
          </select>

          <select v-model="filters.assignee" @change="loadBacklogTickets"
            class="text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm hover:border-indigo-300 transition-all">
            <option :value="null">👥 Tous les assignés</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.firstName }} {{ user.lastName }}
            </option>
          </select>

          <select v-model="filters.sortBy" @change="loadBacklogTickets"
            class="text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm hover:border-indigo-300 transition-all">
            <option value="difficultyPoints">⚡ Points</option>
            <option value="createdAt">📅 Date</option>
            <option value="key">🔑 Clé</option>
          </select>

          <button @click="toggleSortOrder"
            class="text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm font-medium"
            :title="filters.sortOrder === 'DESC' ? 'Décroissant' : 'Croissant'">
            <span class="text-base">{{ filters.sortOrder === 'DESC' ? '↓' : '↑' }}</span>
          </button>
        </div>

        <div v-if="selectedTickets.length > 0" class="flex items-center space-x-3">
          <div class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg shadow-md">
            <div class="flex items-center space-x-3 text-sm font-medium">
              <span>✓ {{ selectedTickets.length }} sélectionné(s)</span>
              <div class="w-px h-4 bg-white/30"></div>
              <span>{{ selectedTicketsPoints }} pts</span>
            </div>
          </div>
          <button @click="selectedTickets = []"
            class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all">
            <span class="text-lg">✕</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex-1 overflow-hidden">
      <div class="h-full flex">
        <!-- Tickets list (70%) -->
        <div class="flex-1 overflow-y-auto">
          <!-- Loading State -->
          <div v-if="loading" class="flex items-center justify-center h-full">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="m-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-800">{{ error }}</p>
          </div>

          <!-- Tickets Table -->
          <div v-else class="bg-white">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th class="px-4 py-2 w-10">
                    <input type="checkbox" @change="toggleSelectAll" :checked="allSelected"
                      :indeterminate.prop="someSelected"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  </th>
                  <th class="px-2 py-2 w-24">Clé</th>
                  <th class="px-2 py-2 w-20">Type</th>
                  <th class="px-2 py-2 flex-1">Titre</th>
                  <th class="px-2 py-2 w-16 text-center">Points</th>
                  <th class="px-2 py-2 w-32">Assigné</th>
                  <th class="px-2 py-2 w-24">Statut</th>
                  <th class="px-2 py-2 w-20"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="ticket in backlogTickets" :key="ticket.id"
                  class="hover:bg-gray-50 transition-colors cursor-pointer"
                  :class="{ 'bg-indigo-50': selectedTickets.includes(ticket.id) }"
                  @click="toggleTicketSelection(ticket.id, $event)">
                  <td class="px-4 py-2" @click.stop>
                    <input type="checkbox" :value="ticket.id" v-model="selectedTickets"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  </td>
                  <td class="px-2 py-2">
                    <span class="text-xs font-mono font-semibold text-indigo-600">
                      {{ ticket.key }}
                    </span>
                  </td>
                  <td class="px-2 py-2">
                    <span class="text-lg" :title="getTypeLabel(ticket.type)">
                      {{ getTypeEmoji(ticket.type) }}
                    </span>
                  </td>
                  <td class="px-2 py-2">
                    <div class="text-sm text-gray-900 truncate max-w-md hover:text-indigo-600"
                      @click="handleTicketClick(ticket)">
                      {{ ticket.title }}
                    </div>
                  </td>
                  <td class="px-2 py-2 text-center">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold"
                      :class="getPointsClass(ticket.difficultyPoints)">
                      {{ ticket.difficultyPoints }}
                    </span>
                  </td>
                  <td class="px-2 py-2">
                    <div v-if="ticket.assignee" class="flex items-center">
                      <div
                        class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-700 mr-2">
                        {{ ticket.assignee.firstName[0] }}{{ ticket.assignee.lastName[0] }}
                      </div>
                      <span class="text-xs text-gray-700 truncate max-w-20">
                        {{ ticket.assignee.firstName }}
                      </span>
                    </div>
                    <span v-else class="text-xs text-gray-400">Non assigné</span>
                  </td>
                  <td class="px-2 py-2">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      :class="getStatusClass(ticket.status)">
                      {{ getStatusLabel(ticket.status) }}
                    </span>
                  </td>
                  <td class="px-2 py-2 text-right">
                    <button @click.stop="quickAssignToSprint(ticket.id)"
                      class="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      :disabled="!selectedSprintForTickets">
                      →
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="backlogTickets.length === 0" class="text-center py-12 text-gray-500">
              Aucun ticket dans le backlog
            </div>
          </div>
        </div>

        <!-- Sprints sidebar (30%) -->
        <div class="w-96 border-l border-gray-200 bg-white overflow-y-auto flex-shrink-0">
          <div class="p-4 space-y-4">
            <!-- Actions -->
            <div v-if="selectedTickets.length > 0" class="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <div class="text-sm font-medium text-indigo-900 mb-2">
                Assigner {{ selectedTickets.length }} ticket(s) à un sprint
              </div>
              <BaseButton size="sm" class="w-full" @click="assignTicketsToSprint" :disabled="!selectedSprintForTickets">
                {{ selectedSprintForTickets ? `→ ${selectedSprintForTickets.name}` : 'Sélectionner un sprint' }}
              </BaseButton>
            </div>

            <!-- Sprints en cours -->
            <div v-if="activeSprints.length > 0">
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                <span class="mr-1">🏃</span>
                Sprints en cours ({{ activeSprints.length }})
              </h3>
              <div class="space-y-2">
                <div v-for="sprint in activeSprints" :key="sprint.id"
                  class="p-3 border rounded-lg cursor-pointer transition-all" :class="getSprintClass(sprint, true)"
                  @click="selectedSprintForTickets = sprint">
                  <div class="flex items-start justify-between mb-2">
                    <h4 class="font-medium text-sm text-gray-900">{{ sprint.name }}</h4>
                    <span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      En cours
                    </span>
                  </div>
                  <div class="space-y-1 text-xs text-gray-600">
                    <div class="flex items-center justify-between">
                      <span>📅 {{ formatDateShort(sprint.startDate) }} - {{ formatDateShort(sprint.endDate) }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span>{{ getSprintCurrentPoints(sprint) }} / {{ sprint.maxPoints }} pts</span>
                      <div class="flex-1 mx-2 bg-gray-200 rounded-full h-1.5">
                        <div class="bg-blue-500 h-1.5 rounded-full transition-all"
                          :style="{ width: getSprintProgress(sprint) + '%' }"></div>
                      </div>
                      <span class="font-medium">{{ getSprintProgress(sprint) }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sprints à venir -->
            <div>
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                <span class="mr-1">📅</span>
                Sprints à venir ({{ upcomingSprints.length }})
              </h3>
              <div class="space-y-2">
                <div v-for="sprint in upcomingSprints" :key="sprint.id"
                  class="p-3 border rounded-lg cursor-pointer transition-all" :class="getSprintClass(sprint, false)"
                  @click="selectedSprintForTickets = sprint">
                  <div class="flex items-start justify-between mb-2">
                    <h4 class="font-medium text-sm text-gray-900">{{ sprint.name }}</h4>
                    <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {{ getDaysUntilStart(sprint.startDate) }}
                    </span>
                  </div>
                  <div class="space-y-1 text-xs text-gray-600">
                    <div>📅 Début {{ formatDateShort(sprint.startDate) }}</div>
                    <div class="flex items-center justify-between">
                      <span>{{ getSprintCurrentPoints(sprint) }} / {{ sprint.maxPoints }} pts</span>
                      <div class="flex-1 mx-2 bg-gray-200 rounded-full h-1.5">
                        <div class="bg-indigo-500 h-1.5 rounded-full transition-all"
                          :style="{ width: getSprintProgress(sprint) + '%' }"></div>
                      </div>
                      <span class="font-medium">{{ getSprintProgress(sprint) }}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="upcomingSprints.length === 0" class="text-center py-8 text-gray-400 text-sm">
                Aucun sprint à venir
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Create Sprint -->
    <BaseModal v-model="showCreateSprintModal" title="Créer un sprint" size="md">
      <div class="space-y-4">
        <BaseInput v-model="newSprint.name" label="Nom du sprint" placeholder="Sprint 1" required />
        <BaseInput v-model.number="newSprint.maxPoints" type="number" label="Points maximum" placeholder="100"
          required />
        <div class="grid grid-cols-2 gap-4">
          <BaseInput v-model="newSprint.startDate" type="date" label="Date de début" required />
          <BaseInput v-model="newSprint.endDate" type="date" label="Date de fin" required />
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

    <!-- Modal Create Ticket -->
    <CreateTicketModal v-model="showCreateTicketModal" :users="users" :sprints="allSprints" @create="handleCreateTicket"
      @saveDraft="handleSaveDraft" />
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
  assignee: null as number | null,
  sortBy: 'difficultyPoints' as 'createdAt' | 'difficultyPoints' | 'key',
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

// Computed
const activeSprints = computed(() => {
  const now = new Date();
  return allSprints.value
    .filter(s => new Date(s.startDate) <= now && new Date(s.endDate) >= now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
});

const upcomingSprints = computed(() => {
  const now = new Date();
  return allSprints.value
    .filter(s => new Date(s.startDate) > now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
});

const totalBacklogPoints = computed(() => {
  return backlogTickets.value.reduce((sum, ticket) => sum + ticket.difficultyPoints, 0);
});

const selectedTicketsPoints = computed(() => {
  return backlogTickets.value
    .filter(t => selectedTickets.value.includes(t.id))
    .reduce((sum, ticket) => sum + ticket.difficultyPoints, 0);
});

const allSelected = computed(() => {
  return backlogTickets.value.length > 0 && selectedTickets.value.length === backlogTickets.value.length;
});

const someSelected = computed(() => {
  return selectedTickets.value.length > 0 && selectedTickets.value.length < backlogTickets.value.length;
});

// Methods
function toggleSortOrder() {
  filters.value.sortOrder = filters.value.sortOrder === 'ASC' ? 'DESC' : 'ASC';
  loadBacklogTickets();
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedTickets.value = [];
  } else {
    selectedTickets.value = backlogTickets.value.map(t => t.id);
  }
}

function toggleTicketSelection(ticketId: number, event: MouseEvent) {
  if ((event.target as HTMLElement).closest('input[type="checkbox"]')) {
    return;
  }

  const index = selectedTickets.value.indexOf(ticketId);
  if (index > -1) {
    selectedTickets.value.splice(index, 1);
  } else {
    selectedTickets.value.push(ticketId);
  }
}

async function quickAssignToSprint(ticketId: number) {
  if (!selectedSprintForTickets.value) {
    toast.warning('Veuillez d\'abord sélectionner un sprint');
    return;
  }

  try {
    await sprintApi.addTickets(selectedSprintForTickets.value.id, [ticketId]);
    toast.success('Ticket assigné au sprint');
    await loadBacklogTickets();
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Erreur lors de l\'assignation');
  }
}

async function loadBacklogTickets() {
  loading.value = true;
  error.value = null;

  try {
    const response = await ticketApi.search({
      sprintId: undefined,
      type: filters.value.type as any,
      assignee: filters.value.assignee || undefined,
      sortBy: filters.value.sortBy,
      sortOrder: filters.value.sortOrder,
      limit: 500,
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
    const payload: CreateTicketPayload = {
      title: data.title,
      description: data.description,
      type: data.type,
      difficultyPoints: data.difficultyPoints,
      assignee: data.assignee || undefined,
      sprintId: data.sprintId || undefined,
      priority: data.priority
    };

    await ticketApi.create(payload);
    toast.success('Ticket créé avec succès !');
    showCreateTicketModal.value = false;
    await loadBacklogTickets();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la création du ticket';
    toast.error(error.value);
  } finally {
    creatingTicket.value = false;
  }
}

function handleSaveDraft(data: any) {
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

function getTypeEmoji(type: TicketType): string {
  const emojis: Record<TicketType, string> = {
    bug: '🐛',
    feature: '✨',
    task: '📋',
    improvement: '⚡'
  };
  return emojis[type];
}

function getTypeLabel(type: TicketType): string {
  const labels: Record<TicketType, string> = {
    bug: 'Bug',
    feature: 'Feature',
    task: 'Tâche',
    improvement: 'Amélioration'
  };
  return labels[type];
}

function getPointsClass(points: number): string {
  if (points <= 3) return 'bg-green-100 text-green-700';
  if (points <= 5) return 'bg-yellow-100 text-yellow-700';
  if (points <= 8) return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
}

function getStatusClass(status: TicketStatus): string {
  const classes: Record<TicketStatus, string> = {
    A_FAIRE: 'bg-gray-100 text-gray-700',
    EN_COURS: 'bg-blue-100 text-blue-700',
    REVISION: 'bg-purple-100 text-purple-700',
    DEMANDE_MODIFICATION: 'bg-orange-100 text-orange-700',
    TEST: 'bg-yellow-100 text-yellow-700',
    TEST_KO: 'bg-red-100 text-red-700',
    TEST_OK: 'bg-green-100 text-green-700',
    PRODUCTION: 'bg-emerald-100 text-emerald-700'
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
    TEST_KO: 'KO',
    TEST_OK: 'OK',
    PRODUCTION: 'Prod'
  };
  return labels[status];
}

function getSprintClass(sprint: Sprint, isActive: boolean): string {
  const isSelected = selectedSprintForTickets.value?.id === sprint.id;
  const baseClass = 'border-2';

  if (isSelected) {
    return isActive
      ? `${baseClass} border-blue-500 bg-blue-50 shadow-md`
      : `${baseClass} border-indigo-500 bg-indigo-50 shadow-md`;
  }

  return isActive
    ? `${baseClass} border-blue-200 hover:border-blue-400 hover:bg-blue-50`
    : `${baseClass} border-gray-200 hover:border-indigo-300 hover:bg-indigo-50`;
}

function getSprintCurrentPoints(sprint: Sprint): number {
  // Cette fonction devrait calculer les points actuels du sprint
  // Pour l'instant, retourne 0 - à implémenter avec les vraies données
  return 0;
}

function getSprintProgress(sprint: Sprint): number {
  const current = getSprintCurrentPoints(sprint);
  return Math.round((current / sprint.maxPoints) * 100);
}

function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function getDaysUntilStart(startDate: string): string {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = start.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Demain";
  if (diffDays <= 7) return `${diffDays}j`;
  return `${Math.ceil(diffDays / 7)}sem`;
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