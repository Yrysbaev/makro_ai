'use client';

import { useState } from 'react';

// Mock data
const mockInvoices = [
  {
    id: 1,
    vendor: 'Fresh Produce Co.',
    date: '2024-04-15',
    status: 'received',
    items: [
      { name: 'Organic Tomatoes', quantity: 50, cases: 5 },
      { name: 'Fresh Lettuce', quantity: 30, cases: 3 },
    ],
    assignedTo: 'Maya Patel',
    assignedAvatar: 'MP',
    priority: 'High',
    tasksCompleted: 2,
    tasksTotal: 5,
  },
  {
    id: 2,
    vendor: 'Dairy Farms Inc.',
    date: '2024-04-14',
    status: 'processing',
    items: [
      { name: 'Whole Milk', quantity: 100, cases: 10 },
      { name: 'Cheddar Cheese', quantity: 40, cases: 4 },
    ],
    assignedTo: 'Noah Kim',
    assignedAvatar: 'NK',
    priority: 'Medium',
    tasksCompleted: 3,
    tasksTotal: 4,
  },
  {
    id: 3,
    vendor: 'Bakery Supplies Ltd.',
    date: '2024-04-13',
    status: 'ready',
    items: [
      { name: 'Bread Flour', quantity: 200, cases: 20 },
      { name: 'Yeast', quantity: 50, cases: 5 },
    ],
    assignedTo: 'Sofia Alvarez',
    assignedAvatar: 'SA',
    priority: 'Low',
    tasksCompleted: 4,
    tasksTotal: 4,
  },
  {
    id: 4,
    vendor: 'Meat Packers Co.',
    date: '2024-04-12',
    status: 'completed',
    items: [
      { name: 'Ground Beef', quantity: 75, cases: 8 },
      { name: 'Chicken Breasts', quantity: 60, cases: 6 },
    ],
    assignedTo: 'Elias Stone',
    assignedAvatar: 'ES',
    priority: 'Medium',
    tasksCompleted: 4,
    tasksTotal: 4,
  },
];

const stages = [
  { id: 'received', title: 'Received', statusClass: 'status-received' },
  { id: 'processing', title: 'Processing', statusClass: 'status-processing' },
  { id: 'ready', title: 'Ready for Delivery', statusClass: 'status-ready' },
  { id: 'completed', title: 'Completed', statusClass: 'status-completed' },
];

export default function WorkflowBoard() {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const moveInvoice = (invoiceId, newStatus) => {
    setInvoices(invoices.map(invoice =>
      invoice.id === invoiceId ? { ...invoice, status: newStatus } : invoice
    ));
  };

  const getNextStage = (status) => {
    if (status === 'received') return 'processing';
    if (status === 'processing') return 'ready';
    if (status === 'ready') return 'completed';
    return 'completed';
  };

  const getNextStageLabel = (status) => {
    if (status === 'received') return 'Processing';
    if (status === 'processing') return 'Ready for Delivery';
    if (status === 'ready') return 'Completed';
    return 'Completed';
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus;
    const matchesSearch = [invoice.vendor, invoice.assignedTo, invoice.status]
      .join(' ')
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getInvoicesByStatus = (status) => {
    return filteredInvoices.filter(invoice => invoice.status === status);
  };

  return (
    <div className="workflow-board">
      <div className="workflow-header">
        <div>
          <h1 className="workflow-title">Workflow Tracking Board</h1>
          <p className="workflow-subtitle">A clear Kanban view of Makro Food invoice operations.</p>
        </div>

        <div className="workflow-toolbar">
          <label className="workflow-search">
            <span className="sr-only">Search invoices</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendor, invoice, or assignee"
            />
          </label>

          <label className="workflow-filter">
            <span className="sr-only">Filter by status</span>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="all">All statuses</option>
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>{stage.title}</option>
              ))}
            </select>
          </label>

          <button className="button button-primary workflow-upload">+ Upload Invoice</button>
        </div>
      </div>

      <div className="workflow-columns">
        {stages.map((stage) => (
          <section key={stage.id} className="workflow-column">
            <div className={`column-header ${stage.statusClass}`}>
              <span>{stage.title}</span>
              <span className="column-count">{getInvoicesByStatus(stage.id).length}</span>
            </div>
            <div className="column-list">
              {getInvoicesByStatus(stage.id).map((invoice) => {
                const totalCases = invoice.items.reduce((sum, item) => sum + item.cases, 0);
                const progress = Math.round((invoice.tasksCompleted / invoice.tasksTotal) * 100);
                const isCompleted = invoice.status === 'completed';

                return (
                  <div key={invoice.id} className="workflow-card">
                    <div className="card-top">
                      <div>
                        <strong>{invoice.vendor}</strong>
                        <p className="card-meta">{invoice.date}</p>
                      </div>
                      <span className={`status-badge badge-${invoice.status}`}>{stage.title}</span>
                    </div>

                    <p className="card-summary">{invoice.items.length} items • {totalCases} cases</p>

                    <div className="card-detail-row">
                      <div className="assigned-user">
                        <span className="avatar">{invoice.assignedAvatar}</span>
                        <div>
                          <div className="label-small">Assigned</div>
                          <div className="assigned-name">{invoice.assignedTo}</div>
                        </div>
                      </div>
                      <span className={`priority-pill priority-${invoice.priority}`}>{invoice.priority}</span>
                    </div>

                    <div className="task-block">
                      <div className="task-label">Tasks: {invoice.tasksCompleted}/{invoice.tasksTotal} completed</div>
                      <div className="task-progress">
                        <div className="task-progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <div className="card-footer">
                      <button
                        type="button"
                        className="button button-secondary workflow-main-action"
                        onClick={() => moveInvoice(invoice.id, getNextStage(invoice.status))}
                        disabled={isCompleted}
                      >
                        {isCompleted ? 'Completed' : `Move to ${getNextStageLabel(invoice.status)} →`}
                      </button>
                      <div className="card-quick-actions">
                        <a href={`/packing-slip/${invoice.id}`}>View Packing Slip</a>
                        <a href="#">View Tasks</a>
                      </div>
                    </div>
                  </div>
                );
              })}

              {getInvoicesByStatus(stage.id).length === 0 && (
                <div className="empty-column">No invoices in this stage</div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}