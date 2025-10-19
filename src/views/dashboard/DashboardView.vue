<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <!-- Header amélioré avec avatar et actions rapides -->
      <div class="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8">
        <div class="absolute inset-0 bg-black opacity-10"></div>
        <div class="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>

        <div class="relative z-10 flex items-center justify-between">
          <div class="flex items-center space-x-6">
            <div class="relative">
              <div class="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <span class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600">
                  {{ authStore.currentUser?.firstName[0] }}{{ authStore.currentUser?.lastName[0] }}
                </span>
              </div>
              <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
            </div>
            <div class="text-white">
              <h1 class="text-3xl font-bold mb-1">
                {{ getGreeting() }}, {{ authStore.currentUser?.firstName }} 👋
              </h1>
              <p class="text-indigo-200 text-sm">
                {{ getCurrentDate() }}
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <BaseButton variant="secondary" size="sm" @click="loadDashboard" class="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </BaseButton>
            <router-link to="/tickets/create">
              <BaseButton size="sm" class="bg-white text-indigo-600 hover:bg-gray-50">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Nouveau ticket
              </BaseButton>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="relative">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-8 h-8 bg-indigo-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p class="mt-6 text-gray-600 font-medium">Chargement de votre tableau de bord...</p>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div v-else-if="dashboard" class="space-y-8">
        <!-- Stats Cards Premium -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Mes Tickets -->
          <div class="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-blue-100 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                  <svg class="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span class="text-xs font-semibold text-blue-600 group-hover:text-white bg-blue-50 group-hover:bg-white/20 px-3 py-1 rounded-full transition-colors">
                  {{ getInProgressCount() }} actifs
                </span>
              </div>
              <h3 class="text-sm font-medium text-gray-600 group-hover:text-blue-100 mb-1 transition-colors">Mes Tickets</h3>
              <p class="text-3xl font-bold text-gray-900 group-hover:text-white transition-colors">{{ dashboard.assignedTickets.total }}</p>
              <div class="mt-4 flex items-center text-sm">
                <div class="flex-1 bg-gray-200 group-hover:bg-white/20 rounded-full h-2 overflow-hidden">
                  <div class="bg-blue-600 group-hover:bg-white h-full rounded-full transition-all" :style="{ width: `${dashboard.stats.completionRate}%` }"></div>
                </div>
                <span class="ml-3 text-sm font-semibold text-gray-600 group-hover:text-white transition-colors">{{ dashboard.stats.completionRate }}%</span>
              </div>
            </div>
          </div>

          <!-- Points -->
          <div class="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-green-100 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                  <svg class="w-6 h-6 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span class="text-xs font-semibold text-green-600 group-hover:text-white bg-green-50 group-hover:bg-white/20 px-3 py-1 rounded-full transition-colors">
                  Cette semaine
                </span>
              </div>
              <h3 class="text-sm font-medium text-gray-600 group-hover:text-green-100 mb-1 transition-colors">Points Complétés</h3>
              <p class="text-3xl font-bold text-gray-900 group-hover:text-white transition-colors">
                {{ getCompletedPoints() }}
                <span class="text-lg text-gray-400 group-hover:text-green-100">/{{ getTotalAssignedPoints() }}</span>
              </p>
              <p class="mt-2 text-sm text-gray-500 group-hover:text-green-100 transition-colors">
                Vélocité: {{ getVelocityText() }}
              </p>
            </div>
          </div>

          <!-- Tests -->
          <div class="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-orange-100 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                  <svg class="w-6 h-6 text-orange-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span v-if="dashboard.testsToValidate.total > 0" class="text-xs font-semibold text-white bg-red-500 px-3 py-1 rounded-full animate-pulse">
                  Action requise
                </span>
              </div>
              <h3 class="text-sm font-medium text-gray-600 group-hover:text-orange-100 mb-1 transition-colors">Tests à Valider</h3>
              <p class="text-3xl font-bold text-gray-900 group-hover:text-white transition-colors">{{ dashboard.testsToValidate.total }}</p>
              <p class="mt-2 text-sm text-gray-500 group-hover:text-orange-100 transition-colors">
                {{ dashboard.testsToValidate.total > 0 ? 'En attente de validation' : 'Tout est à jour !' }}
              </p>
            </div>
          </div>

          <!-- Activité -->
          <div class="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-purple-100 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                  <svg class="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
              </div>
              <h3 class="text-sm font-medium text-gray-600 group-hover:text-purple-100 mb-1 transition-colors">Mon Activité</h3>
              <p class="text-3xl font-bold text-gray-900 group-hover:text-white transition-colors">{{ dashboard.stats.totalComments }}</p>
              <p class="mt-2 text-sm text-gray-500 group-hover:text-purple-100 transition-colors">
                {{ dashboard.stats.totalTests }} tests réalisés
              </p>
            </div>
          </div>
        </div>

        <!-- Vue rapide des statuts avec graphique -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900">Répartition de mes tickets</h2>
              <p class="text-sm text-gray-500 mt-1">Vue d'ensemble par statut</p>
            </div>
            <router-link to="/tickets" class="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              Voir tous →
            </router-link>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            <button
                v-for="(count, status) in dashboard.assignedTickets.byStatus"
                :key="status"
                @click="openStatusModal(status as TicketStatus)"
                class="relative group text-center p-4 rounded-xl transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-indigo-300"
                :class="getStatusBgClass(status)"
            >
              <div class="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="relative">
                <p class="text-3xl font-bold mb-2" :class="getStatusTextClass(status)">
                  {{ count }}
                </p>
                <p class="text-xs font-semibold uppercase tracking-wide" :class="getStatusTextClass(status)">
                  {{ getStatusLabel(status) }}
                </p>
              </div>
            </button>
          </div>
        </div>

        <!-- Grille principale -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Colonne principale -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Tickets prioritaires & bloqués -->
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div class="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div class="text-white">
                      <h2 class="text-lg font-bold">Attention Requise</h2>
                      <p class="text-sm text-red-100">{{ dashboard.assignedTickets.urgent.length }} tickets prioritaires</p>
                    </div>
                  </div>
                  <router-link to="/tickets">
                    <button class="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-semibold transition-colors">
                      Voir tout
                    </button>
                  </router-link>
                </div>
              </div>

              <div class="p-6">
                <div v-if="dashboard.assignedTickets.urgent.length > 0" class="space-y-4">
                  <div
                      v-for="ticket in dashboard.assignedTickets.urgent.slice(0, 5)"
                      :key="ticket.id"
                      @click="$router.push(`/tickets/${ticket.id}`)"
                      class="group relative bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 hover:border-indigo-400 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg"
                  >
                    <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div class="relative flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-3">
                          <span class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold shadow-sm" :class="getPriorityBadgeClass(ticket.priority)">
                            {{ getPriorityIcon(ticket.priority) }}
                            {{ getPriorityLabel(ticket.priority) }}
                          </span>
                          <span class="text-sm font-mono text-gray-500">{{ ticket.key }}</span>
                          <span v-if="ticket.isBlocked" class="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold">
                            🔒 BLOQUÉ
                          </span>
                        </div>
                        <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {{ ticket.title }}
                        </h3>
                        <div class="flex items-center space-x-4 text-sm">
                          <span class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold" :class="getStatusBadgeClass(ticket.status)">
                            {{ getStatusLabel(ticket.status) }}
                          </span>
                          <span class="text-gray-500 font-medium">
                            {{ ticket.difficultyPoints }} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-16">
                  <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p class="text-lg font-semibold text-gray-900 mb-1">Excellent travail ! 🎉</p>
                  <p class="text-sm text-gray-500">Aucun ticket prioritaire</p>
                </div>
              </div>
            </div>

            <!-- Activité récente timeline -->
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-6">Activité Récente</h2>
              <div class="space-y-4">
                <div class="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                  <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900">Dernier commentaire</p>
                    <p class="text-sm text-gray-600 mt-1">
                      {{ dashboard.recentActivity.lastCommentDate ? formatDateRelative(dashboard.recentActivity.lastCommentDate) : 'Aucune activité récente' }}
                    </p>
                  </div>
                </div>

                <div class="flex items-start space-x-4 p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
                  <div class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900">Dernier test validé</p>
                    <p class="text-sm text-gray-600 mt-1">
                      {{ dashboard.recentActivity.lastTestDate ? formatDateRelative(dashboard.recentActivity.lastTestDate) : 'Aucun test récent' }}
                    </p>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div class="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                    <p class="text-2xl font-bold text-indigo-600">{{ dashboard.stats.totalComments }}</p>
                    <p class="text-xs text-gray-600 mt-1 font-medium">Commentaires</p>
                  </div>
                  <div class="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                    <p class="text-2xl font-bold text-green-600">{{ dashboard.stats.totalTests }}</p>
                    <p class="text-xs text-gray-600 mt-1 font-medium">Tests</p>
                  </div>
                  <div class="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                    <p class="text-2xl font-bold text-blue-600">{{ dashboard.stats.completionRate }}%</p>
                    <p class="text-xs text-gray-600 mt-1 font-medium">Complétion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-8">
            <!-- Tests à valider -->
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div class="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                <div class="flex items-center justify-between">
                  <div class="text-white">
                    <h2 class="text-lg font-bold">Tests à Valider</h2>
                    <p class="text-sm text-orange-100">{{ dashboard.testsToValidate.total }} en attente</p>
                  </div>
                  <div v-if="dashboard.testsToValidate.total > 0" class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <span class="text-2xl font-bold text-white">{{ dashboard.testsToValidate.total }}</span>
                  </div>
                </div>
              </div>

              <div class="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                <router-link
                    v-for="test in dashboard.testsToValidate.tests.slice(0, 5)"
                    :key="test.id"
                    :to="`/tickets/${test.ticketKey.split('-')[1]}`"
                    class="block px-6 py-4 hover:bg-orange-50 transition-colors"
                >
                  <div class="flex items-start space-x-3">
                    <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-bold text-gray-900 mb-1">
                        {{ test.ticketKey }}
                      </p>
                      <p class="text-xs text-gray-600 line-clamp-2 mb-2">
                        {{ test.description }}
                      </p>
                      <div class="flex items-center justify-between text-xs">
                        <span class="text-gray-500">{{ test.createdBy }}</span>
                        <span class="text-gray-400">{{ formatDate(test.createdAt) }}</span>
                      </div>
                    </div>
                  </div>
                </router-link>

                <div v-if="dashboard.testsToValidate.tests.length === 0" class="px-6 py-16 text-center">
                  <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p class="text-sm font-semibold text-gray-900">Tout est à jour !</p>
                  <p class="text-xs text-gray-500 mt-1">Aucun test en attente</p>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 class="text-lg font-bold mb-4">Actions Rapides</h3>
              <div class="space-y-3">
                <router-link to="/tickets/create" class="flex items-center space-x-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span class="font-medium">Créer un ticket</span>
                </router-link>
                <router-link to="/sprint/kanban" class="flex items-center space-x-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  <span class="font-medium">Voir le Kanban</span>
                </router-link>
                <router-link to="/tests" class="flex items-center space-x-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span class="font-medium">Gérer les tests</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <TicketsByStatusModal
        v-model="showStatusModal"
        :status="selectedStatus"
        :tickets="filteredTickets"
        :loading="loadingTickets"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { userApi } from '@/api/user.api';
import ticketApi from '@/api/ticket.api';
import type { UserDashboard } from '@/types/dashboard.types';
import type { TicketPriority, TicketStatus, TicketType } from '@/types/ticket.types';
import StatCard from '@/components/common/StatCard.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import TicketsByStatusModal from '@/components/features/ticket/TicketsByStatusModal.vue';

const authStore = useAuthStore();

const dashboard = ref<UserDashboard | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const showStatusModal = ref(false);
const selectedStatus = ref<TicketStatus | null>(null);
const allTickets = ref<any[]>([]);
const loadingTickets = ref(false);

const filteredTickets = computed(() => {
  if (!selectedStatus.value) return [];
  return allTickets.value.filter(ticket => ticket.status === selectedStatus.value);
});

async function loadDashboard() {
  loading.value = true;
  error.value = null;

  try {
    dashboard.value = await userApi.getDashboard();
    await loadAllTickets();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement du dashboard';
    console.error('Failed to load dashboard:', err);
  } finally {
    loading.value = false;
  }
}

async function loadAllTickets() {
  try {
    loadingTickets.value = true;
    const response = await ticketApi.search({
      assignee: authStore.currentUser?.id,
      limit: 1000
    });
    allTickets.value = response.tickets || [];
  } catch (err) {
    console.error('Failed to load tickets:', err);
  } finally {
    loadingTickets.value = false;
  }
}

function openStatusModal(status: TicketStatus) {
  selectedStatus.value = status;
  showStatusModal.value = true;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function getCurrentDate(): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return new Date().toLocaleDateString('fr-FR', options);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatDateRelative(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString('fr-FR');
}

function getInProgressCount(): number {
  if (!dashboard.value) return 0;
  return dashboard.value.assignedTickets.byStatus['EN_COURS'] || 0;
}

function getCompletedPoints(): number {
  if (!dashboard.value) return 0;
  const completedStatuses: TicketStatus[] = ['TEST_OK' as TicketStatus, 'PRODUCTION' as TicketStatus];
  let total = 0;
  for (const status of completedStatuses) {
    total += dashboard.value.assignedTickets.byStatus[status] || 0;
  }
  return total;
}

function getTotalAssignedPoints(): number {
  if (!dashboard.value) return 0;
  return Object.values(dashboard.value.assignedTickets.byStatus).reduce((sum, count) => sum + count, 0);
}

function getVelocityText(): string {
  if (!dashboard.value) return '0 pts';
  const completed = getCompletedPoints();
  return `${completed} pts`;
}

function getPriorityLabel(priority: TicketPriority): string {
  const labels: Record<TicketPriority, string> = {
    LOW: 'Basse',
    MEDIUM: 'Moyenne',
    HIGH: 'Haute',
    CRITICAL: 'Critique'
  };
  return labels[priority] || priority;
}

function getPriorityIcon(priority: TicketPriority): string {
  const icons: Record<TicketPriority, string> = {
    LOW: '🔽',
    MEDIUM: '➡️',
    HIGH: '⬆️',
    CRITICAL: '🔥'
  };
  return icons[priority] || '';
}

function getPriorityBadgeClass(priority: TicketPriority): string {
  const classes: Record<TicketPriority, string> = {
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    CRITICAL: 'bg-red-100 text-red-700'
  };
  return classes[priority] || 'bg-gray-100 text-gray-700';
}

function getStatusBadgeClass(status: TicketStatus): string {
  const classes: Record<TicketStatus, string> = {
    A_FAIRE: 'bg-gray-100 text-gray-800',
    EN_COURS: 'bg-blue-100 text-blue-800',
    REVISION: 'bg-purple-100 text-purple-800',
    DEMANDE_MODIFICATION: 'bg-orange-100 text-orange-800',
    TEST: 'bg-yellow-100 text-yellow-800',
    TEST_KO: 'bg-red-100 text-red-800',
    TEST_OK: 'bg-green-100 text-green-800',
    PRODUCTION: 'bg-emerald-100 text-emerald-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    A_FAIRE: 'À faire',
    EN_COURS: 'En cours',
    REVISION: 'Révision',
    DEMANDE_MODIFICATION: 'Modif.',
    TEST: 'Test',
    TEST_KO: 'Test KO',
    TEST_OK: 'Test OK',
    PRODUCTION: 'Production'
  };
  return labels[status] || status;
}

function getStatusBgClass(status: string): string {
  const classes: Record<string, string> = {
    A_FAIRE: 'bg-gray-50 hover:bg-gray-100',
    EN_COURS: 'bg-blue-50 hover:bg-blue-100',
    REVISION: 'bg-purple-50 hover:bg-purple-100',
    DEMANDE_MODIFICATION: 'bg-orange-50 hover:bg-orange-100',
    TEST: 'bg-yellow-50 hover:bg-yellow-100',
    TEST_KO: 'bg-red-50 hover:bg-red-100',
    TEST_OK: 'bg-green-50 hover:bg-green-100',
    PRODUCTION: 'bg-emerald-50 hover:bg-emerald-100'
  };
  return classes[status] || 'bg-gray-50';
}

function getStatusTextClass(status: string): string {
  const classes: Record<string, string> = {
    A_FAIRE: 'text-gray-700',
    EN_COURS: 'text-blue-700',
    REVISION: 'text-purple-700',
    DEMANDE_MODIFICATION: 'text-orange-700',
    TEST: 'text-yellow-700',
    TEST_KO: 'text-red-700',
    TEST_OK: 'text-green-700',
    PRODUCTION: 'text-emerald-700'
  };
  return classes[status] || 'text-gray-700';
}

onMounted(() => {
  loadDashboard();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
