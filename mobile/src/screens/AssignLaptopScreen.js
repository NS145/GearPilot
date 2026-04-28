import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { assignmentAPI, employeeAPI, authAPI } from '../api';
import Toast from 'react-native-toast-message';

export default function AssignLaptopScreen({ navigation, route }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);
  const laptop = route.params?.laptop;

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data: me } = await authAPI.getMe();
        const params = { limit: 100 };
        // If we have a specific laptop, we can assign to anyone (direct fulfill/assign)
        // Otherwise, use role-based filtering
        if (!laptop && me.data.role === 'service') {
          params.hasPendingRequest = 'true';
        } else {
          params.status = 'active';
        }
        const { data: empData } = await employeeAPI.getAll(params);
        setEmployees(empData.data);
        if (empData.data.length) setSelectedEmployee(empData.data[0]._id);
      } catch (err) {
        Toast.show({ type: 'error', text1: 'Failed to load employees' });
      }
    };
    fetchEmployees();
  }, [laptop]);

  const handleAssign = async () => {
    if (!selectedEmployee) {
      Toast.show({ type: 'error', text1: 'Select an employee' });
      return;
    }
    setLoading(true);
    try {
      const payload = { employeeId: selectedEmployee };
      if (laptop) payload.laptopId = laptop._id;
      
      const { data } = await assignmentAPI.assign(payload);
      setResult(data);
      Toast.show({ type: 'success', text1: 'Laptop assigned!' });
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Assignment failed' });
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Assignment Complete!</Text>
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Employee</Text>
          <Text style={styles.resultValue}>{result.data.employee.name}</Text>
          <Text style={styles.resultLabel}>Laptop</Text>
          <Text style={styles.resultValue}>{result.data.laptop.model}</Text>
          <Text style={styles.resultLabel}>Serial #</Text>
          <Text style={styles.resultValue}>{result.data.laptop.serialNumber}</Text>
          <Text style={styles.priorityNote}>{result.message}</Text>
        </View>
        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {laptop ? (
          <View style={styles.laptopFocus}>
            <Text style={styles.focusLabel}>Assigning Laptop</Text>
            <Text style={styles.focusValue}>{laptop.model}</Text>
            <Text style={styles.focusSub}>{laptop.serialNumber}</Text>
          </View>
        ) : (
          <Text style={styles.infoBox}>
            💡 The system will auto-select the best available laptop based on priority rules.
          </Text>
        )}

        <Text style={styles.label}>Select Employee *</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={selectedEmployee} onValueChange={setSelectedEmployee} style={styles.picker}>
            {employees.map(emp => (
              <Picker.Item key={emp._id} label={`${emp.name} (${emp.employeeId})`} value={emp._id} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.assignBtn} onPress={handleAssign} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.assignBtnText}>Assign Laptop</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  laptopFocus: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#2563eb' },
  focusLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  focusValue: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginTop: 4 },
  focusSub: { fontSize: 13, color: '#2563eb', fontWeight: '600', marginTop: 2 },
  infoBox: { backgroundColor: '#eff6ff', borderRadius: 10, padding: 12, fontSize: 13, color: '#1e40af', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  pickerWrapper: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, overflow: 'hidden', marginBottom: 20 },
  picker: { height: 50 },
  assignBtn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center' },
  assignBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  successContainer: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 20 },
  resultCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', marginBottom: 24 },
  resultLabel: { fontSize: 12, color: '#64748b', fontWeight: '500', marginTop: 10 },
  resultValue: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  priorityNote: { fontSize: 12, color: '#2563eb', fontStyle: 'italic', marginTop: 14, textAlign: 'center' },
  doneBtn: { backgroundColor: '#2563eb', borderRadius: 12, paddingHorizontal: 48, paddingVertical: 14 },
  doneBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
