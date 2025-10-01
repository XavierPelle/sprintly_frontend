import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/api/auth.api';
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthUser
} from '@/types/auth.types';

const ACCESS_TOKEN_KEY = 'sprintly_access_token';
const REFRESH_TOKEN_KEY = 'sprintly_refresh_token';
const USER_KEY = 'sprintly_user';

export const useAuthStore = defineStore('auth', () => {
  // State
  const accessToken = ref<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY));
  const refreshToken = ref<string | null>(localStorage.getItem(REFRESH_TOKEN_KEY));
  const user = ref<AuthUser | null>(
    localStorage.getItem(USER_KEY) ? JSON.parse(localStorage.getItem(USER_KEY)!) : null
  );
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);
  const currentUser = computed(() => user.value);

  // Actions
  async function login(credentials: LoginCredentials): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authApi.login(credentials);

      // Stocker les tokens et l'utilisateur
      accessToken.value = response.accessToken;
      refreshToken.value = response.refreshToken;
      user.value = response.user;

      // Persister dans le localStorage
      localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur de connexion';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(credentials: RegisterCredentials): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      await authApi.register(credentials);
      // Après inscription, on pourrait automatiquement connecter l'utilisateur
      // ou simplement rediriger vers la page de login
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur d\'inscription';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function refreshAccessToken(): Promise<void> {
    if (!refreshToken.value) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authApi.refreshToken(refreshToken.value);

      // Mettre à jour les tokens
      accessToken.value = response.accessToken;
      refreshToken.value = response.refreshToken;

      localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    } catch (err) {
      // Si le refresh échoue, déconnecter l'utilisateur
      logout();
      throw err;
    }
  }

  function logout(): void {
    // Nettoyer le state
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    error.value = null;

    // Nettoyer le localStorage
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function clearError(): void {
    error.value = null;
  }

  return {
    // State
    accessToken,
    refreshToken,
    user,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    currentUser,

    // Actions
    login,
    register,
    refreshAccessToken,
    logout,
    clearError
  };
});