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
              <button
                @click="downloadImage"
                class="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                title="Télécharger"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              
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
        <div class="flex items-center justify-center h-full p-4 pt-20 pb-20 relative" @wheel.prevent="handleWheel">
          <!-- Previous Button - Outside image -->
          <button
            v-if="images.length > 1"
            @click="previous"
            class="absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full transition-all z-20 shadow-xl"
            :disabled="currentIndex === 0"
            :class="{ 'opacity-30 cursor-not-allowed': currentIndex === 0 }"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Image with zoom and pan -->
          <div 
            ref="imageContainer"
            class="overflow-hidden"
            :class="{ 
              'cursor-grab': scale > 1 && !isDragging, 
              'cursor-grabbing': scale > 1 && isDragging,
              'cursor-zoom-in': scale === 1
            }"
            @mousedown="startDrag"
            @mousemove="drag"
            @mouseup="endDrag"
            @mouseleave="endDrag"
            @dblclick="resetZoom"
          >
            <img
              ref="imageElement"
              :src="getImageFullUrl(currentImage)"
              :alt="currentImage.filename"
              class="max-w-full max-h-[calc(100vh-10rem)] object-contain select-none"
              :style="{
                transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }"
              @click.stop
              draggable="false"
            />
          </div>

          <!-- Next Button - Outside image -->
          <button
            v-if="images.length > 1"
            @click="next"
            class="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full transition-all z-20 shadow-xl"
            :disabled="currentIndex === images.length - 1"
            :class="{ 'opacity-30 cursor-not-allowed': currentIndex === images.length - 1 }"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
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
                :src="getImageFullUrl(image)"
                :alt="image.filename"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        <!-- Keyboard Hint -->
        <div class="absolute bottom-4 left-4 text-white text-xs opacity-50">
          <p>← → : Naviguer | Échap : Fermer | Molette : Zoomer | Double-clic : Réinitialiser</p>
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
const imageContainer = ref<HTMLDivElement | null>(null);
const imageElement = ref<HTMLImageElement | null>(null);

// Zoom and pan state
const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const dragStartTranslateX = ref(0);
const dragStartTranslateY = ref(0);

const currentImage = computed(() => {
  return sortedImages.value[currentIndex.value];
});

const sortedImages = computed(() => {
  return [...props.images].sort((a, b) => a.displayOrder - b.displayOrder);
});

// Helper pour construire l'URL complète de l'image
function getImageFullUrl(image: TicketImage): string {
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
  
  if (image.url.startsWith('http://') || image.url.startsWith('https://')) {
    return image.url;
  }
  
  return `${baseUrl}${image.url}`;
}

// Zoom with mouse wheel
function handleWheel(event: WheelEvent) {
  event.preventDefault();
  
  // Inverser la logique et augmenter la vitesse
  const delta = event.deltaY < 0 ? 0.3 : -0.3; // Zoom plus rapide (0.3 au lieu de 0.1)
  const newScale = Math.min(Math.max(1, scale.value + delta), 5); // Min 1x, Max 5x
  
  scale.value = newScale;
  
  // Reset translation when zooming out to 1x
  if (newScale === 1) {
    translateX.value = 0;
    translateY.value = 0;
  }
}

// Drag to pan
function startDrag(event: MouseEvent) {
  if (scale.value <= 1) return;
  
  isDragging.value = true;
  dragStartX.value = event.clientX;
  dragStartY.value = event.clientY;
  dragStartTranslateX.value = translateX.value;
  dragStartTranslateY.value = translateY.value;
}

function drag(event: MouseEvent) {
  if (!isDragging.value || scale.value <= 1) return;
  
  const deltaX = event.clientX - dragStartX.value;
  const deltaY = event.clientY - dragStartY.value;
  
  translateX.value = dragStartTranslateX.value + deltaX / scale.value;
  translateY.value = dragStartTranslateY.value + deltaY / scale.value;
}

function endDrag() {
  isDragging.value = false;
}

// Reset zoom and pan
function resetZoom() {
  scale.value = 1;
  translateX.value = 0;
  translateY.value = 0;
}

// Reset zoom when changing image
watch(currentIndex, () => {
  resetZoom();
});

// Download image
async function downloadImage() {
  try {
    const imageUrl = getImageFullUrl(currentImage.value);
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = currentImage.value.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    // Fallback: ouvrir dans un nouvel onglet
    window.open(getImageFullUrl(currentImage.value), '_blank');
  }
}

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