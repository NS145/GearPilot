import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { assignmentAPI } from '../api';
import { useFocusEffect } from '@react-navigation/native';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchData = async () => {
    try {
      const [resP, resA] = await Promise.all([
        assignmentAPI.getAll({ status: 'requested', limit: 5 }),
        assignmentAPI.getAll({ status: 'active', limit: 10 })
      ]);
      setPending(resP.data.data);
      setActive(resA.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleApply = async (assignment) => {
    setProcessingId(assignment._id);
    try {
      await assignmentAPI.fulfill({ employeeId: assignment.employeeId?._id });
      Alert.alert('Success', 'Assignment Applied & Completed!');
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Fulfillment failed');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name} 👋</Text>
          <Text style={styles.role}>{user?.role} team</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('QRScanner')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Text style={styles.actionIcon}>📷</Text>
            <View>
              <Text style={styles.actionTitle}>Scan Tray QR</Text>
              <Text style={styles.actionSub}>Quick fulfill via physical scan</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* PENDING SECTION */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#f59e0b' }]}>Pending Fulfillment ({pending.length})</Text>
        {loading ? <ActivityIndicator color="#f59e0b" /> : pending.length === 0 ? (
          <Text style={styles.empty}>No pending requests</Text>
        ) : pending.map(a => (
          <View key={a._id} style={[styles.assignCard, { borderLeftColor: '#f59e0b' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.assignModel}>{a.laptopId?.model}</Text>
                <Text style={styles.assignEmp}>{a.employeeId?.name}</Text>
                <Text style={styles.statusLabel}>REQUESTED</Text>
              </View>
              <TouchableOpacity 
                style={[styles.applyBtn, processingId === a._id && { opacity: 0.5 }]} 
                onPress={() => handleApply(a)}
                disabled={processingId === a._id}
              >
                <Text style={styles.applyBtnText}>{processingId === a._id ? '...' : 'Apply'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* ACTIVE SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assigned Laptops</Text>
        {loading ? <ActivityIndicator color="#2563eb" /> : active.length === 0 ? (
          <Text style={styles.empty}>No active assignments</Text>
        ) : active.map(a => (
          <View key={a._id} style={styles.assignCard}>
            <Text style={styles.assignModel}>{a.laptopId?.model}</Text>
            <Text style={styles.assignEmp}>{a.employeeId?.name} · {a.employeeId?.department}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <Text style={styles.assignSerial}>{a.laptopId?.serialNumber}</Text>
              <Text style={[styles.statusLabel, { color: '#10b981' }]}>ASSIGNED</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1e3a5f', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  role: { fontSize: 13, color: '#93c5fd', marginTop: 2, textTransform: 'capitalize' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  logoutText: { color: '#fff', fontSize: 13 },
  actions: { flexDirection: 'row', gap: 12, padding: 16 },
  actionCard: { flex: 1, backgroundColor: '#2563eb', borderRadius: 16, padding: 20, alignItems: 'center' },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  actionSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  section: { padding: 16, paddingTop: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  empty: { color: '#94a3b8', textAlign: 'center', padding: 20 },
  assignCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#10b981', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  assignModel: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  assignEmp: { fontSize: 12, color: '#64748b', marginTop: 2 },
  assignSerial: { fontSize: 11, color: '#94a3b8', marginTop: 2, fontFamily: 'monospace' },
  applyBtn: { backgroundColor: '#f59e0b', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  statusLabel: { fontSize: 10, fontWeight: '800', color: '#f59e0b', marginTop: 4 }
});
