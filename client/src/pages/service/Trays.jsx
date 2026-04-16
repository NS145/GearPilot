import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import { StatusBadge, LoadingOverlay, Pagination, EmptyState, Modal } from '../../components/common';
import { trayAPI, laptopAPI } from '../../api';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';

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
                    <td className="px-4 py-3">
                      <button onClick={() => openTray(t)} className="text-xs btn-secondary py-1 px-3">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {pagination && <div className="px-6 py-4 border-t">{/* Pagination */}</div>}
      </div>

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
    </Layout>
  );
}
