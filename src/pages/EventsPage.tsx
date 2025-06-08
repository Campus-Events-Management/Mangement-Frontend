import React, { useState, useEffect } from 'react';
import { EventCard } from '../components/EventCard';
import { EventService } from '../services/eventService';
import { Event } from '../types';
import { useAuth } from '../context/AuthContext';

export const EventsPage: React.FC = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  
  // Check if user is admin
  const isAdmin = user && (user.role === 'admin' || user.name.includes('Admin'));

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const upcoming = await EventService.getUpcomingEvents();
        const past = await EventService.getPastEvents();
        setUpcomingEvents(upcoming);
        setPastEvents(past);
        setError(null);
      } catch (err) {
        setError('Failed to load events. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);
  
  // Filter events based on search term
  const filteredEvents = (activeTab === 'upcoming' ? upcomingEvents : pastEvents)
    .filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold mb-2">Discover Events</h1>
          <p className="text-gray-600">Find and book your spot at exciting events.</p>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <svg 
            className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming Events
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'past'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('past')}
            >
              Past Events
            </button>
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <>
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg p-12 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? `No ${activeTab} events match your search for "${searchTerm}"`
                  : `No ${activeTab} events available at the moment.`
                }
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-primary hover:text-secondary"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
          
          {isAdmin && (
            <div className="mt-12 bg-secondary bg-opacity-10 rounded-lg p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-secondary mb-1">Admin Tools</h3>
                <p className="text-gray-600">Create, manage and track your events</p>
              </div>
              <a 
                href="/admin" 
                className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-opacity-90"
              >
                Go to Dashboard
              </a>
            </div>
          )}
          
          <div className="mt-12 mb-8">
            <h2 className="text-2xl font-bold mb-6">Event Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Music', 'Sports', 'Technology', 'Food & Drinks'].map((category, index) => (
                <div 
                  key={category} 
                  className="bg-white shadow-sm rounded-lg p-6 text-center hover:shadow-md transition cursor-pointer"
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                    index % 2 === 0 ? 'bg-primary bg-opacity-20 text-primary' : 'bg-secondary bg-opacity-20 text-secondary'
                  }`}>
                    {index === 0 && (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"></path>
                      </svg>
                    )}
                    {index === 1 && (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                      </svg>
                    )}
                    {index === 2 && (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path>
                      </svg>
                    )}
                    {index === 3 && (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z"></path>
                        <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z"></path>
                        <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z"></path>
                      </svg>
                    )}
                  </div>
                  <h3 className="font-semibold">{category}</h3>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 