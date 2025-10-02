<!-- src/components/features/ticket/CreateTicketModal.vue -->

<template>
  <BaseModal
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    title=""
    size="xl"
    :closeOnOverlay="false"
    :showClose="false"
  >
    <!-- Custom Header -->
    <template #header>
      <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg px-6 py-5 title-width">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-900">Créer un nouveau ticket</h2>
            <p class="text-sm text-gray-600 mt-1">Remplissez les informations pour créer un ticket</p>
          </div>
          <button
            @click="$emit('update:modelValue', false)"
            class="flex-shrink-0 p-2 hover:bg-white/50 rounded-lg transition-colors"
            type="button"
          >
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </template>

    <!-- Tabs -->
    <div class="border-b border-gray-200 bg-gray-50">
      <div class="flex px-6">
        <button
          @click="activeTab = 'details'"
          :class="[
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center',
            activeTab === 'details'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
          ]"
          type="button"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Détails
        </button>
        <button
          @click="activeTab = 'images'"
          :class="[
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center',
            activeTab === 'images'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
          ]"
          type="button"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Images ({{ images.length }})
        </button>
        <button
          @click="activeTab = 'advanced'"
          :class="[
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center',
            activeTab === 'advanced'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
          ]"
          type="button"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Options avancées
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="px-6 py-6 max-h-[60vh] overflow-y-auto">
      <!-- Details Tab -->
      <div v-if="activeTab === 'details'" class="space-y-6">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">
            Titre du ticket <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            placeholder="Ex: Corriger le bug d'affichage du dashboard"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        <!-- Type and Priority -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Type <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="type in ticketTypes"
                :key="type.value"
                @click="form.type = type.value"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-lg border transition-all',
                  form.type === type.value
                    ? type.color + ' ring-2 ring-indigo-500'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                ]"
                type="button"
              >
                {{ type.label }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Priorité
            </label>
            <div class="space-y-2">
              <label
                v-for="priority in priorities"
                :key="priority.value"
                class="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  v-model="form.priority"
                  :value="priority.value"
                  class="mr-2 text-indigo-600 focus:ring-indigo-500"
                />
                <span :class="['px-2 py-1 text-xs font-medium rounded', priority.color]">
                  {{ priority.label }}
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">
            Description <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="form.description"
            rows="6"
            placeholder="Décrivez en détail le ticket, les étapes de reproduction (pour un bug), les critères d'acceptation, etc."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            required
          ></textarea>
          <p class="mt-1 text-xs text-gray-500">
            Utilisez une description claire et détaillée pour faciliter le traitement du ticket
          </p>
        </div>

        <!-- Difficulty Points -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">
            Points de difficulté <span class="text-red-500">*</span>
          </label>
          <div class="flex items-center space-x-2">
            <button
              v-for="point in fibonacciPoints"
              :key="point"
              @click="form.difficultyPoints = point"
              :class="[
                'w-12 h-12 rounded-lg font-bold transition-all',
                form.difficultyPoints === point
                  ? 'bg-indigo-600 text-white shadow-lg scale-110'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
              type="button"
            >
              {{ point }}
            </button>
          </div>
          <p class="mt-2 text-xs text-gray-500">
            Sélectionnez un point selon la séquence de Fibonacci
          </p>
        </div>
      </div>

      <!-- Images Tab -->
      <div v-if="activeTab === 'images'" class="space-y-6">
        <!-- Upload Zone -->
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/*"
            @change="handleImageUpload"
            class="hidden"
          />
          <button
            @click="$refs.fileInput.click()"
            class="w-full"
            type="button"
          >
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p class="text-sm font-medium text-gray-900 mb-1">
              Glissez vos images ici ou cliquez pour parcourir
            </p>
            <p class="text-xs text-gray-500">
              PNG, JPG, GIF jusqu'à 10MB
            </p>
          </button>
        </div>

        <!-- Image Preview Grid -->
        <div v-if="images.length > 0">
          <h3 class="text-sm font-medium text-gray-900 mb-3">
            Images ajoutées ({{ images.length }})
          </h3>
          <div class="grid grid-cols-3 gap-4">
            <div
              v-for="img in images"
              :key="img.id"
              class="relative group"
            >
              <img
                :src="img.preview"
                :alt="img.name"
                class="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                @click="removeImage(img.id)"
                class="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                type="button"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <p class="mt-1 text-xs text-gray-600 truncate">{{ img.name }}</p>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-sm text-gray-500">Aucune image ajoutée</p>
        </div>
      </div>

      <!-- Advanced Tab -->
      <div v-if="activeTab === 'advanced'" class="space-y-6">
        <!-- Assignee -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Assigner à
          </label>
          <select
            v-model="form.assigneeId"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option :value="null">Non assigné</option>
            <option
              v-for="user in users"
              :key="user.id"
              :value="user.id"
            >
              {{ user.firstName }} {{ user.lastName }}
            </option>
          </select>
        </div>

        <!-- Sprint -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Sprint
          </label>
          <select
            v-model="form.sprintId"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option :value="null">Backlog (aucun sprint)</option>
            <option
              v-for="sprint in sprints"
              :key="sprint.id"
              :value="sprint.id"
            >
              {{ sprint.name }}
            </option>
          </select>
        </div>

        <!-- Due Date -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Date d'échéance
          </label>
          <input
            v-model="form.dueDate"
            type="date"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <!-- Tags -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Tags
          </label>
          <input
            v-model="form.tags"
            type="text"
            placeholder="Ex: frontend, urgent, bug-critique (séparés par des virgules)"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p class="mt-1 text-xs text-gray-500">
            Ajoutez des tags pour mieux organiser et rechercher vos tickets
          </p>
        </div>

        <!-- Info Box -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
          <svg class="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 class="text-sm font-medium text-blue-900 mb-1">
              Conseil
            </h4>
            <p class="text-xs text-blue-700">
              Vous pouvez modifier ces informations après la création du ticket. Les champs marqués d'une * sont obligatoires.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex items-center justify-between w-full">
        <BaseButton
          variant="secondary"
          @click="$emit('update:modelValue', false)"
        >
          Annuler
        </BaseButton>
        <div class="flex items-center space-x-3">
          <BaseButton
            variant="secondary"
            @click="handleSaveDraft"
            :loading="savingDraft"
          >
            Enregistrer comme brouillon
          </BaseButton>
          <BaseButton
            @click="handleCreate"
            :loading="loading"
            :disabled="!isFormValid"
          >
            Créer le ticket
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseModal from '@/components/common/BaseModal.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import type { TicketType } from '@/types/ticket.types';

interface Props {
  modelValue: boolean;
  users?: any[];
  sprints?: any[];
}

const props = withDefaults(defineProps<Props>(), {
  users: () => [],
  sprints: () => []
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  create: [data: any];
  saveDraft: [data: any];
}>();

const activeTab = ref<'details' | 'images' | 'advanced'>('details');
const loading = ref(false);
const savingDraft = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const form = ref({
  title: '',
  description: '',
  type: 'task' as TicketType,
  priority: 'medium',
  difficultyPoints: 5,
  assigneeId: null as number | null,
  sprintId: null as number | null,
  dueDate: '',
  tags: ''
});

const images = ref<Array<{
  id: number;
  file: File;
  preview: string;
  name: string;
}>>([]);

const ticketTypes = [
  { value: 'bug', label: '🐛 Bug', color: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'feature', label: '✨ Feature', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'task', label: '📋 Tâche', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  { value: 'improvement', label: '⚡ Amélioration', color: 'bg-green-50 text-green-700 border-green-200' }
];

const priorities = [
  { value: 'low', label: 'Faible', color: 'bg-gray-100 text-gray-700' },
  { value: 'medium', label: 'Moyenne', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high', label: 'Haute', color: 'bg-orange-100 text-orange-700' },
  { value: 'critical', label: 'Critique', color: 'bg-red-100 text-red-700' }
];

const fibonacciPoints = [1, 2, 3, 5, 8, 13, 21];

const isFormValid = computed(() => {
  return form.value.title.trim() !== '' && 
         form.value.description.trim() !== '' &&
         form.value.difficultyPoints > 0;
});

function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      images.value.push({
        id: Date.now() + Math.random(),
        file,
        preview: e.target?.result as string,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  });
  
  // Reset input
  if (target) target.value = '';
}

function removeImage(id: number) {
  images.value = images.value.filter(img => img.id !== id);
}

async function handleCreate() {
  if (!isFormValid.value) return;

  loading.value = true;

  try {
    emit('create', {
      ...form.value,
      images: images.value.map(img => img.file)
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
  } finally {
    loading.value = false;
  }
}

async function handleSaveDraft() {
  savingDraft.value = true;

  try {
    emit('saveDraft', {
      ...form.value,
      images: images.value.map(img => img.file)
    });
  } catch (error) {
    console.error('Error saving draft:', error);
  } finally {
    savingDraft.value = false;
  }
}
</script>
<style>
.title-width{
  width: 100%;
}
</style>