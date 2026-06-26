import React, { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from './src/services/queryClient';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ToastContainer } from './src/components/ui/Toast';
import { useToastStore } from './src/state/toastStore';
import { useUserStore } from './src/state/userStore';
import { setAuthHandlers } from './src/services/api/axiosClient';

function ToastLayer() {
  const { toasts, dismiss } = useToastStore();
  return <ToastContainer toasts={toasts} onDismiss={dismiss} />;
}

function AuthBridge() {
  const { token, refreshToken, setTokens, logout } = useUserStore();
  useEffect(() => {
    setAuthHandlers(() => token, () => refreshToken, setTokens, logout);
  }, [token, refreshToken, setTokens, logout]);
  return null;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthBridge />
          <View style={{ flex: 1, backgroundColor: '#F5F2F3' }}>
            <StatusBar style="dark" />
            <ToastLayer />
            <RootNavigator />
          </View>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
