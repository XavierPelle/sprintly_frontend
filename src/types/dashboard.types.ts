// src/types/dashboard.types.ts

import type { TicketStatus } from './ticket.types'

export interface UserDashboard {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };

  assignedTickets: {
    total: number;
    byStatus: Record<TicketStatus, number>;
    urgent: Array<{
      id: number;
      key: string;
      title: string;
      status: TicketStatus;
      difficultyPoints: number;
    }>;
  };

  createdTickets: {
    total: number;
    byStatus: Record<TicketStatus, number>;
    recent: Array<{
      id: number;
      key: string;
      title: string;
      status: TicketStatus;
      createdAt: string;
    }>;
  };

  activeSprints: Array<{
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    userTicketsCount: number;
    userTicketsPoints: number;
    totalPoints: number;
    progressPercentage: number;
  }>;

  testsToValidate: {
    total: number;
    tests: Array<{
      id: number;
      description: string;
      ticketKey: string;
      ticketTitle: string;
      createdAt: string;
      createdBy: string;
    }>;
  };

  recentActivity: {
    commentsCount: number;
    testsCount: number;
    lastCommentDate: string | null;
    lastTestDate: string | null;
  };

  stats: {
    totalTicketsCreated: number;
    totalTicketsAssigned: number;
    totalComments: number;
    totalTests: number;
    completionRate: number;
  };
}