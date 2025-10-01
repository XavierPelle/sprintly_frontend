import type { Ticket, TicketStatus, TicketType } from './ticket.types';

export interface Sprint {
  id: number;
  name: string;
  maxPoints: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  tickets?: Ticket[];
}

export interface SprintDetails extends Sprint {
  stats: {
    totalTickets: number;
    totalPoints: number;
    completedPoints: number;
    remainingPoints: number;
    progressPercentage: number;
    ticketsByStatus: Record<TicketStatus, number>;
    ticketsByType: Record<TicketType, number>;
    isOverCapacity: boolean;
  };
}

export interface CreateSprintPayload {
  name: string;
  maxPoints: number;
  startDate: string;
  endDate: string;
}

export interface BurndownData {
  sprint: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    maxPoints: number;
  };
  burndownData: Array<{
    date: string;
    dayNumber: number;
    idealRemainingPoints: number;
    actualRemainingPoints: number;
    completedPoints: number;
    velocity: number;
  }>;
  summary: {
    totalPoints: number;
    completedPoints: number;
    remainingPoints: number;
    totalDays: number;
    daysElapsed: number;
    daysRemaining: number;
    averageVelocity: number;
    projectedCompletionDate: string | null;
    isOnTrack: boolean;
    percentComplete: number;
  };
}