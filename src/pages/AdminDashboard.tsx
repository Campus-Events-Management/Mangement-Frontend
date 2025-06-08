import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { EventService } from '../services/eventService';
import { BookingService } from '../services/bookingService';
import { Event, Booking } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { DonutChart, BarChart, StatCard, ProgressBar } from '../components/DashboardChart';

// Define interface for admin stats
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
  imageUrl?: string; // Add imageUrl property
}

interface AdminStats {
  totalEvents: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  averageBookingsPerEvent: number;
  eventStats: EventStats[];
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [activeMonth, setActiveMonth] = useState(new Date());
  const [popularEventTypes, setPopularEventTypes] = useState<{type: string, count: number, percentage: number}[]>([]);
  const [revenueData, setRevenueData] = useState<{month: string, amount: number}[]>([]);
  
  // Check if user is admin
  const isAdmin = user && (user.role === 'admin' || user.name.includes('Admin'));

  useEffect(() => {
    // Redirect if not admin
    if (user && !isAdmin) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch events first
        const allEvents = await EventService.getAllEvents();
        setEvents(allEvents);
        
        // Fetch admin stats from booking service
        const stats = await BookingService.getAdminStats();
        
        // Merge event data with stats data to include imageUrl
        const enhancedStats = {
          ...stats,
          eventStats: stats.eventStats.map(eventStat => {
            const matchingEvent = allEvents.find(event => event.id === eventStat.eventId);
            return {
              ...eventStat,
              imageUrl: matchingEvent?.imageUrl
            };
          })
        };
        
        setAdminStats(enhancedStats);
        
        // Generate mock data for charts
        generateChartData(enhancedStats);
        
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, navigate, isAdmin]);
  
  const generateChartData = (stats: AdminStats) => {
    // Generate event types data based on event titles
    const eventTypes = [
      { type: 'Career Events', count: 0, percentage: 0 },
      { type: 'Tech Events', count: 0, percentage: 0 },
      { type: 'Networking', count: 0, percentage: 0 },
    ];
    
    stats.eventStats.forEach(event => {
      if (event.eventTitle.toLowerCase().includes('career')) {
        eventTypes[0].count += event.totalBookings;
      } else if (event.eventTitle.toLowerCase().includes('tech')) {
        eventTypes[1].count += event.totalBookings;
      } else if (event.eventTitle.toLowerCase().includes('network')) {
        eventTypes[2].count += event.totalBookings;
      }
    });
    
    // Calculate percentages
    const totalCount = eventTypes.reduce((sum, type) => sum + type.count, 0);
    eventTypes.forEach(type => {
      type.percentage = totalCount > 0 ? Math.round((type.count / totalCount) * 100) : 0;
    });
    
    setPopularEventTypes(eventTypes);
    
    // Generate mock revenue data for last 8 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const revenueData = months.map(month => ({
      month,
      amount: Math.floor(Math.random() * 30000) + 20000
    }));
    setRevenueData(revenueData);
  };
  
  // Calendar helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const renderCalendar = () => {
    const year = activeMonth.getFullYear();
    const month = activeMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="text-center py-2"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      // Check if there are events on this day
      const hasEvent = adminStats?.eventStats.some(event => {
        const eventDate = new Date(event.eventDate);
        return eventDate.getDate() === day && 
               eventDate.getMonth() === month && 
               eventDate.getFullYear() === year;
      });
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`text-center py-2 ${day === 14 ? 'bg-primary text-white rounded-full' : ''} 
                     ${hasEvent && day !== 14 ? 'relative' : ''}`}
        >
          {day}
          {hasEvent && day !== 14 && (
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-secondary rounded-full"></span>
          )}
        </div>
      );
    }
    
    return days;
  };
  
  const prevMonth = () => {
    const date = new Date(activeMonth);
    date.setMonth(date.getMonth() - 1);
    setActiveMonth(date);
  };
  
  const nextMonth = () => {
    const date = new Date(activeMonth);
    date.setMonth(date.getMonth() + 1);
    setActiveMonth(date);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to access the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Hello {user.name}, welcome back!</p>
        </div>
        <button
          onClick={() => navigate('/events/new')}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90"
        >
          Create New Event
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Events" 
              value={adminStats?.totalEvents || 0}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              }
            />
            
            <StatCard 
              title="Total Bookings" 
              value={adminStats?.totalBookings || 0}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              }
              color="secondary"
            />
            
            <StatCard 
              title="Confirmed Bookings" 
              value={adminStats?.confirmedBookings || 0}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  <path fillRule="evenodd" d="M3 10h14v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4z" clipRule="evenodd" />
                </svg>
              }
            />
            
            <StatCard 
              title="Average Bookings" 
              value={adminStats?.averageBookingsPerEvent.toFixed(1) || "0.0"}
              subtitle={`${adminStats?.cancelledBookings || 0} cancelled`}
            />
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Ticket Sales Chart */}
            <DonutChart 
              title="Booking Status"
              subtitle="All Events"
              percentage={adminStats ? Math.round((adminStats.confirmedBookings / adminStats.totalBookings) * 100) : 0}
              data={[
                { 
                  label: "Confirmed", 
                  value: adminStats?.confirmedBookings || 0, 
                  color: "#E94DCA" 
                },
                { 
                  label: "Cancelled", 
                  value: adminStats?.cancelledBookings || 0, 
                  color: "#7E3AF2" 
                },
                { 
                  label: "Available Seats", 
                  value: adminStats?.eventStats.reduce((sum, event) => sum + event.availableSeats, 0) || 0, 
                  color: "#d1d5db" 
                }
              ]}
            />
            
            {/* Revenue Chart */}
            <BarChart 
              title="Sales Revenue"
              subtitle="Last 8 Months"
              data={revenueData}
            />
          </div>
          
          {/* Popular Events & Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Popular Events */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold">Event Performance</h3>
                <div className="text-sm bg-gray-100 rounded-md px-3 py-1">
                  Booking Rate
                </div>
              </div>
              
              <div className="space-y-6">
                {adminStats?.eventStats.map((event, index) => (
                  <div key={event.eventId} className="space-y-2">
                    <div className="flex justify-between">
                      <span>{event.eventTitle}</span>
                      <span className="text-gray-500">{event.bookingRate}%</span>
                    </div>
                    <ProgressBar 
                      title=""
                      value={event.totalBookings}
                      max={event.capacity}
                      percentage={event.bookingRate}
                      color={index % 3 === 0 ? 'primary' : index % 3 === 1 ? 'secondary' : 'accent'}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Calendar */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">
                    {activeMonth.toLocaleString('default', { month: 'long' })} {activeMonth.getFullYear()}
                  </h3>
                </div>
                <div className="flex space-x-2">
                  <button onClick={prevMonth} className="p-1 rounded-full hover:bg-gray-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>
                  <button onClick={nextMonth} className="p-1 rounded-full hover:bg-gray-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                <div className="text-sm text-gray-500">Su</div>
                <div className="text-sm text-gray-500">Mo</div>
                <div className="text-sm text-gray-500">Tu</div>
                <div className="text-sm text-gray-500">We</div>
                <div className="text-sm text-gray-500">Th</div>
                <div className="text-sm text-gray-500">Fr</div>
                <div className="text-sm text-gray-500">Sa</div>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
              
              {/* Upcoming Events */}
              <div className="mt-6 space-y-4">
                {adminStats?.eventStats.slice(0, 2).map(event => (
                  <div key={event.eventId} className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-white mr-3">
                      <span>{new Date(event.eventDate).getDate()}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{event.eventTitle}</h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="bg-gray-200 rounded px-2 py-0.5 mr-2">
                          {event.availableSeats} seats left
                        </span>
                        <span>{formatDate(event.eventDate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Recent Events */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold">All Events</h3>
              <Link to="/events" className="text-sm text-primary">
                View All Events
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {adminStats?.eventStats.map(event => (
                <div key={event.eventId} className="bg-gray-50 rounded-lg overflow-hidden">
                  <div className="h-40 bg-gray-200 relative">
                    <img 
                      src={event.imageUrl || `https://via.placeholder.com/400x200?text=${encodeURIComponent(event.eventTitle)}`} 
                      alt={event.eventTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-white px-3 py-1 rounded-md text-sm">
                      {event.bookingRate > 50 ? 'Popular' : 'New'}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold mb-1">{event.eventTitle}</h4>
                    <p className="text-sm text-gray-500 mb-3">Capacity: {event.capacity}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {new Date(event.eventDate).toLocaleDateString()}
                      </div>
                      <Link 
                        to={`/events/${event.eventId}`}
                        className="text-primary font-semibold text-sm"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Bookings Table */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold">Recent Bookings</h3>
              <div className="flex">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search name, event, etc." 
                    className="pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <div className="ml-2 text-sm bg-gray-100 rounded-md px-3 py-2">
                  This Week
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confirmed
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cancelled
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking Rate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {adminStats?.eventStats.map(event => (
                    <tr key={event.eventId}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{event.eventTitle}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.eventDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{event.totalBookings}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{event.confirmedBookings}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{event.cancelledBookings}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{event.bookingRate}%</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          event.availableSeats === 0 
                            ? 'bg-red-100 text-red-800' 
                            : event.bookingRate > 50
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {event.availableSeats === 0 
                            ? 'Sold Out' 
                            : event.bookingRate > 50
                              ? 'Popular'
                              : 'Available'
                          }
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 