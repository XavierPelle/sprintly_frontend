<template>
  <teleport to="body">
    <transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
      <div
          v-if="modelValue"
          class="fixed inset-0 z-50 overflow-y-auto"
          @click.self="handleClose"
      >
        <div class="fixed inset-0 bg-gradient-to-br from-gray-900/40 via-gray-800/30 to-slate-900/40 backdrop-blur-md transition-all"></div>

        <div class="flex min-h-full items-center justify-center p-4">
          <transition
              enter-active-class="transition ease-out duration-300"
              enter-from-class="opacity-0 translate-y-8 scale-95"
              enter-to-class="opacity-100 translate-y-0 scale-100"
              leave-active-class="transition ease-in duration-200"
              leave-from-class="opacity-100 translate-y-0 scale-100"
              leave-to-class="opacity-0 translate-y-8 scale-95"
          >
            <div
                v-if="modelValue"
                class="relative bg-white rounded-2xl shadow-2xl transform transition-all border border-gray-200/50"
                :class="sizeClasses"
            >
              <div v-if="title || $slots.header" class="px-6 py-5 border-b border-gray-100">
                <div class="flex items-center justify-between">
                  <slot name="header">
                    <h3 class="text-xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {{ title }}
                    </h3>
                  </slot>
                  <button
                      v-if="showClose"
                      @click="handleClose"
                      class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all hover:rotate-90 duration-300"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="px-6 py-5">
                <slot />
              </div>

              <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-b-2xl">
                <slot name="footer" />
              </div>
            </div>
          </transition>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
  closeOnOverlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showClose: true,
  closeOnOverlay: true
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
}>();

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-full max-w-md',
    md: 'w-full max-w-lg',
    lg: 'w-full max-w-2xl',
    xl: 'w-full max-w-4xl',
    full: 'w-full max-w-7xl'
  };
  return sizes[props.size];
});

function handleClose() {
  if (props.closeOnOverlay) {
    emit('update:modelValue', false);
    emit('close');
  }
}
</script>
