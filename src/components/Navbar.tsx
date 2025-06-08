import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check if user is admin based on name or role
  const isAdmin = user && (user.role === 'admin' || user.name.includes('Admin'));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Check if the current route is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white text-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                <path d="M9 16.9v-2.7l-3 1.63V17h3v3h2v-3.1z"/>
                <path d="M17 14.9V17h1v3h2v-3h1v-2.1l-4 2.1z"/>
              </svg>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                CampusEvents
              </span>
              <span className="ml-1 text-xs text-gray-500 self-end mb-1">
                BETA
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-6">
              <Link 
                to="/events" 
                className={`px-3 py-2 text-sm font-medium ${
                  isActive('/events') 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                Events
              </Link>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={`px-3 py-2 text-sm font-medium ${
                    isActive('/admin') 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  Dashboard
                </Link>
              )}
              {isAuthenticated && (
                <Link 
                  to="/profile" 
                  className={`px-3 py-2 text-sm font-medium ${
                    isActive('/profile') 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  My Profile
                </Link>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-primary focus:outline-none"
            >
              <svg 
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg 
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Desktop auth buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Welcome, {user?.name}
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-secondary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-primary px-4 py-2 text-sm font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
          <Link 
            to="/events" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/events') 
                ? 'text-primary bg-primary bg-opacity-10' 
                : 'text-gray-600 hover:text-primary'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Events
          </Link>
          {isAdmin && (
            <Link 
              to="/admin" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/admin') 
                  ? 'text-primary bg-primary bg-opacity-10' 
                  : 'text-gray-600 hover:text-primary'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}
          {isAuthenticated && (
            <Link 
              to="/profile" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/profile') 
                  ? 'text-primary bg-primary bg-opacity-10' 
                  : 'text-gray-600 hover:text-primary'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              My Profile
            </Link>
          )}
          {isAuthenticated ? (
            <button 
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary"
            >
              Logout
            </button>
          ) : (
            <>
              <Link 
                to="/login" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}; 