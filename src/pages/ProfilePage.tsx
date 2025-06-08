import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookingService } from '../services/bookingService';
import { Booking } from '../types';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to check if user is admin based on name
  const isAdmin = user && user.name.includes('Admin');

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        setLoading(true);
        const userBookingsResponse = await BookingService.getUserBookings();
        
        // Handle different response formats
        let userBookings: Booking[];
        if (Array.isArray(userBookingsResponse)) {
          userBookings = userBookingsResponse;
        } else if (userBookingsResponse && typeof userBookingsResponse === 'object') {
          // If response is an object with data property that might contain bookings
          const responseObj = userBookingsResponse as { data?: unknown };
          if (responseObj.data && Array.isArray(responseObj.data)) {
            userBookings = responseObj.data as Booking[];
          } else {
            // If it's some other object format
            console.log('Unexpected response format:', userBookingsResponse);
            userBookings = [];
          }
        } else {
          console.log('Unexpected response type:', userBookingsResponse);
          userBookings = [];
        }
        
        setBookings(userBookings);
      } catch (err) {
        setError('Failed to load your bookings. Please try again later.');
        console.error(err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (user && !isAdmin) {
      fetchUserBookings();
    } else {
      setLoading(false);
    }
  }, [user, isAdmin]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await BookingService.cancelBooking(bookingId);
      // Remove the cancelled booking from the list
      setBookings(bookings.filter(booking => booking.id !== bookingId));
    } catch (err) {
      setError('Failed to cancel booking. Please try again later.');
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Name</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-gray-600">Role</p>
            <p className="font-medium capitalize">{isAdmin ? 'Admin' : 'User'}</p>
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">My Bookings</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">You have no bookings yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* We would ideally fetch event details to show title */}
                        Event ID: {booking.eventId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {booking.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 