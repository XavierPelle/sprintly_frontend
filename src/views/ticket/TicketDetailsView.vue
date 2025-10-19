<template>
  <div class="space-y-6">
    <nav class="flex" aria-label="Breadcrumb">
      <ol class="flex items-center space-x-2 text-sm">
        <li>
          <router-link to="/tickets" class="text-gray-500 hover:text-gray-700 transition-colors">
            Tickets
          </router-link>
        </li>
        <li>
          <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </li>
        <li class="text-gray-900 font-medium">
          {{ ticket?.key || 'Chargement...' }}
        </li>
      </ol>
    </nav>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
      <button @click="loadTicket" class="mt-2 text-sm text-red-600 hover:text-red-700 font-medium">
        Réessayer
      </button>
    </div>

    <div v-else-if="ticket" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow" :class="ticket.isBlocked ? 'border-red-300 bg-red-50/30' : ''">

          <div v-if="ticket.isBlocked" class="mb-4 bg-red-100 border-l-4 border-red-500 p-3 rounded">
            <div class="flex items-start justify-between">
              <div class="flex items-start space-x-2">
                <svg class="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-red-800">Ticket bloqué</p>
                  <p class="text-sm text-red-700 mt-1">{{ ticket.blockedReason || 'Aucune raison spécifiée' }}</p>
                </div>
              </div>
              <button @click="startUnblockTicket" class="flex-shrink-0 ml-2 px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors">
                Débloquer
              </button>
            </div>
          </div>

          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-3 flex-wrap gap-2">
              <span class="text-xl font-mono font-bold text-indigo-600">
                {{ ticket.key }}
              </span>

              <div v-if="ticket.isBlocked" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Bloqué
              </div>

              <div v-if="!isEditingType" @click="startEditingType"
                   class="cursor-pointer hover:ring-2 hover:ring-indigo-200 rounded-full transition-all">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm" :class="getTypeClass(ticket.type)">
                  {{ getTypeLabel(ticket.type) }}
                </span>
              </div>
              <div v-else class="inline-flex items-center gap-2">
                <div class="relative">
                  <select v-model="editingType" @blur="saveType" @keyup.enter="saveType" @keyup.escape="cancelEditingType"
                          class="appearance-none px-4 py-2 pr-10 border-2 border-indigo-400 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer hover:border-indigo-500 transition-colors" ref="typeSelect">
                    <option value="bug">🐛 Bug</option>
                    <option value="feature">✨ Feature</option>
                    <option value="task">📋 Tâche</option>
                    <option value="improvement">⚡ Amélioration</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-indigo-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <button @click="saveType" class="p-2 hover:bg-green-100 rounded-lg transition-colors">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button @click="cancelEditingType" class="p-2 hover:bg-red-100 rounded-lg transition-colors">
                  <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div v-if="!isEditingPriority" @click="startEditingPriority"
                   class="cursor-pointer hover:ring-2 hover:ring-indigo-200 rounded-full transition-all">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" :class="getPriorityClass(ticket.priority)">
                  {{ getPriorityLabel(ticket.priority) }}
                </span>
              </div>
              <div v-else class="inline-flex items-center gap-2">
                <div class="relative">
                  <select v-model="editingPriority" @blur="savePriority" @keyup.enter="savePriority" @keyup.escape="cancelEditingPriority"
                          class="appearance-none px-4 py-2 pr-10 border-2 border-indigo-400 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer hover:border-indigo-500 transition-colors" ref="prioritySelect">
                    <option value="LOW">🔵 Basse</option>
                    <option value="MEDIUM">🟡 Moyenne</option>
                    <option value="HIGH">🟠 Haute</option>
                    <option value="CRITICAL">🔴 Critique</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-indigo-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <button @click="savePriority" class="p-2 hover:bg-green-100 rounded-lg transition-colors">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button @click="cancelEditingPriority" class="p-2 hover:bg-red-100 rounded-lg transition-colors">
                  <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <button v-if="!ticket.isBlocked" @click="startBlockTicket" class="flex-shrink-0 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Bloquer le ticket">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </button>
          </div>

          <div v-if="!isEditingTitle" @click="startEditingTitle"
               class="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors group/title mb-3">
            <h1 class="text-2xl font-bold text-gray-900 leading-tight group-hover/title:text-indigo-600 transition-colors">
              {{ ticket.title }}
              <svg class="inline w-4 h-4 ml-2 opacity-0 group-hover/title:opacity-50 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </h1>
          </div>
          <div v-else class="mb-3">
            <input v-model="editingTitle" @blur="saveTitle" @keyup.enter="saveTitle" @keyup.escape="cancelEditingTitle"
                   class="w-full text-2xl font-bold text-gray-900 leading-tight border-2 border-indigo-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" ref="titleInput" />
            <div class="flex gap-2 mt-2">
              <button @click="saveTitle" class="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                Sauvegarder
              </button>
              <button @click="cancelEditingTitle" class="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
                Annuler
              </button>
            </div>
          </div>

          <div v-if="tagsList.length" class="mb-4 flex flex-wrap gap-2">
            <div v-for="(tag, index) in tagsList" :key="tag.id || index"
                 class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all group cursor-default"
                 :style="{ backgroundColor: getPastelColor(tag.color), color: getTextColor(tag.color) }">
              <span>{{ tag.name }}</span>
              <button @click="removeTag(index)" type="button" class="opacity-0 group-hover:opacity-100 transition-opacity hover:scale-125 flex-shrink-0">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <button v-if="!showTagInput" @click="openTagInput" type="button"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div v-if="showTagInput" class="mb-4 bg-gray-50 rounded-lg p-4 border border-indigo-200">
            <div class="space-y-3">
              <div class="relative">
                <input
                    v-model="newTagName"
                    @input="filterTagSuggestions"
                    @keyup.enter="handleTagEnter"
                    @keydown.down.prevent="navigateSuggestions(1)"
                    @keydown.up.prevent="navigateSuggestions(-1)"
                    @keydown.escape="clearSuggestions"
                    type="text"
                    placeholder="Nom du tag"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div
                    v-if="filteredTagSuggestions.length > 0 && newTagName.trim()"
                    class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                >
                  <button
                      v-for="(suggestion, index) in filteredTagSuggestions"
                      :key="index"
                      @click="selectTagSuggestion(suggestion)"
                      @mouseenter="selectedSuggestionIndex = index"
                      type="button"
                      class="w-full text-left px-3 py-2 hover:bg-indigo-50 transition-colors flex items-center justify-between group"
                      :class="selectedSuggestionIndex === index ? 'bg-indigo-50' : ''"
                  >
                    <div class="flex items-center gap-2">
                      <div
                          class="w-4 h-4 rounded-full flex-shrink-0"
                          :style="{ backgroundColor: getPastelColor(suggestion.color) }"
                      ></div>
                      <span class="text-sm font-medium text-gray-900">{{ suggestion.content }}</span>
                    </div>
                    <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {{ suggestion.count }}x
                    </span>
                  </button>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <button
                    v-for="color in tagColors"
                    :key="color"
                    @click="newTagColor = color"
                    type="button"
                    class="w-9 h-9 rounded-lg border-2 transition-all hover:scale-110 flex-shrink-0 shadow-sm hover:shadow-md"
                    :class="newTagColor === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''"
                    :style="{ backgroundColor: getPastelColor(color), borderColor: newTagColor === color ? color : 'transparent' }"
                >
                </button>
              </div>
            </div>
            <div class="flex gap-2 mt-3">
              <button
                  @click="addTag"
                  :disabled="!newTagName.trim()"
                  class="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Ajouter
              </button>
              <button
                  @click="cancelTagInput"
                  class="flex-1 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>

          <div v-if="!tagsList.length && !showTagInput" class="mb-4">
            <button @click="openTagInput" type="button"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un tag
            </button>
          </div>

          <div v-if="!isEditingDescription" @click="startEditingDescription"
               class="cursor-pointer hover:bg-gray-50 rounded-lg p-3 -m-3 transition-colors group/desc">
            <TextViewer :content="ticket.description" />
            <div class="flex items-center justify-center mt-2 opacity-0 group-hover/desc:opacity-100 transition-opacity">
              <div class="flex items-center gap-2 text-xs text-indigo-600 font-medium bg-indigo-50 px-3 py-1.5 rounded-full">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier
              </div>
            </div>
          </div>
          <div v-else class="mt-3">
            <TextEditor v-model="editingDescription" placeholder="Décrivez le ticket..." min-height="200px" />
            <div class="flex gap-2 mt-2">
              <button @click="saveDescription" class="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Sauvegarder
              </button>
              <button @click="cancelEditingDescription" class="px-3 py-1.5 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Annuler
              </button>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-gray-200 flex flex-wrap items-center gap-3 text-xs text-gray-600">
            <div class="flex items-center space-x-1">
              <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ formatDateLong(ticket.createdAt) }}</span>
            </div>
            <div class="flex items-center space-x-1">
              <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{{ formatDateLong(ticket.updatedAt) }}</span>
            </div>
          </div>

          <div v-if="ticket.branch || ticket.testLink" class="mt-3 pt-3 border-t border-gray-200 space-y-2">
            <div v-if="ticket.branch" class="flex items-center justify-between bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors">
              <div class="flex items-center space-x-2 flex-1 min-w-0">
                <svg class="w-4 h-4 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span class="font-mono text-xs text-gray-800 truncate font-medium">{{ ticket.branch }}</span>
              </div>
              <button @click="copyToClipboard(ticket.branch)" class="ml-2 flex-shrink-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded transition-colors">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <div v-if="ticket.testLink" class="flex items-center justify-between bg-blue-50 rounded-lg p-2 hover:bg-blue-100 transition-colors">
              <div class="flex items-center space-x-2 flex-1 min-w-0">
                <svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <a :href="ticket.testLink" target="_blank" rel="noopener" class="text-xs text-blue-600 hover:text-blue-700 font-medium truncate">
                  Environnement de test
                </a>
              </div>
              <button @click="copyToClipboard(ticket.testLink)" class="ml-2 flex-shrink-0 text-blue-600 hover:text-blue-700 hover:bg-blue-200 px-2 py-1 rounded transition-colors">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-900 flex items-center">
              <svg class="w-4 h-4 mr-1.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Images ({{ ticket.images?.length || 0 }})
            </h2>
            <button @click="triggerImageUpload"
                    class="inline-flex items-center px-2.5 py-1 border border-purple-300 text-xs font-medium rounded text-purple-700 bg-white hover:bg-purple-50 transition-colors shadow-sm">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Ajouter
            </button>
            <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
          </div>

          <div class="p-4">
            <div v-if="sortedImages.length > 0" class="grid grid-cols-3 gap-2">
              <div v-for="image in sortedImages" :key="image.id" class="relative group">
                <div class="relative cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-indigo-400 transition-all aspect-square bg-gray-100 hover:shadow-lg">
                  <img :src="getImageFullUrl(image)" :alt="image.filename"
                       class="absolute inset-0 w-full h-full object-cover" loading="lazy" @click="openImageViewer(image)" />
                  <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none"></div>
                  <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div class="flex items-center space-x-1 pointer-events-auto">
                      <button @click.stop="openImageViewer(image)"
                              class="p-1.5 bg-white rounded-full hover:bg-gray-100 transition-all shadow-lg hover:scale-110" title="Voir">
                        <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button v-if="canDeleteImages" @click.stop="handleImageDelete(image)"
                              class="p-1.5 bg-white rounded-full hover:bg-red-50 transition-all shadow-lg hover:scale-110" title="Supprimer">
                        <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="absolute top-1 left-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold shadow-lg">
                    #{{ image.displayOrder }}
                  </div>
                </div>
              </div>

              <div v-if="uploadingImages"
                   class="relative rounded-lg overflow-hidden border-2 border-dashed border-indigo-300 aspect-square flex items-center justify-center bg-indigo-50">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                  <p class="mt-1 text-xs text-indigo-600 font-medium">Upload...</p>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <svg class="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="mt-2 text-xs text-gray-500">Aucune image</p>
              <button @click="triggerImageUpload"
                      class="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow transition-all">
                Ajouter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
          <div>
            <h3 class="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide">Statut</h3>
            <div class="relative">
              <select v-model="ticket.status" @change="handleStatusChange"
                      class="w-full appearance-none px-4 py-2.5 pr-10 border-2 border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white cursor-pointer hover:border-gray-400 transition-colors">
                <option value="A_FAIRE">À faire</option>
                <option value="EN_COURS">En cours</option>
                <option value="REVISION">Révision</option>
                <option value="DEMANDE_MODIFICATION">Modif. demandée</option>
                <option value="TEST">Test</option>
                <option value="TEST_KO">Test KO</option>
                <option value="TEST_OK">Test OK</option>
                <option value="PRODUCTION">Production</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-gray-100">
            <h3 class="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide">Créé par</h3>
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                {{ ticket.creator.firstName[0] }}{{ ticket.creator.lastName[0] }}
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-900">{{ ticket.creator.firstName }} {{ ticket.creator.lastName }}</p>
                <p class="text-xs text-gray-500">{{ ticket.creator.email }}</p>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-gray-100">
            <h3 class="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide">Assigné à</h3>
            <div v-if="!isEditingAssignee && ticket.assignee" @click="startEditingAssignee"
                 class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1.5 -m-1.5 transition-colors group">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                {{ ticket.assignee.firstName[0] }}{{ ticket.assignee.lastName[0] }}
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-900">{{ ticket.assignee.firstName }} {{ ticket.assignee.lastName }}</p>
                <p class="text-xs text-gray-500">{{ ticket.assignee.email }}</p>
              </div>
              <svg class="w-3 h-3 ml-auto opacity-0 group-hover:opacity-50 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p v-else-if="!isEditingAssignee" @click="startEditingAssignee"
               class="text-xs text-gray-500 italic cursor-pointer hover:text-indigo-600 transition-colors">
              Non assigné - Cliquer pour assigner
            </p>
            <div v-else class="space-y-2">
              <div class="relative">
                <select v-model="editingAssignee" @blur="saveAssignee" @keyup.enter="saveAssignee" @keyup.escape="cancelEditingAssignee"
                        class="w-full appearance-none px-3 py-2 pr-10 border-2 border-indigo-400 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer hover:border-indigo-500 transition-colors" ref="assigneeSelect">
                  <option :value="null">Non assigné</option>
                  <option v-for="user in users" :key="user.id" :value="user.id">
                    {{ user.firstName }} {{ user.lastName }}
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div class="flex gap-2">
                <button @click="saveAssignee" class="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors">
                  Sauvegarder
                </button>
                <button @click="cancelEditingAssignee" class="flex-1 px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors">
                  Annuler
                </button>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-gray-100">
            <h3 class="text-xs font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">Points de difficulté</h3>
            <div v-if="!isEditingPoints" @click="startEditingPoints"
                 class="flex items-center cursor-pointer hover:bg-gray-50 rounded-lg p-1.5 -m-1.5 transition-colors group">
              <p class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                {{ ticket.difficultyPoints }}
              </p>
              <span class="ml-2 text-xs text-gray-500">points</span>
              <svg class="w-3 h-3 ml-auto opacity-0 group-hover:opacity-50 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div v-else class="space-y-2">
              <input v-model.number="editingPoints" type="number" min="0"
                     @blur="savePoints" @keyup.enter="savePoints" @keyup.escape="cancelEditingPoints"
                     class="w-full px-2.5 py-1.5 border-2 border-indigo-400 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" ref="pointsInput" />
              <div class="flex gap-2">
                <button @click="savePoints" class="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors">
                  Sauvegarder
                </button>
                <button @click="cancelEditingPoints" class="flex-1 px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors">
                  Annuler
                </button>
              </div>
            </div>
          </div>

          <div v-if="ticket.sprint" class="pt-3 border-t border-gray-100">
            <h3 class="text-xs font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">Sprint</h3>
            <router-link :to="`/sprint/${ticket.sprint.id}/details`"
                         class="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-700 font-medium group">
              <svg class="w-3 h-3 mr-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {{ ticket.sprint.name }}
            </router-link>
            <p class="text-xs text-gray-500 mt-0.5">
              {{ formatDate(ticket.sprint.startDate) }} - {{ formatDate(ticket.sprint.endDate) }}
            </p>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
            <h2 class="text-sm font-semibold text-gray-900 flex items-center">
              <svg class="w-4 h-4 mr-1.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Commentaires ({{ ticket.comments?.length || 0 }})
            </h2>
          </div>
          <div class="p-4">
            <div class="mb-4">
              <textarea v-model="newComment" rows="2" placeholder="Ajouter un commentaire..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all text-sm"></textarea>
              <div class="mt-2 flex justify-end">
                <button @click="handleAddComment" :disabled="!newComment.trim() || addingComment"
                        class="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter
                </button>
              </div>
            </div>

            <div v-if="ticket.comments && ticket.comments.length > 0" class="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              <CommentItem v-for="comment in ticket.comments" :key="comment.id" :comment="comment"
                           @edit="handleEditComment" @delete="handleDeleteComment" />
            </div>
            <p v-else class="text-center text-gray-500 py-6 text-xs">Aucun commentaire</p>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-900 flex items-center">
              <svg class="w-4 h-4 mr-1.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Tests ({{ ticket.tests?.length || 0 }})
            </h2>
            <button v-if="ticket.status === 'TEST' || ticket.status === 'TEST_KO'" @click="showTestModal = true"
                    class="inline-flex items-center px-2.5 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors">
              Créer
            </button>
          </div>
          <div class="p-4">
            <div v-if="ticket.tests && ticket.tests.length > 0" class="space-y-3 max-h-80 overflow-y-auto">
              <TestItem v-for="test in ticket.tests" :key="test.id" :test="test" @validate="handleValidateTest" />
            </div>
            <p v-else class="text-center text-gray-500 py-6 text-xs">Aucun test</p>
          </div>
        </div>
      </div>
    </div>

    <BaseModal v-model="showTestModal" title="Créer un test" size="md">
      <div class="space-y-4">
        <textarea v-model="newTest" rows="5" placeholder="Décrivez le résultat du test..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
      </div>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <BaseButton variant="secondary" @click="showTestModal = false">Annuler</BaseButton>
          <BaseButton @click="handleCreateTest" :disabled="!newTest.trim()" :loading="creatingTest">Créer le test</BaseButton>
        </div>
      </template>
    </BaseModal>

    <BaseModal v-model="showBlockModal" title="Bloquer le ticket" size="md">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Raison du blocage <span class="text-red-500">*</span>
          </label>
          <textarea v-model="blockReason" rows="4" placeholder="Expliquez pourquoi ce ticket est bloqué..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"></textarea>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <BaseButton variant="secondary" @click="showBlockModal = false">Annuler</BaseButton>
          <BaseButton variant="danger" @click="handleBlockTicket" :disabled="!blockReason.trim()" :loading="blockingTicket">
            Bloquer
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <ImageViewerModal v-model="showImageViewer" :images="ticket?.images || []" :initial-image-id="selectedImageId" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { ticketApi } from '@/api/ticket.api';
import type { TagSuggestion } from '@/api/ticket.api';
import { commentApi } from '@/api/comment.api';
import { testApi } from '@/api/test.api';
import { userApi } from '@/api/user.api';
import { imageApi } from '@/api/image.api';
import type { TicketDetails, TicketType, Comment, Test } from '@/types/ticket.types';
import type { AuthUser } from '@/types/auth.types';
import { useAuthStore } from '@/stores/auth.store';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import CommentItem from '@/components/features/ticket/CommentItem.vue';
import TestItem from '@/components/features/ticket/TestItem.vue';
import ImageViewerModal from '@/components/features/ticket/ImageViewerModal.vue';
import TextEditor from '@/components/common/TextEditor.vue';
import TextViewer from '@/components/common/TextViewer.vue';
import { useToast } from '@/composables/useToast';
import { useConfirm } from '@/composables/useConfirm';

const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();
const { confirm } = useConfirm();

const tagColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
];

const ticket = ref<TicketDetails | null>(null);
const users = ref<AuthUser[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const newComment = ref('');
const addingComment = ref(false);

const showTestModal = ref(false);
const newTest = ref('');
const creatingTest = ref(false);

const showBlockModal = ref(false);
const blockReason = ref('');
const blockingTicket = ref(false);

const imageInput = ref<HTMLInputElement | null>(null);
const uploadingImages = ref(false);
const showImageViewer = ref(false);
const selectedImageId = ref<number | null>(null);

const showTagInput = ref(false);
const newTagName = ref('');
const newTagColor = ref('#6366f1');
const allTagSuggestions = ref<TagSuggestion[]>([]);
const filteredTagSuggestions = ref<TagSuggestion[]>([]);
const selectedSuggestionIndex = ref(0);

const isEditingTitle = ref(false);
const isEditingDescription = ref(false);
const isEditingType = ref(false);
const isEditingPriority = ref(false);
const isEditingAssignee = ref(false);
const isEditingPoints = ref(false);

const editingTitle = ref('');
const editingDescription = ref('');
const editingType = ref<TicketType>('task');
const editingPriority = ref('MEDIUM');
const editingAssignee = ref<number | null>(null);
const editingPoints = ref(0);

const titleInput = ref<HTMLInputElement | null>(null);
const typeSelect = ref<HTMLSelectElement | null>(null);
const prioritySelect = ref<HTMLSelectElement | null>(null);
const assigneeSelect = ref<HTMLSelectElement | null>(null);
const pointsInput = ref<HTMLInputElement | null>(null);

const sortedImages = computed(() => {
  if (!ticket.value?.images) return [];
  return [...ticket.value.images].sort((a, b) => a.displayOrder - b.displayOrder);
});

const canDeleteImages = computed(() => {
  return authStore.currentUser?.id === ticket.value?.creator.id;
});

const tagsList = computed(() => {
  const raw = ticket.value?.tags;
  if (!raw || !Array.isArray(raw)) return [];
  return raw.map((tag: any) => ({
    id: tag.id,
    name: tag.content || tag.name,
    color: tag.color || '#E5E7EB'
  }));
});

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

function getImageFullUrl(image: { url: string }): string {
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
  if (image.url.startsWith('http://') || image.url.startsWith('https://')) {
    return image.url;
  }
  return `${baseUrl}${image.url}`;
}

async function loadAllTags() {
  try {
    allTagSuggestions.value = await ticketApi.getAllTags();
  } catch (err) {
    console.error('Failed to load tags:', err);
  }
}

function filterTagSuggestions() {
  if (!newTagName.value.trim()) {
    filteredTagSuggestions.value = [];
    selectedSuggestionIndex.value = 0;
    return;
  }

  const query = newTagName.value.toLowerCase();
  const existingSet = new Set(tagsList.value.map(tag => tag.name.trim().toLowerCase()));

  filteredTagSuggestions.value = allTagSuggestions.value
      .filter(tag =>
          tag.content.toLowerCase().includes(query) &&
          !existingSet.has(tag.content.toLowerCase())
      )
      .slice(0, 5);

  selectedSuggestionIndex.value = 0;
}

function selectTagSuggestion(suggestion: TagSuggestion) {
  newTagName.value = suggestion.content;
  newTagColor.value = suggestion.color;
  filteredTagSuggestions.value = [];
  selectedSuggestionIndex.value = 0;
}

function navigateSuggestions(direction: number) {
  if (filteredTagSuggestions.value.length === 0) return;

  selectedSuggestionIndex.value += direction;

  if (selectedSuggestionIndex.value < 0) {
    selectedSuggestionIndex.value = filteredTagSuggestions.value.length - 1;
  } else if (selectedSuggestionIndex.value >= filteredTagSuggestions.value.length) {
    selectedSuggestionIndex.value = 0;
  }

  const selected = filteredTagSuggestions.value[selectedSuggestionIndex.value];
  if (selected) {
    newTagName.value = selected.content;
    newTagColor.value = selected.color;
  }
}

function handleTagEnter() {
  if (filteredTagSuggestions.value.length > 0) {
    const selected = filteredTagSuggestions.value[selectedSuggestionIndex.value];
    if (selected) {
      selectTagSuggestion(selected);
    }
  } else {
    addTag();
  }
}

function clearSuggestions() {
  filteredTagSuggestions.value = [];
  selectedSuggestionIndex.value = 0;
}

async function openTagInput() {
  showTagInput.value = true;
  await loadAllTags();
}

function startBlockTicket() {
  blockReason.value = '';
  showBlockModal.value = true;
}

async function handleBlockTicket() {
  if (!ticket.value || !blockReason.value.trim()) return;
  blockingTicket.value = true;
  try {
    await ticketApi.blockTicket(ticket.value.id, blockReason.value.trim());
    await loadTicket();
    showBlockModal.value = false;
    blockReason.value = '';
    toast.success('Ticket bloqué');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Erreur lors du blocage du ticket');
  } finally {
    blockingTicket.value = false;
  }
}

async function startUnblockTicket() {
  if (!ticket.value) return;

  const confirmed = await confirm({
    title: 'Débloquer le ticket',
    message: 'Voulez-vous vraiment débloquer ce ticket ?',
    confirmText: 'Débloquer',
    cancelText: 'Annuler',
    variant: 'warning'
  });

  if (!confirmed) return;

  try {
    await ticketApi.unblockTicket(ticket.value.id);
    await loadTicket();
    toast.success('Ticket débloqué');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Erreur lors du déblocage du ticket');
  }
}

async function startEditingTitle() {
  if (!ticket.value) return;
  editingTitle.value = ticket.value.title;
  isEditingTitle.value = true;
  await nextTick();
  titleInput.value?.focus();
}

async function saveTitle() {
  if (!ticket.value || !editingTitle.value.trim()) {
    cancelEditingTitle();
    return;
  }
  try {
    await ticketApi.update(ticket.value.id, { title: editingTitle.value.trim() } as any);
    ticket.value.title = editingTitle.value.trim();
    isEditingTitle.value = false;
    toast.success('Titre mis à jour');
  } catch (err: any) {
    toast.error('Erreur lors de la mise à jour du titre');
  }
}

function cancelEditingTitle() {
  isEditingTitle.value = false;
  editingTitle.value = '';
}

async function startEditingDescription() {
  if (!ticket.value) return;
  editingDescription.value = ticket.value.description;
  isEditingDescription.value = true;
}

async function saveDescription() {
  if (!ticket.value || !editingDescription.value.trim()) {
    cancelEditingDescription();
    return;
  }
  try {
    await ticketApi.update(ticket.value.id, { description: editingDescription.value.trim() } as any);
    ticket.value.description = editingDescription.value.trim();
    isEditingDescription.value = false;
    toast.success('Description mise à jour');
  } catch (err: any) {
    toast.error('Erreur lors de la mise à jour de la description');
  }
}

function cancelEditingDescription() {
  isEditingDescription.value = false;
  editingDescription.value = '';
}

async function startEditingType() {
  if (!ticket.value) return;
  editingType.value = ticket.value.type;
  isEditingType.value = true;
  await nextTick();
  typeSelect.value?.focus();
}

async function saveType() {
  if (!ticket.value) return;
  try {
    await ticketApi.update(ticket.value.id, { type: editingType.value } as any);
    ticket.value.type = editingType.value;
    isEditingType.value = false;
    toast.success('Type mis à jour');
  } catch (err: any) {
    toast.error('Erreur lors de la mise à jour du type');
  }
}

function cancelEditingType() {
  isEditingType.value = false;
}

async function startEditingPriority() {
  if (!ticket.value) return;
  editingPriority.value = ticket.value.priority;
  isEditingPriority.value = true;
  await nextTick();
  prioritySelect.value?.focus();
}

async function savePriority() {
  if (!ticket.value) return;
  try {
    await ticketApi.update(ticket.value.id, { priority: editingPriority.value } as any);
    ticket.value.priority = editingPriority.value;
    isEditingPriority.value = false;
    toast.success('Priorité mise à jour');
  } catch (err: any) {
    toast.error('Erreur lors de la mise à jour de la priorité');
  }
}

function cancelEditingPriority() {
  isEditingPriority.value = false;
}

async function startEditingAssignee() {
  if (!ticket.value) return;
  editingAssignee.value = ticket.value.assignee?.id || null;
  isEditingAssignee.value = true;
  await nextTick();
  assigneeSelect.value?.focus();
}

async function saveAssignee() {
  if (!ticket.value) return;
  try {
    await ticketApi.update(ticket.value.id, { assignee: editingAssignee.value } as any);
    await loadTicket();
    isEditingAssignee.value = false;
    toast.success('Assignation mise à jour');
  } catch (err: any) {
    toast.error('Erreur lors de la mise à jour de l\'assignation');
  }
}

function cancelEditingAssignee() {
  isEditingAssignee.value = false;
}

async function startEditingPoints() {
  if (!ticket.value) return;
  editingPoints.value = ticket.value.difficultyPoints;
  isEditingPoints.value = true;
  await nextTick();
  pointsInput.value?.focus();
}

async function savePoints() {
  if (!ticket.value || editingPoints.value < 0) {
    cancelEditingPoints();
    return;
  }
  try {
    await ticketApi.update(ticket.value.id, { difficultyPoints: editingPoints.value } as any);
    ticket.value.difficultyPoints = editingPoints.value;
    isEditingPoints.value = false;
    toast.success('Points mis à jour');
  } catch (err: any) {
    toast.error('Erreur lors de la mise à jour des points');
  }
}

function cancelEditingPoints() {
  isEditingPoints.value = false;
}

async function addTag() {
  if (!ticket.value || !newTagName.value.trim()) return;
  try {
    await ticketApi.addTag(
        ticket.value.id,
        newTagName.value.trim(),
        newTagColor.value
    );
    await loadTicket();
    newTagName.value = '';
    newTagColor.value = '#6366f1';
    showTagInput.value = false;
    clearSuggestions();
    toast.success('Tag ajouté');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Erreur lors de l\'ajout du tag');
  }
}

async function removeTag(index: number) {
  if (!ticket.value) return;
  const tag = tagsList.value[index];
  if (!tag || !tag.id) {
    toast.error('Tag invalide');
    return;
  }

  const confirmed = await confirm({
    title: 'Supprimer le tag',
    message: `Voulez-vous vraiment supprimer le tag "${tag.name}" ?`,
    confirmText: 'Supprimer',
    cancelText: 'Annuler',
    variant: 'danger'
  });

  if (!confirmed) return;

  try {
    await ticketApi.removeTag(ticket.value.id, tag.id);
    await loadTicket();
    toast.success('Tag supprimé');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Erreur lors de la suppression du tag');
  }
}

function cancelTagInput() {
  showTagInput.value = false;
  newTagName.value = '';
  newTagColor.value = '#6366f1';
  clearSuggestions();
}

async function loadTicket() {
  loading.value = true;
  error.value = null;
  try {
    const ticketId = parseInt(route.params.id as string);
    ticket.value = await ticketApi.getDetails(ticketId);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement du ticket';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
}

async function loadUsers() {
  try {
    users.value = await userApi.getAll();
  } catch (err) {
    console.error('Failed to load users:', err);
  }
}

async function handleStatusChange() {
  if (!ticket.value) return;
  try {
    await ticketApi.changeStatus(ticket.value.id, ticket.value.status);
    toast.success('Statut mis à jour');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du changement de statut';
    toast.error(error.value);
    await loadTicket();
  }
}

async function handleAddComment() {
  if (!ticket.value || !newComment.value.trim()) return;
  addingComment.value = true;
  try {
    const comment = await commentApi.createOnTicket(ticket.value.id, { description: newComment.value });
    if (ticket.value.comments) {
      ticket.value.comments.unshift(comment);
    }
    newComment.value = '';
    toast.success('Commentaire ajouté');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de l\'ajout du commentaire';
    toast.error(error.value);
  } finally {
    addingComment.value = false;
  }
}

function handleEditComment(comment: Comment) {
  toast.info('Fonctionnalité à venir');
}

async function handleDeleteComment(comment: Comment) {
  const confirmed = await confirm({
    title: 'Supprimer le commentaire',
    message: 'Voulez-vous vraiment supprimer ce commentaire ?',
    confirmText: 'Supprimer',
    cancelText: 'Annuler',
    variant: 'danger'
  });

  if (!confirmed) return;

  try {
    await commentApi.delete(comment.id);
    if (ticket.value?.comments) {
      const index = ticket.value.comments.findIndex(c => c.id === comment.id);
      if (index !== -1) {
        ticket.value.comments.splice(index, 1);
      }
    }
    toast.success('Commentaire supprimé');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la suppression du commentaire';
    toast.error(error.value);
  }
}

async function handleCreateTest() {
  if (!ticket.value || !newTest.value.trim()) return;
  creatingTest.value = true;
  try {
    const test = await testApi.createForTicket(ticket.value.id, { description: newTest.value });
    if (ticket.value.tests) {
      ticket.value.tests.unshift(test);
    }
    newTest.value = '';
    showTestModal.value = false;
    toast.success('Test créé');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la création du test';
    toast.error(error.value);
  } finally {
    creatingTest.value = false;
  }
}

async function handleValidateTest(test: Test, isValidated: boolean) {
  try {
    await testApi.validate(test.id, { isValidated });
    if (ticket.value?.tests) {
      const index = ticket.value.tests.findIndex(t => t.id === test.id);
      if (index !== -1) {
        ticket.value.tests[index].isValidated = isValidated;
      }
    }
    toast.success(isValidated ? 'Test validé' : 'Test rejeté');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la validation du test';
    toast.error(error.value);
  }
}

function triggerImageUpload() {
  imageInput.value?.click();
}

async function handleImageUpload(event: Event) {
  if (!ticket.value) return;
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  uploadingImages.value = true;
  try {
    const uploadedImage = await imageApi.uploadForTicket(ticket.value.id, [file], 'TICKET_ATTACHMENT');
    if (uploadedImage) {
      if (ticket.value.images) {
        ticket.value.images.push(uploadedImage);
      } else {
        ticket.value.images = [uploadedImage];
      }
      toast.success("Image uploadée avec succès");
    }
    if (imageInput.value) {
      imageInput.value.value = '';
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || "Erreur lors de l'upload de l'image";
    toast.error(error.value);
  } finally {
    uploadingImages.value = false;
  }
}

async function handleImageDelete(image: { id: number; url: string; filename: string; displayOrder: number }) {
  if (!ticket.value) return;

  const confirmed = await confirm({
    title: 'Supprimer l\'image',
    message: `Supprimer l'image "${image.filename}" ?`,
    confirmText: 'Supprimer',
    cancelText: 'Annuler',
    variant: 'danger'
  });

  if (!confirmed) return;

  try {
    await imageApi.delete(image.id);
    if (ticket.value.images) {
      const index = ticket.value.images.findIndex(img => img.id === image.id);
      if (index !== -1) {
        ticket.value.images.splice(index, 1);
      }
    }
    toast.success('Image supprimée');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la suppression de l\'image';
    toast.error(error.value);
  }
}

function openImageViewer(image: { id: number; url: string; filename: string; displayOrder: number }) {
  selectedImageId.value = image.id;
  showImageViewer.value = true;
}

function getTypeClass(type: TicketType): string {
  const classes: Record<TicketType, string> = {
    bug: 'bg-red-100 text-red-800 border border-red-200',
    feature: 'bg-blue-100 text-blue-800 border border-blue-200',
    task: 'bg-gray-100 text-gray-800 border border-gray-200',
    improvement: 'bg-green-100 text-green-800 border border-green-200'
  };
  return classes[type] || 'bg-gray-100 text-gray-800 border border-gray-200';
}

function getTypeLabel(type: TicketType): string {
  const labels: Record<TicketType, string> = {
    bug: '🐛 Bug',
    feature: '✨ Feature',
    task: '📋 Tâche',
    improvement: '⚡ Amélioration'
  };
  return labels[type] || type;
}

function getPriorityClass(priority: string): string {
  const classes: Record<string, string> = {
    LOW: 'bg-blue-100 text-blue-700 border border-blue-200',
    MEDIUM: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    HIGH: 'bg-orange-100 text-orange-700 border border-orange-200',
    CRITICAL: 'bg-red-100 text-red-700 border border-red-200'
  };
  return classes[priority] || 'bg-gray-100 text-gray-700 border border-gray-200';
}

function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    LOW: '🔵 Basse',
    MEDIUM: '🟡 Moyenne',
    HIGH: '🟠 Haute',
    CRITICAL: '🔴 Critique'
  };
  return labels[priority] || priority;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  });
}

function formatDateLong(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function copyToClipboard(text: string) {
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papiers');
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    toast.success('Copié dans le presse-papiers');
  }
}

onMounted(async () => {
  await Promise.all([
    loadTicket(),
    loadUsers(),
    loadAllTags()
  ]);
});
</script>
