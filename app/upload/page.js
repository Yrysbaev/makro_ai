'use client';

import { useState } from 'react';

export default function UploadInvoice() {
  const [file, setFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);

    // Simulate AI extraction with mock data
    setTimeout(() => {
      const mockExtractedData = {
        id: Date.now(),
        vendor: 'Fresh Produce Co.',
        date: new Date().toISOString().split('T')[0],
        items: [
          { name: 'Organic Tomatoes', quantity: 50, cases: 5 },
          { name: 'Fresh Lettuce', quantity: 30, cases: 3 },
          { name: 'Red Onions', quantity: 25, cases: 3 },
        ],
        tasks: [
          { id: 1, name: 'Verify received items in warehouse', assigned: 'John Doe', status: 'pending', dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
          { id: 2, name: 'Prepare packing slip', assigned: 'Jane Smith', status: 'pending', dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
          { id: 3, name: 'Schedule delivery', assigned: 'Mike Johnson', status: 'pending', dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0] },
          { id: 4, name: 'Notify sales team about new arrivals', assigned: 'Sarah Wilson', status: 'pending', dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
        ],
      };

      setExtractedData(mockExtractedData);
      setLoading(false);
    }, 2000);
  };

  const generatePackingSlip = () => {
    // In a real app, this would save to database and redirect
    window.location.href = `/packing-slip/${extractedData.id}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Upload Invoice / Advanced Mode</h1>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Upload Vendor Invoice</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Invoice File (PDF or Image)
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="btn btn-primary disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Extract Information'}
          </button>
        </div>
      </div>

      {extractedData && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Extracted Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Invoice Details</h3>
              <p><strong>Vendor:</strong> {extractedData.vendor}</p>
              <p><strong>Date:</strong> {extractedData.date}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Items</h3>
              <ul className="space-y-1">
                {extractedData.items.map((item, index) => (
                  <li key={index} className="text-sm">
                    {item.name} - {item.quantity} units ({item.cases} cases)
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Generated Tasks</h3>
            <div className="space-y-2">
              {extractedData.tasks.map((task) => (
                <div key={task.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{task.name}</p>
                    <p className="text-sm text-gray-600">Assigned to: {task.assigned} | Due: {task.dueDate}</p>
                  </div>
                  <span className="status-badge status-pending">pending</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <button onClick={generatePackingSlip} className="btn btn-primary">
              Generate Packing Slip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}