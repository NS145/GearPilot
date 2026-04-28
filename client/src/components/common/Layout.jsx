import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Server, Grid, Monitor, Users, ClipboardList, Activity, LogOut, Menu, Bell, ChevronRight, Laptop, Ticket, Settings as SettingsIcon } from 'lucide-react';
import ChatBot from './ChatBot';

const adminNav = [
  { path:'/admin',             label:'Dashboard',   Icon:LayoutDashboard },
  { path:'/admin/racks',       label:'Racks',        Icon:Server },
  { path:'/admin/trays',       label:'Trays',        Icon:Grid },
  { path:'/admin/laptops',     label:'Laptops',      Icon:Laptop },
  { path:'/admin/employees',   label:'Employees',    Icon:Users },
  { path:'/admin/assignments', label:'Assignments',  Icon:ClipboardList },
  { path:'/admin/activity',    label:'Activity Log', Icon:Activity },
  { path:'/admin/tickets',     label:'Tickets',      Icon:Ticket },
  { path:'/settings',          label:'Settings',     Icon:SettingsIcon },
];
const serviceNav = [
  { path:'/service',            label:'Dashboard',   Icon:LayoutDashboard },
  { path:'/service/trays',      label:'Tray View',   Icon:Grid },
  { path:'/settings',           label:'Settings',    Icon:SettingsIcon },
];
const employeeNav = [
  { path:'/employee',           label:'Dashboard',   Icon:LayoutDashboard },
  { path:'/settings',           label:'Settings',    Icon:SettingsIcon },
];

export default function Layout({ children, title }) {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [hasOpenTickets, setHasOpenTickets] = useState(false);
  const location = useLocation();
  const navigate  = useNavigate();
  const nav = user?.role === 'employee' ? employeeNav : (isAdmin ? adminNav : serviceNav);

  React.useEffect(() => {
    if (isAdmin) {
      const checkTickets = async () => {
        try {
          const { ticketAPI } = await import('../../api');
          const { data } = await ticketAPI.getAll({ limit: 1, status: 'open' });
          if (data && data.data && data.data.length > 0) {
            setHasOpenTickets(true);
          } else {
            setHasOpenTickets(false);
          }
        } catch { /* ignore */ }
      };
      checkTickets();
      // Poll every 30s
      const interval = setInterval(checkTickets, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'#f9f9fa', fontFamily:"var(--font-display)" }}>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden backdrop-blur-sm" onClick={()=>setOpen(false)}/>}

      {/* ── Sidebar ── */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-56 flex flex-col transform transition-transform duration-200 ${open?'translate-x-0':'-translate-x-full'} lg:translate-x-0`}
        style={{ background:'#ffffff', borderRight:'1px solid rgba(137,113,100,.2)', position:'relative', boxShadow:'2px 0 8px rgba(56,51,71,.04)' }}>
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-bg pointer-events-none opacity-40"/>

        <div className="relative flex items-center gap-3 px-5 py-5" style={{ borderBottom:'1px solid rgba(137,113,100,.15)' }}>
          <Link to="/" className="text-left w-full focus:outline-none flex-1 hover:opacity-80 transition-opacity block">
            <div style={{ fontSize:16, fontWeight:800, color:'#1c1c1e', letterSpacing:'-0.3px' }} className="dark:text-white">GearPilot</div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-2 overflow-y-auto space-y-0.5 relative">
          {nav.map(({ path, label, Icon }) => {
            const active = location.pathname === path;
            const isTicketGlow = label === 'Tickets' && hasOpenTickets;
            return (
              <Link key={path} to={path} onClick={()=>setOpen(false)}
                className={`nav-item ${active?'active':''} ${isTicketGlow ? 'bg-red-50 text-red-600 font-semibold' : ''}`}
                style={{ position: 'relative' }}>
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isTicketGlow ? 'text-red-500' : ''}`}/>
                <span>{label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background:'#dc2626', boxShadow:'0 0 6px rgba(220,38,38,.4)' }}/>}
                {isTicketGlow && !active && (
                   <div className="absolute right-3 w-2 h-2 rounded-full bg-red-500 animate-ping"/>
                )}
                {isTicketGlow && !active && (
                   <div className="absolute right-3 w-2 h-2 rounded-full bg-red-500"/>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="relative px-2.5 py-3" style={{ borderTop:'1px solid rgba(137,113,100,.15)' }}>
          <button onClick={handleLogout} className="nav-item">
            <LogOut className="w-3.5 h-3.5"/>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 flex-shrink-0" style={{ height:60, background:'#ffffff', borderBottom:'1px solid rgba(137,113,100,.18)', boxShadow:'0 2px 8px rgba(56,51,71,.05)' }}>
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={()=>setOpen(true)} style={{ background:'none', border:'none', color:'#7a7588', cursor:'pointer' }}><Menu className="w-5 h-5"/></button>
            <div>
              <div style={{ fontSize:17, fontWeight:700, color:'#1c1c1e' }}>{title}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center rounded-xl text-white text-xs font-bold overflow-hidden" style={{ width:32,height:32,background:'linear-gradient(135deg,#dc2626,#ef4444)' }}>
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : user?.name?.[0]}
              </div>
              <div style={{ lineHeight:1.4 }}>
                <div style={{ fontSize:11, color:'#1c1c1e', fontWeight:600 }}>{user?.name}</div>
                <div style={{ fontSize:9, color: isAdmin ? '#dc2626' : '#8e8e93', textTransform:'uppercase', letterSpacing:'1px' }}>{user?.role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6 relative" style={{ background:'#f5f3f7' }}>
          {/* Ambient glow */}
          <div className="fixed pointer-events-none" style={{ top:'30%',right:'8%',width:600,height:600,background:'radial-gradient(ellipse, rgba(137,113,100,.03) 0%, transparent 70%)',zIndex:0 }}/>
          <div className="relative" style={{ zIndex:1 }}>
            {children}
          </div>
        </main>
      </div>

      {user && (isAdmin || user.role === 'service') && <ChatBot />}
    </div>
  );
}
