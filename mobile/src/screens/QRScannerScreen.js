import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { trayAPI } from '../api';
import Toast from 'react-native-toast-message';

export default function QRScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!permission) requestPermission();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    try {
      const response = await trayAPI.getByQR(data);
      navigation.replace('TrayDetail', { tray: response.data.data });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'QR not recognized', text2: err.response?.data?.message || 'Try again' });
      setTimeout(() => setScanned(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (!permission) return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
  if (!permission.granted) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>Camera permission denied</Text>
      <TouchableOpacity onPress={requestPermission} style={styles.retryBtn}>
        <Text style={styles.retryText}>Grant Permission</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <View style={styles.topOverlay} />
        <View style={styles.middle}>
          <View style={styles.sideOverlay} />
          <View style={styles.scanBox}>
            {loading && <ActivityIndicator color="#fff" size="large" />}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={styles.sideOverlay} />
        </View>
        <View style={styles.bottomOverlay}>
          <Text style={styles.hint}>Point camera at tray QR code</Text>
          {scanned && !loading && (
            <TouchableOpacity style={styles.retryBtn} onPress={() => setScanned(false)}>
              <Text style={styles.retryText}>Tap to scan again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const BOX = 250;
const CORNER = 24;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#ef4444', fontSize: 16 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center' },
  topOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  middle: { flexDirection: 'row', height: BOX },
  sideOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  scanBox: { width: BOX, height: BOX, justifyContent: 'center', alignItems: 'center', borderColor: 'rgba(255,255,255,0.3)', borderWidth: 1 },
  bottomOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', paddingTop: 20 },
  hint: { color: '#fff', fontSize: 15, opacity: 0.8 },
  retryBtn: { marginTop: 16, backgroundColor: '#2563eb', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontWeight: 'bold' },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: '#2563eb', borderWidth: 3 },
  topLeft: { top: -1, left: -1, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: -1, right: -1, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: -1, left: -1, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: -1, right: -1, borderLeftWidth: 0, borderTopWidth: 0 }
});
