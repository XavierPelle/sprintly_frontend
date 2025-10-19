<!-- src/components/common/ConfirmDialog.vue -->
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
          v-if="isOpen"
          class="fixed inset-0 z-[100] overflow-y-auto"
          @click.self="handleCancel"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gradient-to-br from-gray-900/60 via-gray-800/50 to-slate-900/60 backdrop-blur-sm"></div>

        <!-- Dialog Container -->
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
                v-if="isOpen"
                class="relative bg-white rounded-2xl shadow-2xl transform transition-all w-full max-w-md border border-gray-200/50"
            >
              <!-- Icon -->
              <div class="p-6 pb-4">
                <div
                    class="mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4"
                    :class="iconConfig.bgClass"
                >
                  <!-- Info Icon -->
                  <svg v-if="variant === 'info'" class="h-7 w-7" :class="iconConfig.colorClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>

                  <!-- Success Icon -->
                  <svg v-else-if="variant === 'success'" class="h-7 w-7" :class="iconConfig.colorClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>

                  <!-- Warning Icon -->
                  <svg v-else-if="variant === 'warning'" class="h-7 w-7" :class="iconConfig.colorClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>

                  <!-- Danger Icon -->
                  <svg v-else-if="variant === 'danger'" class="h-7 w-7" :class="iconConfig.colorClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <!-- Title et Message restent identiques -->
                <h3 class="text-xl font-bold text-gray-900 text-center mb-2">
                  {{ title }}
                </h3>

                <p class="text-sm text-gray-600 text-center">
                  {{ message }}
                </p>
              </div>


              <!-- Actions -->
              <div class="px-6 pb-6 flex gap-3">
                <button
                    v-if="showCancel"
                    @click="handleCancel"
                    class="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  {{ cancelText }}
                </button>
                <button
                    @click="handleConfirm"
                    class="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                    :class="confirmButtonClass"
                >
                  {{ confirmText }}
                </button>
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
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  showCancel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirmation',
  confirmText: 'Confirmer',
  cancelText: 'Annuler',
  variant: 'info',
  showCancel: true
});

const emit = defineEmits<{
  confirm: [];
  cancel: [];
  'update:isOpen': [value: boolean];
}>();

// Icons composants
const InfoIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `
};

const SuccessIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `
};

const WarningIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  `
};

const DangerIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `
};

const iconConfig = computed(() => {
  const configs = {
    info: {
      component: InfoIcon,
      bgClass: 'bg-blue-100',
      colorClass: 'text-blue-600'
    },
    success: {
      component: SuccessIcon,
      bgClass: 'bg-green-100',
      colorClass: 'text-green-600'
    },
    warning: {
      component: WarningIcon,
      bgClass: 'bg-orange-100',
      colorClass: 'text-orange-600'
    },
    danger: {
      component: DangerIcon,
      bgClass: 'bg-red-100',
      colorClass: 'text-red-600'
    }
  };
  return configs[props.variant];
});

const confirmButtonClass = computed(() => {
  const classes = {
    info: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  return classes[props.variant];
});

function handleConfirm() {
  emit('confirm');
  emit('update:isOpen', false);
}

function handleCancel() {
  emit('cancel');
  emit('update:isOpen', false);
}
</script>
