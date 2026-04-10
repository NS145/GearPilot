// Service Dashboard.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { StatusBadge, LoadingOverlay, EmptyState } from '../../components/common';
import { assignmentAPI } from '../../api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ServiceDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(null);

  const fetchActive = async () => {
    setLoading(true);
    try {
      const { data } = await assignmentAPI.getAll({ status: 'active', limit: 50 });
      setAssignments(data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchActive(); }, []);

  const handleReturn = async (assignment) => {
    setReturning(assignment._id);
    try {
      await assignmentAPI.return({ assignmentId: assignment._id });
      toast.success('Laptop returned');
      fetchActive();
    } finally { setReturning(null); }
  };

  return (
    <Layout title="Active Assignments">
      <div className="card overflow-hidden p-0">
        {loading ? <LoadingOverlay /> : assignments.length === 0 ? <EmptyState message="No active assignments" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Laptop', 'Employee', 'Dept', 'Assigned Date', 'Status', 'Action'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignments.map(a => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{a.laptopId?.model}</div>
                      <div className="text-xs text-gray-400 font-mono">{a.laptopId?.serialNumber}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">{a.employeeId?.name}</td>
                    <td className="px-4 py-3 text-gray-500">{a.employeeId?.department}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{format(new Date(a.assignedDate), 'dd MMM yyyy')}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleReturn(a)}
                        disabled={returning === a._id}
                        className="text-xs btn-secondary py-1 px-3"
                      >
                        {returning === a._id ? 'Processing...' : 'Return'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
