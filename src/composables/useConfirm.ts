// src/composables/useConfirm.ts
import { ref } from 'vue';

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'info' | 'success' | 'warning' | 'danger';
    showCancel?: boolean;
}

const isOpen = ref(false);
const options = ref<ConfirmOptions>({
    message: '',
    variant: 'info'
});
const resolvePromise = ref<((value: boolean) => void) | null>(null);

export function useConfirm() {
    function confirm(opts: ConfirmOptions): Promise<boolean> {
        options.value = {
            variant: 'info',
            showCancel: true,
            ...opts
        };
        isOpen.value = true;

        return new Promise<boolean>((resolve) => {
            resolvePromise.value = resolve;
        });
    }

    function handleConfirm() {
        if (resolvePromise.value) {
            resolvePromise.value(true);
            resolvePromise.value = null;
        }
        isOpen.value = false;
    }

    function handleCancel() {
        if (resolvePromise.value) {
            resolvePromise.value(false);
            resolvePromise.value = null;
        }
        isOpen.value = false;
    }

    return {
        isOpen,
        options,
        confirm,
        handleConfirm,
        handleCancel
    };
}
