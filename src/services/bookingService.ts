import { Booking } from '../types';
import { bookingServiceApi } from './api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// Define interfaces for admin statistics
interface EventStats {
  eventId: string;
  eventTitle: string;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  bookingRate: number;
  capacity: number;
  availableSeats: number;
  eventDate: string;
}

interface AdminStats {
  totalEvents: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  averageBookingsPerEvent: number;
  eventStats: EventStats[];
}

export const BookingService = {
  // Create a new booking
  async createBooking(eventId: string): Promise<Booking> {
    const response = await bookingServiceApi.post('/bookings', { eventId });
    return response.data;
  },

  // Get user's bookings
  async getUserBookings(): Promise<Booking[]> {
    try {
      const response = await bookingServiceApi.get('/bookings');
      
      // Check if response.data is an array
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // If response.data contains a data property that is an array (common API pattern)
      if (response.data && typeof response.data === 'object' && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // Log unexpected format and return empty array
      console.error('Unexpected booking service response format:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  // Get bookings for a specific event
  async getEventBookings(eventId: string): Promise<Booking[]> {
    const response = await bookingServiceApi.get(`/bookings?eventId=${eventId}`);
    return response.data;
  },

  // Check if user has already booked an event
  async checkBookingExists(eventId: string): Promise<boolean> {
    try {
      const response = await bookingServiceApi.get<ApiResponse<boolean>>(`/bookings/check/${eventId}`);
      
      // Handle different response formats
      if (response.data && typeof response.data === 'object') {
        if (typeof response.data.data === 'boolean') {
          return response.data.data;
        } else if (typeof response.data === 'boolean') {
          return response.data;
        }
      }
      
      console.error('Unexpected response format from booking check:', response.data);
      return false;
    } catch (error) {
      console.error(`Error checking booking for event ${eventId}:`, error);
      return false;
    }
  },

  // Cancel a booking
  async cancelBooking(bookingId: string): Promise<void> {
    await bookingServiceApi.delete(`/bookings/${bookingId}`);
  },

  // Get admin statistics
  async getAdminStats(): Promise<AdminStats> {
    const response = await bookingServiceApi.get('/admin/stats');
    return response.data.data;
  },

  // Get all bookings (admin only)
  async getAllBookings(page: number = 1, limit: number = 10): Promise<{
    bookings: Booking[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await bookingServiceApi.get(`/bookings/all?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get booking statistics (admin only)
  async getBookingStatistics(): Promise<{
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
  }> {
    const response = await bookingServiceApi.get('/bookings/statistics');
    return response.data;
  },

  // Get recent bookings (admin only)
  async getRecentBookings(limit: number = 5): Promise<Booking[]> {
    const response = await bookingServiceApi.get(`/bookings/recent?limit=${limit}`);
    return response.data;
  },
  
  // Update booking status (admin only)
  async updateBookingStatus(bookingId: string, status: 'confirmed' | 'pending' | 'cancelled'): Promise<Booking> {
    const response = await bookingServiceApi.put(`/bookings/${bookingId}/status`, { status });
    return response.data;
  }
}; 