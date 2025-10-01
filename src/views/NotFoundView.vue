<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-indigo-600">404</h1>
      <h2 class="mt-4 text-3xl font-bold text-gray-900">Page non trouvée</h2>
      <p class="mt-2 text-gray-600">
        Désolé, la page que vous recherchez n'existe pas.
      </p>
      <router-link
        to="/dashboard"
        class="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
      >
        Retour au tableau de bord
      </router-link>
    </div>
  </div>
</template>