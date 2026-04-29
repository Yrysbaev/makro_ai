// Mock invoice data
export const mockInvoices = [
  {
    id: 'INV-001',
    vendorName: 'Fresh Foods Supplier Ltd.',
    date: '2026-04-28',
    status: 'Received',
    items: [
      { name: 'Tomatoes', quantity: 50, unit: 'lbs', casesCount: 5, price: 2.50 },
      { name: 'Lettuce', quantity: 30, unit: 'heads', casesCount: 3, price: 1.20 },
      { name: 'Carrots', quantity: 100, unit: 'lbs', casesCount: 4, price: 0.80 },
    ],
    totalItems: 180,
    image: '/sample-invoice-1.jpg',
  },
  {
    id: 'INV-002',
    vendorName: 'Premium Produce Co.',
    date: '2026-04-28',
    status: 'Processing',
    items: [
      { name: 'Onions', quantity: 60, unit: 'lbs', casesCount: 3, price: 1.50 },
      { name: 'Bell Peppers', quantity: 40, unit: 'units', casesCount: 2, price: 3.00 },
      { name: 'Broccoli', quantity: 50, unit: 'lbs', casesCount: 5, price: 2.20 },
    ],
    totalItems: 150,
    image: '/sample-invoice-2.jpg',
  },
  {
    id: 'INV-003',
    vendorName: 'Organic Greens Warehouse',
    date: '2026-04-27',
    status: 'Ready for Delivery',
    items: [
      { name: 'Spinach', quantity: 25, unit: 'lbs', casesCount: 2, price: 3.50 },
      { name: 'Kale', quantity: 35, unit: 'lbs', casesCount: 3, price: 4.00 },
    ],
    totalItems: 60,
    image: '/sample-invoice-3.jpg',
  },
  {
    id: 'INV-004',
    vendorName: 'Fresh Foods Supplier Ltd.',
    date: '2026-04-26',
    status: 'Completed',
    items: [
      { name: 'Cucumbers', quantity: 45, unit: 'units', casesCount: 2, price: 2.00 },
    ],
    totalItems: 45,
    image: '/sample-invoice-4.jpg',
  },
];

// Mock task data
export const mockTasks = [
  {
    id: 'TASK-001',
    invoiceId: 'INV-001',
    name: 'Verify received items in warehouse',
    assignee: 'John Smith',
    assigneeRole: 'Warehouse Manager',
    status: 'In Progress',
    dueDate: '2026-04-29',
    priority: 'High',
  },
  {
    id: 'TASK-002',
    invoiceId: 'INV-001',
    name: 'Prepare packing slip',
    assignee: 'Maria Garcia',
    assigneeRole: 'Logistics Team',
    status: 'Pending',
    dueDate: '2026-04-30',
    priority: 'High',
  },
  {
    id: 'TASK-003',
    invoiceId: 'INV-001',
    name: 'Schedule delivery',
    assignee: 'Ahmed Hassan',
    assigneeRole: 'Delivery Coordinator',
    status: 'Pending',
    dueDate: '2026-05-01',
    priority: 'Medium',
  },
  {
    id: 'TASK-004',
    invoiceId: 'INV-001',
    name: 'Notify sales team about new arrivals',
    assignee: 'Sarah Johnson',
    assigneeRole: 'Sales Operations',
    status: 'Done',
    dueDate: '2026-04-28',
    priority: 'Medium',
  },
  {
    id: 'TASK-005',
    invoiceId: 'INV-002',
    name: 'Verify received items in warehouse',
    assignee: 'John Smith',
    assigneeRole: 'Warehouse Manager',
    status: 'Pending',
    dueDate: '2026-04-29',
    priority: 'High',
  },
  {
    id: 'TASK-006',
    invoiceId: 'INV-002',
    name: 'Prepare packing slip',
    assignee: 'Maria Garcia',
    assigneeRole: 'Logistics Team',
    status: 'In Progress',
    dueDate: '2026-04-30',
    priority: 'High',
  },
  {
    id: 'TASK-007',
    invoiceId: 'INV-003',
    name: 'Verify received items in warehouse',
    assignee: 'John Smith',
    assigneeRole: 'Warehouse Manager',
    status: 'Done',
    dueDate: '2026-04-27',
    priority: 'High',
  },
  {
    id: 'TASK-008',
    invoiceId: 'INV-003',
    name: 'Prepare packing slip',
    assignee: 'Maria Garcia',
    assigneeRole: 'Logistics Team',
    status: 'Done',
    dueDate: '2026-04-28',
    priority: 'High',
  },
  {
    id: 'TASK-009',
    invoiceId: 'INV-003',
    name: 'Schedule delivery',
    assignee: 'Ahmed Hassan',
    assigneeRole: 'Delivery Coordinator',
    status: 'Done',
    dueDate: '2026-04-29',
    priority: 'Medium',
  },
];

// Mock workflow stages
export const workflowStages = [
  { id: 'received', name: 'Received', color: 'bg-gray-100' },
  { id: 'processing', name: 'Processing', color: 'bg-blue-100' },
  { id: 'ready', name: 'Ready for Delivery', color: 'bg-purple-100' },
  { id: 'completed', name: 'Completed', color: 'bg-green-100' },
];

// Mock metrics
export const mockMetrics = {
  totalInvoices: 4,
  pendingTasks: 5,
  completedTasks: 5,
  averageProcessingTime: '2.5 days',
  activeInvoices: 2,
};

// Helper function to map status to color
export const getStatusColor = (status) => {
  const statusMap = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Done': 'bg-green-100 text-green-800',
    'Received': 'bg-gray-100 text-gray-800',
    'Processing': 'bg-blue-100 text-blue-800',
    'Ready for Delivery': 'bg-purple-100 text-purple-800',
    'Completed': 'bg-green-100 text-green-800',
  };
  return statusMap[status] || 'bg-gray-100 text-gray-800';
};

// Helper function to get status icon/style
export const getPriorityColor = (priority) => {
  const priorityMap = {
    'High': 'text-red-600 bg-red-50',
    'Medium': 'text-yellow-600 bg-yellow-50',
    'Low': 'text-green-600 bg-green-50',
  };
  return priorityMap[priority] || 'text-gray-600 bg-gray-50';
};

// Format date
export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Get days until due
export const getDaysUntilDue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
