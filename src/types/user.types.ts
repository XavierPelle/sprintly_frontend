export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: {
    id: number;
    url: string;
    filename: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
}