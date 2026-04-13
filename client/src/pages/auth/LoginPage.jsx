import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, BarChart3, Package } from 'lucide-react';

/* ─── Premium Glassmorphism Showcase ─── */
function Showcase() {
  return (
    <div style={{ position:'relative', width:'100%', maxWidth:540, marginTop:40, height:400 }}>
      {/* Background glowing orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full" 
           style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', filter: 'blur(70px)', opacity: 0.12, animation: 'glow-pulse 4s infinite alternate' }} />
      
      {/* Floating abstract dashboard card */}
      <div className="absolute top-4 left-4 right-4 bottom-4 rounded-3xl" 
           style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(30px)', border: '1px solid rgba(220,38,38,0.6)', boxShadow: '0 32px 80px rgba(220,38,38,0.15), inset 0 2px 4px rgba(255,255,255,0.8)' }}>
        <div className="p-8 flex flex-col h-full gap-5 opacity-100">
          <div className="w-1/3 h-8 rounded-xl bg-red-100/90 border border-red-300" />
          <div className="flex gap-4">
             <div className="flex-1 h-28 rounded-2xl bg-white border border-red-200 shadow-sm flex flex-col justify-end p-4">
               <div className="w-1/2 h-4 rounded bg-red-100 mb-2"/>
               <div className="w-3/4 h-3 rounded bg-red-50"/>
             </div>
             <div className="flex-1 h-28 rounded-2xl bg-white border border-red-200 shadow-sm flex flex-col justify-end p-4">
               <div className="w-1/3 h-4 rounded bg-red-100 mb-2"/>
               <div className="w-2/3 h-3 rounded bg-red-50"/>
             </div>
          </div>
          <div className="flex-1 rounded-2xl bg-white border border-red-200 shadow-sm mt-2 p-5">
            <div className="w-full h-3 rounded-full bg-red-50 mb-4"/>
            <div className="w-full h-3 rounded-full bg-red-50 mb-4"/>
            <div className="w-2/3 h-3 rounded-full bg-red-50"/>
          </div>
        </div>
      </div>
      
      {/* Floating badge 1 */}
      <div className="absolute -right-6 top-16 rounded-2xl p-5 bg-white shadow-2xl flex items-center gap-4" style={{ border:'1px solid rgba(220,38,38,.4)', animation:'float 5s ease-in-out infinite' }}>
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
          <Package className="w-6 h-6"/>
        </div>
        <div>
          <div className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-1">Total Assets</div>
          <div className="text-2xl font-black text-gray-900 leading-none">1,248</div>
        </div>
      </div>

      {/* Floating badge 2 */}
      <div className="absolute -left-6 bottom-24 rounded-2xl p-4 bg-white shadow-xl flex items-center gap-3" style={{ border:'1px solid rgba(220,38,38,.4)', animation:'float 4s ease-in-out infinite reverse' }}>
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
          <BarChart3 className="w-5 h-5"/>
        </div>
        <div>
          <div className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-0.5">Active Flow</div>
          <div className="text-lg font-black text-gray-900 leading-none">94%</div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [role, setRole] = useState('admin');
  const [form, setForm] = useState({ email:'admin@wms.com', password:'Admin@123' });
  const [loading, setLoading] = useState(false);
  const [reqLoading, setReqLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    if (!form.email) {
      toast.error('Please enter your email to request a reset');
      return;
    }
    setReqLoading(true);
    try {
      const { ticketAPI } = await import('../../api');
      const { data } = await ticketAPI.requestReset(form.email);
      toast.success(data.message || 'Reset requested');
    } catch {
      // toast err handled by interceptor ideally
    } finally {
      setReqLoading(false);
    }
  };

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'admin') setForm({ email:'admin@wms.com', password:'Admin@123' });
    else if (selectedRole === 'service') setForm({ email:'service@wms.com', password:'Service@123' });
    else setForm({ email:'', password:'' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Welcome back!');
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'employee') navigate('/employee');
      else navigate('/service');
    } catch { /* handled by interceptor */ } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight:'100vh',
      background:'#f5f3f7',
      display:'flex',
      fontFamily:"'JetBrains Mono',monospace",
      position:'relative',
      overflow:'hidden'
    }}>
      {/* Subtle grid */}
      <div className="grid-bg absolute inset-0"/>

      {/* Ambient glows */}
      <div style={{ position:'absolute', top:'20%', left:'25%', width:500, height:400, background:'radial-gradient(ellipse, rgba(137,113,100,.05) 0%, transparent 70%)', pointerEvents:'none', animation:'glow-pulse 4s ease-in-out infinite' }}/>
      <div style={{ position:'absolute', bottom:'15%', right:'20%', width:400, height:400, background:'radial-gradient(ellipse, rgba(86,81,106,.04) 0%, transparent 70%)', pointerEvents:'none', animation:'glow-pulse 5s ease-in-out infinite reverse' }}/>

      {/* ─── LEFT: Illustration ─── */}
      <div style={{
        flex:1,
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
        padding:'40px 40px',
        position:'relative',
        zIndex:1
      }}
      className="hidden lg:flex"
      >
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:32, fontWeight:800, color:'#1c1c1e', letterSpacing:'-0.5px', textAlign:'center' }}>
            Manage Smarter.
          </div>
          <div style={{ fontSize:32, fontWeight:800, background:'linear-gradient(135deg, #dc2626, #ef4444)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', textAlign:'center' }}>
            Track Everything.
          </div>
          <div style={{ fontSize:11, color:'#8e8e93', textAlign:'center', marginTop:10, maxWidth:350, lineHeight:1.7 }}>
            Your complete laptop warehouse management solution. Track, assign, and monitor your entire fleet from one dashboard.
          </div>
        </div>

        <Showcase />
      </div>

      {/* ─── RIGHT: Login Form ─── */}
      <div style={{
        width:'100%',
        maxWidth:520,
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        padding:'40px 48px',
        position:'relative',
        zIndex:1,
        flexShrink:0,
      }}>
        <div style={{ width:'100%', maxWidth:400, animation:'fade-up .4s ease' }}>
          {/* Header */}
          <div style={{ marginBottom:32, textAlign:'center' }}>
            <div style={{ fontSize:28, fontWeight:800, color:'#1c1c1e', letterSpacing:'-0.5px', marginTop:4 }}>GearPilot</div>
            <div style={{ fontSize:10, color:'#dc2626', letterSpacing:'3px', textTransform:'uppercase', marginTop:4 }}>Laptop Tracking System</div>
          </div>

          {/* Card */}
          <div style={{ background:'#ffffff', border:'1px solid rgba(220,38,38,.12)', borderRadius:20, padding:'32px', boxShadow:'0 16px 64px rgba(28,28,30,.08), 0 1px 3px rgba(0,0,0,.04)' }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#1c1c1e', marginBottom:4 }}>Welcome back</div>
            <div style={{ fontSize:11, color:'#8e8e93', marginBottom:24 }}>Sign in to your account</div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Radio Group */}
              <div className="flex gap-2 mb-4">
                <label className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl border-2 cursor-pointer transition-all ${role === 'admin' ? 'border-red-500 bg-red-50/50' : 'border-gray-100 bg-gray-50/50 hover:bg-gray-100'}`}>
                  <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={() => handleRoleChange('admin')} className="hidden" />
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${role === 'admin' ? 'border-red-500' : 'border-gray-300'}`}>
                    {role === 'admin' && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                  </div>
                  <span className={`text-xs font-bold ${role === 'admin' ? 'text-red-700' : 'text-gray-500'}`}>Admin</span>
                </label>

                <label className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl border-2 cursor-pointer transition-all ${role === 'service' ? 'border-red-500 bg-red-50/50' : 'border-gray-100 bg-gray-50/50 hover:bg-gray-100'}`}>
                  <input type="radio" name="role" value="service" checked={role === 'service'} onChange={() => handleRoleChange('service')} className="hidden" />
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${role === 'service' ? 'border-red-500' : 'border-gray-300'}`}>
                    {role === 'service' && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                  </div>
                  <span className={`text-xs font-bold ${role === 'service' ? 'text-red-700' : 'text-gray-500'}`}>Service</span>
                </label>
                
                <label className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl border-2 cursor-pointer transition-all ${role === 'employee' ? 'border-red-500 bg-red-50/50' : 'border-gray-100 bg-gray-50/50 hover:bg-gray-100'}`}>
                  <input type="radio" name="role" value="employee" checked={role === 'employee'} onChange={() => handleRoleChange('employee')} className="hidden" />
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${role === 'employee' ? 'border-red-500' : 'border-gray-300'}`}>
                    {role === 'employee' && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                  </div>
                  <span className={`text-xs font-bold ${role === 'employee' ? 'text-red-700' : 'text-gray-500'}`}>Employee</span>
                </label>
              </div>

              <div>
                <label className="form-label">Email Address</label>
                <input className="input" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} required/>
              </div>
              <div>
                <label className="form-label">Password</label>
                <input className="input" type="password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} required/>
              </div>
              <button type="submit" className="btn-primary w-full py-3.5 mt-2" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin"/> Authenticating...</> : 'Sign In →'}
              </button>
              
              {role === 'employee' && (
                <div className="text-center mt-4">
                  <button type="button" onClick={handleForgotPassword} disabled={reqLoading} className="text-xs text-red-600 hover:text-red-700 font-semibold transition-colors">
                    {reqLoading ? 'Requesting...' : 'Forgot/Change Password?'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
