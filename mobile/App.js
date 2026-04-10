import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import TrayDetailScreen from './src/screens/TrayDetailScreen';
import AddLaptopScreen from './src/screens/AddLaptopScreen';
import AssignLaptopScreen from './src/screens/AssignLaptopScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1e3a5f' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' }
      }}
    >
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Laptop WMS' }} />
          <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ title: 'Scan QR Code' }} />
          <Stack.Screen name="TrayDetail" component={TrayDetailScreen} options={{ title: 'Tray Details' }} />
          <Stack.Screen name="AddLaptop" component={AddLaptopScreen} options={{ title: 'Add Laptop' }} />
          <Stack.Screen name="AssignLaptop" component={AssignLaptopScreen} options={{ title: 'Assign Laptop' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
        <Toast />
      </NavigationContainer>
    </AuthProvider>
  );
}
