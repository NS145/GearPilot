import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import { ticketAPI } from '../../api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { LoadingOverlay, Modal, StatusBadge, Pagination, EmptyState } from '../../components/common';
import { MessageSquare } from 'lucide-react';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  
  const [respondModal, setRespondModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseForm, setResponseForm] = useState({ response: '', status: 'open' });
  const [saving, setSaving] = useState(false);

  const [resetModal, setResetModal] = useState(false);
  const [resetForm, setResetForm] = useState('');

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await ticketAPI.getAll(params);
      setTickets(data.data);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleRespond = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ticketAPI.respond(selectedTicket._id, responseForm);
      toast.success('Ticket updated successfully');
      setRespondModal(false);
      fetchTickets();
    } finally { setSaving(false); }
  };

  const openReset = (t) => {
    setSelectedTicket(t);
    const suggestedPassword = t.employeeId?.name ? t.employeeId.name.replace(/\s+/g, '').toLowerCase() + '@laptopwms' : '';
    setResetForm(suggestedPassword);
    setResetModal(true);
  };

  const submitResetPassword = async (e) => {
    e.preventDefault();
    if (!resetForm) return toast.error('Password is required');
    setSaving(true);
    try {
      const { data } = await ticketAPI.resetPassword(selectedTicket._id, { password: resetForm });
      toast.success('Password successfully reset!');
      alert(`New password for ${selectedTicket.employeeId?.name}: ${data.newPassword}`);
      setResetModal(false);
      fetchTickets();
    } finally { setSaving(false); }
  };

  const openRespond = (t) => {
    setSelectedTicket(t);
    setResponseForm({ response: t.adminResponse || '', status: t.status });
    setRespondModal(true);
  };

  return (
    <Layout title="Employee Tickets">
      <div className="flex items-center mb-4">
        <select className="input w-40" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Tickets</option>
          <option value="open">Open</option>
          <option value="solved">Solved</option>
        </select>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          {loading ? <LoadingOverlay /> : tickets.length === 0 ? <EmptyState /> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Employee</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Title & Issue</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{t.employeeId?.name}</div>
                      <div className="text-xs text-gray-500">{t.employeeId?.email}</div>
                    </td>
                    <td className="px-4 py-3 max-w-sm">
                      <div className="font-medium text-gray-900 truncate">{t.title}</div>
                      <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider">{t.type}</div>
                      <div className="text-xs text-gray-500 truncate">{t.description}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{format(new Date(t.createdAt), 'dd MMM yyyy')}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        {t.type === 'password_reset' && t.status === 'open' ? (
                          <button onClick={() => openReset(t)} className="btn-primary py-1 px-2 text-xs flex items-center justify-center gap-1 w-full whitespace-nowrap">
                            Reset Password
                          </button>
                        ) : (
                          <button onClick={() => openRespond(t)} className="btn-secondary py-1 px-2 text-xs flex items-center justify-center gap-1 w-full">
                            <MessageSquare className="w-3 h-3" /> {t.status === 'open' ? 'Respond' : 'View'}
                          </button>
                        )}
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

      <Modal isOpen={respondModal} onClose={() => setRespondModal(false)} title="Ticket Response">
        {selectedTicket && (
          <form onSubmit={handleRespond} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg text-sm mb-4">
              <h3 className="font-medium">{selectedTicket.title}</h3>
              <p className="text-gray-600 mt-1">{selectedTicket.description}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className="input" value={responseForm.status} onChange={e => setResponseForm({ ...responseForm, status: e.target.value })}>
                <option value="open">Open</option>
                <option value="solved">Solved</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Admin Response</label>
              <textarea className="input" rows={4} required value={responseForm.response} onChange={e => setResponseForm({ ...responseForm, response: e.target.value })}></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setRespondModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Response'}</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={resetModal} onClose={() => setResetModal(false)} title="Reset Employee Password">
        {selectedTicket && (
          <form onSubmit={submitResetPassword} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg text-sm mb-4">
              <h3 className="font-medium">Reset Password for {selectedTicket.employeeId?.name}</h3>
              <p className="text-gray-600 mt-1">You can visually edit the suggested password before saving.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input type="text" className="input font-mono border-red-200 focus:ring-red-500" value={resetForm} onChange={e => setResetForm(e.target.value)} required />
              <div className="text-xs text-gray-500 mt-1">This exact password will be set via the database. It will immediately complete this ticket.</div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setResetModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Processing...' : 'Confirm Reset'}</button>
            </div>
          </form>
        )}
      </Modal>
    </Layout>
  );
}
