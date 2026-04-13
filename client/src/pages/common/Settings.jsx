import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { useAuth } from '../../context/AuthContext';
import { Camera, Moon, Sun, Monitor, Bell, Shield, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../api';

export default function Settings() {
  const { user, login } = useAuth();
  
  // States
  const [profilePhoto, setProfilePhoto] = useState(user?.avatarUrl || '');
  const [name, setName] = useState(user?.name || '');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Basic dark mode toggler across the app based on document class
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Image must be under 2MB');
    
    const reader = new FileReader();
    reader.onload = () => setProfilePhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // In a real app we'd upload the photo file. Here we just take a URL or fake it to reflect state.
      const { data } = await authAPI.updateMe({ name, avatarUrl: profilePhoto });
      if (data?.user) {
        const updatedUser = { ...user, name: data.user.name, avatarUrl: data.user.avatarUrl };
        localStorage.setItem('wms_user', JSON.stringify(updatedUser));
      }
      toast.success('Profile updated successfully!');
      window.location.reload();
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    toast.success('Preferences saved!');
  };

  return (
    <Layout title="Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Profile Settings */}
        <div className="card">
          <div className="mb-6 border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><UserIcon className="w-5 h-5 text-red-500" /> Public Profile</h2>
            <p className="text-sm text-gray-500">Manage your profile picture and personal details.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-red-200 overflow-hidden relative">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl text-gray-300 font-bold">{name?.[0]}</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Upload Profile Photo</label>
                <input type="file" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" onChange={handlePhotoUpload} />
                <p className="text-xs text-gray-500">Pick an image from your computer (Max 2MB).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Full Name</label>
                <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email Address (Read Only)</label>
                <input type="email" className="input bg-gray-50 text-gray-500 cursor-not-allowed" value={user?.email || ''} readOnly />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary px-6">{saving ? 'Saving...' : 'Save Profile'}</button>
            </div>
          </form>
        </div>

        {/* Preferences */}
        <div className="card">
          <div className="mb-6 border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Monitor className="w-5 h-5 text-blue-500" /> Preferences</h2>
            <p className="text-sm text-gray-500">Customize your visual and functional experience.</p>
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-3 block">Theme Mode</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setTheme('light')} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${theme === 'light' ? 'bg-red-50 border-red-200 text-red-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  <Sun className="w-4 h-4" /> Light
                </button>
                <button type="button" onClick={() => setTheme('dark')} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  <Moon className="w-4 h-4" /> Dark
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block flex items-center gap-2"><Bell className="w-4 h-4 text-gray-400" /> Notifications</label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`relative w-10 h-5 rounded-full transition-colors ${notifications ? 'bg-red-500' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <input type="checkbox" className="hidden" checked={notifications} onChange={() => setNotifications(!notifications)} />
                <span className="text-sm text-gray-700">Enable email and dashboard notifications</span>
              </label>
            </div>

            <div className="flex justify-end border-t pt-4">
              <button type="submit" className="btn-secondary px-6">Save Preferences</button>
            </div>
          </form>
        </div>

      </div>
    </Layout>
  );
}

// Inline UserIcon to avoid heavy extra imports if missing
function UserIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
