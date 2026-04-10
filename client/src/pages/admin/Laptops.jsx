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
    } finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchLaptops(); }, [fetchLaptops]);
  useEffect(() => {
    trayAPI.getAll({ status: 'free', limit: 100 }).then(({ data }) => setTrays(data.data));
  }, []);

  const openCreate = () => { setEditing(null); setForm(INIT); setModal(true); };
  const openEdit = (l) => {
    setEditing(l);
    setForm({ model: l.model, ram: l.ram, storage: l.storage, serialNumber: l.serialNumber, purchaseDate: l.purchaseDate?.slice(0, 10) || '', vendor: l.vendor, trayId: l.trayId?._id || '', notes: l.notes || '' });
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
          <input className="input w-40" placeholder="Model..." value={filters.model} onChange={e => setFilters(p => ({ ...p, model: e.target.value }))} />
          <select className="input w-40" value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Laptop</button>
      </div>
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          {loading ? <LoadingOverlay /> : laptops.length === 0 ? <EmptyState /> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Model', 'RAM', 'Storage', 'Serial #', 'Vendor', 'Purchase Date', 'Tray', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {laptops.map(l => (
                  <tr key={l._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{l.model}</td>
                    <td className="px-4 py-3 text-gray-500">{l.ram}</td>
                    <td className="px-4 py-3 text-gray-500">{l.storage}</td>
                    <td className="px-4 py-3 font-mono text-xs">{l.serialNumber}</td>
                    <td className="px-4 py-3">{l.vendor}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{l.purchaseDate ? format(new Date(l.purchaseDate), 'dd MMM yyyy') : '—'}</td>
                    <td className="px-4 py-3 text-xs">{l.trayId?.trayNumber || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => openEdit(l)} className="text-blue-600 p-1"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(l)} className="text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {pagination && <div className="px-6 py-4 border-t"><Pagination pagination={pagination} onChange={setPage} /></div>}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Laptop' : 'Add Laptop'} size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {[['Model', 'model', 'text', true], ['Serial Number', 'serialNumber', 'text', true], ['RAM', 'ram', 'text', true], ['Storage', 'storage', 'text', true], ['Vendor', 'vendor', 'text', true], ['Purchase Date', 'purchaseDate', 'date', true]].map(([label, key, type, req]) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1">{label}{req ? ' *' : ''}</label>
              <input className="input" type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} required={req} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1">Tray</label>
            <select className="input" value={form.trayId} onChange={e => setForm(p => ({ ...p, trayId: e.target.value }))}>
              <option value="">No tray</option>
              {trays.map(t => <option key={t._id} value={t._id}>{t.trayNumber} (Rack: {t.rackId?.rackNumber || '?'})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <input className="input" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
          <div className="col-span-2 flex gap-3 justify-end mt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete Laptop" message={`Delete "${deleteTarget?.model}" (${deleteTarget?.serialNumber})?`} />
    </Layout>
  );
}
