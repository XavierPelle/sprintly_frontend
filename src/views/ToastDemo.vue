<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          🎉 Système de Toasts - Démonstration
        </h1>
        <p class="text-gray-600">
          Testez tous les types de toasts et leurs différentes configurations
        </p>
      </div>

      <!-- Basic Toasts -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Types de base
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            @click="showSuccessToast"
            class="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            ✅ Success
          </button>
          
          <button
            @click="showErrorToast"
            class="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            ❌ Error
          </button>
          
          <button
            @click="showWarningToast"
            class="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            ⚠️ Warning
          </button>
          
          <button
            @click="showInfoToast"
            class="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            ℹ️ Info
          </button>
        </div>
      </div>

      <!-- Custom Duration -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Durées personnalisées
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            @click="showQuickToast"
            class="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
          >
            ⚡ Rapide (2s)
          </button>
          
          <button
            @click="showNormalToast"
            class="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
          >
            ⏱️ Normal (5s)
          </button>
          
          <button
            @click="showLongToast"
            class="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
          >
            ⏳ Long (10s)
          </button>
        </div>
      </div>

      <!-- Realistic Scenarios -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Scénarios réalistes
        </h2>
        
        <div class="space-y-3">
          <button
            @click="simulateLogin"
            class="w-full px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium text-left flex items-center justify-between"
          >
            <span>🔐 Simuler une connexion</span>
            <span class="text-sm opacity-80">Success après 1s</span>
          </button>
          
          <button
            @click="simulateTicketCreation"
            class="w-full px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium text-left flex items-center justify-between"
          >
            <span>🎫 Créer un ticket</span>
            <span class="text-sm opacity-80">Success après 1.5s</span>
          </button>
          
          <button
            @click="simulateError"
            class="w-full px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium text-left flex items-center justify-between"
          >
            <span>💥 Simuler une erreur</span>
            <span class="text-sm opacity-80">Error après 1s</span>
          </button>
          
          <button
            @click="simulateFormValidation"
            class="w-full px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium text-left flex items-center justify-between"
          >
            <span>📝 Validation de formulaire</span>
            <span class="text-sm opacity-80">Multiple warnings</span>
          </button>
          
          <button
            @click="simulateBulkOperation"
            class="w-full px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium text-left flex items-center justify-between"
          >
            <span>📦 Opération en masse</span>
            <span class="text-sm opacity-80">Progress toasts</span>
          </button>
        </div>
      </div>

      <!-- Advanced Controls -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Contrôles avancés
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            @click="showPersistentToast"
            class="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            📌 Toast persistant
          </button>
          
          <button
            @click="showMultipleToasts"
            class="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            📚 Multiple toasts
          </button>
          
          <button
            @click="clearAllToasts"
            class="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            🗑️ Tout effacer
          </button>
        </div>
      </div>

      <!-- Message Templates -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Messages courants
        </h2>
        
        <div class="space-y-2">
          <button
            @click="toast.success('Modification enregistrée avec succès')"
            class="w-full px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            💾 Modification enregistrée avec succès
          </button>
          
          <button
            @click="toast.error('Une erreur est survenue. Veuillez réessayer.')"
            class="w-full px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            ⚠️ Une erreur est survenue. Veuillez réessayer.
          </button>
          
          <button
            @click="toast.warning('Cette action est irréversible')"
            class="w-full px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            🚨 Cette action est irréversible
          </button>
          
          <button
            @click="toast.info('Votre session expire dans 5 minutes')"
            class="w-full px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            ⏰ Votre session expire dans 5 minutes
          </button>
          
          <button
            @click="toast.success('Fichier uploadé avec succès (2.4 MB)')"
            class="w-full px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            📤 Fichier uploadé avec succès (2.4 MB)
          </button>
          
          <button
            @click="toast.error('Connexion perdue. Reconnexion en cours...')"
            class="w-full px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            🔌 Connexion perdue. Reconnexion en cours...
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Statistiques
        </h2>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ stats.success }}</div>
            <div class="text-sm text-green-700">Success</div>
          </div>
          
          <div class="text-center p-4 bg-red-50 rounded-lg">
            <div class="text-2xl font-bold text-red-600">{{ stats.error }}</div>
            <div class="text-sm text-red-700">Error</div>
          </div>
          
          <div class="text-center p-4 bg-orange-50 rounded-lg">
            <div class="text-2xl font-bold text-orange-600">{{ stats.warning }}</div>
            <div class="text-sm text-orange-700">Warning</div>
          </div>
          
          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">{{ stats.info }}</div>
            <div class="text-sm text-blue-700">Info</div>
          </div>
        </div>
        
        <div class="mt-4 text-center text-sm text-gray-600">
          Total de toasts affichés : {{ stats.total }}
        </div>
      </div>

      <!-- Code Examples -->
      <div class="bg-white rounded-lg shadow-sm p-6 mt-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Exemples de code
        </h2>
        
        <div class="space-y-4">
          <div>
            <div class="text-sm font-medium text-gray-700 mb-2">Success Toast</div>
            <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto"><code>toast.success('Opération réussie !')</code></pre>
          </div>
          
          <div>
            <div class="text-sm font-medium text-gray-700 mb-2">Error Toast</div>
            <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto"><code>toast.error('Une erreur est survenue')</code></pre>
          </div>
          
          <div>
            <div class="text-sm font-medium text-gray-700 mb-2">Toast avec durée personnalisée</div>
            <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto"><code>toast.success('Message', 3000) // 3 secondes</code></pre>
          </div>
          
          <div>
            <div class="text-sm font-medium text-gray-700 mb-2">Toast persistant (manuel)</div>
            <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto"><code>const id = toast.info('Loading...', 0)
// Plus tard...
toast.removeToast(id)</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useToast } from '@/composables/useToast'

const toast = useToast()

// Statistics
const stats = reactive({
  success: 0,
  error: 0,
  warning: 0,
  info: 0,
  total: 0
})

const incrementStat = (type: 'success' | 'error' | 'warning' | 'info') => {
  stats[type]++
  stats.total++
}

// Basic Toasts
const showSuccessToast = () => {
  toast.success('Opération réussie ! ✨')
  incrementStat('success')
}

const showErrorToast = () => {
  toast.error('Une erreur est survenue 😞')
  incrementStat('error')
}

const showWarningToast = () => {
  toast.warning('Attention à cette action ⚠️')
  incrementStat('warning')
}

const showInfoToast = () => {
  toast.info('Nouvelle information disponible 📢')
  incrementStat('info')
}

// Custom Duration
const showQuickToast = () => {
  toast.success('Toast rapide (2 secondes)', 2000)
  incrementStat('success')
}

const showNormalToast = () => {
  toast.info('Toast normal (5 secondes)', 5000)
  incrementStat('info')
}

const showLongToast = () => {
  toast.warning('Toast long (10 secondes)', 10000)
  incrementStat('warning')
}

// Realistic Scenarios
const simulateLogin = () => {
  toast.info('Connexion en cours...')
  incrementStat('info')
  
  setTimeout(() => {
    toast.success('Bienvenue Jean Dupont ! 👋')
    incrementStat('success')
  }, 1000)
}

const simulateTicketCreation = () => {
  toast.info('Création du ticket...')
  incrementStat('info')
  
  setTimeout(() => {
    toast.success('Ticket PROJ-042 créé avec succès 🎫')
    incrementStat('success')
  }, 1500)
}

const simulateError = () => {
  toast.info('Traitement en cours...')
  incrementStat('info')
  
  setTimeout(() => {
    toast.error('Échec de la connexion au serveur 🔌')
    incrementStat('error')
  }, 1000)
}

const simulateFormValidation = () => {
  toast.warning('Le titre doit contenir au moins 3 caractères')
  incrementStat('warning')
  
  setTimeout(() => {
    toast.warning('Veuillez sélectionner un type de ticket')
    incrementStat('warning')
  }, 500)
  
  setTimeout(() => {
    toast.warning('Les points de difficulté sont obligatoires')
    incrementStat('warning')
  }, 1000)
}

const simulateBulkOperation = async () => {
  const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']
  
  toast.info(`Traitement de ${items.length} éléments...`, 0)
  incrementStat('info')
  
  for (let i = 0; i < items.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 800))
    toast.info(`${items[i]} traité (${i + 1}/${items.length})`, 2000)
    incrementStat('info')
  }
  
  setTimeout(() => {
    toast.success(`✅ ${items.length} éléments traités avec succès !`)
    incrementStat('success')
  }, 800)
}

// Advanced Controls
const showPersistentToast = () => {
  const id = toast.info('⏳ Ce toast ne disparaîtra pas automatiquement. Cliquez sur X pour le fermer.', 0)
  incrementStat('info')
  
  // Optionnel : le fermer après 30 secondes
  setTimeout(() => {
    toast.removeToast(id)
  }, 30000)
}

const showMultipleToasts = () => {
  toast.success('Premier toast')
  incrementStat('success')
  
  setTimeout(() => {
    toast.info('Deuxième toast')
    incrementStat('info')
  }, 300)
  
  setTimeout(() => {
    toast.warning('Troisième toast')
    incrementStat('warning')
  }, 600)
  
  setTimeout(() => {
    toast.error('Quatrième toast')
    incrementStat('error')
  }, 900)
}

const clearAllToasts = () => {
  toast.clear()
  toast.info('Tous les toasts ont été effacés 🗑️')
  incrementStat('info')
}
</script>

<style scoped>
pre {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

code {
  font-size: 0.875rem;
  line-height: 1.5;
}
</style>