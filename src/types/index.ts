export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface DailyEntry {
  id: string;
  userId: string;
  userName: string;
  date: string;
  workDone: string;
  blockers: string;
  learnings: string;
  githubCommitLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDailyEntryRequest {
  workDone: string;
  blockers: string;
  learnings: string;
  githubCommitLink?: string;
}

export interface UpdateDailyEntryRequest extends CreateDailyEntryRequest {
  id: string;
}