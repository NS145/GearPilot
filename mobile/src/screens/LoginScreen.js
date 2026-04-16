import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' });
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      Toast.show({ type: 'success', text1: 'Welcome back!' });
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          <Text style={styles.iconText}>💻</Text>
        </View>
        <Text style={styles.title}>Laptop WMS</Text>
        <Text style={styles.subtitle}>Service Team Portal</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.hint}>
          <Text style={styles.hintText}>service@wms.com / Service@123</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e3a5f', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 28, alignItems: 'center' },
  iconWrapper: { backgroundColor: '#2563eb', borderRadius: 16, padding: 16, marginBottom: 12 },
  iconText: { fontSize: 32 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  form: { width: '100%' },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 16, backgroundColor: '#f9fafb' },
  button: { backgroundColor: '#2563eb', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  hint: { marginTop: 16, backgroundColor: '#f1f5f9', borderRadius: 8, padding: 10 },
  hintText: { fontSize: 12, color: '#64748b', textAlign: 'center' }
});
