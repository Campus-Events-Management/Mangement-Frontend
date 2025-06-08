import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">Campus Event Management</h3>
            <p className="text-sm text-gray-400">Your platform for campus events</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Contact</a>
          </div>
        </div>
        <div className="text-center mt-6 text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Campus Event Management. All rights reserved.
        </div>
      </div>
    </footer>
  );
}; 