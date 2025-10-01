import type { Router } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

export function setupRouterGuards(router: Router): void {
  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      });
      return;
    }

    if (to.meta.requiresGuest && authStore.isAuthenticated) {
      next({ name: 'Dashboard' });
      return;
    }

    next();
  });

  router.afterEach((to) => {
    document.title = to.meta.title 
      ? `${to.meta.title} - Sprintly` 
      : 'Sprintly - Project Management';
  });
}