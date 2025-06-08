import { User, LoginCredentials, RegisterData } from '../types';
import { userServiceApi } from './api';

// Define a type for the register data that doesn't include confirmPassword
type RegisterApiData = Omit<RegisterData, 'confirmPassword'>;

export const UserService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await userServiceApi.post('/users/login', credentials);
    return response.data;
  },

  // Register user
  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    // Make sure confirmPassword is sent to the API
    const response = await userServiceApi.post('/users/register', {
      name: data.name,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword
    });
    return response.data;
  },

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    const response = await userServiceApi.get('/users/me');
    return response.data;
  },

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await userServiceApi.put('/users/me', data);
    return response.data;
  }
}; 