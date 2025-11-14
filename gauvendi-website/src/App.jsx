import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ArchitectureOverview from './pages/ArchitectureOverview';
import TechnicalDetails from './pages/TechnicalDetails';

function App() {
  return (
    <Router basename="/gauvendi-website">
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<ArchitectureOverview />} />
            <Route path="/technical" element={<TechnicalDetails />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-neutral-900 text-white py-12 mt-20 border-t-4 border-accent-electric">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-6">
                <h3 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight">
                  GauVendi
                </h3>
                <p className="text-gray-400 text-lg">
                  Transforming Hotel Booking with AI
                </p>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-6"></div>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent-electric rounded-full"></span>
                  React
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent-vibrant rounded-full"></span>
                  Tailwind CSS
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent-energy rounded-full"></span>
                  Vite
                </span>
              </div>
              <p className="text-sm text-gray-500">
                © 2025 GauVendi. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
