<!-- src/components/layout/AppLayout.vue -->

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <AppHeader />

    <!-- Sidebar + Contenu -->
    <div class="flex pt-16">
      <!-- Sidebar -->
      <AppSidebar :is-open="sidebarOpen" @toggle="toggleSidebar" />

      <!-- Main Content -->
      <main
        class="flex-1 transition-all duration-300"
        :class="sidebarOpen ? 'ml-64' : 'ml-0'"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppHeader from './AppHeader.vue';
import AppSidebar from './AppSidebar.vue';

const sidebarOpen = ref(true);

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}
</script>