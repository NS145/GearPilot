import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { trayAPI } from '../../api';
import { Spinner, StatusBadge, Modal } from '../../components/common';
import { QrCode as QrIcon, Download, Search } from 'lucide-react';
import QRCode from 'qrcode.react';
import toast from 'react-hot-toast';

export default function ServiceTrays() {
  const [trays, setTrays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQR, setShowQR] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await trayAPI.getAll({ limit: 100 });
      setTrays(data.data);
    } catch (err) {
      toast.error('Failed to load trays');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const downloadQR = () => {
    const canvas = document.getElementById('qr-gen');
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `Tray_${showQR.trayNumber}_QR.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const filteredTrays = trays.filter(t => 
    t.trayNumber.toString().includes(searchTerm) || 
    t.rackId?.rackNumber?.toString().includes(searchTerm)
  );

  return (
    <Layout title="Inventory Trays">
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Tray or Rack #..." 
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {filteredTrays.length} Trays Found
          </div>
        </div>

        {loading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Tray #', 'Rack #', 'Status', 'Laptop', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTrays.map(tray => (
                  <tr key={tray._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4 font-bold text-gray-800">T-{tray.trayNumber}</td>
                    <td className="px-4 py-4 text-gray-600">Rack {tray.rackId?.rackNumber}</td>
                    <td className="px-4 py-4"><StatusBadge status={tray.status} /></td>
                    <td className="px-4 py-4 text-gray-500 italic">
                      {tray.laptop ? 'Occupied' : 'Empty'}
                    </td>
                    <td className="px-4 py-4">
                      <button 
                        onClick={() => setShowQR(tray)}
                        className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-colors"
                      >
                        <QrIcon className="w-4 h-4" /> QR Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR PREVIEW MODAL */}
      <Modal 
        isOpen={!!showQR} 
        onClose={() => setShowQR(null)} 
        title={`Tray T-${showQR?.trayNumber} Label`}
        size="sm"
      >
        {showQR && (
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="p-6 bg-white rounded-2xl shadow-xl border-2 border-gray-100">
              <QRCode 
                id="qr-gen"
                value={showQR.qrCode} 
                size={200} 
                level="H" 
                includeMargin={true} 
              />
              <div className="mt-4 text-center">
                <div className="text-xl font-black text-gray-900">Tray T-{showQR.trayNumber}</div>
                <div className="text-xs font-bold text-blue-500 uppercase">Rack #{showQR.rackId?.rackNumber}</div>
              </div>
            </div>
            
            <button 
              onClick={downloadQR}
              className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-blue-100"
            >
              <Download className="w-5 h-5" /> Download QR Label
            </button>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
