export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  capacity: number;
  registered: number;
  isPast: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string | null;
}

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  bookingDate: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
} 