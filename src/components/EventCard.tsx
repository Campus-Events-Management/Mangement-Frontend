import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../types';
import { BookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { id, title, date, location, imageUrl, capacity, registered, isPast } = event;
  const [alreadyBooked, setAlreadyBooked] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  
  // Check if the event is already booked by the user
  useEffect(() => {
    const checkBookingStatus = async () => {
      if (!isAuthenticated) return;
      
      try {
        const hasBooking = await BookingService.checkBookingExists(id);
        setAlreadyBooked(hasBooking);
      } catch (err) {
        console.error(`Failed to check booking status for event ${id}:`, err);
      }
    };

    checkBookingStatus();
  }, [id, isAuthenticated]);
  
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const availableSpots = capacity - registered;
  const isFull = availableSpots <= 0;
  
  // Calculate a random price for display purposes
  const eventPrice = Math.floor(Math.random() * 50) + 30;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
      <div className="relative">
        <img 
          src={imageUrl || 'https://via.placeholder.com/400x200?text=Event'} 
          alt={title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-0 left-0 bg-white m-3 p-2 rounded-md shadow-sm">
          <div className="text-xs text-gray-500">
            {new Date(date).toLocaleDateString('en-US', { month: 'short' })}
          </div>
          <div className="text-xl font-bold">
            {new Date(date).getDate()}
          </div>
        </div>
        
        {isPast && (
          <div className="absolute top-0 right-0 bg-gray-800 text-white px-3 py-1 m-2 rounded-md">
            Past Event
          </div>
        )}
        {!isPast && isFull && (
          <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 m-2 rounded-md">
            Sold Out
          </div>
        )}
        {!isPast && !isFull && alreadyBooked && (
          <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 m-2 rounded-md">
            Booked
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-2 line-clamp-1">{title}</h3>
        <div className="text-gray-600 mb-3">
          <div className="flex items-center mb-2">
            <svg className="w-4 h-4 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="line-clamp-1">{location}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>{new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">
            {!isPast && !isFull ? `${availableSpots} spots left` : ''}
          </div>
          <div className="text-primary font-bold">
            ${eventPrice}
          </div>
        </div>
        
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
            <div 
              className={`h-1.5 rounded-full ${isFull ? 'bg-red-600' : 'bg-primary'}`}
              style={{ width: `${Math.min((registered / capacity) * 100, 100)}%` }}
            ></div>
          </div>
          
          <Link 
            to={`/events/${id}`}
            className={`block w-full text-center py-2 px-4 rounded-md transition ${
              isPast
                ? 'bg-gray-500 text-white hover:bg-gray-600'
                : alreadyBooked
                  ? 'bg-secondary text-white hover:bg-opacity-90'
                  : 'bg-primary text-white hover:bg-opacity-90'
            }`}
          >
            {isPast 
              ? 'View Details' 
              : alreadyBooked 
                ? 'View Booking' 
                : 'Book Now'
            }
          </Link>
        </div>
      </div>
    </div>
  );
}; 