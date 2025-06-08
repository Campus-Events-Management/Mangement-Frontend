import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventService } from '../services/eventService';
import { useAuth } from '../context/AuthContext';

export const EventCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Check if user is admin
  const isAdmin = user && (user.role === 'admin' || user.name?.includes('Admin'));
  
  // Redirect if not admin
  React.useEffect(() => {
    if (user && !isAdmin) {
      navigate('/');
    }
  }, [user, isAdmin, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !date || !location) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (title.length > 100) {
      setError('Title must be less than 100 characters');
      return;
    }
    
    if (location.length > 100) {
      setError('Location must be less than 100 characters');
      return;
    }
    
    if (capacity < 1) {
      setError('Capacity must be at least 1');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Format date correctly - ensure it's in ISO format
      const formattedDate = new Date(date).toISOString();
      console.log('Original date input:', date);
      console.log('Formatted date:', formattedDate);
      
      // Create the event object matching CreateEventDto requirements
      const eventData = {
        title,
        description,
        date: formattedDate,
        location,
        capacity: Number(capacity)
        // Don't include registered or isPast as they're not in CreateEventDto
      };
      
      console.log('Submitting event data:', eventData);
      
      // Create event with properly formatted data
      const newEvent = await EventService.createEvent(eventData);
      console.log('Event created successfully:', newEvent);
      
      // Upload image if provided
      if (imageFile && newEvent.id) {
        try {
          console.log('Uploading image for event:', newEvent.id);
          const imageResult = await EventService.uploadEventImage(newEvent.id, imageFile);
          console.log('Image uploaded successfully:', imageResult);
        } catch (imageError) {
          console.error('Error uploading image:', imageError);
          // Continue even if image upload fails
        }
      }
      
      // Redirect to event detail page
      navigate(`/events/${newEvent.id}`);
    } catch (err: any) {
      console.error('Error creating event:', err);
      
      // Extract detailed error information
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.error || 
        err.message || 
        'Failed to create event. Please try again.';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to access this page.</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            Event Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="date" className="block text-gray-700 font-medium mb-2">
            Event Date and Time *
          </label>
          <input
            type="datetime-local"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="location" className="block text-gray-700 font-medium mb-2">
            Location *
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="capacity" className="block text-gray-700 font-medium mb-2">
            Capacity *
          </label>
          <input
            type="number"
            id="capacity"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value))}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="image" className="block text-gray-700 font-medium mb-2">
            Event Image
          </label>
          <input
            type="file"
            id="image"
            onChange={handleImageChange}
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-sm text-gray-500 mt-1">
            Recommended image size: 1200x400 pixels
          </p>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 disabled:bg-opacity-70"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}; 