<template>
  <div>
    <div class="rich-text-viewer" v-html="content"></div>

    <!-- Affichage des images si présentes -->
    <div v-if="images && images.length > 0" class="mt-4">
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div
            v-for="image in sortedImages"
            :key="image.id"
            class="relative cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-indigo-400 transition-all aspect-square bg-gray-100"
            @click="openImageViewer(image)"
        >
          <img
              :src="getImageUrl(image.url)"
              :alt="image.filename"
              class="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              @error="handleImageError"
          />

          <!-- Hover Overlay -->
          <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity"></div>

          <!-- Buttons Container -->
          <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>

          <!-- Order Badge -->
          <div class="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded z-10">
            #{{ image.displayOrder + 1 }}
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de visualisation des images -->
    <ImageViewerModal
        v-model="showImageViewer"
        :images="imagesWithFullUrl"
        :initial-image-id="selectedImageId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ImageViewerModal from '@/components/features/ticket/ImageViewerModal.vue';

interface Image {
  id: number;
  url: string;
  filename: string;
  displayOrder: number;
}

interface Props {
  content: string;
  images?: Image[];
}

const props = defineProps<Props>();

const showImageViewer = ref(false);
const selectedImageId = ref<number | undefined>(undefined);

const sortedImages = computed(() => {
  if (!props.images) return [];
  return [...props.images].sort((a, b) => a.displayOrder - b.displayOrder);
});

const imagesWithFullUrl = computed(() => {
  return sortedImages.value.map(image => ({
    ...image,
    url: getImageUrl(image.url)
  }));
});

function getImageUrl(url: string): string {
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Assurer qu'il n'y a pas de double slash
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  return `${cleanBaseUrl}${cleanUrl}`;
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  console.error('Erreur de chargement de l\'image:', img.src);
  // Optionnel: afficher une image placeholder
  // img.src = '/placeholder-image.png';
}

function openImageViewer(image: Image) {
  selectedImageId.value = image.id;
  showImageViewer.value = true;
}
</script>

<style>
/* Styles pour l'affichage du contenu riche */
.rich-text-viewer {
  line-height: 1.6;
  color: #374151;
}

.rich-text-viewer p {
  margin: 0.75em 0;
}

.rich-text-viewer h1 {
  font-size: 2em;
  font-weight: 700;
  margin: 1em 0 0.5em 0;
  line-height: 1.2;
  color: #111827;
}

.rich-text-viewer h2 {
  font-size: 1.5em;
  font-weight: 700;
  margin: 0.9em 0 0.5em 0;
  line-height: 1.3;
  color: #111827;
}

.rich-text-viewer h3 {
  font-size: 1.25em;
  font-weight: 600;
  margin: 0.8em 0 0.5em 0;
  line-height: 1.4;
  color: #111827;
}

.rich-text-viewer ul,
.rich-text-viewer ol {
  margin: 0.75em 0;
  padding-left: 1.75rem;
}

.rich-text-viewer ul {
  list-style-type: disc;
}

.rich-text-viewer ol {
  list-style-type: decimal;
}

.rich-text-viewer li {
  margin: 0.25em 0;
  line-height: 1.5;
}

.rich-text-viewer strong {
  font-weight: 700;
  color: #111827;
}

.rich-text-viewer em {
  font-style: italic;
}

.rich-text-viewer u {
  text-decoration: underline;
}

.rich-text-viewer s {
  text-decoration: line-through;
}

.rich-text-viewer code {
  background-color: #f3f4f6;
  color: #dc2626;
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
  font-size: 0.9em;
  font-family: 'Courier New', Courier, monospace;
}

.rich-text-viewer pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1em 0;
}

.rich-text-viewer pre code {
  background: none;
  color: #f9fafb;
  padding: 0;
  font-size: 0.875rem;
}

.rich-text-viewer blockquote {
  border-left: 4px solid #6366f1;
  background-color: #f0f9ff;
  padding: 0.75rem 1rem;
  margin: 1em 0;
  color: #1e40af;
  font-style: italic;
}

.rich-text-viewer a {
  color: #4f46e5;
  text-decoration: underline;
}

.rich-text-viewer a:hover {
  color: #4338ca;
}

/* Alignement du texte */
.rich-text-viewer [style*="text-align: center"] {
  text-align: center;
}

.rich-text-viewer [style*="text-align: right"] {
  text-align: right;
}

.rich-text-viewer [style*="text-align: left"] {
  text-align: left;
}

/* Espacement pour le premier et dernier élément */
.rich-text-viewer > *:first-child {
  margin-top: 0;
}

.rich-text-viewer > *:last-child {
  margin-bottom: 0;
}
</style>