import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import { StatusBadge, LoadingOverlay, Pagination, EmptyState } from '../../components/common';
import { laptopAPI, rackAPI, trayAPI, employeeAPI } from '../../api';
import { format } from 'date-fns';
import { SlidersHorizontal, Server, Grid, Laptop, ClipboardCheck } from 'lucide-react';

export default function AdminDashboard() {
  const [rows, setRows]           = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({ status:'', model:'', rackNumber:'', trayNumber:'', page:1 });
  const [stats, setStats]         = useState({ racks:0, trays:0, laptops:0, employees:0 });

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await laptopAPI.getDashboard(params);
      setRows(data.data);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
  useEffect(() => {
    Promise.all([
      rackAPI.getAll({ limit:1 }),
      trayAPI.getAll({ limit:1 }),
      laptopAPI.getAll({ limit:1 }),
      employeeAPI.getAll({ limit:1, status:'active' }),
    ]).then(([r,t,l,e]) => setStats({ racks:r.data.pagination?.total||0, trays:t.data.pagination?.total||0, laptops:l.data.pagination?.total||0, employees:e.data.pagination?.total||0 }));
  }, []);

  const setFilter = (key, val) => setFilters(p => ({ ...p, [key]:val, page:1 }));

  const statCards = [
    { label:'Total Racks',    value:stats.racks,     color:'#0ea5e9', glow:'rgba(14,165,233,.15)',  Icon:Server },
    { label:'Trays',          value:stats.trays,     color:'#6366f1', glow:'rgba(99,102,241,.15)',  Icon:Grid },
    { label:'Laptops',        value:stats.laptops,   color:'#10b981', glow:'rgba(16,185,129,.15)',  Icon:Laptop },
    { label:'Active Assigns', value:stats.employees, color:'#f59e0b', glow:'rgba(245,158,11,.15)',  Icon:ClipboardCheck },
  ];

  return (
    <Layout title="Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, color, glow, Icon }) => (
          <div key={label} className="card card-hover relative overflow-hidden p-5">
            <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none" style={{ background:`radial-gradient(circle at top right, ${glow}, transparent)` }}/>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center rounded-xl" style={{ width:36,height:36,background:glow,border:`1px solid ${color}30`,color }}>
                <Icon className="w-4 h-4"/>
              </div>
              <span style={{ fontSize:10, color:'#475569', textTransform:'uppercase', letterSpacing:'1px', fontWeight:600 }}>{label}</span>
            </div>
            <div style={{ fontSize:36, fontWeight:800, color:'#1c1c1e', lineHeight:1 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2" style={{ color:'#475569' }}>
            <SlidersHorizontal className="w-3.5 h-3.5"/>
            <span style={{ fontSize:10, letterSpacing:'1px', textTransform:'uppercase', fontWeight:600 }}>Filters</span>
          </div>
          <input className="input" style={{ width:180 }} placeholder="Search model..." value={filters.model} onChange={e=>setFilter('model',e.target.value)}/>
          <input className="input" style={{ width:120 }} placeholder="Rack #" value={filters.rackNumber} onChange={e=>setFilter('rackNumber',e.target.value)}/>
          <input className="input" style={{ width:120 }} placeholder="Tray #" value={filters.trayNumber} onChange={e=>setFilter('trayNumber',e.target.value)}/>
          <select className="input" style={{ width:160 }} value={filters.status} onChange={e=>setFilter('status',e.target.value)}>
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="maintenance">Maintenance</option>
          </select>
          {(filters.status||filters.model||filters.rackNumber||filters.trayNumber) && (
            <button onClick={()=>setFilters({status:'',model:'',rackNumber:'',trayNumber:'',page:1})} className="btn-danger py-2 px-3 text-xs">Clear</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          {loading ? <LoadingOverlay/> : rows.length===0 ? <EmptyState/> : (
            <table className="wms-table">
              <thead>
                <tr>
                  {['Rack','Tray','Tray Status','Model','Serial #','Purchase Date','Status','Assigned To','Last Returned'].map(h=>(
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row,i) => (
                  <tr key={i}>
                    <td style={{ fontWeight:700, color:'#38bdf8', fontFamily:"'JetBrains Mono'" }}>{row.rackNumber}</td>
                    <td style={{ color:'#94a3b8', fontFamily:"'JetBrains Mono'" }}>{row.trayNumber}</td>
                    <td><StatusBadge status={row.trayStatus}/></td>
                    <td style={{ fontWeight:500, color:'#e2e8f0' }}>{row.model}</td>
                    <td style={{ color:'#475569', fontFamily:"'JetBrains Mono'", fontSize:11 }}>{row.serialNumber}</td>
                    <td style={{ color:'#64748b', whiteSpace:'nowrap' }}>{row.purchaseDate ? format(new Date(row.purchaseDate),'dd MMM yyyy') : '—'}</td>
                    <td><StatusBadge status={row.status}/></td>
                    <td style={{ color: row.assignedEmployee ? '#e2e8f0' : '#334155' }}>{row.assignedEmployee||'—'}</td>
                    <td style={{ color:'#475569', whiteSpace:'nowrap' }}>{row.lastReturnedDate ? format(new Date(row.lastReturnedDate),'dd MMM yyyy') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {pagination && (
          <div className="px-5 py-3" style={{ borderTop:'1px solid rgba(56,189,248,.06)' }}>
            <Pagination pagination={pagination} onChange={p=>setFilters(prev=>({...prev,page:p}))}/>
          </div>
        )}
      </div>
    </Layout>
  );
}
