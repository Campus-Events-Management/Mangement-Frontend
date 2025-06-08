import { Event } from '../types';
import { eventServiceApi } from './api';

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

// Define interface for CreateEventDto
interface CreateEventDto {
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  imageUrl?: string;
}

export const EventService = {
  // Get all events
  async getAllEvents(): Promise<Event[]> {
    const response = await eventServiceApi.get('/events');
    return response.data;
  },

  // Get event by id
  async getEventById(id: string): Promise<Event> {
    const response = await eventServiceApi.get(`/events/${id}`);
    return response.data;
  },

  // Get upcoming events
  async getUpcomingEvents(): Promise<Event[]> {
    const response = await eventServiceApi.get('/events?isPast=false');
    return response.data;
  },

  // Get past events
  async getPastEvents(): Promise<Event[]> {
    const response = await eventServiceApi.get('/events?isPast=true');
    return response.data;
  },

  // Create a new event (admin only)
  async createEvent(eventData: CreateEventDto): Promise<Event> {
    try {
      // Log the request for debugging
      console.log('Creating event with data:', eventData);
      
      // Make sure the API endpoint is correct
      const response = await eventServiceApi.post('/events', eventData);
      
      // Log the response for debugging
      console.log('Event creation response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Error in createEvent:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update an event (admin only)
  async updateEvent(id: string, event: Partial<Event>): Promise<Event> {
    const response = await eventServiceApi.put(`/events/${id}`, event);
    return response.data;
  },

  // Delete an event (admin only)
  async deleteEvent(id: string): Promise<void> {
    await eventServiceApi.delete(`/events/${id}`);
  },
  
  // Upload an image for an event (admin only)
  async uploadEventImage(eventId: string, imageFile: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await eventServiceApi.post(`/events/${eventId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },
  
  // Update booking count for an event
  async updateBookingCount(eventId: string, isIncrement: boolean): Promise<boolean> {
    const response = await eventServiceApi.put(`/events/${eventId}/bookings`, { isIncrement });
    return true;
  },

  // Get event statistics (admin only)
  async getEventStatistics(): Promise<{
    upcomingEvents: number;
    totalEvents: number;
    totalBookings: number;
    ticketsSold: number;
    totalRevenue: number;
  }> {
    const response = await eventServiceApi.get('/events/statistics');
    return response.data;
  },

  // Get events by category
  async getEventsByCategory(category: string): Promise<Event[]> {
    const response = await eventServiceApi.get(`/events/category/${category}`);
    return response.data;
  },
  
  // Get popular event categories
  async getPopularCategories(): Promise<{
    type: string;
    count: number;
    percentage: number;
  }[]> {
    const response = await eventServiceApi.get('/events/popular-categories');
    return response.data;
  },
  
  // Get monthly revenue data
  async getMonthlyRevenue(year: number): Promise<{
    month: string;
    amount: number;
  }[]> {
    const response = await eventServiceApi.get(`/events/revenue/${year}`);
    return response.data;
  },
  
  // Get similar events
  async getSimilarEvents(eventId: string, limit: number = 3): Promise<Event[]> {
    const response = await eventServiceApi.get(`/events/${eventId}/similar?limit=${limit}`);
    return response.data;
  }
}; 