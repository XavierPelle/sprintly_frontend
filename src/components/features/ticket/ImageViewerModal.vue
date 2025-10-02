<!-- src/components/features/ticket/ImageViewerModal.vue -->

<template>
  <teleport to="body">
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue && currentImage"
        class="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-90"
        @click.self="close"
      >
        <!-- Header -->
        <div class="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black to-transparent p-4">
          <div class="flex items-center justify-between text-white">
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-medium truncate">{{ currentImage.filename }}</h3>
              <p class="text-sm text-gray-300">
                Image {{ currentIndex + 1 }} sur {{ images.length }}
              </p>
            </div>
            
            <div class="flex items-center space-x-2 ml-4">
              <!-- Download Button -->
              <a
                :href="currentImage.url"
                :download="currentImage.filename"
                target="_blank"
                class="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                title="Télécharger"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
              
              <!-- Close Button -->
              <button
                @click="close"
                class="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                title="Fermer (Échap)"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Image Container -->
        <div class="flex items-center justify-center h-full p-4 pt-20 pb-20">
          <div class="relative max-w-7xl max-h-full">
            <!-- Previous Button -->
            <button
              v-if="images.length > 1"
              @click="previous"
              class="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all z-10"
              :disabled="currentIndex === 0"
              :class="{ 'opacity-50 cursor-not-allowed': currentIndex === 0 }"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <!-- Image -->
            <img
              :src="currentImage.url"
              :alt="currentImage.filename"
              class="max-w-full max-h-[calc(100vh-10rem)] object-contain"
              @click.stop
            />

            <!-- Next Button -->
            <button
              v-if="images.length > 1"
              @click="next"
              class="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all z-10"
              :disabled="currentIndex === images.length - 1"
              :class="{ 'opacity-50 cursor-not-allowed': currentIndex === images.length - 1 }"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Thumbnail Strip -->
        <div
          v-if="images.length > 1"
          class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4"
        >
          <div class="flex items-center justify-center space-x-2 overflow-x-auto pb-2">
            <button
              v-for="(image, index) in images"
              :key="image.id"
              @click="goToImage(index)"
              class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all"
              :class="
                index === currentIndex
                  ? 'border-white scale-110'
                  : 'border-transparent opacity-60 hover:opacity-100'
              "
            >
              <img
                :src="image.url"
                :alt="image.filename"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        <!-- Keyboard Hint -->
        <div class="absolute bottom-4 left-4 text-white text-xs opacity-50">
          <p>← → : Naviguer | Échap : Fermer</p>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

interface TicketImage {
  id: number;
  url: string;
  filename: string;
  displayOrder: number;
}

interface Props {
  modelValue: boolean;
  images: TicketImage[];
  initialImageId?: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const currentIndex = ref(0);

const currentImage = computed(() => {
  return sortedImages.value[currentIndex.value];
});

const sortedImages = computed(() => {
  return [...props.images].sort((a, b) => a.displayOrder - b.displayOrder);
});

// Initialize with the selected image
watch(() => props.initialImageId, (imageId) => {
  if (imageId) {
    const index = sortedImages.value.findIndex(img => img.id === imageId);
    if (index !== -1) {
      currentIndex.value = index;
    }
  }
}, { immediate: true });

function close() {
  emit('update:modelValue', false);
}

function previous() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
}

function next() {
  if (currentIndex.value < sortedImages.value.length - 1) {
    currentIndex.value++;
  }
}

function goToImage(index: number) {
  currentIndex.value = index;
}

// Keyboard navigation
function handleKeydown(event: KeyboardEvent) {
  if (!props.modelValue) return;

  switch (event.key) {
    case 'Escape':
      close();
      break;
    case 'ArrowLeft':
      previous();
      break;
    case 'ArrowRight':
      next();
      break;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>