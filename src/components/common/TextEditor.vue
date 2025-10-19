<template>
  <div class="rich-text-editor">
    <div v-if="editor" class="tiptap-editor-wrapper">
      <!-- Barre d'outils -->
      <div class="toolbar">
        <button
            type="button"
            @click="editor.chain().focus().toggleBold().run()"
            :class="{ 'is-active': editor.isActive('bold') }"
            class="toolbar-btn"
            title="Gras (Ctrl+B)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"></path>
          </svg>
        </button>

        <button
            type="button"
            @click="editor.chain().focus().toggleItalic().run()"
            :class="{ 'is-active': editor.isActive('italic') }"
            class="toolbar-btn"
            title="Italique (Ctrl+I)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 4h6M10 20h6M14 4L10 20"></path>
          </svg>
        </button>

        <button
            type="button"
            @click="editor.chain().focus().toggleUnderline().run()"
            :class="{ 'is-active': editor.isActive('underline') }"
            class="toolbar-btn"
            title="Souligné (Ctrl+U)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19h14M7 5v6a5 5 0 0010 0V5"></path>
          </svg>
        </button>

        <button
            type="button"
            @click="editor.chain().focus().toggleStrike().run()"
            :class="{ 'is-active': editor.isActive('strike') }"
            class="toolbar-btn"
            title="Barré"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12h18M9 5l6 14M15 5L9 19"></path>
          </svg>
        </button>

        <div class="toolbar-separator"></div>

        <button
            type="button"
            @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
            :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
            class="toolbar-btn"
            title="Titre 1"
        >
          H1
        </button>

        <button
            type="button"
            @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
            :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
            class="toolbar-btn"
            title="Titre 2"
        >
          H2
        </button>

        <button
            type="button"
            @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
            :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
            class="toolbar-btn"
            title="Titre 3"
        >
          H3
        </button>

        <div class="toolbar-separator"></div>

        <button
            type="button"
            @click="editor.chain().focus().toggleBulletList().run()"
            :class="{ 'is-active': editor.isActive('bulletList') }"
            class="toolbar-btn"
            title="Liste à puces"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        <button
            type="button"
            @click="editor.chain().focus().toggleOrderedList().run()"
            :class="{ 'is-active': editor.isActive('orderedList') }"
            class="toolbar-btn"
            title="Liste numérotée"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h3M3 8h3M3 12h3M7 4h14M7 8h14M7 12h14"></path>
          </svg>
        </button>

        <div class="toolbar-separator"></div>

        <button
            type="button"
            @click="editor.chain().focus().toggleCodeBlock().run()"
            :class="{ 'is-active': editor.isActive('codeBlock') }"
            class="toolbar-btn"
            title="Bloc de code"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
          </svg>
        </button>

        <button
            type="button"
            @click="editor.chain().focus().toggleBlockquote().run()"
            :class="{ 'is-active': editor.isActive('blockquote') }"
            class="toolbar-btn"
            title="Citation"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
          </svg>
        </button>

        <button
            type="button"
            @click="openLinkModal"
            :class="{ 'is-active': editor.isActive('link') }"
            class="toolbar-btn"
            title="Insérer un lien"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
          </svg>
        </button>

        <button
            v-if="editor.isActive('link')"
            type="button"
            @click="editor.chain().focus().unsetLink().run()"
            class="toolbar-btn"
            title="Supprimer le lien"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </button>

        <div class="toolbar-separator"></div>

        <button
            type="button"
            @click="editor.chain().focus().setTextAlign('left').run()"
            :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
            class="toolbar-btn"
            title="Aligner à gauche"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h14"></path>
          </svg>
        </button>

        <button
            type="button"
            @click="editor.chain().focus().setTextAlign('center').run()"
            :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
            class="toolbar-btn"
            title="Centrer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M7 12h10M5 18h14"></path>
          </svg>
        </button>

        <button
            type="button"
            @click="editor.chain().focus().setTextAlign('right').run()"
            :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
            class="toolbar-btn"
            title="Aligner à droite"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M10 12h10M6 18h14"></path>
          </svg>
        </button>
      </div>

      <!-- Zone d'édition -->
      <editor-content :editor="editor" class="editor-content" />
    </div>

    <!-- Modal pour ajouter un lien -->
    <div v-if="showLinkModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeLinkModal">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Insérer un lien</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Texte du lien
            </label>
            <input
                v-model="linkText"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Texte à afficher"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              URL *
            </label>
            <input
                v-model="linkUrl"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://exemple.com"
                @keydown.enter="insertLink"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
              type="button"
              @click="closeLinkModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
              type="button"
              @click="insertLink"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              :disabled="!linkUrl"
          >
            Insérer
          </button>
        </div>
      </div>
    </div>

    <slot name="hint"></slot>
  </div>
</template>

<script setup lang="ts">
import { watch, onBeforeUnmount, ref } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';

interface Props {
  modelValue: string;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Commencez à écrire...',
  minHeight: '300px',
  disabled: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'textLength': [length: number];
}>();

// Modal pour les liens
const showLinkModal = ref(false);
const linkUrl = ref('');
const linkText = ref('');

// Configuration de l'éditeur TipTap
const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-indigo-600 underline hover:text-indigo-800',
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
  ],
  content: props.modelValue,
  editable: !props.disabled,
  editorProps: {
    attributes: {
      class: 'prose prose-sm max-w-none focus:outline-none px-4 py-3',
      style: `min-height: ${props.minHeight}`,
    },
  },
  onUpdate: ({ editor }) => {
    const html = editor.getHTML();
    emit('update:modelValue', html);
    emit('textLength', editor.getText().trim().length);
  },
});

function openLinkModal() {
  if (!editor.value) return;

  // Récupérer le texte sélectionné
  const { from, to } = editor.value.state.selection;
  const selectedText = editor.value.state.doc.textBetween(from, to, '');

  // Si un lien existe déjà, récupérer son URL
  const previousUrl = editor.value.getAttributes('link').href;

  linkText.value = selectedText;
  linkUrl.value = previousUrl || '';
  showLinkModal.value = true;
}

function closeLinkModal() {
  showLinkModal.value = false;
  linkUrl.value = '';
  linkText.value = '';
}

function insertLink() {
  if (!editor.value || !linkUrl.value) return;

  // Si du texte est fourni et qu'il n'y a pas de sélection, insérer le texte avec le lien
  if (linkText.value && editor.value.state.selection.empty) {
    editor.value
        .chain()
        .focus()
        .insertContent(`<a href="${linkUrl.value}">${linkText.value}</a> `)
        .run();
  } else {
    // Sinon, appliquer le lien à la sélection actuelle
    editor.value
        .chain()
        .focus()
        .setLink({ href: linkUrl.value })
        .run();

    // Sortir du lien en se déplaçant à la fin et en désactivant la marque
    editor.value
        .chain()
        .focus()
        .setTextSelection(editor.value.state.selection.to)
        .insertContent(' ')
        .run();
  }

  closeLinkModal();
}

// Synchroniser le contenu quand modelValue change de l'extérieur
watch(() => props.modelValue, (newValue) => {
  if (editor.value) {
    const currentValue = editor.value.getHTML();
    if (newValue !== currentValue) {
      editor.value.commands.setContent(newValue, false);
    }
  }
});

// Gérer le mode disabled
watch(() => props.disabled, (disabled) => {
  if (editor.value) {
    editor.value.setEditable(!disabled);
  }
});

// Exposer des méthodes utiles
defineExpose({
  focus: () => editor.value?.commands.focus(),
  clear: () => editor.value?.commands.clearContent(),
  getHTML: () => editor.value?.getHTML() || '',
  getText: () => editor.value?.getText() || '',
  getTextLength: () => editor.value?.getText().trim().length || 0,
});

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style>
/* Wrapper de l'éditeur TipTap */
.tiptap-editor-wrapper {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  overflow: hidden;
}

/* Barre d'outils */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px;
  background-color: #f9fafb;
  border-bottom: 1px solid #d1d5db;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  min-width: 36px;
  height: 36px;
}

.toolbar-btn:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.toolbar-btn.is-active {
  background-color: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-separator {
  width: 1px;
  background-color: #d1d5db;
  margin: 4px 4px;
}

/* Zone d'édition */
.editor-content {
  background: white;
}

/* Styles pour le contenu de l'éditeur */
.ProseMirror {
  outline: none;
}

.ProseMirror p.is-editor-empty:first-child::before {
  color: #9ca3af;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
  white-space: pre-wrap;
}

.ProseMirror p {
  margin: 0.5em 0;
}

.ProseMirror h1 {
  font-size: 2em;
  font-weight: bold;
  margin: 0.67em 0;
  line-height: 1.2;
}

.ProseMirror h2 {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.75em 0;
  line-height: 1.3;
}

.ProseMirror h3 {
  font-size: 1.17em;
  font-weight: bold;
  margin: 0.83em 0;
  line-height: 1.4;
}

.ProseMirror ul,
.ProseMirror ol {
  padding-left: 2em;
  margin: 0.5em 0;
}

.ProseMirror ul {
  list-style-type: disc;
}

.ProseMirror ol {
  list-style-type: decimal;
}

.ProseMirror li {
  margin: 0.25em 0;
}

.ProseMirror code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  font-family: 'Courier New', Courier, monospace;
}

.ProseMirror pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1em 0;
}

.ProseMirror pre code {
  background: none;
  color: inherit;
  padding: 0;
  font-size: 0.875rem;
}

.ProseMirror blockquote {
  border-left: 4px solid #d1d5db;
  padding-left: 1rem;
  margin: 1em 0;
  color: #6b7280;
  font-style: italic;
}

.ProseMirror strong {
  font-weight: 700;
}

.ProseMirror em {
  font-style: italic;
}

.ProseMirror u {
  text-decoration: underline;
}

.ProseMirror s {
  text-decoration: line-through;
}

.ProseMirror a {
  color: #4f46e5;
  text-decoration: underline;
  cursor: pointer;
}

.ProseMirror a:hover {
  color: #4338ca;
}
</style>