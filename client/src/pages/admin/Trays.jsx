import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import { Modal, StatusBadge, LoadingOverlay, Pagination, EmptyState, ConfirmDialog } from '../../components/common';
import { trayAPI, rackAPI } from '../../api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, QrCode } from 'lucide-react';

const INIT = { trayNumber: '', rackId: '', status: 'free', notes: '', laptopModel: '' };
const BULK_INIT = { rackId: '', prefix: 'T-', startNumber: '1', quantity: '10', laptopModel: '' };

export default function AdminTrays() {
  const [trays, setTrays] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [racks, setRacks] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [modal, setModal] = useState(false);
  const [mode, setMode] = useState('single'); // 'single' | 'bulk'
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INIT);
  const [bulkForm, setBulkForm] = useState(BULK_INIT);
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [qrModal, setQrModal] = useState(null);

  const fetchTrays = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await trayAPI.getAll({ page, limit: 20 });
      setTrays(data.data);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  }, [page]);

  const fetchAvailableModels = useCallback(async () => {
    try {
      const { data } = await trayAPI.getAvailableModels();
      setAvailableModels(data.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchTrays(); }, [fetchTrays]);
  useEffect(() => {
    rackAPI.getAll({ limit: 100 }).then(({ data }) => setRacks(data.data));
    fetchAvailableModels();
  }, [fetchAvailableModels]);

  // Auto-generate number when rack changes in single mode
  useEffect(() => {
    if (mode === 'single' && form.rackId && !editing) {
      setSuggesting(true);
      trayAPI.suggestNumber(form.rackId)
        .then(({ data }) => setForm(p => ({ ...p, trayNumber: data.nextNumber.toString() })))
        .finally(() => setSuggesting(false));
    }
  }, [form.rackId, mode, editing]);

  const openCreate = () => { 
    setEditing(null); 
    setForm(INIT); 
    setMode('single'); 
    setModal(true); 
    fetchAvailableModels();
  };
  const openEdit = (t) => { 
    setEditing(t); 
    setForm({ trayNumber: t.trayNumber, rackId: t.rackId?._id || '', status: t.status, notes: t.notes || '', laptopModel: '' }); 
    setMode('single'); 
    setModal(true); 
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (form.laptopModel) {
      const model = availableModels.find(m => m.model === form.laptopModel);
      if (!model || model.count < 1) return toast.error(`No ${form.laptopModel} pieces available`);
    }

    setSaving(true);
    try {
      if (editing) { await trayAPI.update(editing._id, form); toast.success('Updated'); }
      else { await trayAPI.create(form); toast.success('Created'); }
      setModal(false);
      fetchTrays();
      fetchAvailableModels();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (bulkForm.laptopModel) {
      const model = availableModels.find(m => m.model === bulkForm.laptopModel);
      const qty = parseInt(bulkForm.quantity);
      if (!model || model.count < qty) {
        return toast.error(`Limit reached! Only ${model?.count || 0} pieces of ${bulkForm.laptopModel} are available.`);
      }
    }

    setSaving(true);
    try {
      const { data } = await trayAPI.bulkCreate(bulkForm);
      toast.success(`Successfully created ${data.count} trays`);
      setModal(false);
      fetchTrays();
      fetchAvailableModels();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await trayAPI.delete(deleteTarget._id);
      toast.success('Deleted');
      setDeleteTarget(null);
      fetchTrays();
      fetchAvailableModels();
    } finally { setDeleting(false); }
  };

  const currentAvailable = bulkForm.laptopModel ? (availableModels.find(m => m.model === bulkForm.laptopModel)?.count || 0) : null;
  const isBulkLimitExceeded = currentAvailable !== null && parseInt(bulkForm.quantity) > currentAvailable;

  return (
    <Layout title="Trays">
      <div className="flex justify-end mb-4 gap-3">
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Tray
        </button>
      </div>
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          {loading ? <LoadingOverlay /> : trays.length === 0 ? <EmptyState /> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Tray #', 'Rack', 'Rack Status', 'Tray Status', 'Laptop Model', 'Serial #', 'QR Code', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trays.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{t.trayNumber}</td>
                    <td className="px-4 py-3">{t.rackId?.rackNumber}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.rackId?.status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3 text-gray-600 font-medium">{t.status === 'occupied' && t.laptop ? t.laptop.model : '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">{t.status === 'occupied' && t.laptop ? t.laptop.serialNumber : '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setQrModal(t)} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-mono">
                        <QrCode className="w-3 h-3" /> {t.qrCode?.slice(0, 12)}...
                      </button>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => openEdit(t)} className="text-blue-600 p-1"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(t)} className="text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {pagination && <div className="px-6 py-4 border-t"><Pagination pagination={pagination} onChange={setPage} /></div>}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Tray' : 'Add Tray'}>
        <div className="space-y-6">
          {!editing && (
            <div className="flex p-1 bg-gray-100 rounded-xl">
              <button 
                onClick={() => setMode('single')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'single' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500'}`}
              >
                Single Tray
              </button>
              <button 
                onClick={() => setMode('bulk')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'bulk' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500'}`}
              >
                Bulk Batch
              </button>
            </div>
          )}

          {mode === 'single' ? (
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rack *</label>
                <select className="input" value={form.rackId} onChange={e => setForm(p => ({ ...p, rackId: e.target.value }))} required>
                  <option value="">Select rack...</option>
                  {racks.map(r => <option key={r._id} value={r._id}>{r.rackNumber} — {r.location}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tray Number *</label>
                <div className="relative">
                  <input 
                    className={`input ${suggesting ? 'opacity-50' : ''}`} 
                    value={form.trayNumber} 
                    onChange={e => setForm(p => ({ ...p, trayNumber: e.target.value }))} 
                    placeholder={suggesting ? 'Calculating next...' : 'e.g. T-1'}
                    required 
                  />
                  {suggesting && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">Loading...</div>}
                </div>
                {!editing && form.rackId && !suggesting && <div className="text-[10px] text-green-600 mt-1 font-medium">✓ Automatically assigned next number</div>}
              </div>

              {!editing && (
                <div>
                  <label className="block text-sm font-medium mb-1">Assign Laptop (Optional)</label>
                  <select className="input" value={form.laptopModel} onChange={e => setForm(p => ({ ...p, laptopModel: e.target.value }))}>
                    <option value="">No laptop</option>
                    {availableModels.map(m => (
                      <option key={m.model} value={m.model} disabled={m.count === 0}>
                        {m.model} ({m.count} available)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {editing && (
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="free">Free</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving || suggesting} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rack *</label>
                <select className="input" value={bulkForm.rackId} onChange={e => setBulkForm(p => ({ ...p, rackId: e.target.value }))} required>
                  <option value="">Select rack...</option>
                  {racks.map(r => <option key={r._id} value={r._id}>{r.rackNumber} — {r.location}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prefix</label>
                  <input className="input" placeholder="e.g. T-" value={bulkForm.prefix} onChange={e => setBulkForm(p => ({ ...p, prefix: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Start Number *</label>
                  <input className="input" type="number" min="1" value={bulkForm.startNumber} onChange={e => setBulkForm(p => ({ ...p, startNumber: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity *</label>
                <input 
                  className={`input ${isBulkLimitExceeded ? 'border-red-500' : ''}`} 
                  type="number" 
                  min="1" 
                  max="50" 
                  value={bulkForm.quantity} 
                  onChange={e => setBulkForm(p => ({ ...p, quantity: e.target.value }))} 
                  required 
                />
                <div className="text-[10px] text-gray-400 mt-1">Max 50 trays per batch</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Assign Laptop Model (Optional)</label>
                <select className="input" value={bulkForm.laptopModel} onChange={e => setBulkForm(p => ({ ...p, laptopModel: e.target.value }))}>
                  <option value="">No laptops</option>
                  {availableModels.map(m => (
                    <option key={m.model} value={m.model}>
                      {m.model} ({m.count} available)
                    </option>
                  ))}
                </select>
                {isBulkLimitExceeded && (
                  <div className="text-[10px] text-red-600 mt-1 font-bold">
                    ⚠️ Limit reached! Only {currentAvailable} pieces available.
                  </div>
                )}
              </div>
              
              <div className="bg-red-50 p-3 rounded-lg border border-red-100 italic">
                 <div className="text-xs text-red-800 font-semibold mb-1">Preview:</div>
                 <div className="text-[11px] text-red-600">
                   Trays <strong>{bulkForm.prefix}{bulkForm.startNumber}</strong> to <strong>{bulkForm.prefix}{parseInt(bulkForm.startNumber) + parseInt(bulkForm.quantity || 0) - 1}</strong>
                   {bulkForm.laptopModel && !isBulkLimitExceeded && <span> with <strong>{bulkForm.quantity}</strong> {bulkForm.laptopModel} laptops assigned.</span>}
                 </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving || isBulkLimitExceeded} className="btn-primary">
                  {saving ? 'Generating...' : 'Start Generating'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      <Modal isOpen={!!qrModal} onClose={() => setQrModal(null)} title="QR Code Details" size="sm">
        {qrModal && (
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">Tray <strong>{qrModal.trayNumber}</strong></p>
            <div className="bg-gray-100 rounded-lg p-4 font-mono text-xs break-all">{qrModal.qrCode}</div>
            <p className="text-xs text-gray-400">Use this code in the mobile app QR scanner</p>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete Tray" message={`Delete tray "${deleteTarget?.trayNumber}"?`} />
    </Layout>
  );
}
