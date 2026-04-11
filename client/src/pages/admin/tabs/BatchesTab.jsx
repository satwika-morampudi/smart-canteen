import { useEffect, useState } from 'react';
import { getOrders, createBatch, getBatches, completeBatch } from '../../../api/api';

const BatchesTab = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, batchesRes] = await Promise.all([
        getOrders(),
        getBatches()
      ]);
      setPendingOrders(ordersRes.data.filter(o => o.status === 'Pending'));
      setBatches(batchesRes.data);
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const toggleOrder = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleCreateBatch = async () => {
    if (selectedOrders.length === 0) {
      return alert('Please select at least one order');
    }
    try {
      await createBatch(selectedOrders);
      setSelectedOrders([]);
      fetchData();
      alert('Batch created! All selected orders are now In Progress');
    } catch (err) {
      alert('Failed to create batch');
    }
  };

  const handleCompleteBatch = async (batchId) => {
    try {
      await completeBatch(batchId);
      fetchData();
      alert('Batch completed! All orders are now Ready for pickup');
    } catch (err) {
      alert('Failed to complete batch');
    }
  };

  if (loading) return (
    <div className="text-center py-20 text-orange-500 animate-pulse">
      Loading...
    </div>
  );

  return (
    <div className="space-y-8">

      {/* Create new batch */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            Create New Batch
            <span className="ml-2 text-sm font-normal text-gray-400">
              (select pending orders to cook together)
            </span>
          </h2>
          {selectedOrders.length > 0 && (
            <button
              onClick={handleCreateBatch}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl font-semibold transition"
            >
              🍳 Create Batch ({selectedOrders.length})
            </button>
          )}
        </div>

        {pendingOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">✅</div>
            <p>No pending orders right now</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingOrders.map(order => (
              <div
                key={order._id}
                onClick={() => toggleOrder(order._id)}
                className={`border-2 rounded-xl p-4 cursor-pointer transition
                  ${selectedOrders.includes(order._id)
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-100 hover:border-orange-200'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${selectedOrders.includes(order._id)
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-gray-300'
                      }`}>
                      {selectedOrders.includes(order._id) && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">{order.orderID}</p>
                      <p className="text-xs text-gray-400">
                        Table {order.tableNumber} · {order.items.length} items
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-orange-500">₹{order.totalAmount}</span>
                </div>

                {/* Items preview */}
                <div className="mt-2 text-xs text-gray-500 pl-8">
                  {order.items.map((item, i) => (
                    <span key={i}>
                      {item.name} ×{item.quantity}
                      {i < order.items.length - 1 ? ' · ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active batches */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Active Batches</h2>

        {batches.filter(b => b.status === 'In Progress').length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🍳</div>
            <p>No active batches</p>
          </div>
        ) : (
          <div className="space-y-4">
            {batches
              .filter(b => b.status === 'In Progress')
              .map(batch => (
                <div key={batch._id}
                  className="border border-orange-200 bg-orange-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-orange-700">{batch.batchID}</h3>
                      <p className="text-xs text-orange-400">
                        {batch.orders.length} orders · Started {new Date(batch.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCompleteBatch(batch._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                    >
                      ✅ Complete Batch
                    </button>
                  </div>

                  {/* Orders in batch */}
                  <div className="space-y-1">
                    {batch.orders.map((order, i) => (
                      <div key={i} className="text-xs text-orange-600 bg-white rounded-lg px-3 py-1.5">
                        {order.orderID || `Order ${i + 1}`} · Table {order.tableNumber}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Completed batches */}
      {batches.filter(b => b.status === 'Completed').length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Completed Batches</h2>
          <div className="space-y-2">
            {batches
              .filter(b => b.status === 'Completed')
              .map(batch => (
                <div key={batch._id}
                  className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                  <div>
                    <span className="font-semibold text-gray-600">{batch.batchID}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {batch.orders.length} orders
                    </span>
                  </div>
                  <span className="text-xs text-green-500 font-medium">✅ Completed</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchesTab;