// src/router/index.ts

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { setupRouterGuards } from './guards';

const routes: RouteRecordRaw[] = [
  // Routes publiques (Auth)
  {
    path: '/auth',
    component: () => import('@/views/auth/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { requiresGuest: true }
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/auth/RegisterView.vue'),
        meta: { requiresGuest: true }
      }
    ]
  },

  // Routes protégées (App)
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/ProfileView.vue')
      },
      {
        path: 'sprint',
        children: [
          {
            path: 'kanban',
            name: 'Kanban',
            component: () => import('@/views/sprint/KanbanView.vue')
          },
          {
            path: ':id/details',
            name: 'SprintDetails',
            component: () => import('@/views/sprint/SprintDetailsView.vue')
          }
        ]
      },
      {
        path: 'tickets',
        children: [
          {
            path: '',
            name: 'TicketList',
            component: () => import('@/views/ticket/TicketListView.vue')
          },
          {
            path: ':id',
            name: 'TicketDetails',
            component: () => import('@/views/ticket/TicketDetailsView.vue')
          }
        ]
      },
      {
        path: 'backlog',
        name: 'Backlog',
        component: () => import('@/views/backlog/BacklogView.vue')
      },
      {
        path: 'tests',
        name: 'Tests',
        component: () => import('@/views/test/TestListView.vue')
      },
    ]
  },  
  {
    path: '/toast-demo',
    name: 'ToastDemo',
    component: () => import('@/views/ToastDemo.vue'),
    meta: {
      requiresAuth: false,
      title: 'Toast Demo'
    }
  },
    {
    path: '/sprint-management',
    name: 'SprintManagement',
    component: () => import('@/components/features/sprint/SprintManagementView.vue'),
    meta: {
      requiresAuth: false,
      title: 'Toast Demo'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

setupRouterGuards(router);

export default router;