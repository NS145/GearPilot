// Service Dashboard.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { StatusBadge, LoadingOverlay, EmptyState } from '../../components/common';
import { assignmentAPI } from '../../api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { CheckCircle, ArrowRightLeft, Clock } from 'lucide-react';

export default function ServiceDashboard() {
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resPending, resActive] = await Promise.all([
        assignmentAPI.getAll({ status: 'requested', limit: 50 }),
        assignmentAPI.getAll({ status: 'active', limit: 50 })
      ]);
      setPending(resPending.data.data);
      setActive(resActive.data.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFulfill = async (a) => {
    setProcessing(a._id);
    try {
      await assignmentAPI.fulfill({ laptopId: a.laptopId?._id });
      toast.success('Assignment Completed!');
      fetchData();
    } catch (err) {
      console.error('Fulfillment error:', err);
      const msg = err.response?.data?.message || err.message || 'Fulfillment failed';
      toast.error(msg);
    } finally { setProcessing(null); }
  };

  const handleReturn = async (a) => {
    setProcessing(a._id);
    try {
      await assignmentAPI.return({ assignmentId: a._id });
      toast.success('Laptop returned to inventory');
      fetchData();
    } catch (err) {
      toast.error('Return failed');
    } finally { setProcessing(null); }
  };

  return (
    <Layout title="Operations Center">
      <div className="space-y-8">
        {/* PENDING REQUESTS SECTION */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-800">Pending Fulfillment</h2>
            <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-bold">{pending.length}</span>
          </div>
          
          <div className="card overflow-hidden p-0 border-orange-100">
            {loading ? <LoadingOverlay /> : pending.length === 0 ? <EmptyState message="No pending requests to fulfill" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-orange-50/50 border-b border-orange-100">
                    <tr>{['Laptop', 'Employee', 'Requested Date', 'Action'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-orange-700 uppercase tracking-wide">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pending.map(a => (
                      <tr key={a._id} className="hover:bg-orange-50/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{a.laptopId?.model}</div>
                          <div className="text-[10px] text-gray-400 font-mono uppercase">{a.laptopId?.serialNumber}</div>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-700">{a.employeeId?.name}</td>
                        <td className="px-4 py-3 text-gray-500 italic">{format(new Date(a.assignedDate), 'dd MMM, HH:mm')}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleFulfill(a)}
                            disabled={processing === a._id}
                            className="btn-primary py-1.5 px-4 text-xs flex items-center gap-2 shadow-sm"
                          >
                            {processing === a._id ? 'Applying...' : <><CheckCircle className="w-3.5 h-3.5" /> Apply & Assign</>}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ACTIVE ASSIGNMENTS SECTION */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ArrowRightLeft className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-gray-800">Active Assignments</h2>
          </div>
          
          <div className="card overflow-hidden p-0 border-gray-100">
            {loading ? <LoadingOverlay /> : active.length === 0 ? <EmptyState message="No active assignments" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>{['Laptop', 'Employee', 'Department', 'Assigned On', 'Action'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {active.map(a => (
                      <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">{a.laptopId?.model}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{a.laptopId?.serialNumber}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{a.employeeId?.name}</td>
                        <td className="px-4 py-3 text-gray-500">{a.employeeId?.department}</td>
                        <td className="px-4 py-3 text-gray-500">{format(new Date(a.assignedDate), 'dd MMM yyyy')}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleReturn(a)}
                            disabled={processing === a._id}
                            className="btn-secondary py-1.5 px-4 text-xs font-semibold"
                          >
                            {processing === a._id ? 'Processing...' : 'Return'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
