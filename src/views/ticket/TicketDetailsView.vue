<!-- src/views/ticket/TicketDetailsView.vue -->

<template>
  <div class="space-y-6">
    <!-- Breadcrumb -->
    <nav class="flex" aria-label="Breadcrumb">
      <ol class="flex items-center space-x-2 text-sm">
        <li>
          <router-link to="/tickets" class="text-gray-500 hover:text-gray-700">
            Tickets
          </router-link>
        </li>
        <li>
          <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </li>
        <li class="text-gray-900 font-medium">
          {{ ticket?.key || 'Chargement...' }}
        </li>
      </ol>
    </nav>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
      <button
        @click="loadTicket"
        class="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
      >
        Réessayer
      </button>
    </div>

    <!-- Ticket Content -->
    <div v-else-if="ticket" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content (2/3) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Header Card -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-3">
              <span class="text-xl font-mono font-bold text-indigo-600">
                {{ ticket.key }}
              </span>
              <span
                class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium"
                :class="getTypeClass(ticket.type)"
              >
                {{ getTypeLabel(ticket.type) }}
              </span>
            </div>
            <BaseButton
              variant="secondary"
              size="sm"
              @click="handleEdit"
            >
              Modifier
            </BaseButton>
          </div>

          <h1 class="text-2xl font-bold text-gray-900 mb-4">
            {{ ticket.title }}
          </h1>

          <div class="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {{ ticket.description }}
          </div>
        </div>

        <!-- Comments Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">
              Commentaires ({{ ticket.comments?.length || 0 }})
            </h2>
          </div>
          <div class="p-6">
            <!-- Comment Form -->
            <div class="mb-6">
              <textarea
                v-model="newComment"
                rows="3"
                placeholder="Ajouter un commentaire..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              ></textarea>
              <div class="mt-2 flex justify-end">
                <BaseButton
                  @click="handleAddComment"
                  :disabled="!newComment.trim()"
                  :loading="addingComment"
                >
                  Ajouter
                </BaseButton>
              </div>
            </div>

            <!-- Comments List -->
            <div v-if="ticket.comments && ticket.comments.length > 0" class="divide-y divide-gray-200">
              <CommentItem
                v-for="comment in ticket.comments"
                :key="comment.id"
                :comment="comment"
                @edit="handleEditComment"
                @delete="handleDeleteComment"
              />
            </div>
            <p v-else class="text-center text-gray-500 py-8">
              Aucun commentaire pour le moment
            </p>
          </div>
        </div>

        <!-- Tests Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">
              Tests ({{ ticket.tests?.length || 0 }})
            </h2>
            <BaseButton
              v-if="ticket.status === 'TEST' || ticket.status === 'TEST_KO'"
              size="sm"
              @click="showTestModal = true"
            >
              Créer un test
            </BaseButton>
          </div>
          <div class="p-6">
            <div v-if="ticket.tests && ticket.tests.length > 0" class="space-y-4">
              <TestItem
                v-for="test in ticket.tests"
                :key="test.id"
                :test="test"
                @validate="handleValidateTest"
              />
            </div>
            <p v-else class="text-center text-gray-500 py-8">
              Aucun test pour le moment
            </p>
          </div>
        </div>
      </div>

      <!-- Sidebar (1/3) -->
      <div class="space-y-6">
        <!-- Status Card -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-sm font-medium text-gray-900 mb-3">Statut</h3>
          <select
            v-model="ticket.status"
            @change="handleStatusChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="A_FAIRE">À faire</option>
            <option value="EN_COURS">En cours</option>
            <option value="REVISION">Révision</option>
            <option value="DEMANDE_MODIFICATION">Modif. demandée</option>
            <option value="TEST">Test</option>
            <option value="TEST_KO">Test KO</option>
            <option value="TEST_OK">Test OK</option>
            <option value="PRODUCTION">Production</option>
          </select>
        </div>

        <!-- Details Card -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <h3 class="text-sm font-medium text-gray-900 mb-2">Créé par</h3>
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {{ ticket.creator.firstName[0] }}{{ ticket.creator.lastName[0] }}
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ ticket.creator.firstName }} {{ ticket.creator.lastName }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ formatDate(ticket.createdAt) }}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-900 mb-2">Assigné à</h3>
            <div v-if="ticket.assignee" class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {{ ticket.assignee.firstName[0] }}{{ ticket.assignee.lastName[0] }}
              </div>
              <p class="text-sm font-medium text-gray-900">
                {{ ticket.assignee.firstName }} {{ ticket.assignee.lastName }}
              </p>
            </div>
            <p v-else class="text-sm text-gray-500">Non assigné</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-900 mb-2">Points de difficulté</h3>
            <p class="text-2xl font-bold text-indigo-600">
              {{ ticket.difficultyPoints }}
            </p>
          </div>

          <div v-if="ticket.sprint">
            <h3 class="text-sm font-medium text-gray-900 mb-2">Sprint</h3>
            <router-link
              :to="`/sprint/${ticket.sprint.id}/details`"
              class="text-sm text-indigo-600 hover:text-indigo-700"
            >
              {{ ticket.sprint.name }}
            </router-link>
          </div>
        </div>

        <!-- Stats Card -->
        <div v-if="ticket.stats" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">Statistiques</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Commentaires</span>
              <span class="text-sm font-medium text-gray-900">{{ ticket.stats.totalComments }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Tests</span>
              <span class="text-sm font-medium text-gray-900">{{ ticket.stats.totalTests }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Tests validés</span>
              <span class="text-sm font-medium text-green-600">{{ ticket.stats.validatedTests }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Images</span>
              <span class="text-sm font-medium text-gray-900">{{ ticket.stats.totalImages }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Create Test -->
    <BaseModal
      v-model="showTestModal"
      title="Créer un test"
      size="md"
    >
      <div class="space-y-4">
        <textarea
          v-model="newTest"
          rows="5"
          placeholder="Décrivez le résultat du test..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        ></textarea>
      </div>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <BaseButton
            variant="secondary"
            @click="showTestModal = false"
          >
            Annuler
          </BaseButton>
          <BaseButton
            @click="handleCreateTest"
            :disabled="!newTest.trim()"
            :loading="creatingTest"
          >
            Créer le test
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
// Script pour TicketDetailsView.vue (à ajouter après le template)

import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ticketApi } from '@/api/ticket.api';
import { commentApi } from '@/api/comment.api';
import { testApi } from '@/api/test.api';
import type { TicketDetails, TicketType, Comment, Test } from '@/types/ticket.types';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import CommentItem from '@/components/features/ticket/CommentItem.vue';
import TestItem from '@/components/features/ticket/TestItem.vue';

const route = useRoute();

const ticket = ref<TicketDetails | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// Comments
const newComment = ref('');
const addingComment = ref(false);

// Tests
const showTestModal = ref(false);
const newTest = ref('');
const creatingTest = ref(false);

async function loadTicket() {
  loading.value = true;
  error.value = null;

  try {
    const ticketId = parseInt(route.params.id as string);
    ticket.value = await ticketApi.getDetails(ticketId);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement du ticket';
    console.error('Failed to load ticket:', err);
  } finally {
    loading.value = false;
  }
}

async function handleStatusChange() {
  if (!ticket.value) return;

  try {
    await ticketApi.changeStatus(ticket.value.id, ticket.value.status);
    // Success message could be added here
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du changement de statut';
    await loadTicket(); // Reload to reset status
  }
}

async function handleAddComment() {
  if (!ticket.value || !newComment.value.trim()) return;

  addingComment.value = true;

  try {
    const comment = await commentApi.createOnTicket(ticket.value.id, {
      description: newComment.value
    });

    // Add comment to local list
    if (ticket.value.comments) {
      ticket.value.comments.unshift(comment);
    }

    newComment.value = '';
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de l\'ajout du commentaire';
  } finally {
    addingComment.value = false;
  }
}

function handleEditComment(comment: Comment) {
  // TODO: Implement edit comment
  alert('Fonctionnalité à venir');
}

async function handleDeleteComment(comment: Comment) {
  if (!confirm('Voulez-vous vraiment supprimer ce commentaire ?')) {
    return;
  }

  try {
    await commentApi.delete(comment.id);

    // Remove from local list
    if (ticket.value?.comments) {
      const index = ticket.value.comments.findIndex(c => c.id === comment.id);
      if (index !== -1) {
        ticket.value.comments.splice(index, 1);
      }
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la suppression du commentaire';
  }
}

async function handleCreateTest() {
  if (!ticket.value || !newTest.value.trim()) return;

  creatingTest.value = true;

  try {
    const test = await testApi.createForTicket(ticket.value.id, {
      description: newTest.value
    });

    // Add test to local list
    if (ticket.value.tests) {
      ticket.value.tests.unshift(test);
    }

    newTest.value = '';
    showTestModal.value = false;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la création du test';
  } finally {
    creatingTest.value = false;
  }
}

async function handleValidateTest(test: Test, isValidated: boolean) {
  try {
    await testApi.validate(test.id, { isValidated });

    // Update local test
    if (ticket.value?.tests) {
      const index = ticket.value.tests.findIndex(t => t.id === test.id);
      if (index !== -1) {
        ticket.value.tests[index].isValidated = isValidated;
      }
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la validation du test';
  }
}

function handleEdit() {
  // TODO: Navigate to edit page or open edit modal
  alert('Fonctionnalité à venir');
}

function getTypeClass(type: TicketType): string {
  const classes: Record<TicketType, string> = {
    bug: 'bg-red-100 text-red-800',
    feature: 'bg-blue-100 text-blue-800',
    task: 'bg-gray-100 text-gray-800',
    improvement: 'bg-green-100 text-green-800'
  };
  return classes[type] || 'bg-gray-100 text-gray-800';
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

onMounted(() => {
  loadTicket();
});
</script>