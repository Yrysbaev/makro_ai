import React, { useState } from 'react';
import Dashboard from '../components/Dashboard';
import InvoiceUpload from '../components/InvoiceUpload';
import PackingSlipPreview from '../components/PackingSlipPreview';
import TaskManagement from '../components/TaskManagement';
import WorkflowBoard from '../components/WorkflowBoard';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoices, setInvoices] = useState([
    {
      id: 'INV001',
      vendor: 'Fresh Foods Ltd',
      date: '2026-04-28',
      status: 'Completed',
      items: [
        { name: 'Organic Tomatoes', quantity: 50, cases: 5, unit: 'kg' },
        { name: 'Fresh Lettuce', quantity: 30, cases: 3, unit: 'bundles' },
        { name: 'Bell Peppers', quantity: 40, cases: 4, unit: 'kg' },
      ],
    },
    {
      id: 'INV002',
      vendor: 'Premium Imports',
      date: '2026-04-29',
      status: 'Processing',
      items: [
        { name: 'Imported Olive Oil', quantity: 20, cases: 2, unit: 'liters' },
        { name: 'Italian Pasta', quantity: 100, cases: 10, unit: 'boxes' },
      ],
    },
    {
      id: 'INV003',
      vendor: 'Local Suppliers',
      date: '2026-04-27',
      status: 'Ready for Delivery',
      items: [
        { name: 'Fresh Milk', quantity: 60, cases: 6, unit: 'liters' },
        { name: 'Cheese Blocks', quantity: 25, cases: 5, unit: 'kg' },
      ],
    },
  ]);

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleSelectInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setCurrentPage('packingslip');
  };

  const handleUploadInvoice = (newInvoice) => {
    const invoice = {
      id: `INV${String(invoices.length + 1).padStart(3, '0')}`,
      ...newInvoice,
      status: 'Received',
    };
    setInvoices([...invoices, invoice]);
    setSelectedInvoice(invoice);
    setCurrentPage('packingslip';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'dashboard' && (
        <Dashboard
          onNavigate={handleNavigate}
          invoices={invoices}
          onSelectInvoice={handleSelectInvoice}
        />
      )}
      {currentPage === 'upload' && (
        <InvoiceUpload
          onNavigate={handleNavigate}
          onUpload={handleUploadInvoice}
        />
      )}
      {currentPage === 'packingslip' && selectedInvoice && (
        <PackingSlipPreview
          invoice={selectedInvoice}
          onNavigate={handleNavigate}
        />
      )}
      {currentPage === 'tasks' && (
        <TaskManagement
          onNavigate={handleNavigate}
          selectedInvoice={selectedInvoice}
        />
      )}
      {currentPage === 'workflow' && (
        <WorkflowBoard
          onNavigate={handleNavigate}
          invoices={invoices}
          setInvoices={setInvoices}
        />
      )}
    </div>
  );
}
