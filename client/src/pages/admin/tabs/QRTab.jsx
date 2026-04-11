import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import CONFIG from '../../../config';
const BASE_URL = CONFIG.APP_URL;

const QRTab = () => {
  const [tables, setTables] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      number: i + 1,
      label: `Table ${i + 1}`
    }))
  );
  const [customTable, setCustomTable] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);

  const downloadQR = (tableNumber) => {
    const canvas = document.getElementById(`qr-${tableNumber}`);
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `canteen-table-${tableNumber}.png`;
    link.click();
  };

  const addCustomTable = () => {
    if (!customTable) return;
    const exists = tables.find(t => t.number === Number(customTable));
    if (exists) return alert('Table already exists');
    setTables(prev => [...prev, {
      number: Number(customTable),
      label: `Table ${customTable}`
    }].sort((a, b) => a.number - b.number));
    setCustomTable('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">QR Code Generator</h2>
        <div className="flex gap-2">
          <input
            type="number"
            value={customTable}
            onChange={e => setCustomTable(e.target.value)}
            placeholder="Add table no."
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-32 focus:outline-none focus:border-orange-400"
          />
          <button
            onClick={addCustomTable}
            className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <span className="text-2xl">💡</span>
        <div>
          <p className="font-semibold text-blue-700">How to use</p>
          <p className="text-sm text-blue-600 mt-1">
            Click any table to preview its QR code. Students scan the QR code
            with their phone camera — it opens the menu page directly.
            Print and place the QR code on each table.
          </p>
        </div>
      </div>

      {/* Table grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {tables.map(table => (
          <div
            key={table.number}
            onClick={() => setSelectedTable(
              selectedTable?.number === table.number ? null : table
            )}
            className={`bg-white rounded-2xl p-4 text-center cursor-pointer transition shadow-sm
              ${selectedTable?.number === table.number
                ? 'ring-2 ring-orange-500 shadow-md'
                : 'hover:shadow-md'
              }`}
          >
            <div className="text-3xl mb-2">🪑</div>
            <p className="font-semibold text-gray-700 text-sm">{table.label}</p>
            <p className="text-xs text-gray-400 mt-1">Click to preview</p>
          </div>
        ))}
      </div>

      {/* QR Preview Modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {selectedTable.label}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Scan to order from {selectedTable.label}
            </p>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100">
                <QRCodeCanvas
                  id={`qr-${selectedTable.number}`}
                  value={`${BASE_URL}/?table=${selectedTable.number}`}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#1a1a1a"
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>

            {/* URL preview */}
            <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 mb-6 font-mono break-all">
              {BASE_URL}/?table={selectedTable.number}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => downloadQR(selectedTable.number)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition"
              >
                ⬇️ Download PNG
              </button>
              <button
                onClick={() => setSelectedTable(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-xl font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden QR codes for download */}
      <div className="hidden">
        {tables.map(table => (
          <QRCodeCanvas
            key={table.number}
            id={`qr-${table.number}`}
            value={`${BASE_URL}/?table=${table.number}`}
            size={400}
            level="H"
            includeMargin={true}
          />
        ))}
      </div>
    </div>
  );
};

export default QRTab;