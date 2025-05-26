import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import '../lib/i18n';
import i18n, { initI18n } from '../lib/i18n';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const isRTL = i18n.language === 'he';

  useEffect(() => {
    const init = async () => {
      await initI18n();

      // Clean URL hash right away for visual tidiness
      if (
        typeof window !== 'undefined' &&
        window.location.hash.includes('access_token')
      ) {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) console.error('Failed to set session:', error.message);
        }

        // ✅ Immediately remove the hash for clean URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname 
        );
      }

      setReady(true);
    };

    init();
  }, []);

  if (!ready) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView
      style={{ flex: 1, direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <Stack screenOptions={{ headerShown: false }} />
      <Toast />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16 },
});
