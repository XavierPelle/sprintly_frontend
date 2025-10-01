<!-- src/views/profile/ProfileView.vue -->

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Mon profil</h1>
      <p class="mt-1 text-sm text-gray-600">
        Gérez vos informations personnelles et votre mot de passe
      </p>
    </div>

    <!-- Messages de succès/erreur -->
    <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-4">
      <p class="text-green-800">{{ successMessage }}</p>
    </div>

    <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ errorMessage }}</p>
    </div>

    <!-- Avatar et informations de base -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center space-x-6">
        <!-- Avatar -->
        <div class="relative">
          <div class="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {{ userInitials }}
          </div>
          <button
            class="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Changer l'avatar (à venir)"
          >
            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <!-- Info -->
        <div class="flex-1">
          <h2 class="text-xl font-semibold text-gray-900">
            {{ authStore.currentUser?.firstName }} {{ authStore.currentUser?.lastName }}
          </h2>
          <p class="text-sm text-gray-600">{{ authStore.currentUser?.email }}</p>
          <p class="mt-2 text-xs text-gray-500">
            Membre depuis {{ formatDate(authStore.currentUser?.createdAt || '') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Formulaire informations personnelles -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Informations personnelles</h2>
      </div>
      <form @submit.prevent="handleUpdateInfo" class="p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput
            v-model="infoForm.firstName"
            label="Prénom"
            placeholder="Jean"
            required
            autocomplete="given-name"
          />
          <BaseInput
            v-model="infoForm.lastName"
            label="Nom"
            placeholder="Dupont"
            required
            autocomplete="family-name"
          />
        </div>
        <BaseInput
          v-model="infoForm.email"
          type="email"
          label="Email"
          placeholder="jean.dupont@email.com"
          required
          autocomplete="email"
        />
        <div class="flex justify-end space-x-3">
          <BaseButton
            variant="secondary"
            @click="resetInfoForm"
          >
            Annuler
          </BaseButton>
          <BaseButton
            type="submit"
            :loading="loadingInfo"
            loading-text="Mise à jour..."
          >
            Enregistrer
          </BaseButton>
        </div>
      </form>
    </div>

    <!-- Formulaire mot de passe -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Changer le mot de passe</h2>
      </div>
      <form @submit.prevent="handleUpdatePassword" class="p-6 space-y-4">
        <BaseInput
          v-model="passwordForm.currentPassword"
          type="password"
          label="Mot de passe actuel"
          placeholder="••••••••"
          required
          autocomplete="current-password"
          :error="passwordErrors.currentPassword"
        />
        <BaseInput
          v-model="passwordForm.newPassword"
          type="password"
          label="Nouveau mot de passe"
          placeholder="••••••••"
          required
          autocomplete="new-password"
          :error="passwordErrors.newPassword"
          hint="Au moins 8 caractères avec majuscule, minuscule, chiffre et caractère spécial"
        />
        <BaseInput
          v-model="passwordForm.confirmPassword"
          type="password"
          label="Confirmer le nouveau mot de passe"
          placeholder="••••••••"
          required
          autocomplete="new-password"
          :error="passwordErrors.confirmPassword"
        />
        <div class="flex justify-end space-x-3">
          <BaseButton
            variant="secondary"
            @click="resetPasswordForm"
          >
            Annuler
          </BaseButton>
          <BaseButton
            type="submit"
            :loading="loadingPassword"
            loading-text="Mise à jour..."
          >
            Changer le mot de passe
          </BaseButton>
        </div>
      </form>
    </div>

    <!-- Zone dangereuse -->
    <div class="bg-white rounded-lg shadow-sm border border-red-200">
      <div class="px-6 py-4 border-b border-red-200">
        <h2 class="text-lg font-semibold text-red-900">Zone dangereuse</h2>
      </div>
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900">Supprimer mon compte</h3>
            <p class="text-sm text-gray-600 mt-1">
              Cette action est irréversible. Toutes vos données seront supprimées.
            </p>
          </div>
          <BaseButton variant="danger" @click="handleDeleteAccount">
            Supprimer
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { userApi } from '@/api/user.api';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const authStore = useAuthStore();

// Forms
const infoForm = ref({
  firstName: '',
  lastName: '',
  email: ''
});

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const passwordErrors = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// States
const loadingInfo = ref(false);
const loadingPassword = ref(false);
const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

const userInitials = computed(() => {
  const user = authStore.currentUser;
  if (!user) return '?';
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
});

function initForms() {
  if (authStore.currentUser) {
    infoForm.value = {
      firstName: authStore.currentUser.firstName,
      lastName: authStore.currentUser.lastName,
      email: authStore.currentUser.email
    };
  }
}

function resetInfoForm() {
  initForms();
}

function resetPasswordForm() {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  passwordErrors.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
}

function clearMessages() {
  successMessage.value = null;
  errorMessage.value = null;
}

function validatePassword(): boolean {
  clearMessages();
  passwordErrors.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  let isValid = true;

  if (passwordForm.value.newPassword.length < 8) {
    passwordErrors.value.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    isValid = false;
  }

  const hasUpperCase = /[A-Z]/.test(passwordForm.value.newPassword);
  const hasLowerCase = /[a-z]/.test(passwordForm.value.newPassword);
  const hasNumber = /[0-9]/.test(passwordForm.value.newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.value.newPassword);

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    passwordErrors.value.newPassword = 'Le mot de passe doit contenir majuscule, minuscule, chiffre et caractère spécial';
    isValid = false;
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordErrors.value.confirmPassword = 'Les mots de passe ne correspondent pas';
    isValid = false;
  }

  if (passwordForm.value.currentPassword === passwordForm.value.newPassword) {
    passwordErrors.value.newPassword = 'Le nouveau mot de passe doit être différent de l\'ancien';
    isValid = false;
  }

  return isValid;
}

async function handleUpdateInfo() {
  clearMessages();
  loadingInfo.value = true;

  try {
    // TODO: API call to update user info
    // await userApi.updateInfo(authStore.currentUser!.id, infoForm.value);
    
    // Pour l'instant, simuler un succès
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    successMessage.value = 'Informations mises à jour avec succès';
    
    // Mettre à jour le store
    // authStore.updateUser(infoForm.value);
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Erreur lors de la mise à jour';
  } finally {
    loadingInfo.value = false;
  }
}

async function handleUpdatePassword() {
  if (!validatePassword()) {
    return;
  }

  clearMessages();
  loadingPassword.value = true;

  try {
    await userApi.updatePassword(
      authStore.currentUser!.id,
      passwordForm.value
    );
    
    successMessage.value = 'Mot de passe modifié avec succès';
    resetPasswordForm();
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Erreur lors du changement de mot de passe';
  } finally {
    loadingPassword.value = false;
  }
}

function handleDeleteAccount() {
  if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
    // TODO: Implémenter la suppression de compte
    alert('Fonctionnalité à venir');
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

onMounted(() => {
  initForms();
});
</script>