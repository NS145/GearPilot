import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import { StatusBadge, LoadingOverlay, Pagination, EmptyState, Modal } from '../../components/common';
import { trayAPI, laptopAPI } from '../../api';
import toast from 'react-hot-toast';
import { Search, QrCode, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

export default function ServiceTrays() {
  const [trays, setTrays] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedTray, setSelectedTray] = useState(null);
  const [trayDetail, setTrayDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [addLaptopForm, setAddLaptopForm] = useState({ model: '', ram: '', storage: '', serialNumber: '', purchaseDate: '', vendor: '' });
  const [addingLaptop, setAddingLaptop] = useState(false);
  const [qrModal, setQrModal] = useState(null);

  const fetchTrays = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await trayAPI.getAll({ page, limit: 20 });
      setTrays(data.data);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchTrays(); }, [fetchTrays]);

  const openTray = async (tray) => {
    setSelectedTray(tray);
    setDetailLoading(true);
    const { data } = await trayAPI.get(tray._id);
    setTrayDetail(data.data);
    setDetailLoading(false);
  };

  const handleAddLaptop = async (e) => {
    e.preventDefault();
    setAddingLaptop(true);
    try {
      await laptopAPI.create({ ...addLaptopForm, trayId: selectedTray._id });
      toast.success('Laptop added to tray');
      setSelectedTray(null);
      fetchTrays();
    } finally { setAddingLaptop(false); }
  };

  const downloadQR = (t) => {
    const canvas = document.getElementById(`qr-modal-canvas`);
    if (!canvas) return;
    
    const finalCanvas = document.createElement('canvas');
    const ctx = finalCanvas.getContext('2d');
    finalCanvas.width = 300;
    finalCanvas.height = 360;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    ctx.drawImage(canvas, 25, 20, 250, 250);
    
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText(`TRAY: ${t.trayNumber}`, 150, 300);
    
    ctx.font = '16px Inter, sans-serif';
    ctx.fillStyle = '#666666';
    ctx.fillText(`RACK: ${t.rackId?.rackNumber || 'N/A'}`, 150, 330);
    
    const pngUrl = finalCanvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_Tray_${t.trayNumber}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    toast.success(`Downloading QR for ${t.trayNumber}`);
  };

  return (
    <Layout title="Tray View">
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          {loading ? <LoadingOverlay /> : trays.length === 0 ? <EmptyState /> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Tray #', 'Rack', 'Status', 'Action'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trays.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{t.trayNumber}</td>
                    <td className="px-4 py-3">{t.rackId?.rackNumber}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => openTray(t)} className="text-xs btn-secondary py-1 px-3">View</button>
                      <button onClick={() => setQrModal(t)} className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium">
                        <QrCode className="w-3.5 h-3.5" /> QR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {pagination && <div className="px-6 py-4 border-t">{/* Pagination placeholder */}</div>}
      </div>

      {/* ... existing modals ... */}
      
      <Modal isOpen={!!selectedTray} onClose={() => setSelectedTray(null)} title={`Tray ${selectedTray?.trayNumber}`} size="lg">
        {detailLoading ? <div className="py-8 text-center text-gray-400">Loading...</div> : trayDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">Rack</div>
                <div className="font-semibold">{trayDetail.rackId?.rackNumber}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">Status</div>
                <StatusBadge status={trayDetail.status} />
              </div>
            </div>

            {trayDetail.laptop ? (
              <div className="border rounded-lg p-4 space-y-2 text-sm">
                <h3 className="font-semibold text-gray-800">Laptop in this tray</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[['Model', trayDetail.laptop.model], ['RAM', trayDetail.laptop.ram], ['Storage', trayDetail.laptop.storage], ['Serial #', trayDetail.laptop.serialNumber], ['Vendor', trayDetail.laptop.vendor], ['Status', trayDetail.laptop.status]].map(([k, v]) => (
                    <div key={k}><span className="text-gray-500">{k}:</span> <span className="font-medium">{v}</span></div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Add Laptop to this Tray</h3>
                <form onSubmit={handleAddLaptop} className="grid grid-cols-2 gap-3 text-sm">
                  {[['Model', 'model', 'text'], ['Serial #', 'serialNumber', 'text'], ['RAM', 'ram', 'text'], ['Storage', 'storage', 'text'], ['Vendor', 'vendor', 'text'], ['Purchase Date', 'purchaseDate', 'date']].map(([label, key, type]) => (
                    <div key={key}>
                      <label className="block text-xs font-medium mb-1">{label} *</label>
                      <input className="input text-xs" type={type} value={addLaptopForm[key]} onChange={e => setAddLaptopForm(p => ({ ...p, [key]: e.target.value }))} required />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <button type="submit" disabled={addingLaptop} className="btn-primary w-full">
                      {addingLaptop ? 'Adding...' : 'Add Laptop'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={!!qrModal} onClose={() => setQrModal(null)} title="Tray QR Code" size="sm">
        {qrModal && (
          <div className="text-center space-y-5 py-2">
            <div className="flex flex-col items-center">
              <div className="bg-white p-3 rounded-2xl shadow-sm border mb-4">
                <QRCodeCanvas 
                  id="qr-modal-canvas"
                  value={qrModal._id} 
                  size={200} 
                  level="H" 
                  includeMargin={true} 
                />
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">Tray {qrModal.trayNumber}</div>
                <div className="text-sm text-gray-500 uppercase tracking-widest">{qrModal.rackId?.rackNumber}</div>
              </div>
            </div>
            
            <button 
              onClick={() => downloadQR(qrModal)}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              <Download className="w-4 h-4" /> Download QR Label
            </button>
            <p className="text-[10px] text-gray-400">Scan this code with the mobile app for instant tray identification</p>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
