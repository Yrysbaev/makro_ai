import React from 'react';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">M</span>
            </div>
            <h1 className="text-2xl font-bold">Makro AI</n            <span className="text-blue-200"> – Project Management Mode</span>
            </h1>
          </div>
          <div className="text-sm text-blue-100">
            AI-Powered Wholesale Food Distribution
          </div>
        </div>
      </div>
    </header>
  );
}
