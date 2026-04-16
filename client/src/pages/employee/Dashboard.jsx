import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import { ticketAPI } from '../../api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { LoadingOverlay, Modal, StatusBadge } from '../../components/common';
import { Plus } from 'lucide-react';

export default function EmployeeDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketModal, setTicketModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'hardware' });
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await ticketAPI.getMyTickets();
      setTickets(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ticketAPI.create(form);
      toast.success('Ticket submitted successfully');
      setTicketModal(false);
      setForm({ title: '', description: '', type: 'hardware' });
      fetchTickets();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="My Dashboard">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">My Tickets</h2>
        <button onClick={() => setTicketModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Raise Ticket
        </button>
      </div>

      <div className="card md:p-0 overflow-hidden">
        {loading ? <LoadingOverlay /> : tickets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No tickets found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Date</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Title</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Type</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Admin Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map(t => (
                <tr key={t._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{format(new Date(t.createdAt), 'dd MMM yyyy')}</td>
                  <td className="px-6 py-4 font-medium">{t.title}</td>
                  <td className="px-6 py-4 capitalize">{t.type}</td>
                  <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                  <td className="px-6 py-4 text-gray-600">{t.adminResponse || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={ticketModal} onClose={() => setTicketModal(false)} title="Raise a Ticket">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input className="input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="hardware">Hardware Issue</option>
              <option value="software">Software Issue</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea className="input" rows={4} required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setTicketModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Submitting...' : 'Submit Ticket'}</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
