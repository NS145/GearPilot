import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { assignmentAPI } from '../api';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assignmentAPI.getAll({ status: 'active', limit: 10 }).then(({ data }) => {
      setAssignments(data.data);
    }).finally(() => setLoading(false));
  }, []);

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
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={styles.actionTitle}>Scan QR</Text>
          <Text style={styles.actionSub}>Scan tray QR code</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#7c3aed' }]} onPress={() => navigation.navigate('AssignLaptop')}>
          <Text style={styles.actionIcon}>🔗</Text>
          <Text style={styles.actionTitle}>Assign</Text>
          <Text style={styles.actionSub}>Assign to employee</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Active Assignments</Text>
        {loading ? <ActivityIndicator color="#2563eb" style={{ marginTop: 20 }} /> : assignments.length === 0 ? (
          <Text style={styles.empty}>No active assignments</Text>
        ) : assignments.map(a => (
          <View key={a._id} style={styles.assignCard}>
            <Text style={styles.assignModel}>{a.laptopId?.model}</Text>
            <Text style={styles.assignEmp}>{a.employeeId?.name} · {a.employeeId?.department}</Text>
            <Text style={styles.assignSerial}>{a.laptopId?.serialNumber}</Text>
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
  section: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  empty: { color: '#94a3b8', textAlign: 'center', padding: 20 },
  assignCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#2563eb', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  assignModel: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  assignEmp: { fontSize: 12, color: '#64748b', marginTop: 2 },
  assignSerial: { fontSize: 11, color: '#94a3b8', marginTop: 2, fontFamily: 'monospace' }
});
