import React, { useState } from 'react';

export default function InvoiceUpload({ onNavigate, onUpload }) {
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([
    { name: '', quantity: '', cases: '', unit: '' },
  ]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { name: '', quantity: '', cases: '', unit: '' }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validItems = items.filter(item => item.name && item.quantity);
    if (vendor && validItems.length > 0) {
      onUpload({
        vendor,
        date,
        items: validItems,
      });
      alert('Invoice uploaded successfully!');
    } else {
      alert('Please fill in vendor name and at least one item.');
    }
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-blue-600 hover:text-blue-800 font-semibold mb-4"
          >
            ← Back to Dashboard
          </button>
          <h2 className="text-3xl font-bold text-gray-800">Upload Invoice</h2>
          <p className="text-gray-600 mt-2">Advanced Mode: Invoice to Packing Slip</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Vendor Information */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Vendor Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Vendor Name *</label>
                  <input
                    type="text"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Fresh Foods Ltd"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Invoice Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Products (AI Extracted Data)</h3>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      placeholder="Product Name"
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      placeholder="Quantity"
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="number"
                      value={item.cases}
                      onChange={(e) => handleItemChange(index, 'cases', e.target.value)}
                      placeholder="Cases"
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                      placeholder="Unit"
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addItem}
                className="mt-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition"
              >
                + Add Product
              </button>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Process Invoice
              </button>
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
