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
            <path fill-rule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clip-rule="evenodd" />
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
      <button @click="loadTicket" class="mt-2 text-sm text-red-600 hover:text-red-700 font-medium">
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
              <span class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium"
                :class="getTypeClass(ticket.type)">
                {{ getTypeLabel(ticket.type) }}
              </span>
            </div>
            <BaseButton variant="secondary" size="sm" @click="openEditModal">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modifier
            </BaseButton>
          </div>

          <h1 class="text-2xl font-bold text-gray-900 mb-4">
            {{ ticket.title }}
          </h1>

          <div class="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {{ ticket.description }}
          </div>

          <!-- Metadata row -->
          <div class="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Créé le {{ formatDateLong(ticket.createdAt) }}
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Mis à jour le {{ formatDateLong(ticket.updatedAt) }}
            </div>
          </div>
        </div>

        <!-- Images Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">
              Images ({{ ticket.images?.length || 0 }})
            </h2>
            <button @click="triggerImageUpload"
              class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Ajouter
            </button>
            <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
          </div>

          <div class="p-6">
            <!-- Images Grid -->
            <div v-if="sortedImages.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div v-for="image in sortedImages" :key="image.id" class="relative group">
                <div
                  class="relative cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-indigo-400 transition-all aspect-square bg-gray-100"
                  @click="openImageViewer(image)">
                  
                  <img 
                    :src="getImageFullUrl(image)" 
                    :alt="image.filename" 
                    class="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />

                  <!-- Hover Overlay - uniquement visible au hover -->
                  <div
                    class="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity flex items-center justify-center pointer-events-none">
                  </div>
                  
                  <!-- Buttons Container -->
                  <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div class="flex items-center space-x-2 pointer-events-auto">
                      <!-- View Icon -->
                      <button @click.stop="openImageViewer(image)"
                        class="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors" title="Voir l'image">
                        <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      <!-- Delete Icon -->
                      <button v-if="canDeleteImages" @click.stop="handleImageDelete(image)"
                        class="p-2 bg-white rounded-full hover:bg-red-50 transition-colors" title="Supprimer l'image">
                        <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Order Badge -->
                  <div class="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded z-10">
                    #{{ image.displayOrder }}
                  </div>
                </div>

                <!-- Filename -->
                <div class="mt-2">
                  <p class="text-xs text-gray-600 truncate" :title="image.filename">
                    {{ image.filename }}
                  </p>
                </div>
              </div>

              <!-- Upload placeholder -->
              <div v-if="uploadingImages"
                class="relative rounded-lg overflow-hidden border-2 border-dashed border-gray-300 aspect-square flex items-center justify-center bg-gray-50">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p class="mt-2 text-xs text-gray-500">Upload...</p>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="mt-2 text-sm text-gray-500">Aucune image pour ce ticket</p>
              <button @click="triggerImageUpload"
                class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Ajouter la première image
              </button>
            </div>
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
              <textarea v-model="newComment" rows="3" placeholder="Ajouter un commentaire..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
              <div class="mt-2 flex justify-end">
                <BaseButton @click="handleAddComment" :disabled="!newComment.trim()" :loading="addingComment">
                  Ajouter
                </BaseButton>
              </div>
            </div>

            <!-- Comments List -->
            <div v-if="ticket.comments && ticket.comments.length > 0" class="divide-y divide-gray-200">
              <CommentItem v-for="comment in ticket.comments" :key="comment.id" :comment="comment"
                @edit="handleEditComment" @delete="handleDeleteComment" />
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
            <BaseButton v-if="ticket.status === 'TEST' || ticket.status === 'TEST_KO'" size="sm"
              @click="showTestModal = true">
              Créer un test
            </BaseButton>
          </div>
          <div class="p-6">
            <div v-if="ticket.tests && ticket.tests.length > 0" class="space-y-4">
              <TestItem v-for="test in ticket.tests" :key="test.id" :test="test" @validate="handleValidateTest" />
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
          <select v-model="ticket.status" @change="handleStatusChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
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
              <div
                class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {{ ticket.creator.firstName[0] }}{{ ticket.creator.lastName[0] }}
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ ticket.creator.firstName }} {{ ticket.creator.lastName }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ ticket.creator.email }}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-900 mb-2">Assigné à</h3>
            <div v-if="ticket.assignee" class="flex items-center space-x-2">
              <div
                class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {{ ticket.assignee.firstName[0] }}{{ ticket.assignee.lastName[0] }}
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ ticket.assignee.firstName }} {{ ticket.assignee.lastName }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ ticket.assignee.email }}
                </p>
              </div>
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
            <router-link :to="`/sprint/${ticket.sprint.id}/details`"
              class="text-sm text-indigo-600 hover:text-indigo-700 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {{ ticket.sprint.name }}
            </router-link>
            <p class="text-xs text-gray-500 mt-1">
              {{ formatDate(ticket.sprint.startDate) }} - {{ formatDate(ticket.sprint.endDate) }}
            </p>
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

    <!-- Modal Edit Ticket -->
    <BaseModal v-model="showEditModal" title="Modifier le ticket" size="lg">
      <div class="space-y-4">
        <BaseInput v-model="editForm.title" label="Titre" placeholder="Titre du ticket" required />
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea v-model="editForm.description" rows="5"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Description détaillée..."></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select v-model="editForm.type"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="bug">🐛 Bug</option>
              <option value="feature">✨ Feature</option>
              <option value="task">📋 Tâche</option>
              <option value="improvement">⚡ Amélioration</option>
            </select>
          </div>
          <BaseInput v-model.number="editForm.difficultyPoints" type="number" label="Points de difficulté" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Assigner à</label>
          <select v-model="editForm.assignee"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option :value="null">Non assigné</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.firstName }} {{ user.lastName }}
            </option>
          </select>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <BaseButton variant="secondary" @click="showEditModal = false">
            Annuler
          </BaseButton>
          <BaseButton @click="handleUpdateTicket" :loading="updatingTicket">
            Enregistrer
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Modal Create Test -->
    <BaseModal v-model="showTestModal" title="Créer un test" size="md">
      <div class="space-y-4">
        <textarea v-model="newTest" rows="5" placeholder="Décrivez le résultat du test..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
      </div>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <BaseButton variant="secondary" @click="showTestModal = false">
            Annuler
          </BaseButton>
          <BaseButton @click="handleCreateTest" :disabled="!newTest.trim()" :loading="creatingTest">
            Créer le test
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Modal Image Viewer -->
    <ImageViewerModal v-model="showImageViewer" :images="ticket?.images || []" :initial-image-id="selectedImageId" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ticketApi } from '@/api/ticket.api';
import { commentApi } from '@/api/comment.api';
import { testApi } from '@/api/test.api';
import { userApi } from '@/api/user.api';
import { imageApi } from '@/api/image.api';
import type { TicketDetails, TicketType, Comment, Test } from '@/types/ticket.types';
import type { AuthUser } from '@/types/auth.types';
import { useAuthStore } from '@/stores/auth.store';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import CommentItem from '@/components/features/ticket/CommentItem.vue';
import TestItem from '@/components/features/ticket/TestItem.vue';
import ImageViewerModal from '@/components/features/ticket/ImageViewerModal.vue';
import { useToast } from '@/composables/useToast';

const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();

const ticket = ref<TicketDetails | null>(null);
const users = ref<AuthUser[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Comments
const newComment = ref('');
const addingComment = ref(false);

// Tests
const showTestModal = ref(false);
const newTest = ref('');
const creatingTest = ref(false);

// Edit
const showEditModal = ref(false);
const updatingTicket = ref(false);
const editForm = ref({
  title: '',
  description: '',
  type: 'task' as TicketType,
  difficultyPoints: 0,
  assignee: null as number | null
});

// Images
const imageInput = ref<HTMLInputElement | null>(null);
const uploadingImages = ref(false);
const showImageViewer = ref(false);
const selectedImageId = ref<number | null>(null);

const sortedImages = computed(() => {
  if (!ticket.value?.images) return [];
  return [...ticket.value.images].sort((a, b) => a.displayOrder - b.displayOrder);
});

const canDeleteImages = computed(() => {
  return authStore.currentUser?.id === ticket.value?.creator.id;
});

// Helper pour construire l'URL complète de l'image
function getImageFullUrl(image: { url: string }): string {
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
  
  if (image.url.startsWith('http://') || image.url.startsWith('https://')) {
    return image.url;
  }
  
  return `${baseUrl}${image.url}`;
}

async function loadTicket() {
  loading.value = true;
  error.value = null;

  try {
    const ticketId = parseInt(route.params.id as string);
    ticket.value = await ticketApi.getDetails(ticketId);

    if (ticket.value) {
      editForm.value = {
        title: ticket.value.title,
        description: ticket.value.description,
        type: ticket.value.type,
        difficultyPoints: ticket.value.difficultyPoints,
        assignee: ticket.value.assignee?.id || null
      };
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement du ticket';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
}

async function loadUsers() {
  try {
    users.value = await userApi.getAll();
  } catch (err) {
    console.error('Failed to load users:', err);
  }
}

function openEditModal() {
  if (ticket.value) {
    editForm.value = {
      title: ticket.value.title,
      description: ticket.value.description,
      type: ticket.value.type,
      difficultyPoints: ticket.value.difficultyPoints,
      assignee: ticket.value.assignee?.id || null
    };
    showEditModal.value = true;
  }
}

async function handleStatusChange() {
  if (!ticket.value) return;

  try {
    await ticketApi.changeStatus(ticket.value.id, ticket.value.status);
    toast.success('Statut mis à jour');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du changement de statut';
    toast.error(error.value);
    await loadTicket();
  }
}

async function handleUpdateTicket() {
  if (!ticket.value) return;

  updatingTicket.value = true;

  try {
    await ticketApi.update(ticket.value.id, editForm.value);
    toast.success('Ticket mis à jour');
    showEditModal.value = false;
    await loadTicket();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la mise à jour';
    toast.error(error.value);
  } finally {
    updatingTicket.value = false;
  }
}

async function handleAddComment() {
  if (!ticket.value || !newComment.value.trim()) return;

  addingComment.value = true;

  try {
    const comment = await commentApi.createOnTicket(ticket.value.id, {
      description: newComment.value
    });

    if (ticket.value.comments) {
      ticket.value.comments.unshift(comment);
      if (ticket.value.stats) {
        ticket.value.stats.totalComments++;
      }
    }

    newComment.value = '';
    toast.success('Commentaire ajouté');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de l\'ajout du commentaire';
    toast.error(error.value);
  } finally {
    addingComment.value = false;
  }
}

function handleEditComment(comment: Comment) {
  toast.info('Fonctionnalité à venir');
}

async function handleDeleteComment(comment: Comment) {
  if (!confirm('Voulez-vous vraiment supprimer ce commentaire ?')) {
    return;
  }

  try {
    await commentApi.delete(comment.id);

    if (ticket.value?.comments) {
      const index = ticket.value.comments.findIndex(c => c.id === comment.id);
      if (index !== -1) {
        ticket.value.comments.splice(index, 1);
        if (ticket.value.stats) {
          ticket.value.stats.totalComments--;
        }
      }
    }

    toast.success('Commentaire supprimé');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la suppression du commentaire';
    toast.error(error.value);
  }
}

async function handleCreateTest() {
  if (!ticket.value || !newTest.value.trim()) return;

  creatingTest.value = true;

  try {
    const test = await testApi.createForTicket(ticket.value.id, {
      description: newTest.value
    });

    if (ticket.value.tests) {
      ticket.value.tests.unshift(test);
      if (ticket.value.stats) {
        ticket.value.stats.totalTests++;
      }
    }

    newTest.value = '';
    showTestModal.value = false;
    toast.success('Test créé');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la création du test';
    toast.error(error.value);
  } finally {
    creatingTest.value = false;
  }
}

async function handleValidateTest(test: Test, isValidated: boolean) {
  try {
    await testApi.validate(test.id, { isValidated });

    if (ticket.value?.tests) {
      const index = ticket.value.tests.findIndex(t => t.id === test.id);
      if (index !== -1) {
        ticket.value.tests[index].isValidated = isValidated;
        if (ticket.value.stats && isValidated) {
          ticket.value.stats.validatedTests++;
        }
      }
    }

    toast.success(isValidated ? 'Test validé' : 'Test rejeté');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la validation du test';
    toast.error(error.value);
  }
}

function triggerImageUpload() {
  imageInput.value?.click();
}

async function handleImageUpload(event: Event) {
  if (!ticket.value) return;

  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  uploadingImages.value = true;

  try {
    const uploadedImage = await imageApi.uploadForTicket(ticket.value.id, [file], 'TICKET_ATTACHMENT');
    if (uploadedImage) {
      if (ticket.value.images) {
        ticket.value.images.push(uploadedImage);
      } else {
        ticket.value.images = [uploadedImage];
      }

      if (ticket.value.stats) {
        ticket.value.stats.totalImages += 1;
      }

      toast.success("Image uploadée avec succès");
    }

    if (imageInput.value) {
      imageInput.value.value = '';
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || "Erreur lors de l'upload de l'image";
    toast.error(error.value);
  } finally {
    uploadingImages.value = false;
  }
}

async function handleImageDelete(image: { id: number; url: string; filename: string; displayOrder: number }) {
  if (!ticket.value) return;

  if (!confirm(`Supprimer l'image "${image.filename}" ?`)) {
    return;
  }

  try {
    await imageApi.delete(image.id);

    if (ticket.value.images) {
      const index = ticket.value.images.findIndex(img => img.id === image.id);
      if (index !== -1) {
        ticket.value.images.splice(index, 1);
        if (ticket.value.stats) {
          ticket.value.stats.totalImages--;
        }
      }
    }

    toast.success('Image supprimée');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la suppression de l\'image';
    toast.error(error.value);
  }
}

function openImageViewer(image: { id: number; url: string; filename: string; displayOrder: number }) {
  selectedImageId.value = image.id;
  showImageViewer.value = true;
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
    month: 'short'
  });
}

function formatDateLong(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

onMounted(async () => {
  await Promise.all([
    loadTicket(),
    loadUsers()
  ]);
});
</script>