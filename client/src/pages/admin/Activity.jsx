import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import { LoadingOverlay, Pagination, EmptyState } from '../../components/common';
import { activityAPI } from '../../api';
import { format } from 'date-fns';

const ACTION_COLORS = {
  ASSIGN_LAPTOP: 'bg-blue-100 text-blue-800',
  RETURN_LAPTOP: 'bg-green-100 text-green-800',
  CREATE_RACK: 'bg-purple-100 text-purple-800',
  DELETE_RACK: 'bg-red-100 text-red-800',
  LOGIN: 'bg-gray-100 text-gray-600',
  ADD_LAPTOP: 'bg-yellow-100 text-yellow-800'
};

export default function AdminActivity() {
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await activityAPI.getAll({ page, limit: 30 });
      setActivities(data.data);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <Layout title="Activity Log">
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          {loading ? <LoadingOverlay /> : activities.length === 0 ? <EmptyState /> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Time', 'User', 'Action', 'Entity', 'Details'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activities.map(a => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{format(new Date(a.createdAt), 'dd MMM yyyy HH:mm')}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-xs">{a.userId?.name || '—'}</div>
                      <div className="text-gray-400 text-xs capitalize">{a.userId?.role}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${ACTION_COLORS[a.action] || 'bg-gray-100 text-gray-600'}`}>{a.action}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{a.entity}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                      {a.details ? JSON.stringify(a.details).slice(0, 80) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {pagination && <div className="px-6 py-4 border-t"><Pagination pagination={pagination} onChange={setPage} /></div>}
      </div>
    </Layout>
  );
}
