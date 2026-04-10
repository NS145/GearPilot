// Employees.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import { Modal, StatusBadge, LoadingOverlay, Pagination, EmptyState, ConfirmDialog } from '../../components/common';
import { employeeAPI } from '../../api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const INIT = { employeeId: '', name: '', email: '', department: '', status: 'active' };

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INIT);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      const { data } = await employeeAPI.getAll(params);
      setEmployees(data.data);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditing(null); setForm(INIT); setModal(true); };
  const openEdit = (e) => { setEditing(e); setForm({ employeeId: e.employeeId, name: e.name, email: e.email, department: e.department, status: e.status }); setModal(true); };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    try {
      if (editing) { await employeeAPI.update(editing._id, form); toast.success('Updated'); }
      else { await employeeAPI.create(form); toast.success('Created'); }
      setModal(false);
      fetch();
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await employeeAPI.delete(deleteTarget._id);
      toast.success('Deleted');
      setDeleteTarget(null);
      fetch();
    } finally { setDeleting(false); }
  };

  return (
    <Layout title="Employees">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <input className="input w-64" placeholder="Search name, ID, email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Employee</button>
      </div>
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          {loading ? <LoadingOverlay /> : employees.length === 0 ? <EmptyState /> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['ID', 'Name', 'Email', 'Department', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map(emp => (
                  <tr key={emp._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{emp.employeeId}</td>
                    <td className="px-4 py-3 font-medium">{emp.name}</td>
                    <td className="px-4 py-3 text-gray-500">{emp.email}</td>
                    <td className="px-4 py-3">{emp.department}</td>
                    <td className="px-4 py-3"><StatusBadge status={emp.status} /></td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => openEdit(emp)} className="text-blue-600 p-1"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(emp)} className="text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {pagination && <div className="px-6 py-4 border-t"><Pagination pagination={pagination} onChange={setPage} /></div>}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Employee' : 'Add Employee'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[['Employee ID', 'employeeId'], ['Name', 'name'], ['Email', 'email'], ['Department', 'department']].map(([label, key]) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1">{label} *</label>
              <input className="input" type={key === 'email' ? 'email' : 'text'} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} required />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="active">Active</option>
              <option value="exited">Exited</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete Employee" message={`Delete "${deleteTarget?.name}"?`} />
    </Layout>
  );
}
