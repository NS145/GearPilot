import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { assignmentAPI, employeeAPI, authAPI } from '../../api';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle } from 'lucide-react';

export default function ServiceAssign() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ employeeId: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data: me } = await authAPI.getMe();
      const params = { limit: 100 };
      if (me.data.role === 'service') {
        params.hasPendingRequest = 'true';
      } else {
        params.status = 'active';
      }
      const { data } = await employeeAPI.getAll(params);
      setEmployees(data.data);
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setResult(null);
    try {
      const { data } = await assignmentAPI.assign(form);
      toast.success('Laptop assigned!');
      setResult(data);
      setForm({ employeeId: '', notes: '' });
    } finally { setSaving(false); }
  };

  return (
    <Layout title="Assign Laptop">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-1">Smart Assignment</h2>
          <p className="text-sm text-gray-500 mb-4">
            The system auto-selects the best laptop:<br />
            <strong>Priority 1:</strong> Most recently returned laptop<br />
            <strong>Priority 2:</strong> Oldest purchase date (if no returns available)
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Employee *</label>
              <select className="input" value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))} required>
                <option value="">Select employee...</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId}) — {emp.department}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Assigning...</> : 'Assign Laptop'}
            </button>
          </form>
        </div>

        {result && (
          <div className="card border-green-200 bg-green-50">
            <div className="flex items-center gap-2 mb-3 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Assignment Successful</span>
            </div>
            <div className="text-sm text-green-800 space-y-1">
              <p><strong>Employee:</strong> {result.data.employee.name}</p>
              <p><strong>Laptop:</strong> {result.data.laptop.model}</p>
              <p><strong>Serial:</strong> {result.data.laptop.serialNumber}</p>
              <p className="text-xs text-green-600 mt-2 italic">{result.message}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
