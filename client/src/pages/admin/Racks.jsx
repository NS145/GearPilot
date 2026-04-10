import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import { Modal, StatusBadge, LoadingOverlay, Pagination, EmptyState, ConfirmDialog } from '../../components/common';
import { rackAPI } from '../../api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const INITIAL_FORM = { rackNumber: '', location: '', status: 'active', notes: '' };

export default function AdminRacks() {
  const [racks, setRacks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRacks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await rackAPI.getAll({ page, limit: 20 });
      setRacks(data.data);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchRacks(); }, [fetchRacks]);

  const openCreate = () => { setEditing(null); setForm(INITIAL_FORM); setModal(true); };
  const openEdit = (rack) => { setEditing(rack); setForm({ rackNumber: rack.rackNumber, location: rack.location || '', status: rack.status, notes: rack.notes || '' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await rackAPI.update(editing._id, form);
        toast.success('Rack updated');
      } else {
        await rackAPI.create(form);
        toast.success('Rack created');
      }
      setModal(false);
      fetchRacks();
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await rackAPI.delete(deleteTarget._id);
      toast.success('Rack deleted');
      setDeleteTarget(null);
      fetchRacks();
    } finally { setDeleting(false); }
  };

  return (
    <Layout title="Racks">
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Rack
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          {loading ? <LoadingOverlay /> : racks.length === 0 ? <EmptyState message="No racks found" /> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Rack Number', 'Location', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {racks.map(rack => (
                  <tr key={rack._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{rack.rackNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{rack.location || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={rack.status} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(rack.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(rack)} className="text-blue-600 hover:text-blue-800 p-1"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteTarget(rack)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {pagination && <div className="px-6 py-4 border-t"><Pagination pagination={pagination} onChange={setPage} /></div>}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Rack' : 'Add Rack'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Rack Number *</label>
            <input className="input" value={form.rackNumber} onChange={e => setForm(p => ({ ...p, rackNumber: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input className="input" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="active">Active</option>
              <option value="maintenance">Under Maintenance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Rack"
        message={`Delete rack "${deleteTarget?.rackNumber}"? This cannot be undone.`}
      />
    </Layout>
  );
}
