export enum TicketStatus {
  TODO = 'A_FAIRE',
  IN_PROGRESS = 'EN_COURS',
  REVIEW = 'REVISION',
  CHANGE_REQUEST = 'DEMANDE_MODIFICATION',
  TEST = 'TEST',
  TEST_KO = 'TEST_KO',
  TEST_OK = 'TEST_OK',
  PRODUCTION = 'PRODUCTION'
}

export enum TicketType {
  BUG = 'bug',
  FEATURE = 'feature',
  TASK = 'task',
  IMPROVEMENT = 'improvement'
}

export enum TicketPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface Ticket {
  id: number;
  key: string;
  title: string;
  description: string;
  status: TicketStatus;
  type: TicketType;
  difficultyPoints: number;
  createdAt: string;
  updatedAt: string;
  priority: string;
  isBlocked: boolean;
  blockedReason: string;
  creator: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignee: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  sprint: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
  } | null;
  images?: Array<{
    id: number;
    url: string;
    filename: string;
    displayOrder: number;
  }>;
  comments?: Comment[];
  tests?: Test[];
  branch: string;
  testLink: string;
}

export interface TicketDetails extends Ticket {
  stats: {
    totalComments: number;
    totalTests: number;
    validatedTests: number;
    totalImages: number;
  };
}

export interface Comment {
  id: number;
  description: string;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface Test {
  id: number;
  description: string;
  isValidated: boolean;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  type: TicketType;
  difficultyPoints: number;
  assignee?: number;
  sprintId?: number;
  projectPrefix?: string;
  priority: TicketPriority;
}