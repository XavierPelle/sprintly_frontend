<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <AppHeader />
    <div class="flex flex-1 pt-16 overflow-hidden">
      <AppSidebar :is-open="sidebarOpen" @toggle="toggleSidebar" />
      <main class="flex-1 transition-all duration-300 overflow-hidden" :class="sidebarOpen ? 'ml-64' : 'ml-0'">
        <div class="h-full transition-all duration-300" :class="[
          isKanbanRoute ? 'w-full' : (sidebarOpen ? 'max-w-7xl mx-auto' : 'max-w-[95%] mx-auto'),
          isKanbanRoute ? '' : 'px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto']">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from './AppHeader.vue';
import AppSidebar from './AppSidebar.vue';

const route = useRoute();
const sidebarOpen = ref(true);

const isKanbanRoute = computed(() => {
  return route.path === '/sprint/kanban';
});

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}
</script>