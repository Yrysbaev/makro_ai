'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// Mock data - in a real app, this would come from an API
const mockPackingSlip = {
  id: 1,
  vendor: 'Fresh Produce Co.',
  date: '2024-04-15',
  items: [
    { name: 'Organic Tomatoes', quantity: 50, cases: 5 },
    { name: 'Fresh Lettuce', quantity: 30, cases: 3 },
    { name: 'Red Onions', quantity: 25, cases: 3 },
  ],
};

export default function PackingSlipPreview() {
  const params = useParams();
  const [packingSlip, setPackingSlip] = useState(null);

  useEffect(() => {
    // In a real app, fetch data based on params.id
    setPackingSlip(mockPackingSlip);
  }, [params.id]);

  if (!packingSlip) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Packing Slip Preview</h1>
        <button className="btn btn-secondary" onClick={() => window.print()}>
          Print Packing Slip
        </button>
      </div>

      <div className="card max-w-4xl mx-auto">
        <div className="border-b pb-4 mb-6">
          <h2 className="text-2xl font-bold text-center mb-2">MAKRO FOOD DISTRIBUTION</h2>
          <p className="text-center text-gray-600">Packing Slip</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Vendor Information</h3>
            <p><strong>Vendor:</strong> {packingSlip.vendor}</p>
            <p><strong>Date:</strong> {packingSlip.date}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Packing Slip Details</h3>
            <p><strong>Slip ID:</strong> #{packingSlip.id}</p>
            <p><strong>Status:</strong> <span className="status-badge status-ready">Ready for Delivery</span></p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-4">Items</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Item Name</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Quantity</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Cases</th>
              </tr>
            </thead>
            <tbody>
              {packingSlip.items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{item.cases}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Prepared By</h4>
              <p className="text-sm text-gray-600">Warehouse Team</p>
              <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Delivery Notes</h4>
              <p className="text-sm text-gray-600">Handle with care. Keep refrigerated.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}