<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Header avec retour -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button
            @click="goBack"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Rédiger un test</h1>
          <p class="text-sm text-gray-600 mt-1">
            Documentez les tests effectués sur ce ticket
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-800">{{ error }}</p>
      </div>
    </div>

    <template v-else-if="ticket">
      <!-- 1. DÉTAILS DU TICKET -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3">
              <span class="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
                {{ ticket.key }}
              </span>
              <span
                  class="px-3 py-1 text-sm font-medium rounded-full"
                  :class="getStatusClass(ticket.status)"
              >
                {{ ticket.status }}
              </span>
              <span
                  class="px-3 py-1 text-sm font-medium rounded-full"
                  :class="getPriorityClass(ticket.priority)"
              >
                {{ ticket.priority }}
              </span>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 mt-3">{{ ticket.title }}</h2>
            <p class="text-gray-600 mt-2 whitespace-pre-wrap">{{ ticket.description }}</p>

            <div class="mt-4 flex items-center space-x-6 text-sm text-gray-500">
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Assigné à: {{ ticket.assignee ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}` : 'Non assigné' }}</span>
              </div>
              <div v-if="ticket.pullRequestLink" class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <a :href="ticket.pullRequestLink" target="_blank" class="text-indigo-600 hover:text-indigo-800">
                  Pull Request
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. FORMULAIRE DE RÉDACTION DU TEST -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Rédiger le test</h3>

        <form @submit.prevent="submitTest" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description du test *
            </label>

            <!-- Éditeur de texte riche -->
            <TextEditor
                v-model="testDescription"
                min-height="300px"
                @textLength="textLength => currentTextLength = textLength"
            >
              <template #hint>
                <p class="mt-1 text-sm text-gray-500">
                  Minimum 10 caractères ({{ currentTextLength }}/50000)
                </p>
              </template>
            </TextEditor>
          </div>

          <!-- Zone d'upload d'images -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Captures d'écran (optionnel)
            </label>

            <!-- Input file caché -->
            <input
                ref="fileInput"
                type="file"
                accept="image/*"
                multiple
                @change="handleFileSelect"
                class="hidden"
            />

            <!-- Bouton d'upload -->
            <button
                type="button"
                @click="triggerFileInput"
                class="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-2 text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Cliquez pour ajouter des images ou glissez-les ici</span>
            </button>

            <!-- Prévisualisation des images -->
            <div v-if="selectedImages.length > 0" class="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div
                  v-for="(image, index) in selectedImages"
                  :key="index"
                  class="relative group"
              >
                <img
                    :src="image.preview"
                    :alt="`Capture ${index + 1}`"
                    class="w-full h-40 object-cover rounded-lg border border-gray-200"
                />
                <button
                    type="button"
                    @click="removeImage(index)"
                    class="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    title="Supprimer"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div class="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded">
                  {{ formatFileSize(image.file.size) }}
                </div>
              </div>
            </div>

            <p class="mt-2 text-xs text-gray-500">
              Formats acceptés: JPG, PNG, GIF. Maximum {{ maxImages }} images.
            </p>
          </div>

          <!-- Validation errors -->
          <div v-if="validationError" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-sm text-red-800">{{ validationError }}</p>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end space-x-3 pt-4">
            <button
                type="button"
                @click="goBack"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                :disabled="submitting"
            >
              Annuler
            </button>
            <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="submitting || currentTextLength < 10"
            >
              <span v-if="submitting" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </span>
              <span v-else>Enregistrer le test</span>
            </button>
          </div>
        </form>
      </div>

      <!-- 3. TESTS PRÉCÉDENTS ÉCHOUÉS (si existants) -->
      <div v-if="tests.length > 0" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="flex items-center mb-4">
          <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 class="text-lg font-semibold text-red-900">
            Tests précédents échoués ({{ tests.length }})
          </h3>
        </div>

        <div class="space-y-3">
          <div
              v-for="test in tests"
              :key="test.id"
              class="bg-white rounded-lg p-4 border border-red-300"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center text-sm text-gray-500 mb-2">
                  <span class="font-medium">{{ test.user.firstName }} {{ test.user.lastName }}</span>
                  <span class="mx-2">•</span>
                  <span>{{ formatDate(test.createdAt) }}</span>
                </div>
                <TextViewer :content="test.description" :images="test.images"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TextEditor from '@/components/common/TextEditor.vue';
import TextViewer from '@/components/common/TextViewer.vue';
import { ticketApi } from '@/api/ticket.api';
import { testApi } from '@/api/test.api';
import type { Ticket, Test } from '@/types/ticket.types';

const route = useRoute();
const router = useRouter();

const ticket = ref<Ticket | null>(null);
const tests = ref<Test[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const validationError = ref<string | null>(null);

const testDescription = ref('');
const currentTextLength = ref(0);
const submitting = ref(false);

// Gestion des images
const fileInput = ref<HTMLInputElement | null>(null);
const selectedImages = ref<Array<{ file: File; preview: string }>>([]);
const maxImages = 10;

async function loadTicketData() {
  loading.value = true;
  error.value = null;

  try {
    const ticketId = Number(route.params.ticketId);

    if (isNaN(ticketId)) {
      throw new Error('ID de ticket invalide');
    }

    const details = await ticketApi.getDetails(ticketId);
    ticket.value = details;
    // Tous les tests affichés sont considérés comme échoués (non validés)
    tests.value = (details.tests || []).filter(test => !test.isValidated);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement du ticket';
    console.error('Failed to load ticket:', err);
  } finally {
    loading.value = false;
  }
}

function triggerFileInput() {
  fileInput.value?.click();
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files) return;

  const remainingSlots = maxImages - selectedImages.value.length;
  const filesToAdd = Array.from(files).slice(0, remainingSlots);

  filesToAdd.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedImages.value.push({
          file,
          preview: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  });

  // Reset input
  if (target) {
    target.value = '';
  }
}

function removeImage(index: number) {
  selectedImages.value.splice(index, 1);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function submitTest() {
  if (!ticket.value) return;

  validationError.value = null;

  if (currentTextLength.value < 10) {
    validationError.value = 'La description doit contenir au moins 10 caractères';
    return;
  }

  if (testDescription.value.length > 50000) {
    validationError.value = 'La description ne doit pas dépasser 50000 caractères';
    return;
  }

  submitting.value = true;

  try {
    const formData = new FormData();
    formData.append('description', testDescription.value);
    formData.append('type', 'TEST_ATTACHMENT');

    selectedImages.value.forEach((image) => {
      formData.append('images', image.file);
    });

    await testApi.createForTicket(ticket.value.id, formData);

    router.push({
      name: 'tests',
      query: { success: 'Test créé avec succès' }
    });
  } catch (err: any) {
    validationError.value = err.response?.data?.message || 'Erreur lors de la création du test';
    console.error('Failed to create test:', err);
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  router.push({ name: 'tests' });
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    TODO: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    TEST: 'bg-orange-100 text-orange-800',
    DONE: 'bg-green-100 text-green-800',
    BLOCKED: 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}

function getPriorityClass(priority: string): string {
  const classes: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800'
  };
  return classes[priority] || 'bg-gray-100 text-gray-800';
}

onMounted(() => {
  loadTicketData();
});
</script>