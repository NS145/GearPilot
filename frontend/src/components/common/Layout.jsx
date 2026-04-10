import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Server, Grid, Monitor, Users, ClipboardList, Activity, LogOut, Menu, Bell, ChevronRight, Laptop } from 'lucide-react';

const adminNav = [
  { path:'/admin',             label:'Dashboard',   Icon:LayoutDashboard },
  { path:'/admin/racks',       label:'Racks',        Icon:Server },
  { path:'/admin/trays',       label:'Trays',        Icon:Grid },
  { path:'/admin/laptops',     label:'Laptops',      Icon:Laptop },
  { path:'/admin/employees',   label:'Employees',    Icon:Users },
  { path:'/admin/assignments', label:'Assignments',  Icon:ClipboardList },
  { path:'/admin/activity',    label:'Activity Log', Icon:Activity },
];
const serviceNav = [
  { path:'/service',            label:'Dashboard',   Icon:LayoutDashboard },
  { path:'/service/trays',      label:'Tray View',   Icon:Grid },
  { path:'/service/assign',     label:'Assign',      Icon:ClipboardList },
];

export default function Layout({ children, title }) {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate  = useNavigate();
  const nav = isAdmin ? adminNav : serviceNav;

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
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:800, color:'#1c1c1e', letterSpacing:'-0.3px' }}>GearPilot</div>
            <div style={{ fontSize:9, color:'#8e8e93', letterSpacing:'1.5px', textTransform:'uppercase' }}>Tracking System</div>
          </div>
        </div>

        {/* Role badge */}
        <div className="relative mx-3 mt-3 mb-1 px-3 py-2 rounded-xl" style={{ background: isAdmin ? 'rgba(220,38,38,.06)' : 'rgba(142,142,147,.06)', border:`1px solid ${isAdmin ? 'rgba(220,38,38,.1)' : 'rgba(142,142,147,.1)'}` }}>
          <div style={{ fontSize:9, color:'#8e8e93', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:2 }}>Signed in as</div>
          <div style={{ fontSize:12, color: isAdmin ? '#dc2626' : '#56516a', fontWeight:700 }}>{user?.name}</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-2 overflow-y-auto space-y-0.5 relative">
          {nav.map(({ path, label, Icon }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} onClick={()=>setOpen(false)}
                className={`nav-item ${active?'active':''}`}>
                <Icon className="w-3.5 h-3.5 flex-shrink-0"/>
                <span>{label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background:'#dc2626', boxShadow:'0 0 6px rgba(220,38,38,.4)' }}/>}
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
              <div style={{ fontSize:9, color:'#8e8e93', letterSpacing:'2px', textTransform:'uppercase' }}>GearPilot — Laptop Tracking System</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative flex items-center justify-center rounded-xl" style={{ width:36,height:36,background:'#f5f3f7',border:'1px solid rgba(137,113,100,.1)',color:'#7a7588',cursor:'pointer' }}>
              <Bell className="w-4 h-4"/>
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background:'#ef4444', boxShadow:'0 0 6px #ef4444' }}/>
            </button>
            <div className="w-px h-7" style={{ background:'rgba(137,113,100,.1)' }}/>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center rounded-xl text-white text-xs font-bold" style={{ width:32,height:32,background:'linear-gradient(135deg,#dc2626,#ef4444)' }}>
                {user?.name?.[0]}
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
    </div>
  );
}
