export type Role = 'CUSTOMER' | 'OWNER' | 'ADMIN';
export type Category = 'CAFE' | 'RESTAURANT' | 'PUB';
export type BusinessStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface City {
  id: number;
  name: string;
  state: string | null;
  country: string;
}

export interface Business {
  id: number;
  cityId: number;
  cityName: string;
  ownerId: number;
  name: string;
  category: Category;
  cuisine: string | null;
  description: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  websiteUrl: string | null;
  socialLinks: Record<string, string>;
  openingHours: Record<string, string>;
  logoUrl: string | null;
  status: BusinessStatus;
}

export interface BusinessRequest {
  cityId: number;
  name: string;
  category: Category;
  cuisine: string | null;
  description: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  websiteUrl: string | null;
  socialLinks: Record<string, string>;
  openingHours: Record<string, string>;
  logoUrl: string | null;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** Turns a failed HTTP response into a message that is safe to show to the user. */
export function errorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const body = (err as { error?: { message?: unknown } } | null)?.error;
  return typeof body?.message === 'string' && body.message.length > 0 ? body.message : fallback;
}
