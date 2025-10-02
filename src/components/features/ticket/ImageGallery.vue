<!-- src/components/features/ticket/ImageGallery.vue -->

<template>
  <div class="space-y-4">
    <!-- Header with upload button -->
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-medium text-gray-900">
        Images ({{ images.length }})
      </h3>
      <button
        v-if="canUpload"
        @click="triggerFileInput"
        class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Ajouter une image
      </button>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        class="hidden"
        @change="handleFileSelect"
      />
    </div>

    <!-- Image Grid -->
    <div v-if="images.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="image in sortedImages"
        :key="image.id"
        class="relative group"
      >
        <!-- Image Container -->
        <div
          class="relative cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-indigo-400 transition-all aspect-square"
          @click="$emit('view', image)"
        >
          <!-- Image -->
          <img
            :src="image.url"
            :alt="image.filename"
            class="w-full h-full object-cover"
            loading="lazy"
          />
          
          <!-- Hover Overlay -->
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
            <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
              <!-- View Icon -->
              <button
                @click.stop="$emit('view', image)"
                class="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                title="Voir l'image"
              >
                <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              
              <!-- Delete Icon (if allowed) -->
              <button
                v-if="canDelete"
                @click.stop="handleDeleteImage(image)"
                class="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                title="Supprimer l'image"
              >
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Order Badge -->
          <div class="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
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

      <!-- Upload placeholder when uploading -->
      <div
        v-for="(file, index) in uploadingFiles"
        :key="`uploading-${index}`"
        class="relative rounded-lg overflow-hidden border-2 border-dashed border-gray-300 aspect-square flex items-center justify-center bg-gray-50"
      >
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p class="mt-2 text-xs text-gray-500">Upload...</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="mt-2 text-sm text-gray-500">Aucune image pour ce ticket</p>
      <button
        v-if="canUpload"
        @click="triggerFileInput"
        class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
      >
        Ajouter la première image
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface TicketImage {
  id: number;
  url: string;
  filename: string;
  displayOrder: number;
}

interface Props {
  images: TicketImage[];
  canUpload?: boolean;
  canDelete?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  canUpload: false,
  canDelete: false
});

const emit = defineEmits<{
  view: [image: TicketImage];
  upload: [files: File[]];
  delete: [image: TicketImage];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const uploadingFiles = ref<File[]>([]);

const sortedImages = computed(() => {
  return [...props.images].sort((a, b) => a.displayOrder - b.displayOrder);
});

function triggerFileInput() {
  fileInput.value?.click();
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  
  if (files.length > 0) {
    uploadingFiles.value = files;
    emit('upload', files);
    
    // Reset input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
    
    // Clear uploading state after a delay (you should clear this when upload completes)
    setTimeout(() => {
      uploadingFiles.value = [];
    }, 3000);
  }
}

function handleDeleteImage(image: TicketImage) {
  if (confirm(`Supprimer l'image "${image.filename}" ?`)) {
    emit('delete', image);
  }
}

// Expose method to clear uploading state
defineExpose({
  clearUploading: () => {
    uploadingFiles.value = [];
  }
});
</script>