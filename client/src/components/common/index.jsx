import React from 'react';
import { X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

/* ── Status Pill ── */
const PILL_MAP = {
  active:      'pill pill-green',
  available:   'pill pill-green',
  free:        'pill pill-green',
  requested:   'pill pill-amber',
  assigned:    'pill pill-green',
  occupied:    'pill pill-green',
  maintenance: 'pill pill-amber',
  returned:    'pill pill-red',
  exited:      'pill pill-red',
};
const DOT_MAP = {
  active:'dot-green', available:'dot-green', free:'dot-green',
  requested:'dot-amber',
  assigned:'dot-green', occupied:'dot-green',
  maintenance:'dot-amber', returned:'dot-red', exited:'dot-red',
};
export function StatusBadge({ status }) {
  const label = status === 'active' ? 'ASSIGNED' : status;
  return (
    <span className={PILL_MAP[status] || 'pill pill-slate'} style={{ textTransform: 'uppercase' }}>
      <span className={`status-dot ${DOT_MAP[status] || 'dot-slate'}`}/>
      {label}
    </span>
  );
}

/* ── Modal ── */
export function Modal({ isOpen, onClose, title, children, size='md' }) {
  if (!isOpen) return null;
  const sizes = { sm:'max-w-sm', md:'max-w-md', lg:'max-w-2xl', xl:'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:'rgba(0,0,0,.75)', backdropFilter:'blur(8px)' }}>
      <div className={`w-full ${sizes[size]} max-h-[88vh] overflow-y-auto modal-enter`}
        style={{ background:'#ffffff', border:'1px solid rgba(137,113,100,.15)', borderRadius:18, padding:28, boxShadow:'0 32px 80px rgba(0,0,0,.6)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontSize:18, fontWeight:700, color:'#1c1c1e', letterSpacing:'-0.3px' }}>{title}</h2>
          <button onClick={onClose} className="flex items-center justify-center rounded-lg" style={{ width:28,height:28,background:'#f5f3f7',border:'none',color:'#64748b',cursor:'pointer' }}>
            <X className="w-4 h-4"/>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Spinner ── */
export function Spinner({ size='md' }) {
  const s = { sm:'w-3.5 h-3.5', md:'w-5 h-5', lg:'w-8 h-8' };
  return <Loader2 className={`${s[size]} animate-spin`} style={{ color:'#0ea5e9' }}/>;
}

/* ── Loading Overlay ── */
export function LoadingOverlay() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Spinner size="lg"/>
      <span style={{ fontSize:11, color:'#334155', letterSpacing:'1px', textTransform:'uppercase' }}>Loading...</span>
    </div>
  );
}

/* ── Confirm Dialog ── */
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p style={{ color:'#64748b', fontSize:13, marginBottom:20, lineHeight:1.6 }}>{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="btn-danger flex items-center gap-2">
          {loading && <Spinner size="sm"/>} Delete
        </button>
      </div>
    </Modal>
  );
}

/* ── Pagination ── */
export function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total, limit } = pagination;
  return (
    <div className="flex items-center justify-between" style={{ fontSize:11, color:'#475569' }}>
      <span>Showing {(page-1)*limit+1}–{Math.min(page*limit,total)} of <strong style={{ color:'#64748b' }}>{total}</strong></span>
      <div className="flex gap-1.5 items-center">
        <button onClick={()=>onChange(page-1)} disabled={page===1}
          className="flex items-center justify-center rounded-lg transition-all" style={{ width:28,height:28,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',color: page===1 ? '#1e3a5f' : '#64748b',cursor: page===1 ? 'default':'pointer' }}>
          <ChevronLeft className="w-3.5 h-3.5"/>
        </button>
        {Array.from({ length:Math.min(totalPages,5) },(_,i)=>i+1).map(p=>(
          <button key={p} onClick={()=>onChange(p)}
            style={{ width:28,height:28,borderRadius:8,border: p===page ? 'none' : '1px solid rgba(255,255,255,.07)', background: p===page ? 'linear-gradient(135deg,#0ea5e9,#6366f1)' : 'rgba(255,255,255,.04)', color: p===page ? '#fff' : '#475569', cursor:'pointer', fontSize:11, fontFamily:'inherit', fontWeight: p===page ? 700 : 400, transition:'all .15s' }}>
            {p}
          </button>
        ))}
        <button onClick={()=>onChange(page+1)} disabled={page===totalPages}
          className="flex items-center justify-center rounded-lg transition-all" style={{ width:28,height:28,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',color: page===totalPages ? '#1e3a5f' : '#64748b',cursor: page===totalPages ? 'default':'pointer' }}>
          <ChevronRight className="w-3.5 h-3.5"/>
        </button>
      </div>
    </div>
  );
}

/* ── Form Field ── */
export function FormField({ label, children }) {
  return (
    <div>
      {label && <label className="form-label">{label}</label>}
      {children}
    </div>
  );
}

/* ── Empty State ── */
export function EmptyState({ message='No data found' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div style={{ fontSize:40 }}>📭</div>
      <p style={{ color:'#334155', fontSize:13 }}>{message}</p>
    </div>
  );
}

/* ── Section Header ── */
export function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:'#1e293b' }}>{title}</h2>
      {action}
    </div>
  );
}
