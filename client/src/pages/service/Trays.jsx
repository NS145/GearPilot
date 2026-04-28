// Warehouse Visualizer (Service Tray View)
import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { rackAPI, trayAPI } from '../../api';
import { Spinner, StatusBadge, Modal } from '../../components/common';
import { Server, Grid, Monitor, User, Info, ArrowRightCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WarehouseVisualizer() {
  const [racks, setRacks] = useState([]);
  const [selectedRack, setSelectedRack] = useState(null);
  const [trays, setTrays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTrays, setLoadingTrays] = useState(false);
  const [detailTray, setDetailTray] = useState(null);

  useEffect(() => {
    fetchRacks();
  }, []);

  const fetchRacks = async () => {
    try {
      const { data } = await rackAPI.getAll({ limit: 50 });
      setRacks(data.data);
      if (data.data.length > 0) handleRackSelect(data.data[0]);
    } catch (err) {
      toast.error('Failed to load racks');
    } finally { setLoading(false); }
  };

  const handleRackSelect = async (rack) => {
    setSelectedRack(rack);
    setLoadingTrays(true);
    try {
      const { data } = await trayAPI.getAll({ rackId: rack._id, limit: 100 });
      // Sort trays by trayNumber
      const sorted = data.data.sort((a, b) => a.trayNumber - b.trayNumber);
      setTrays(sorted);
    } catch (err) {
      toast.error('Failed to load trays');
    } finally { setLoadingTrays(false); }
  };

  const getTrayColor = (tray) => {
    if (!tray.laptop) return '#e2e8f0'; // Empty - Grey
    if (tray.laptop.status === 'assigned') return '#3b82f6'; // Assigned - Blue
    if (tray.laptop.status === 'reserved') return '#f59e0b'; // Requested - Yellow
    return '#10b981'; // Available - Green
  };

  return (
    <Layout title="Warehouse Visualizer">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
        
        {/* RACK SELECTOR (Left Sidebar) */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Physical Racks</div>
          {loading ? <Spinner /> : racks.map(rack => (
            <button
              key={rack._id}
              onClick={() => handleRackSelect(rack)}
              className={`w-full text-left p-4 rounded-2xl transition-all border-2 flex items-center gap-4 ${
                selectedRack?._id === rack._id 
                ? 'bg-white border-blue-500 shadow-lg shadow-blue-100' 
                : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-200'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${selectedRack?._id === rack._id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                <Server className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-800">Rack #{rack.rackNumber}</div>
                <div className="text-xs text-gray-500">{rack.location}</div>
              </div>
              <ArrowRightCircle className={`ml-auto w-4 h-4 ${selectedRack?._id === rack._id ? 'text-blue-500' : 'text-transparent'}`} />
            </button>
          ))}
        </div>

        {/* TRAY GRID VISUALIZER (Main Content) */}
        <div className="lg:col-span-3 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          {selectedRack ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-800 tracking-tight">Rack {selectedRack.rackNumber}</h2>
                  <p className="text-sm text-gray-500 font-medium">Shelf Visualization • {trays.length} Trays Total</p>
                </div>
                
                {/* LEGEND */}
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /> Ready</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Out</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pending</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gray-300" /> Empty</div>
                </div>
              </div>

              {loadingTrays ? (
                <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                  {/* GRAPHIC SHELF GRID */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6 p-2">
                    {trays.map(tray => (
                      <button
                        key={tray._id}
                        onClick={() => setDetailTray(tray)}
                        className="group relative aspect-[4/3] rounded-2xl border-b-8 border-gray-100 transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col items-center justify-center gap-2"
                        style={{ backgroundColor: `${getTrayColor(tray)}15`, borderColor: `${getTrayColor(tray)}30` }}
                      >
                        {/* Tray Number Badge */}
                        <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[9px] font-black text-gray-500 shadow-sm border border-gray-100">
                          T-{tray.trayNumber}
                        </div>

                        {/* Status Icon */}
                        <div className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: getTrayColor(tray) }}>
                          <Monitor className="w-6 h-6 text-white" />
                        </div>

                        <div className="text-[11px] font-bold text-gray-700">
                          {tray.laptop ? tray.laptop.model : 'Empty'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400">
              <Server className="w-12 h-12 opacity-20" />
              <p className="font-medium">Select a rack to view shelf layout</p>
            </div>
          )}
        </div>
      </div>

      {/* TRAY DETAIL MODAL */}
      <Modal 
        isOpen={!!detailTray} 
        onClose={() => setDetailTray(null)} 
        title={`Tray Detail: T-${detailTray?.trayNumber}`}
        size="md"
      >
        {detailTray && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">Current Status</div>
                <StatusBadge status={detailTray.laptop ? detailTray.laptop.status : 'free'} />
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Hardware ID</div>
                <div className="font-mono text-xs font-bold text-gray-700">{detailTray.laptop?.serialNumber || 'N/A'}</div>
              </div>
            </div>

            {detailTray.laptop ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-black text-gray-800">{detailTray.laptop.model}</div>
                    <div className="text-xs text-gray-500">{detailTray.laptop.ram} / {detailTray.laptop.storage}</div>
                  </div>
                </div>

                {detailTray.laptop.status === 'assigned' && (
                  <div className="p-4 bg-blue-50 rounded-2xl flex items-center gap-4 border border-blue-100">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-blue-400 uppercase">Assigned To</div>
                      <div className="font-bold text-blue-900">Current Employee Info In Sidebar</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📥</div>
                <p className="text-sm font-medium text-gray-500">This tray is currently empty and available for new stock.</p>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => setDetailTray(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => { setShowQR(detailTray); setDetailTray(null); }}
                className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
              >
                <QrIcon className="w-4 h-4" /> View QR
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* QR PREVIEW MODAL */}
      <Modal 
        isOpen={!!showQR} 
        onClose={() => setShowQR(null)} 
        title="Tray QR Label"
        size="sm"
      >
        {showQR && (
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="p-6 bg-white rounded-3xl shadow-2xl border-4 border-gray-900">
              <QRCode 
                id="qr-gen"
                value={showQR.qrCode} 
                size={200} 
                level="H" 
                includeMargin={true} 
              />
              <div className="mt-4 text-center">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Tray ID</div>
                <div className="text-xl font-black text-gray-900">T-{showQR.trayNumber}</div>
                <div className="text-[10px] font-bold text-blue-500 uppercase">Rack #{selectedRack?.rackNumber}</div>
              </div>
            </div>
            
            <button 
              onClick={downloadQR}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" /> Download Labeled QR
            </button>
          </div>
        )}
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </Layout>
  );
}
