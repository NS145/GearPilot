import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import { Modal, StatusBadge, LoadingOverlay, Pagination, EmptyState, ConfirmDialog } from '../../components/common';
import { trayAPI, rackAPI } from '../../api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, QrCode as QrIcon, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const INIT = { trayNumber: '', rackId: '', status: 'free', notes: '' };

export default function AdminTrays() {
  const [trays, setTrays] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [racks, setRacks] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INIT);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);


  const fetchTrays = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await trayAPI.getAll({ page, limit: 20 });
      setTrays(data.data);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchTrays(); }, [fetchTrays]);
  useEffect(() => {
    rackAPI.getAll({ limit: 100 }).then(({ data }) => setRacks(data.data));
  }, []);

  const openCreate = () => { setEditing(null); setForm(INIT); setModal(true); };
  const openEdit = (t) => { setEditing(t); setForm({ trayNumber: t.trayNumber, rackId: t.rackId?._id || '', status: t.status, notes: t.notes || '' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await trayAPI.update(editing._id, form); toast.success('Updated'); }
      else { await trayAPI.create(form); toast.success('Created'); }
      setModal(false);
      fetchTrays();
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await trayAPI.delete(deleteTarget._id);
      toast.success('Deleted');
      setDeleteTarget(null);
      fetchTrays();
    } finally { setDeleting(false); }
  };

  const downloadQR = (t) => {
    const canvas = document.getElementById(`qr-gen-${t._id}`);
    if (!canvas) return;
    
    // Create a new high-quality canvas for the final labeled image
    const finalCanvas = document.createElement('canvas');
    const ctx = finalCanvas.getContext('2d');
    finalCanvas.width = 300;
    finalCanvas.height = 360; // Extra space for labels
    
    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    
    // Draw the QR code
    ctx.drawImage(canvas, 25, 20, 250, 250);
    
    // Add Labels
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText(`TRAY: ${t.trayNumber}`, 150, 300);
    
    ctx.font = '16px Inter, sans-serif';
    ctx.fillStyle = '#666666';
    ctx.fillText(`RACK: ${t.rackId?.rackNumber || 'N/A'}`, 150, 330);
    
    const pngUrl = finalCanvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_Tray_${t.trayNumber}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    toast.success(`Downloading QR for ${t.trayNumber}`);
  };

  return (
    <Layout title="Trays">
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Tray</button>
      </div>
      
      {/* Hidden QR Generators */}
      <div className="hidden">
        {trays.map(t => (
          <QRCodeCanvas 
            key={t._id} 
            id={`qr-gen-${t._id}`} 
            value={t._id} 
            size={512} 
            level="H" 
            includeMargin={true} 
          />
        ))}
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          {loading ? <LoadingOverlay /> : trays.length === 0 ? <EmptyState /> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Tray #', 'Rack', 'Rack Status', 'Tray Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trays.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{t.trayNumber}</td>
                    <td className="px-4 py-3">{t.rackId?.rackNumber}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.rackId?.status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>

                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => downloadQR(t)} className="text-purple-600 p-1 hover:bg-purple-50 rounded" title="Download QR Code"><QrIcon className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(t)} className="text-blue-600 p-1"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(t)} className="text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {pagination && <div className="px-6 py-4 border-t"><Pagination pagination={pagination} onChange={setPage} /></div>}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Tray' : 'Add Tray'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tray Number *</label>
            <input className="input" value={form.trayNumber} onChange={e => setForm(p => ({ ...p, trayNumber: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rack *</label>
            <select className="input" value={form.rackId} onChange={e => setForm(p => ({ ...p, rackId: e.target.value }))} required>
              <option value="">Select rack...</option>
              {racks.map(r => <option key={r._id} value={r._id}>{r.rackNumber} — {r.location}</option>)}
            </select>
          </div>
          {editing && (
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option value="free">Free</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>



      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete Tray" message={`Delete tray "${deleteTarget?.trayNumber}"?`} />
    </Layout>
  );
}
