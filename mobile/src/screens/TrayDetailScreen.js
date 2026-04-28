import { trayAPI, assignmentAPI } from '../api';
import Toast from 'react-native-toast-message';

const StatusChip = ({ status }) => {
  const colors = {
    free: { bg: '#dcfce7', text: '#166534' },
    occupied: { bg: '#dbeafe', text: '#1e40af' },
    maintenance: { bg: '#fef9c3', text: '#854d0e' },
    available: { bg: '#dcfce7', text: '#166534' },
    assigned: { bg: '#dbeafe', text: '#1e40af' },
    reserved: { bg: '#fef9c3', text: '#854d0e' }
  };
  const c = colors[status] || { bg: '#f1f5f9', text: '#475569' };
  return <Text style={[styles.chip, { backgroundColor: c.bg, color: c.text }]}>{status}</Text>;
};

const InfoRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || '—'}</Text>
  </View>
);

export default function TrayDetailScreen({ navigation, route }) {
  const { tray } = route.params;
  const [currentTray, setCurrentTray] = React.useState(tray);
  const laptop = currentTray.laptop;

  const handleFulfill = async () => {
    try {
      await assignmentAPI.fulfill({ laptopId: laptop._id });
      Toast.show({ type: 'success', text1: 'Assignment Completed!', text2: 'The laptop is now officially assigned.' });
      
      // Refresh tray data
      const response = await trayAPI.get(currentTray._id);
      setCurrentTray(response.data.data);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Fulfillment Failed', text2: err.response?.data?.message || 'Try again' });
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Tray Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Tray Information</Text>
          <StatusChip status={currentTray.status} />
        </View>
        <InfoRow label="Tray Number" value={currentTray.trayNumber} />
        <InfoRow label="Rack" value={currentTray.rackId?.rackNumber} />
        <InfoRow label="Rack Status" value={currentTray.rackId?.status} />
        <InfoRow label="Location" value={currentTray.rackId?.location} />
      </View>

      {/* Laptop or Add */}
      {laptop ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Laptop in Tray</Text>
            <StatusChip status={laptop.status} />
          </View>
          <InfoRow label="Model" value={laptop.model} />
          <InfoRow label="RAM" value={laptop.ram} />
          <InfoRow label="Storage" value={laptop.storage} />
          <InfoRow label="Serial #" value={laptop.serialNumber} />
          <InfoRow label="Vendor" value={laptop.vendor} />

          <View style={styles.btnGroup}>
            {laptop.status === 'reserved' && (
              <TouchableOpacity
                style={styles.fulfillBtn}
                onPress={handleFulfill}
              >
                <Text style={styles.fulfillBtnText}>Complete Assignment</Text>
              </TouchableOpacity>
            )}
            {laptop.status === 'available' && (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => navigation.navigate('AssignLaptop', { laptop, tray: currentTray })}
              >
                <Text style={styles.primaryBtnText}>Assign to Employee</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('AddLaptop', { tray: currentTray, laptop })}
            >
              <Text style={styles.secondaryBtnText}>Edit Laptop Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>Tray is Empty</Text>
          <Text style={styles.emptyText}>No laptop currently stored here.</Text>
          {tray.status !== 'maintenance' ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('AddLaptop', { tray })}
            >
              <Text style={styles.primaryBtnText}>Add Laptop to Tray</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.maintenanceNote}>⚠️ Tray is under maintenance</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  label: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  value: { fontSize: 13, color: '#1e293b', fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 12 },
  btnGroup: { marginTop: 16, gap: 10 },
  primaryBtn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  fulfillBtn: { backgroundColor: '#10b981', borderRadius: 12, padding: 14, alignItems: 'center' },
  fulfillBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  secondaryBtn: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, alignItems: 'center' },
  secondaryBtnText: { color: '#1e293b', fontWeight: '600', fontSize: 15 },
  emptyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 14 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 6 },
  emptyText: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  maintenanceNote: { color: '#d97706', fontWeight: '600', fontSize: 14 }
});
