import React, { useState } from 'react';

export default function TaskManagement({ onNavigate, selectedInvoice }) {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      invoiceId: selectedInvoice?.id || 'INV001',
      name: 'Verify received items in warehouse',
      assigned: 'Warehouse Manager',
      status: 'Pending',
      dueDate: '2026-04-30',
      description: 'Check all received items against invoice',
      priority: 'High',
    },
    {
      id: 2,
      invoiceId: 'INV001',
      name: 'Prepare packing slip',
      assigned: 'Logistics Team',
      status: 'In Progress',
      dueDate: '2026-04-30',
      description: 'Generate and print packing slips',
      priority: 'High',
    },
    {
      id: 3,
      invoiceId: 'INV002',
      name: 'Schedule delivery',
      assigned: 'Delivery Coordinator',
      status: 'Pending',
      dueDate: '2026-05-01',
      description: 'Arrange delivery time and route',
      priority: 'Medium',
    },
    {
      id: 4,
      invoiceId: 'INV001',
      name: 'Notify sales team about new arrivals',
      assigned: 'Sales Manager',
      status: 'Done',
      dueDate: '2026-04-30',
      description: 'Send notification to sales team',
      priority: 'Medium',
    },
    {
      id: 5,
      invoiceId: 'INV003',
      name: 'Update inventory system',
      assigned: 'IT Support',
      status: 'In Progress',
      dueDate: '2026-04-29',
      description: 'Update inventory management system',
      priority: 'High',
    },
  ]);

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Done': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-orange-100 text-orange-800',
      'Low': 'bg-green-100 text-green-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const doneCount = tasks.filter(t => t.status === 'Done').length;

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-8">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-blue-600 hover:text-blue-800 font-semibold mb-4"
        >
          ← Back to Dashboard
        </button>
        <h2 className="text-3xl font-bold text-gray-800">Task Management</h2>
        <p className="text-gray-600 mt-2">Manage all project tasks and assignments</p>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-yellow-600 text-3xl font-bold">{pendingCount}</div>
          <div className="text-gray-600 text-sm">Pending Tasks</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-blue-600 text-3xl font-bold">{inProgressCount}</div>
          <div className="text-gray-600 text-sm">In Progress</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-green-600 text-3xl font-bold">{doneCount}</div>
          <div className="text-gray-600 text-sm">Completed</div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-lg shadow-lg p-8 overflow-x-auto">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">All Tasks</h3>
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Task Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Invoice</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Assigned To</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Priority</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900">{task.name}</div>
                  <div className="text-sm text-gray-600">{task.description}</div>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-700">{task.invoiceId}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{task.assigned}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className={`px-3 py-1 rounded text-sm font-semibold cursor-pointer ${getStatusColor(task.status)}`}
                    >
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Done</option>
                    </select>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{task.dueDate}</td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
