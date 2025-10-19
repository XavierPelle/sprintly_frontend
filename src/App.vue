<template>
  <div id="app">
    <router-view />
    <ToastContainer />
    <ConfirmDialog
        v-model:is-open="confirmDialog.isOpen.value"
        :title="confirmDialog.options.value.title"
        :message="confirmDialog.options.value.message"
        :confirm-text="confirmDialog.options.value.confirmText"
        :cancel-text="confirmDialog.options.value.cancelText"
        :variant="confirmDialog.options.value.variant"
        :show-cancel="confirmDialog.options.value.showCancel"
        @confirm="confirmDialog.handleConfirm"
        @cancel="confirmDialog.handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import ToastContainer from '@/components/common/ToastContainer.vue'
import { useConfirm } from '@/composables/useConfirm';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const confirmDialog = useConfirm();
</script>