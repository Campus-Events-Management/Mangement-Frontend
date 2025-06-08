import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventService } from '../services/eventService';
import { BookingService } from '../services/bookingService';
import { Event } from '../types';
import { useAuth } from '../context/AuthContext';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [alreadyBooked, setAlreadyBooked] = useState<boolean>(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is admin based on name or role
  const isAdmin = user && (user.role === 'admin' || user.name.includes('Admin'));

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const eventData = await EventService.getEventById(id);
        setEvent(eventData);
        setError(null);
      } catch (err) {
        setError('Failed to load event details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Check if user has already booked this event
  useEffect(() => {
    const checkBookingStatus = async () => {
      if (!id || !isAuthenticated) return;
      
      try {
        const hasBooking = await BookingService.checkBookingExists(id);
        setAlreadyBooked(hasBooking);
        if (hasBooking) {
          setBookingStatus('success');
        }
      } catch (err) {
        console.error('Failed to check booking status:', err);
      }
    };

    checkBookingStatus();
  }, [id, isAuthenticated]);

  const handleBookEvent = async () => {
    if (!event || !id) return;

    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: `/events/${id}` } });
      return;
    }

    // Don't allow booking if already booked
    if (alreadyBooked) return;

    try {
      setBookingStatus('loading');
      await BookingService.createBooking(id);
      setBookingStatus('success');
      setAlreadyBooked(true);

      // Refresh event data to update capacity
      const updatedEvent = await EventService.getEventById(id);
      setEvent(updatedEvent);
    } catch (err) {
      setBookingStatus('error');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error || 'Event not found'}
      </div>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const availableSpots = event.capacity - event.registered;
  const isFull = availableSpots <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="relative h-64 md:h-96">
          <img 
            src={event.imageUrl || 'https://via.placeholder.com/1200x400?text=Event'} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
          {event.isPast && (
            <div className="absolute top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded">
              Past Event
            </div>
          )}
          {!event.isPast && (
            <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-md shadow-sm">
              <div className="text-sm text-gray-500">
                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-xl font-bold">
                {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              <div className="flex flex-col md:flex-row md:items-center mb-4 text-gray-600">
                <div className="flex items-center mr-6 mb-2 md:mb-0">
                  <svg className="w-5 h-5 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {formattedDate}
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {event.location}
                </div>
              </div>
              <div className="inline-block bg-secondary bg-opacity-10 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                {event.isPast ? 'Past Event' : isFull ? 'Sold Out' : 'Open for Registration'}
              </div>
            </div>
            
            {isAdmin && (
              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => navigate(`/events/${id}/edit`)}
                  className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-opacity-90"
                >
                  Edit Event
                </button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">About this event</h2>
                <div className="prose max-w-none text-gray-700">
                  <p className="whitespace-pre-line">{event.description}</p>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="font-medium">{event.location}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Exact location details will be provided after booking confirmation.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sticky top-6">
                <div className="mb-4">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {isFull ? 'Sold Out' : `$${Math.floor(Math.random() * 50) + 30}`}
                  </div>
                  <div className="text-sm text-gray-500">
                    {!event.isPast && !isFull && `${availableSpots} spots left`}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Capacity:</span>
                    <span>{event.registered}/{event.capacity}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${isFull ? 'bg-red-600' : 'bg-primary'}`}
                      style={{ width: `${Math.min((event.registered / event.capacity) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {!event.isPast && (
                  <button
                    onClick={handleBookEvent}
                    disabled={isFull || bookingStatus === 'loading' || bookingStatus === 'success' || alreadyBooked}
                    className={`w-full py-3 px-4 rounded-md text-white font-medium transition ${
                      isFull || bookingStatus === 'success' || alreadyBooked
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary hover:bg-opacity-90'
                    }`}
                  >
                    {bookingStatus === 'loading' && 'Processing...'}
                    {bookingStatus === 'success' && 'Booked Successfully!'}
                    {bookingStatus === 'error' && 'Try Again'}
                    {bookingStatus === 'idle' && (
                      alreadyBooked 
                        ? 'Already Booked' 
                        : isFull 
                          ? 'Sold Out' 
                          : 'Book Now'
                    )}
                  </button>
                )}
                
                {bookingStatus === 'error' && (
                  <div className="mt-2 text-red-600 text-sm">
                    There was an error booking this event. Please try again.
                  </div>
                )}
                
                <div className="mt-4 text-sm text-gray-500">
                  <p className="flex items-center mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Confirmation email after booking
                  </p>
                  <p className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Easy cancellation up to 24 hours before
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {isAdmin && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Admin Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500">Total Bookings</div>
                  <div className="text-2xl font-bold">{event.registered}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500">Remaining Capacity</div>
                  <div className="text-2xl font-bold">{availableSpots}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500">Fill Rate</div>
                  <div className="text-2xl font-bold">
                    {Math.round((event.registered / event.capacity) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Similar Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-40 bg-gray-200 relative">
                <img 
                  src={`https://via.placeholder.com/400x200?text=Similar+Event+${i}`} 
                  alt={`Similar Event ${i}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1">Similar Event {i}</h3>
                <p className="text-sm text-gray-500 mb-3">Another great event you might like</p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {new Date().toLocaleDateString()}
                  </div>
                  <div className="text-primary font-semibold">
                    ${Math.floor(Math.random() * 50) + 30}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 