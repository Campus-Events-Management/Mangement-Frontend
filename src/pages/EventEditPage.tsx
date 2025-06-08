import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventService } from '../services/eventService';
import { Event } from '../types';
import { useAuth } from '../context/AuthContext';

export const EventEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: 0,
    imageUrl: ''
  });

  // Check if user is admin based on name
  const isAdmin = user && user.name.includes('Admin');

  useEffect(() => {
    // Redirect if not admin
    if (user && !isAdmin) {
      navigate('/');
      return;
    }

    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const eventData = await EventService.getEventById(id);
        setEvent(eventData);
        setFormData({
          title: eventData.title,
          description: eventData.description,
          date: formatDateForInput(eventData.date),
          location: eventData.location,
          capacity: eventData.capacity,
          imageUrl: eventData.imageUrl || ''
        });
        setError(null);
      } catch (err) {
        setError('Failed to load event details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEvent();
    }
  }, [id, user, navigate, isAdmin]);

  const formatDateForInput = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDThh:mm
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !event) return;

    try {
      setSaving(true);
      // Update event details
      const updatedEvent = await EventService.updateEvent(id, formData);
      
      // If image file is selected, upload it
      if (imageFile) {
        setUploadStatus('uploading');
        try {
          const imageResponse = await EventService.uploadEventImage(id, imageFile);
          // Update the event with the new image URL
          await EventService.updateEvent(id, {
            imageUrl: imageResponse.imageUrl
          });
          setUploadStatus('success');
        } catch (imageErr) {
          console.error('Failed to upload image:', imageErr);
          setUploadStatus('error');
        }
      }
      
      // Navigate back to event detail page
      navigate(`/events/${id}`);
    } catch (err) {
      setError('Failed to update event. Please try again.');
      console.error(err);
      setSaving(false);
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Event</h1>
        <button
          onClick={() => navigate(`/events/${id}`)}
          className="text-primary hover:text-blue-700"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Date and Time</label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity || 0}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                min="1"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={4}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-1">Current Image</label>
            {formData.imageUrl ? (
              <div className="relative">
                <img 
                  src={formData.imageUrl} 
                  alt={formData.title || 'Event'} 
                  className="w-full h-48 object-cover rounded mb-2"
                />
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Image URL"
                />
              </div>
            ) : (
              <div className="bg-gray-100 rounded flex items-center justify-center h-48 mb-2">
                <p className="text-gray-500">No image available</p>
              </div>
            )}
            
            <div className="mt-4">
              <label className="block text-gray-700 mb-1">Upload New Image</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/gif"
                onChange={handleImageChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPEG, PNG, GIF. Max size: 5MB
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
              disabled={saving || uploadStatus === 'uploading'}
            >
              {saving || uploadStatus === 'uploading' ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 