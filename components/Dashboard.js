import React from 'react';

export default function Dashboard({ onNavigate, invoices }) {
  const completedCount = invoices.filter(inv => inv.status === 'Completed').length;
  const processingCount = invoices.filter(inv => inv.status === 'Processing').length;
  const readyCount = invoices.filter(inv => inv.status === 'Ready for Delivery').length;

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Makro AI</h2>
        <p className="text-gray-600 mb-6">AI-powered operations assistant for wholesale food distribution. Automate invoice processing, task assignment, and workflow management.</p>
        <div className="flex gap-4">
          <button
            onClick={() => onNavigate('upload')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            📄 Upload Invoice
          </button>
          <button
            onClick={() => onNavigate('workflow')}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            📊 View Workflow Board
          </button>
          <button
            onClick={() => onNavigate('tasks')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            ✓ Manage Tasks
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-blue-600 text-3xl font-bold">{invoices.length}</div>
          <div className="text-gray-600 text-sm">Total Invoices</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-green-600 text-3xl font-bold">{completedCount}</div>
          <div className="text-gray-600 text-sm">Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-yellow-600 text-3xl font-bold">{processingCount}</div>
          <div className="text-gray-600 text-sm">In Processing</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-orange-600 text-3xl font-bold">{readyCount}</div>
          <div className="text-gray-600 text-sm">Ready for Delivery</div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Recent Invoices</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Invoice ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vendor</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Items</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const statusColor = {
                  'Received': 'bg-blue-100 text-blue-800',
                  'Processing': 'bg-yellow-100 text-yellow-800',
                  'Ready for Delivery': 'bg-orange-100 text-orange-800',
                  'Completed': 'bg-green-100 text-green-800',
                }[invoice.status] || 'bg-gray-100 text-gray-800';

                return (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{invoice.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{invoice.vendor}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{invoice.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{invoice.items.length} items</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => onNavigate('packingslip')}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
