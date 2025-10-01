import type { TicketStatus, TicketType } from '@/types/ticket.types';

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  A_FAIRE: 'À faire',
  EN_COURS: 'En cours',
  REVISION: 'Révision',
  DEMANDE_MODIFICATION: 'Modification demandée',
  TEST: 'Test',
  TEST_KO: 'Test KO',
  TEST_OK: 'Test OK',
  PRODUCTION: 'Production'
};

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  A_FAIRE: 'bg-gray-100 text-gray-800',
  EN_COURS: 'bg-blue-100 text-blue-800',
  REVISION: 'bg-purple-100 text-purple-800',
  DEMANDE_MODIFICATION: 'bg-orange-100 text-orange-800',
  TEST: 'bg-yellow-100 text-yellow-800',
  TEST_KO: 'bg-red-100 text-red-800',
  TEST_OK: 'bg-green-100 text-green-800',
  PRODUCTION: 'bg-emerald-100 text-emerald-800'
};

export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  bug: '🐛 Bug',
  feature: '✨ Feature',
  task: '📋 Tâche',
  improvement: '⚡ Amélioration'
};

export const TICKET_TYPE_COLORS: Record<TicketType, string> = {
  bug: 'bg-red-50 text-red-700 border border-red-200',
  feature: 'bg-blue-50 text-blue-700 border border-blue-200',
  task: 'bg-gray-50 text-gray-700 border border-gray-200',
  improvement: 'bg-green-50 text-green-700 border border-green-200'
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  KANBAN: '/sprint/kanban',
  TICKETS: '/tickets',
  BACKLOG: '/backlog',
  TESTS: '/tests'
} as const;