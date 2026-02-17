import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-lg text-center">
        <h1 className="text-8xl font-bold mb-4 gradient-text">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page not found</h2>
        <p className="text-gray-500 mb-8">The page you requested doesn't exist or has been moved.</p>
        <Link to="/" className="inline-block px-8 py-3.5 btn-pink-gradient rounded-full font-medium">Go to Homepage</Link>
      </div>
    </div>
  );
}
