'use client';

import { useState } from 'react';

// Mock data
const mockTasks = [
  { id: 1, name: 'Verify received items in warehouse', assigned: 'John Doe', status: 'pending', dueDate: '2024-04-16', invoiceId: 1 },
  { id: 2, name: 'Prepare packing slip', assigned: 'Jane Smith', status: 'in-progress', dueDate: '2024-04-16', invoiceId: 1 },
  { id: 3, name: 'Schedule delivery', assigned: 'Mike Johnson', status: 'done', dueDate: '2024-04-15', invoiceId: 2 },
  { id: 4, name: 'Notify sales team about new arrivals', assigned: 'Sarah Wilson', status: 'pending', dueDate: '2024-04-16', invoiceId: 2 },
];

export default function TaskManagement() {
  const [tasks, setTasks] = useState(mockTasks);
  const [filter, setFilter] = useState('all');

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'in-progress': return 'status-in-progress';
      case 'done': return 'status-done';
      default: return 'status-pending';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Pending Tasks</h3>
          <p className="text-3xl font-bold text-yellow-600">{tasks.filter(t => t.status === 'pending').length}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">In Progress</h3>
          <p className="text-3xl font-bold text-blue-600">{tasks.filter(t => t.status === 'in-progress').length}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Completed</h3>
          <p className="text-3xl font-bold text-green-600">{tasks.filter(t => t.status === 'done').length}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">All Tasks</h2>
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">{task.name}</h3>
                <p className="text-sm text-gray-600">Assigned to: {task.assigned}</p>
                <p className="text-sm text-gray-600">Due: {task.dueDate}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`status-badge ${getTaskStatusColor(task.status)}`}>
                  {task.status}
                </span>
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}