import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { laptopAPI } from '../api';
import Toast from 'react-native-toast-message';

const Field = ({ label, value, onChange, placeholder, keyboardType = 'default', required }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}{required ? ' *' : ''}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder || label}
      keyboardType={keyboardType}
      placeholderTextColor="#94a3b8"
    />
  </View>
);

export default function AddLaptopScreen({ navigation, route }) {
  const { tray, laptop } = route.params;
  const isEdit = !!laptop;

  const [form, setForm] = useState({
    model: laptop?.model || '',
    ram: laptop?.ram || '',
    storage: laptop?.storage || '',
    serialNumber: laptop?.serialNumber || '',
    purchaseDate: laptop?.purchaseDate?.slice(0, 10) || '',
    vendor: laptop?.vendor || '',
    notes: laptop?.notes || ''
  });
  const [saving, setSaving] = useState(false);

  const set = (key) => (val) => setForm(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    if (!form.model || !form.serialNumber || !form.ram || !form.storage || !form.vendor || !form.purchaseDate) {
      Toast.show({ type: 'error', text1: 'Please fill all required fields' });
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await laptopAPI.update(laptop._id, form);
        Toast.show({ type: 'success', text1: 'Laptop updated' });
      } else {
        await laptopAPI.create({ ...form, trayId: tray._id });
        Toast.show({ type: 'success', text1: 'Laptop added to tray' });
      }
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.trayNote}>Tray: {tray.trayNumber} · Rack: {tray.rackId?.rackNumber}</Text>

        <Field label="Model" value={form.model} onChange={set('model')} required />
        <Field label="Serial Number" value={form.serialNumber} onChange={set('serialNumber')} required />
        <Field label="RAM" value={form.ram} onChange={set('ram')} placeholder="e.g. 16GB" required />
        <Field label="Storage" value={form.storage} onChange={set('storage')} placeholder="e.g. 512GB SSD" required />
        <Field label="Vendor" value={form.vendor} onChange={set('vendor')} required />
        <Field label="Purchase Date" value={form.purchaseDate} onChange={set('purchaseDate')} placeholder="YYYY-MM-DD" required />
        <Field label="Notes" value={form.notes} onChange={set('notes')} />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{isEdit ? 'Update Laptop' : 'Add Laptop'}</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  trayNote: { fontSize: 13, color: '#2563eb', fontWeight: '600', marginBottom: 16, backgroundColor: '#eff6ff', padding: 10, borderRadius: 8 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, fontSize: 15, color: '#1e293b', backgroundColor: '#f8fafc' },
  saveBtn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
