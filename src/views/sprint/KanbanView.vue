<!-- src/views/sprint/KanbanView.vue -->

<template>
  <div class="flex flex-col h-screen">
    <!-- Header - Fixed -->
    <div class="flex-shrink-0 space-y-4 p-4 bg-white border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-900">Kanban Board</h1>
          <p v-if="currentSprint" class="text-xs text-gray-600">
            {{ currentSprint.name }} - {{ formatDate(currentSprint.startDate) }} au {{ formatDate(currentSprint.endDate) }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center space-x-2">
          <!-- Sélecteur de sprint -->
          <select v-model="selectedSprintId" @change="handleSprintChange"
                  class="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option :value="null">Sélectionner un sprint</option>
            <optgroup label="Sprints actifs">
              <option v-for="sprint in activeSprints" :key="sprint.id" :value="sprint.id">
                {{ sprint.name }}
              </option>
            </optgroup>
            <optgroup v-if="upcomingSprints.length > 0" label="Sprints à venir">
              <option v-for="sprint in upcomingSprints" :key="sprint.id" :value="sprint.id">
                {{ sprint.name }}
              </option>
            </optgroup>
          </select>

          <!-- Bouton refresh -->
          <BaseButton variant="secondary" size="sm" @click="loadTickets" :loading="loading" title="Actualiser">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </BaseButton>
        </div>
      </div>

      <!-- Filtres visuels - Toujours visibles avec taille augmentée -->
      <div class="flex items-center gap-6 flex-wrap">
        <!-- Filtre par type -->
        <div class="flex items-center gap-3">
          <span class="text-sm font-semibold text-gray-700">Type:</span>
          <div class="flex gap-2">
            <button v-for="type in ticketTypes" :key="type.value" @click="toggleTypeFilter(type.value)" :class="[
              'px-3 py-2 rounded-lg text-base font-medium transition-all border-2',
              filters.types.includes(type.value)
                ? 'bg-indigo-100 border-indigo-400 text-indigo-800 shadow-sm'
                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
            ]" :title="type.label">
              {{ type.icon }}
            </button>
          </div>
        </div>

        <!-- Filtre par assigné -->
        <div class="flex items-center gap-3">
          <span class="text-sm font-semibold text-gray-700">Assigné:</span>
          <div class="flex gap-2">
            <!-- Non assigné -->
            <button @click="toggleAssigneeFilter(0)" :class="[
              'w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all',
              filters.assigneeIds.includes(0)
                ? 'border-indigo-600 bg-indigo-100 text-indigo-800 shadow-sm'
                : 'border-gray-300 bg-gray-100 text-gray-600 hover:border-gray-400'
            ]" title="Non assigné">
              ?
            </button>
            <!-- Avatars utilisateurs -->
            <button v-for="assignee in uniqueAssignees" :key="assignee.id" @click="toggleAssigneeFilter(assignee.id)"
                    :class="[
                'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2',
                filters.assigneeIds.includes(assignee.id)
                  ? 'border-indigo-600 ring-2 ring-indigo-200 shadow-sm'
                  : 'border-transparent hover:border-gray-300'
              ]" :style="{ backgroundColor: getAvatarColor(assignee.id) }"
                    :title="`${assignee.firstName} ${assignee.lastName}`">
              <span class="text-white">
                {{ assignee.firstName[0] }}{{ assignee.lastName[0] }}
              </span>
            </button>
          </div>
        </div>

        <!-- Filtre par points -->
        <div class="flex items-center gap-3">
          <span class="text-sm font-semibold text-gray-700">Points:</span>
          <div class="flex gap-2">
            <button v-for="point in pointsOptions" :key="point" @click="togglePointsFilter(point)" :class="[
              'w-9 h-9 rounded-lg text-sm font-bold transition-all border-2',
              filters.points.includes(point)
                ? 'bg-purple-100 border-purple-400 text-purple-800 shadow-sm'
                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
            ]" :title="`${point} points`">
              {{ point }}
            </button>
          </div>
        </div>

        <!-- NOUVEAU: Filtre par tags minimaliste -->
        <div v-if="allTags.length > 0" class="flex items-center gap-3">
          <span class="text-sm font-semibold text-gray-700">Tags:</span>
          <div class="relative">
            <button
                @click="showTagsDropdown = !showTagsDropdown"
                class="px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 flex items-center gap-2"
                :class="filters.tags.length > 0
                ? 'bg-indigo-100 border-indigo-400 text-indigo-800'
                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>{{ filters.tags.length > 0 ? `${filters.tags.length} tag(s)` : 'Tous' }}</span>
              <svg class="w-4 h-4 transition-transform" :class="showTagsDropdown ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown tags -->
            <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-1"
            >
              <div
                  v-if="showTagsDropdown"
                  v-click-outside="() => showTagsDropdown = false"
                  class="absolute z-50 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto"
              >
                <div class="p-3 border-b border-gray-200 flex items-center justify-between">
                  <span class="text-xs font-semibold text-gray-700">Filtrer par tags</span>
                  <button
                      v-if="filters.tags.length > 0"
                      @click="clearTagFilters"
                      class="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Effacer
                  </button>
                </div>
                <div class="p-2">
                  <button
                      v-for="tag in allTags"
                      :key="tag.id"
                      @click="toggleTagFilter(tag.id)"
                      class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                      <div
                          class="w-3 h-3 rounded-full flex-shrink-0"
                          :style="{ backgroundColor: tag.color }"
                      ></div>
                      <span class="font-medium text-gray-900 truncate">{{ tag.name }}</span>
                      <span class="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{{ tag.count }}</span>
                    </div>
                    <div
                        v-if="filters.tags.includes(tag.id)"
                        class="ml-2 flex-shrink-0 w-4 h-4 bg-indigo-600 rounded flex items-center justify-center"
                    >
                      <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- Recherche -->
        <div class="flex items-center gap-3 flex-1 min-w-[220px]">
          <span class="text-sm font-semibold text-gray-700">Recherche:</span>
          <input v-model="filters.search" type="text" placeholder="Titre ou clé..."
                 class="flex-1 px-4 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white" />
        </div>

        <!-- Bouton reset si filtres actifs -->
        <button v-if="hasActiveFilters" @click="resetFilters"
                class="px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border-2 border-transparent hover:border-red-200">
          Réinitialiser
        </button>
      </div>

      <!-- Sprint Stats - Version réduite -->
      <div v-if="currentSprint && tickets.length > 0"
           class="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow border border-gray-200 p-3">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <!-- Carte Tickets -->
          <div class="bg-white rounded-md p-2.5 border border-gray-200 hover:shadow transition-shadow">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center">
                  <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p class="text-[10px] text-gray-500 font-medium">Tickets</p>
                  <p class="text-lg font-bold text-gray-900">{{ stats.totalTickets }}</p>
                </div>
              </div>
            </div>
            <p v-if="filteredTickets.length !== tickets.length" class="text-[10px] text-gray-500 mt-1">
              {{ filteredTickets.length }} affichés
            </p>
          </div>

          <!-- Carte Points -->
          <div class="bg-white rounded-md p-2.5 border border-gray-200 hover:shadow transition-shadow">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="w-7 h-7 rounded-md bg-indigo-100 flex items-center justify-center">
                  <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p class="text-[10px] text-gray-500 font-medium">Points</p>
                  <p class="text-lg font-bold text-gray-900">
                    <span class="text-indigo-600">{{ stats.completedPoints }}</span>
                    <span class="text-xs text-gray-400">/{{ stats.totalPoints }}</span>
                  </p>
                </div>
              </div>
            </div>
            <p class="text-[10px] text-gray-500 mt-1">
              {{ stats.remainingPoints }} restants
            </p>
          </div>

          <!-- Carte Progression -->
          <div class="bg-white rounded-md p-2.5 border border-gray-200 hover:shadow transition-shadow">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center space-x-2">
                <div class="w-7 h-7 rounded-md bg-purple-100 flex items-center justify-center">
                  <svg class="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p class="text-[10px] text-gray-500 font-medium">Progression</p>
                  <p class="text-lg font-bold text-purple-600">{{ stats.progressPercentage }}%</p>
                </div>
              </div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-1.5">
              <div
                  class="bg-gradient-to-r from-purple-500 to-indigo-600 h-1.5 rounded-full transition-all duration-500 relative overflow-hidden"
                  :style="{ width: `${stats.progressPercentage}%` }">
                <div class="absolute inset-0 bg-white opacity-20 animate-shimmer"></div>
              </div>
            </div>
          </div>

          <!-- Carte Vélocité -->
          <div class="bg-white rounded-md p-2.5 border border-gray-200 hover:shadow transition-shadow">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="w-7 h-7 rounded-md bg-emerald-100 flex items-center justify-center">
                  <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p class="text-[10px] text-gray-500 font-medium">Vélocité</p>
                  <p class="text-lg font-bold text-emerald-600">{{ stats.velocity }}</p>
                </div>
              </div>
            </div>
            <p class="text-[10px] text-gray-500 mt-1">
              points/jour
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !tickets.length" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-2 text-xs text-gray-600">Chargement...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex-1 p-4">
      <div class="bg-red-50 border border-red-200 rounded-lg p-3">
        <div class="flex items-center text-sm">
          <svg class="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-red-800">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!selectedSprintId" class="flex-1 flex items-center justify-center p-4">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
        <h3 class="mt-3 text-sm font-medium text-gray-900">Aucun sprint sélectionné</h3>
        <p class="mt-1 text-xs text-gray-600">
          Sélectionnez un sprint dans la liste ci-dessus
        </p>
      </div>
    </div>

    <!-- No tickets State -->
    <div v-else-if="tickets.length === 0" class="flex-1 flex items-center justify-center p-4">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="mt-3 text-sm font-medium text-gray-900">Aucun ticket</h3>
        <p class="mt-1 text-xs text-gray-600">
          Commencez par ajouter des tickets depuis le backlog
        </p>
        <router-link to="/backlog">
          <BaseButton size="sm" class="mt-3">
            Aller au Backlog
          </BaseButton>
        </router-link>
      </div>
    </div>

    <!-- Kanban Columns - Hauteur fixe avec scroll horizontal ET vertical -->
    <div v-else class="flex-1 overflow-auto p-4">
      <div class="flex space-x-2 min-h-full">
        <!-- Colonne pour chaque statut -->
        <div v-for="column in columns" :key="column.status" class="flex-shrink-0"
             :class="collapsedColumns.includes(column.status) ? 'w-12' : 'w-62'">
          <div class="bg-gray-50 rounded-lg h-full flex flex-col shadow-sm border border-gray-200">
            <!-- Column Header -->
            <div class="border-b border-gray-200 px-3 py-2 flex-shrink-0">
              <div class="flex items-center justify-between">
                <button @click="toggleColumn(column.status)"
                        class="flex items-center space-x-1.5 flex-1 min-w-0 hover:opacity-70 transition-opacity">
                  <div class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: column.color }"></div>
                  <h3 v-if="!collapsedColumns.includes(column.status)"
                      class="font-semibold text-gray-900 truncate text-sm">
                    {{ column.title }}
                  </h3>
                  <svg v-if="collapsedColumns.includes(column.status)" class="w-4 h-4 text-gray-500 transform rotate-90"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <span v-if="!collapsedColumns.includes(column.status)"
                      class="font-medium text-gray-500 bg-white rounded-full text-xs px-2 py-0.5 flex-shrink-0 ml-2">
                  {{ getFilteredTicketsByStatus(column.status).length }}
                </span>
              </div>
            </div>

            <!-- Collapsed view -->
            <div v-if="collapsedColumns.includes(column.status)" class="flex-1 flex items-center justify-center">
              <div class="transform -rotate-90 whitespace-nowrap text-xs font-medium text-gray-600">
                {{ column.title }} ({{ getFilteredTicketsByStatus(column.status).length }})
              </div>
            </div>

            <!-- Drop Zone -->
            <div v-else class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2" :class="{
              'bg-indigo-50 ring-2 ring-indigo-300 ring-inset rounded': dragOverColumn === column.status
            }" @dragover="handleDragOver" @drop="handleDrop($event, column.status)"
                 @dragenter="handleDragEnter(column.status)" @dragleave="handleDragLeave">
              <!-- Ticket Cards -->
              <div v-for="ticket in getFilteredTicketsByStatus(column.status)" :key="ticket.id"
                   :draggable="!ticket.isBlocked" @dragstart="handleDragStart(ticket)" @dragend="handleDragEnd"
                   @click="handleTicketClick(ticket)" class="rounded border transition-all p-2.5 relative" :class="{
                  'opacity-50 scale-95': draggedTicket?.id === ticket.id,
                  'bg-red-50 border-red-300 ring-2 ring-red-200 cursor-not-allowed': ticket.isBlocked,
                  'bg-white border-gray-200 hover:border-indigo-300 cursor-move hover:shadow-md': !ticket.isBlocked,
                  'ring-2 ring-orange-300': !ticket.isBlocked && ticket.priority === 'HIGH',
                  'ring-2 ring-red-400 shadow-lg': !ticket.isBlocked && ticket.priority === 'CRITICAL'
                }">
                <!-- Barre de priorité gauche -->
                <div v-if="ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL'"
                     class="absolute left-0 top-0 bottom-0 w-1 rounded-l" :class="{
                    'bg-orange-500': ticket.priority === 'HIGH',
                    'bg-red-600 animate-pulse': ticket.priority === 'CRITICAL'
                  }"></div>

                <!-- Badge bloqué -->
                <div v-if="ticket.isBlocked"
                     class="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-0.5"
                     :title="ticket.blockedReason || 'Ticket bloqué'">
                  <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                          d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                          clip-rule="evenodd" />
                  </svg>
                  BLOQUÉ
                </div>

                <!-- Ticket Header -->
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center space-x-1 min-w-0 flex-1">
                    <span class="font-mono font-semibold text-indigo-600 truncate text-[11px]">
                      {{ ticket.key }}
                    </span>
                    <span class="flex-shrink-0 text-xs">
                      {{ getTypeIcon(ticket.type) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1 flex-shrink-0 ml-1">
                    <!-- Badge priorité -->
                    <span v-if="ticket.priority && ticket.priority !== 'LOW'"
                          class="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase" :class="{
                        'bg-yellow-100 text-yellow-800': ticket.priority === 'MEDIUM',
                        'bg-orange-100 text-orange-800': ticket.priority === 'HIGH',
                        'bg-red-100 text-red-800': ticket.priority === 'CRITICAL'
                      }">
                      {{ ticket.priority === 'MEDIUM' ? 'M' : ticket.priority === 'HIGH' ? 'H' : 'C' }}
                    </span>
                    <!-- Points -->
                    <span v-if="ticket.difficultyPoints"
                          class="font-medium text-gray-500 bg-gray-100 rounded text-[10px] px-1.5 py-0.5">
                      {{ ticket.difficultyPoints }}
                    </span>
                  </div>
                </div>

                <!-- Ticket Title -->
                <h4 class="font-medium text-xs mb-2 line-clamp-2"
                    :class="ticket.isBlocked ? 'text-red-900' : 'text-gray-900'" :title="ticket.title">
                  {{ ticket.title }}
                </h4>

                <!-- Tags -->
                <div v-if="ticket.tags && ticket.tags.length > 0" class="flex flex-wrap gap-1 mb-2">
                  <span v-for="tag in ticket.tags" :key="tag.id"
                        class="text-[9px] font-medium px-1.5 py-0.5 rounded"
                        :style="{ backgroundColor: getPastelColor(tag.color), color: getTextColor(tag.color) }"
                        :title="tag.name">
                    {{ tag.name }}
                  </span>
                </div>

                <!-- Message de blocage -->
                <div v-if="ticket.isBlocked && ticket.blockedReason"
                     class="mb-2 p-1.5 bg-red-100 border border-red-200 rounded text-[10px] text-red-800">
                  <div class="flex items-start gap-1">
                    <svg class="w-3 h-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clip-rule="evenodd" />
                    </svg>
                    <span class="line-clamp-2">{{ ticket.blockedReason }}</span>
                  </div>
                </div>

                <!-- Ticket Footer -->
                <div class="flex items-center justify-between">
                  <!-- Assignee -->
                  <div v-if="ticket.assignee" class="flex items-center space-x-1 min-w-0">
                    <div
                        class="bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 w-5 h-5 text-[9px]"
                        :title="`${ticket.assignee.firstName} ${ticket.assignee.lastName}`">
                      {{ ticket.assignee.firstName[0] }}{{ ticket.assignee.lastName[0] }}
                    </div>
                    <span class="text-[10px] text-gray-600 truncate">
                      {{ ticket.assignee.firstName }}
                    </span>
                  </div>
                  <div v-else class="text-gray-400 text-[10px]">
                    -
                  </div>

                  <!-- Meta icons -->
                  <div class="flex items-center space-x-0.5 flex-shrink-0">
                    <span v-if="ticket.comments && ticket.comments.length > 0" class="text-gray-500 text-[10px]"
                          :title="`${ticket.comments.length} commentaires`">
                      💬{{ ticket.comments.length }}
                    </span>
                    <span v-if="ticket.tests && ticket.tests.length > 0" class="text-gray-500 text-[10px]"
                          :title="`${ticket.tests.length} tests`">
                      ✓{{ ticket.tests.length }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Empty column message -->
              <div v-if="getFilteredTicketsByStatus(column.status).length === 0"
                   class="text-center text-gray-400 py-6 text-xs">
                Vide
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ticketApi } from '@/api/ticket.api';
import { sprintApi } from '@/api/sprint.api';
import type { Ticket, TicketStatus, TicketType } from '@/types/ticket.types';
import type { Sprint } from '@/types/sprint.types';
import BaseButton from '@/components/common/BaseButton.vue';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const toast = useToast();

// State
const tickets = ref<Ticket[]>([]);
const allSprints = ref<Sprint[]>([]);
const selectedSprintId = ref<number | null>(null);
const currentSprint = ref<Sprint | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const showTagsDropdown = ref(false);

// Filtres - Ajout du filtre tags
const showFilters = ref(false);
const filters = ref({
  types: [] as TicketType[],
  assigneeIds: [] as number[],
  points: [] as number[],
  tags: [] as number[],
  search: ''
});

// Options pour les filtres
const ticketTypes = [
  { value: 'bug' as TicketType, label: 'Bug', icon: '🐛' },
  { value: 'feature' as TicketType, label: 'Feature', icon: '✨' },
  { value: 'task' as TicketType, label: 'Task', icon: '📋' },
  { value: 'improvement' as TicketType, label: 'Amélioration', icon: '⚡' }
];

const pointsOptions = [1, 2, 3, 5, 8, 13];

// Colonnes pliées
const collapsedColumns = ref<TicketStatus[]>([]);

// Drag & Drop State
const draggedTicket = ref<Ticket | null>(null);
const dragOverColumn = ref<TicketStatus | null>(null);

// Kanban Columns Configuration
const columns = [
  { status: 'A_FAIRE' as TicketStatus, title: 'À faire', color: '#6B7280' },
  { status: 'EN_COURS' as TicketStatus, title: 'En cours', color: '#3B82F6' },
  { status: 'REVISION' as TicketStatus, title: 'Révision', color: '#8B5CF6' },
  { status: 'DEMANDE_MODIFICATION' as TicketStatus, title: 'Modif.', color: '#F97316' },
  { status: 'TEST' as TicketStatus, title: 'Test', color: '#EAB308' },
  { status: 'TEST_KO' as TicketStatus, title: 'Test KO', color: '#EF4444' },
  { status: 'TEST_OK' as TicketStatus, title: 'Test OK', color: '#10B981' },
  { status: 'PRODUCTION' as TicketStatus, title: 'Production', color: '#059669' }
];

// Interface pour les tags avec compteur
interface TagWithCount {
  id: number;
  name: string;
  color: string;
  count: number;
}

// Computed pour les tags uniques
const allTags = computed<TagWithCount[]>(() => {
  if (!tickets.value) return [];

  const tagMap = new Map<number, TagWithCount>();

  tickets.value.forEach(ticket => {
    if (ticket.tags && Array.isArray(ticket.tags)) {
      ticket.tags.forEach((tag: any) => {
        if (tagMap.has(tag.id)) {
          tagMap.get(tag.id)!.count++;
        } else {
          tagMap.set(tag.id, {
            id: tag.id,
            name: tag.name,
            color: tag.color,
            count: 1
          });
        }
      });
    }
  });

  return Array.from(tagMap.values()).sort((a, b) => b.count - a.count);
});

// Computed
const activeSprints = computed(() => {
  const now = new Date();
  return allSprints.value.filter(s =>
      new Date(s.startDate) <= now && new Date(s.endDate) >= now
  );
});

const upcomingSprints = computed(() => {
  const now = new Date();
  return allSprints.value.filter(s => new Date(s.startDate) > now);
});

const uniqueAssignees = computed(() => {
  const assignees = tickets.value
      .filter(t => t.assignee)
      .map(t => t.assignee!);

  const uniqueMap = new Map();
  assignees.forEach(a => {
    if (!uniqueMap.has(a.id)) {
      uniqueMap.set(a.id, a);
    }
  });

  return Array.from(uniqueMap.values());
});

const filteredTickets = computed(() => {
  let result = tickets.value;

  // Filtre par types (OU entre les types sélectionnés)
  if (filters.value.types.length > 0) {
    result = result.filter(t => filters.value.types.includes(t.type));
  }

  // Filtre par assignés (OU entre les assignés sélectionnés)
  if (filters.value.assigneeIds.length > 0) {
    result = result.filter(t => {
      if (filters.value.assigneeIds.includes(0) && !t.assignee) {
        return true;
      }
      if (t.assignee && filters.value.assigneeIds.includes(t.assignee.id)) {
        return true;
      }
      return false;
    });
  }

  // Filtre par points (OU entre les points sélectionnés)
  if (filters.value.points.length > 0) {
    result = result.filter(t =>
        t.difficultyPoints && filters.value.points.includes(t.difficultyPoints)
    );
  }

  // MODIFIÉ: Filtre par tags (OU au lieu de ET)
  if (filters.value.tags.length > 0) {
    result = result.filter(ticket => {
      if (!ticket.tags || !Array.isArray(ticket.tags)) return false;
      // Retourne true si le ticket a AU MOINS UN des tags sélectionnés
      return filters.value.tags.some(selectedTagId =>
          ticket.tags.some((tag: any) => tag.id === selectedTagId)
      );
    });
  }

  // Recherche textuelle (fonctionne indépendamment)
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter(t =>
        t.title.toLowerCase().includes(search) ||
        t.key.toLowerCase().includes(search)
    );
  }

  return result;
});


const hasActiveFilters = computed(() => {
  return filters.value.types.length > 0 ||
      filters.value.assigneeIds.length > 0 ||
      filters.value.points.length > 0 ||
      filters.value.tags.length > 0 ||
      filters.value.search !== '';
});

const stats = computed(() => {
  const totalTickets = tickets.value.length;
  const totalPoints = tickets.value.reduce((sum, t) => sum + (t.difficultyPoints || 0), 0);

  const completedStatuses: TicketStatus[] = ['TEST_OK' as TicketStatus, 'PRODUCTION' as TicketStatus];
  const completedTickets = tickets.value.filter(t => completedStatuses.includes(t.status));
  const completedPoints = completedTickets.reduce((sum, t) => sum + (t.difficultyPoints || 0), 0);

  const remainingPoints = totalPoints - completedPoints;
  const progressPercentage = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  let velocity = 0;
  if (currentSprint.value) {
    const startDate = new Date(currentSprint.value.startDate);
    const now = new Date();
    const endDate = new Date(currentSprint.value.endDate);

    const daysElapsed = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    if (now < startDate) {
      velocity = 0;
    }
    else if (now > endDate) {
      const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      velocity = totalDays > 0 ? Math.round((completedPoints / totalDays) * 10) / 10 : 0;
    }
    else {
      velocity = Math.round((completedPoints / daysElapsed) * 10) / 10;
    }
  }

  return {
    totalTickets,
    totalPoints,
    completedPoints,
    remainingPoints,
    progressPercentage,
    velocity
  };
});

// Methods
function getFilteredTicketsByStatus(status: TicketStatus): Ticket[] {
  return filteredTickets.value.filter(ticket => ticket.status === status);
}

function toggleColumn(status: TicketStatus) {
  const index = collapsedColumns.value.indexOf(status);
  if (index > -1) {
    collapsedColumns.value.splice(index, 1);
  } else {
    collapsedColumns.value.push(status);
  }
}

function resetFilters() {
  filters.value = {
    types: [],
    assigneeIds: [],
    points: [],
    tags: [],
    search: ''
  };
}

// Fonctions de toggle pour les filtres multi-sélection
function toggleTypeFilter(type: TicketType) {
  const index = filters.value.types.indexOf(type);
  if (index > -1) {
    filters.value.types.splice(index, 1);
  } else {
    filters.value.types.push(type);
  }
}

function toggleAssigneeFilter(assigneeId: number) {
  const index = filters.value.assigneeIds.indexOf(assigneeId);
  if (index > -1) {
    filters.value.assigneeIds.splice(index, 1);
  } else {
    filters.value.assigneeIds.push(assigneeId);
  }
}

function togglePointsFilter(points: number) {
  const index = filters.value.points.indexOf(points);
  if (index > -1) {
    filters.value.points.splice(index, 1);
  } else {
    filters.value.points.push(points);
  }
}

// Toggle filtre tags
function toggleTagFilter(tagId: number) {
  const index = filters.value.tags.indexOf(tagId);
  if (index > -1) {
    filters.value.tags.splice(index, 1);
  } else {
    filters.value.tags.push(tagId);
  }
}

// Effacer filtres tags
function clearTagFilters() {
  filters.value.tags = [];
}

// Fonctions couleurs pastel
function getPastelColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const pastelR = Math.floor((r + 255 * 2) / 3);
  const pastelG = Math.floor((g + 255 * 2) / 3);
  const pastelB = Math.floor((b + 255 * 2) / 3);

  return `#${pastelR.toString(16).padStart(2, '0')}${pastelG.toString(16).padStart(2, '0')}${pastelB.toString(16).padStart(2, '0')}`;
}

function getTextColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1f2937' : '#374151';
}

// Générer une couleur consistante pour chaque utilisateur
function getAvatarColor(userId: number): string {
  const colors = [
    '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B',
    '#10B981', '#3B82F6', '#EF4444', '#06B6D4',
  ];
  return colors[userId % colors.length];
}

async function loadSprints() {
  try {
    allSprints.value = await sprintApi.getAll();

    if (activeSprints.value.length > 0 && !selectedSprintId.value) {
      selectedSprintId.value = activeSprints.value[0].id;
      currentSprint.value = activeSprints.value[0];
      await loadTickets();
    }
  } catch (err) {
    console.error('Failed to load sprints:', err);
  }
}

async function loadTickets() {
  if (!selectedSprintId.value) {
    tickets.value = [];
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await ticketApi.search({
      sprintId: selectedSprintId.value,
      limit: 200
    });

    tickets.value = response.tickets;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement des tickets';
    console.error('Failed to load tickets:', err);
  } finally {
    loading.value = false;
  }
}

async function handleSprintChange() {
  currentSprint.value = allSprints.value.find(s => s.id === selectedSprintId.value) || null;
  await loadTickets();
}

// Drag & Drop Handlers
function handleDragStart(ticket: Ticket) {
  draggedTicket.value = ticket;
}

function handleDragEnd() {
  draggedTicket.value = null;
  dragOverColumn.value = null;
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
}

function handleDragEnter(status: TicketStatus) {
  dragOverColumn.value = status;
}

function handleDragLeave() {
  dragOverColumn.value = null;
}

async function handleDrop(event: DragEvent, newStatus: TicketStatus) {
  event.preventDefault();
  dragOverColumn.value = null;

  if (!draggedTicket.value || draggedTicket.value.status === newStatus) {
    handleDragEnd();
    return;
  }

  const ticket = draggedTicket.value;
  const oldStatus = ticket.status;

  try {
    const index = tickets.value.findIndex(t => t.id === ticket.id);
    if (index !== -1) {
      tickets.value[index].status = newStatus;
    }

    await ticketApi.changeStatus(ticket.id, newStatus);
    toast.success(`${ticket.key} déplacé vers "${columns.find(c => c.status === newStatus)?.title}"`);
  } catch (err: any) {
    const index = tickets.value.findIndex(t => t.id === ticket.id);
    if (index !== -1) {
      tickets.value[index].status = oldStatus;
    }
    toast.error(`Échec du changement de statut`);
    error.value = err.response?.data?.message || 'Erreur lors du changement de statut';
    console.error('Failed to update ticket status:', err);
  } finally {
    handleDragEnd();
  }
}

function handleTicketClick(ticket: Ticket) {
  router.push(`/tickets/${ticket.id}`);
}

function getTypeIcon(type: TicketType): string {
  const icons: Record<TicketType, string> = {
    bug: '🐛',
    feature: '✨',
    task: '📋',
    improvement: '⚡'
  };
  return icons[type] || '📋';
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

onMounted(async () => {
  await loadSprints();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
</style>
