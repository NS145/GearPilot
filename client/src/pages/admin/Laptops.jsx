import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import { Modal, StatusBadge, LoadingOverlay, Pagination, EmptyState, ConfirmDialog } from '../../components/common';
import { laptopAPI, trayAPI } from '../../api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const INIT = { model: '', ram: '', storage: '', serialNumber: '', purchaseDate: '', vendor: '', trayId: '', notes: '' };

export default function AdminLaptops() {
  const [laptops, setLaptops] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', model: '' });
  const [trays, setTrays] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INIT);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLaptops = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await laptopAPI.getAll(params);
      setLaptops(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Failed to fetch laptops');
    } finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchLaptops(); }, [fetchLaptops]);
  useEffect(() => {
    trayAPI.getAll({ status: 'free', limit: 100 }).then(({ data }) => setTrays(data.data));
  }, []);

  const openCreate = () => { setEditing(null); setForm(INIT); setModal(true); };
  const openEdit = (l) => {
    setEditing(l);
    setForm({ 
      model: l.model, 
      ram: l.ram, 
      storage: l.storage, 
      serialNumber: l.serialNumber, 
      purchaseDate: l.purchaseDate?.slice(0, 10) || '', 
      vendor: l.vendor, 
      trayId: l.trayId?._id || '', 
      notes: l.notes || '' 
    });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await laptopAPI.update(editing._id, form); toast.success('Updated'); }
      else { await laptopAPI.create(form); toast.success('Created'); }
      setModal(false);
      fetchLaptops();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await laptopAPI.delete(deleteTarget._id);
      toast.success('Deleted');
      setDeleteTarget(null);
      fetchLaptops();
    } finally { setDeleting(false); }
  };

  return (
    <Layout title="Laptops">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex gap-2">
          <input 
            className="input w-48" 
            placeholder="Search Model..." 
            value={filters.model} 
            onChange={e => setFilters(p => ({ ...p, model: e.target.value }))} 
          />
          <select 
            className="input w-40" 
            value={filters.status} 
            onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Laptop
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          {loading ? <LoadingOverlay /> : laptops.length === 0 ? <EmptyState /> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Model', 'RAM', 'Storage', 'Serial #', 'Vendor', 'Purchase Date', 'Tray', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {laptops.map(l => (
                  <tr key={l._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{l.model}</td>
                    <td className="px-4 py-3 text-gray-600 font-medium">{l.ram}</td>
                    <td className="px-4 py-3 text-gray-600 font-medium">{l.storage}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">{l.serialNumber}</td>
                    <td className="px-4 py-3 text-gray-500">{l.vendor}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                      {l.purchaseDate ? format(new Date(l.purchaseDate), 'dd MMM yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-700">
                      {l.trayId?.trayNumber || <span className="text-gray-300 italic">None</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => openEdit(l)} className="text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(l)} className="text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {pagination && <div className="px-6 py-4 border-t"><Pagination pagination={pagination} onChange={setPage} /></div>}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Laptop' : 'Add New Laptop'} size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Model Name *</label>
            <input className="input" placeholder="e.g. Dell Latitude" value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Serial Number *</label>
            <input className="input" placeholder="e.g. SN-4291-AB" value={form.serialNumber} onChange={e => setForm(p => ({ ...p, serialNumber: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">RAM Specs *</label>
            <input className="input" placeholder="e.g. 16GB" value={form.ram} onChange={e => setForm(p => ({ ...p, ram: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Storage *</label>
            <input className="input" placeholder="e.g. 512GB SSD" value={form.storage} onChange={e => setForm(p => ({ ...p, storage: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Vendor *</label>
            <input className="input" placeholder="e.g. Dell India" value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Purchase Date *</label>
            <input className="input" type="date" value={form.purchaseDate} onChange={e => setForm(p => ({ ...p, purchaseDate: e.target.value }))} required />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Tray Assignment</label>
            <select className="input" value={form.trayId} onChange={e => setForm(p => ({ ...p, trayId: e.target.value }))}>
              <option value="">No tray (Available Pool)</option>
              {trays.map(t => <option key={t._id} value={t._id}>{t.trayNumber} (Rack: {t.rackId?.rackNumber || '?'})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Notes</label>
            <input className="input" placeholder="Additional details..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>

          <div className="col-span-2 flex gap-3 justify-end mt-4 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary h-11 px-6">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary h-11 px-10">
              {saving ? 'Saving...' : 'Save Laptop'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)} 
        onConfirm={handleDelete} 
        loading={deleting} 
        title="Delete Laptop" 
        message={`Are you sure you want to delete "${deleteTarget?.model}" (${deleteTarget?.serialNumber})? This action cannot be undone.`} 
      />
    </Layout>
  );
}
