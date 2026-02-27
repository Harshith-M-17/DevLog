/**
 * User roles used across the application.
 * Following Open/Closed Principle — extend this enum to add new roles
 * without modifying existing authorization guards.
 */
export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}
