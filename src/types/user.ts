export type UserRole = 'admin' | 'agent' | 'viewer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  photoURL?: string;
  isActive: boolean;
  createdAt: any;
  updatedAt?: any;
}
