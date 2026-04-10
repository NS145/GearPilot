import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import { StatusBadge, LoadingOverlay, Pagination, EmptyState } from '../../components/common';
import { laptopAPI, rackAPI, trayAPI, employeeAPI } from '../../api';
import { format } from 'date-fns';
import { SlidersHorizontal, Server, Grid, Laptop, ClipboardCheck } from 'lucide-react';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function AdminDashboard() {
  const [rows, setRows]           = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({ status:'', model:'', rackNumber:'', trayNumber:'', page:1 });
  const [stats, setStats]         = useState({ racks:0, trays:0, laptops:0, employees:0 });
  const [dist, setDist]           = useState([]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await laptopAPI.getDashboard(params);
      setRows(data.data);
      setPagination(data.pagination);
      
      // Calculate distribution for chart
      const counts = data.data.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, { available: 0, assigned: 0, maintenance: 0 });
      setDist([
        { name: 'Available', value: counts.available, color: '#10b981' },
        { name: 'Assigned', value: counts.assigned, color: '#3b82f6' },
        { name: 'Maintenance', value: counts.maintenance, color: '#f59e0b' },
      ]);
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
      {/* Stats & Analytics */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="grid grid-cols-2 gap-4 flex-1">
          {statCards.map(({ label, value, color, glow, Icon }) => (
            <div key={label} className="card card-hover relative overflow-hidden p-5 flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none" style={{ background:`radial-gradient(circle at top right, ${glow}, transparent)` }}/>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center rounded-xl" style={{ width:36,height:36,background:glow,border:`1px solid ${color}30`,color }}>
                  <Icon className="w-4 h-4"/>
                </div>
                <span style={{ fontSize:10, color:'#475569', textTransform:'uppercase', letterSpacing:'1px', fontWeight:600 }}>{label}</span>
              </div>
              <div style={{ fontSize:32, fontWeight:800, color:'#1c1c1e', lineHeight:1 }}>{value}</div>
            </div>
          ))}
        </div>
        
        <div className="card p-5 lg:w-80 flex flex-col">
          <span className="mb-4" style={{ fontSize:10, color:'#475569', textTransform:'uppercase', letterSpacing:'1px', fontWeight:600 }}>Fleet Health Distribution</span>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dist} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value">
                  {dist.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-2 px-2">
            {dist.map(d => (
              <div key={d.name} className="flex flex-col items-center">
                <span style={{ fontSize:16, fontWeight:700, color:d.color }}>{d.value}</span>
                <span style={{ fontSize:8, textTransform:'uppercase', color:'#64748b' }}>{d.name.slice(0,4)}</span>
              </div>
            ))}
          </div>
        </div>
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
