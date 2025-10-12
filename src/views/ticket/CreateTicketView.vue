<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button @click="handleCancel" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" type="button">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Créer un nouveau ticket</h1>
              <p class="text-sm text-gray-600 mt-0.5">Remplissez les informations pour créer un ticket</p>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <button @click="handleSubmit" :disabled="submitting || !isFormValid"
                    class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
              <span v-if="submitting">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création...
              </span>
              <span v-else>Créer le ticket</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <form @submit.prevent="handleSubmit" class="max-w-7xl mx-auto px-6 py-8">
      <div class="grid grid-cols-3 gap-8">
        <!-- Main Column (2/3) -->
        <div class="col-span-2 space-y-6">
          <!-- Title Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label class="block text-sm font-semibold text-gray-900 mb-3">
              Titre <span class="text-red-500">*</span>
            </label>
            <input v-model="form.title" type="text" placeholder="Titre du ticket"
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                   required />
            <p class="mt-2 text-xs text-gray-500">
              Soyez concis et descriptif ({{ form.title.length }}/200)
            </p>
          </div>

          <!-- Description Card with Rich Text Editor -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label class="block text-sm font-semibold text-gray-900 mb-3">
              Description <span class="text-red-500">*</span>
            </label>

            <TextEditor v-model="form.description" min-height="400px" placeholder="Décrivez en détail le ticket...

Exemples d'utilisation :
• Utilisez le gras pour les points importants
• Créez des listes pour organiser les étapes
• Ajoutez des liens vers des ressources
• Utilisez des titres pour structurer" @textLength="descriptionLength = $event">
              <template #hint>
                <p class="mt-2 text-xs text-gray-500">
                  Minimum 20 caractères ({{ descriptionLength }} caractères)
                </p>
              </template>
            </TextEditor>
          </div>

          <!-- Images Upload Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <label class="block text-sm font-semibold text-gray-900">
                Images (optionnel)
              </label>
              <button type="button" @click="triggerFileInput"
                      class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Ajouter des images
              </button>
              <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleFileSelect" />
            </div>

            <!-- Images Preview -->
            <div v-if="selectedImages.length > 0" class="grid grid-cols-3 gap-4">
              <div v-for="(image, index) in selectedImages" :key="index" class="relative group">
                <div class="relative rounded-lg overflow-hidden border-2 border-gray-200 aspect-square bg-gray-100">
                  <img :src="image.preview" :alt="`Image ${index + 1}`"
                       class="absolute inset-0 w-full h-full object-cover" />

                  <button type="button" @click="removeImage(index)"
                          class="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div class="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded">
                    {{ formatFileSize(image.file.size) }}
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="mt-2 text-sm text-gray-500">Aucune image ajoutée</p>
            </div>

            <p class="mt-3 text-xs text-gray-500">
              Formats acceptés: JPG, PNG, GIF. Maximum {{ maxImages }} images.
            </p>
          </div>
        </div>

        <!-- Sidebar (1/3) -->
        <div class="space-y-6">
          <!-- Type Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label class="block text-sm font-semibold text-gray-900 mb-3">
              Type <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button v-for="type in ticketTypes" :key="type.value" type="button" @click="form.type = type.value"
                      :class="[
                  'p-4 rounded-lg border-2 transition-all text-center',
                  form.type === type.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                ]">
                <div class="text-2xl mb-1">{{ type.emoji }}</div>
                <div class="text-xs font-medium text-gray-700">{{ type.label }}</div>
              </button>
            </div>
          </div>

          <!-- Priority Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label class="block text-sm font-semibold text-gray-900 mb-3">
              Priorité <span class="text-red-500">*</span>
            </label>
            <div class="space-y-2">
              <button v-for="priority in priorities" :key="priority.value" type="button"
                      @click="form.priority = priority.value" :class="[
                  'w-full p-3 rounded-lg border-2 transition-all flex items-center justify-between',
                  form.priority === priority.value
                    ? `border-${priority.color}-500 bg-${priority.color}-50`
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                ]">
                <span class="flex items-center space-x-2">
                  <span class="text-xl">{{ priority.emoji }}</span>
                  <span class="text-sm font-medium text-gray-700">{{ priority.label }}</span>
                </span>
                <svg v-if="form.priority === priority.value" class="w-5 h-5 text-indigo-600" fill="currentColor"
                     viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Difficulty Points Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label class="block text-sm font-semibold text-gray-900 mb-3">
              Points de difficulté <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-5 gap-2 mb-3">
              <button v-for="point in [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]" :key="point" type="button"
                      @click="form.difficultyPoints = point" :class="[
                  'p-3 rounded-lg border-2 font-bold text-lg transition-all',
                  form.difficultyPoints === point
                    ? 'border-indigo-500 bg-indigo-500 text-white'
                    : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                ]">
                {{ point }}
              </button>
            </div>
            <input v-model.number="form.difficultyPoints" type="number" min="1" max="100"
                   placeholder="Ou entrez un nombre"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                   required />
            <p class="mt-2 text-xs text-gray-500 text-center">
              Suite de Fibonacci ou valeur personnalisée
            </p>
          </div>

          <!-- Tags Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label class="block text-sm font-semibold text-gray-900 mb-3">
              Tags
            </label>

            <!-- Tag Input -->
            <div class="flex space-x-2 mb-3">
              <input v-model="newTag" type="text" placeholder="Ajouter un tag" @keydown.enter.prevent="addTag"
                     class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              <button type="button" @click="addTag"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <!-- Color Picker -->
            <div class="grid grid-cols-8 gap-2 mb-4">
              <button v-for="color in tagColors" :key="color" type="button" @click="selectedTagColor = color" :class="[
                'w-8 h-8 rounded-full border-2 transition-all',
                selectedTagColor === color ? 'border-gray-900 scale-110' : 'border-transparent'
              ]" :style="{ backgroundColor: color }"></button>
            </div>

            <!-- Tags List -->
            <div v-if="form.tags.length > 0" class="flex flex-wrap gap-2">
              <span v-for="(tag, index) in form.tags" :key="index"
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                    :style="{ backgroundColor: tag.color }">
                {{ tag.content }}
                <button type="button" @click="removeTag(index)" class="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
            <p v-else class="text-sm text-gray-500 text-center py-2">Aucun tag ajouté</p>
          </div>

          <!-- Pull Request Link Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label class="block text-sm font-semibold text-gray-900 mb-3">
              Lien Pull Request (optionnel)
            </label>
            <input v-model="form.pullRequestLink" type="url" placeholder="https://github.com/..."
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
      </div>

      <!-- Validation Errors -->
      <div v-if="validationError" class="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-sm text-red-800">{{ validationError }}</p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import TextEditor from '@/components/common/TextEditor.vue';
import { ticketApi } from '@/api/ticket.api';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const toast = useToast();

const ticketTypes = [
  { value: 'bug', label: 'Bug', emoji: '🐛' },
  { value: 'feature', label: 'Feature', emoji: '✨' },
  { value: 'task', label: 'Tâche', emoji: '📋' },
  { value: 'improvement', label: 'Amélioration', emoji: '⚡' }
];

const priorities = [
  { value: 'LOW', label: 'Basse', emoji: '🟢', color: 'green' },
  { value: 'MEDIUM', label: 'Moyenne', emoji: '🟡', color: 'yellow' },
  { value: 'HIGH', label: 'Haute', emoji: '🟠', color: 'orange' },
  { value: 'CRITICAL', label: 'Critique', emoji: '🔴', color: 'red' }
];

const tagColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
];

const form = ref({
  title: '',
  description: '',
  type: 'task' as 'bug' | 'feature' | 'task' | 'improvement',
  priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  difficultyPoints: 5,
  pullRequestLink: '',
  tags: [] as Array<{ content: string; color: string }>
});

const descriptionLength = ref(0);
const submitting = ref(false);
const validationError = ref<string | null>(null);

// Tags
const newTag = ref('');
const selectedTagColor = ref(tagColors[0]);

// Images
const fileInput = ref<HTMLInputElement | null>(null);
const selectedImages = ref<Array<{ file: File; preview: string }>>([]);
const maxImages = 10;

const isFormValid = computed(() => {
  return (
      form.value.title.trim().length > 0 &&
      descriptionLength.value >= 20 &&
      form.value.difficultyPoints > 0
  );
});

function addTag() {
  if (newTag.value.trim()) {
    form.value.tags.push({
      content: newTag.value.trim(),
      color: selectedTagColor.value
    });
    newTag.value = '';
  }
}

function removeTag(index: number) {
  form.value.tags.splice(index, 1);
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

async function handleSubmit() {
  validationError.value = null;

  if (!isFormValid.value) {
    validationError.value = 'Veuillez remplir tous les champs obligatoires';
    return;
  }

  submitting.value = true;

  try {
    const formData = new FormData();

    formData.append('title', form.value.title);
    formData.append('description', form.value.description);
    formData.append('type', form.value.type);
    formData.append('priority', form.value.priority);
    formData.append('difficultyPoints', form.value.difficultyPoints.toString());

    if (form.value.pullRequestLink) {
      formData.append('pullRequestLink', form.value.pullRequestLink);
    }

    // Ajouter les tags
    if (form.value.tags.length > 0) {
      formData.append('tags', JSON.stringify(form.value.tags));
    }

    // Ajouter les images
    selectedImages.value.forEach((image) => {
      formData.append('images', image.file);
    });

    const createdTicket = await ticketApi.create(formData);

    toast.success('Ticket créé avec succès');
    router.push(`/tickets/${createdTicket.id}`);
  } catch (err: any) {
    validationError.value = err.response?.data?.message || 'Erreur lors de la création du ticket';
    toast.error(validationError.value);
  } finally {
    submitting.value = false;
  }
}

function handleCancel() {
  if (form.value.title || form.value.description || selectedImages.value.length > 0) {
    if (confirm('Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.')) {
      router.push('/tickets');
    }
  } else {
    router.push('/tickets');
  }
}
</script>