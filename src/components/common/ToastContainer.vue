<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <TransitionGroup
        name="toast"
        tag="div"
        class="flex flex-col gap-3"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto',
            'min-w-[320px] max-w-md',
            'rounded-lg shadow-lg',
            'p-4',
            'flex items-start gap-3',
            'transition-all duration-300',
            'backdrop-blur-sm',
            toastClasses[toast.type]
          ]"
        >
          <!-- Icon -->
          <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center">
            <component :is="toastIcons[toast.type]" class="w-5 h-5" />
          </div>
          
          <!-- Message -->
          <div class="flex-1 pt-0.5">
            <p class="text-sm font-medium leading-relaxed">
              {{ toast.message }}
            </p>
          </div>
          
          <!-- Close button -->
          <button
            @click="removeToast(toast.id)"
            class="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Close notification"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon 
} from '@heroicons/vue/24/solid'

const { toasts, removeToast } = useToast()

const toastClasses = {
  success: 'bg-green-50 text-green-900 border-l-4 border-green-500',
  error: 'bg-red-50 text-red-900 border-l-4 border-red-500',
  warning: 'bg-orange-50 text-orange-900 border-l-4 border-orange-500',
  info: 'bg-blue-50 text-blue-900 border-l-4 border-blue-500',
}

const toastIcons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
}
</script>

<style scoped>
/* Toast enter/leave animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>