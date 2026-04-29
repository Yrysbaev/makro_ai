import React from 'react';
import Header from './Header';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-gray-900 text-white text-center py-4 mt-12">
        <p>&copy; 2026 Makro AI – Project Management Mode. Advanced Software Project Management Course.</p>
      </footer>
    </div>
  );
}
