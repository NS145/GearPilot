import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import { StatusBadge, LoadingOverlay, Pagination, EmptyState, Modal } from '../../components/common';
import { assignmentAPI, employeeAPI } from '../../api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Plus, RotateCcw } from 'lucide-react';

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [assignModal, setAssignModal] = useState(false);
  const [returnModal, setReturnModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [assignForm, setAssignForm] = useState({ employeeId: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await assignmentAPI.getAll(params);
      setAssignments(data.data);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  useEffect(() => {
    employeeAPI.getAll({ status: 'active', limit: 100 }).then(({ data }) => setEmployees(data.data));
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await assignmentAPI.assign(assignForm);
      toast.success(data.message);
      setAssignModal(false);
      setAssignForm({ employeeId: '', notes: '' });
      fetchAssignments();
    } finally { setSaving(false); }
  };

  const handleReturn = async () => {
    setSaving(true);
    try {
      await assignmentAPI.return({ assignmentId: selectedAssignment._id });
      toast.success('Laptop returned successfully');
      setReturnModal(false);
      fetchAssignments();
    } finally { setSaving(false); }
  };

  return (
    <Layout title="Assignments">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <select className="input w-40" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="returned">Returned</option>
        </select>
        <button onClick={() => setAssignModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Assignment
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          {loading ? <LoadingOverlay /> : assignments.length === 0 ? <EmptyState /> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Laptop', 'Serial #', 'Employee', 'Department', 'Assigned Date', 'Returned Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignments.map(a => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{a.laptopId?.model}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{a.laptopId?.serialNumber}</td>
                    <td className="px-4 py-3">{a.employeeId?.name}</td>
                    <td className="px-4 py-3 text-gray-500">{a.employeeId?.department}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{format(new Date(a.assignedDate), 'dd MMM yyyy')}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{a.returnedDate ? format(new Date(a.returnedDate), 'dd MMM yyyy') : '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3">
                      {a.status === 'active' && (
                        <button onClick={() => { setSelectedAssignment(a); setReturnModal(true); }} className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-800 font-medium">
                          <RotateCcw className="w-3 h-3" /> Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {pagination && <div className="px-6 py-4 border-t"><Pagination pagination={pagination} onChange={setPage} /></div>}
      </div>

      {/* Assign Modal */}
      <Modal isOpen={assignModal} onClose={() => setAssignModal(false)} title="Assign Laptop to Employee">
        <p className="text-sm text-blue-600 bg-blue-50 rounded-lg p-3 mb-4">
          The system will automatically select the best available laptop based on assignment priority rules.
        </p>
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Employee *</label>
            <select className="input" value={assignForm.employeeId} onChange={e => setAssignForm(p => ({ ...p, employeeId: e.target.value }))} required>
              <option value="">Select employee...</option>
              {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId}) — {emp.department}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea className="input" rows={2} value={assignForm.notes} onChange={e => setAssignForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setAssignModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Assigning...' : 'Assign'}</button>
          </div>
        </form>
      </Modal>

      {/* Return Confirm */}
      <Modal isOpen={returnModal} onClose={() => setReturnModal(false)} title="Return Laptop" size="sm">
        <p className="text-gray-600 mb-4">
          Return <strong>{selectedAssignment?.laptopId?.model}</strong> from <strong>{selectedAssignment?.employeeId?.name}</strong>?
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setReturnModal(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleReturn} disabled={saving} className="btn-primary">{saving ? 'Processing...' : 'Confirm Return'}</button>
        </div>
      </Modal>
    </Layout>
  );
}
