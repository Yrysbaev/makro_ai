import React, { useState } from 'react';

export default function WorkflowBoard({ onNavigate, invoices, setInvoices }) {
  const stages = ['Received', 'Processing', 'Ready for Delivery', 'Completed'];

  const handleDragStart = (e, invoice, sourceStage) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('invoiceId', invoice.id);
    e.dataTransfer.setData('sourceStage', sourceStage);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, stage) => {
    e.preventDefault();
    const invoiceId = e.dataTransfer.getData('invoiceId');
    const sourceStage = e.dataTransfer.getData('sourceStage');

    if (sourceStage !== stage) {
      setInvoices(invoices.map(inv =>
        inv.id === invoiceId ? { ...inv, status: stage } : inv
      ));
    }
  };

  const getInvoicesByStage = (stage) => {
    return invoices.filter(inv => inv.status === stage);
  };

  const getStageColor = (stage) => {
    const colors = {
      'Received': 'bg-blue-50 border-blue-300',
      'Processing': 'bg-yellow-50 border-yellow-300',
      'Ready for Delivery': 'bg-orange-50 border-orange-300',
      'Completed': 'bg-green-50 border-green-300',
    };
    return colors[stage] || 'bg-gray-50 border-gray-300';
  };

  const getCardColor = (status) => {
    const colors = {
      'Received': 'bg-blue-100 border-blue-400',
      'Processing': 'bg-yellow-100 border-yellow-400',
      'Ready for Delivery': 'bg-orange-100 border-orange-400',
      'Completed': 'bg-green-100 border-green-400',
    };
    return colors[status] || 'bg-gray-100 border-gray-400';
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-8">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-blue-600 hover:text-blue-800 font-semibold mb-4"
        >
          ← Back to Dashboard
        </button>
        <h2 className="text-3xl font-bold text-gray-800">Workflow Tracking Board</h2>
        <p className="text-gray-600 mt-2">Kanban-style view of invoice processing stages. Drag and drop to move invoices between stages.</p>
      </div>

      {/* Workflow Information */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded">
        <p className="text-sm text-gray-700"><strong>ℹ️ How to use:</strong> Drag invoice cards between columns to move them through different workflow stages. Each invoice is treated as a mini project with automatic task assignment.</p>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stages.map((stage) => {
          const stageInvoices = getInvoicesByStage(stage);
          return (
            <div
              key={stage}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              className={`rounded-lg border-2 p-6 min-h-96 ${getStageColor(stage)}`}
            >
              {/* Stage Header */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800">{stage}</h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-block w-8 h-8 bg-white rounded-full text-center font-bold text-gray-800">
                    {stageInvoices.length}
                  </span>
                  <span className="text-sm text-gray-600">invoices</span>
                </div>
              </div>

              {/* Invoice Cards */}
              <div className="space-y-3">
                {stageInvoices.length > 0 ? (
                  stageInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, invoice, stage)}
                      className={`p-4 rounded-lg border-2 cursor-move hover:shadow-lg transition ${getCardColor(stage)}`}
                    >
                      <div className="font-semibold text-gray-900 text-sm">{invoice.id}</div>
                      <div className="text-xs text-gray-700 mt-1">{invoice.vendor}</div>
                      <div className="text-xs text-gray-600 mt-2">📅 {invoice.date}</div>
                      <div className="text-xs text-gray-600 mt-1">📦 {invoice.items.length} items</div>
                      <button
                        onClick={() => onNavigate('packingslip')}
                        className="mt-3 w-full text-xs bg-white hover:bg-gray-50 text-blue-600 font-semibold py-1 px-2 rounded border border-gray-300 transition"
                      >
                        View Details
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No invoices in this stage</p>
                    <p className="text-xs mt-2">Drag invoices here to move them</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        <div className="bg-blue-100 rounded-lg p-6 border-l-4 border-blue-400">
          <h4 className="font-bold text-gray-800 mb-2">Received</h4>
          <p className="text-sm text-gray-700">Invoice uploaded and initial processing started</p>
        </div>
        <div className="bg-yellow-100 rounded-lg p-6 border-l-4 border-yellow-400">
          <h4 className="font-bold text-gray-800 mb-2">Processing</h4>
          <p className="text-sm text-gray-700">Items being verified and packing slip generated</p>
        </div>
        <div className="bg-orange-100 rounded-lg p-6 border-l-4 border-orange-400">
          <h4 className="font-bold text-gray-800 mb-2">Ready for Delivery</h4>
          <p className="text-sm text-gray-700">Inventory updated and delivery scheduled</p>
        </div>
        <div className="bg-green-100 rounded-lg p-6 border-l-4 border-green-400">
          <h4 className="font-bold text-gray-800 mb-2">Completed</h4>
          <p className="text-sm text-gray-700">Delivery confirmed and all tasks done</p>
        </div>
      </div>
    </div>
  );
}
