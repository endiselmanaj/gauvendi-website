import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b-2 border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-6 md:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Brand */}
          <div className="flex items-center">
            <Link to="/" className="group">
              <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">
                GauVendi
                <span className="text-accent-electric ml-2 transition-colors group-hover:text-accent-vibrant">
                  ChatGPT
                </span>
              </h1>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex gap-2 md:gap-4">
            <Link
              to="/"
              className={`relative px-5 md:px-6 py-3 font-bold text-sm md:text-base rounded-xl transition-all duration-300 ${
                isActive('/')
                  ? 'bg-accent-electric text-white shadow-lg scale-105'
                  : 'text-gray-700 hover:text-neutral-900 hover:bg-gray-50'
              }`}
            >
              <span className="relative z-10">Architecture</span>
              {isActive('/') && (
                <div className="absolute inset-0 bg-accent-electric rounded-xl animate-pulse opacity-20"></div>
              )}
            </Link>
            <Link
              to="/technical"
              className={`relative px-5 md:px-6 py-3 font-bold text-sm md:text-base rounded-xl transition-all duration-300 ${
                isActive('/technical')
                  ? 'bg-accent-electric text-white shadow-lg scale-105'
                  : 'text-gray-700 hover:text-neutral-900 hover:bg-gray-50'
              }`}
            >
              <span className="relative z-10">Technical</span>
              {isActive('/technical') && (
                <div className="absolute inset-0 bg-accent-electric rounded-xl animate-pulse opacity-20"></div>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
