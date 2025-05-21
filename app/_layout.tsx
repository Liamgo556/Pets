import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, StyleSheet, I18nManager } from 'react-native';
import Toast from 'react-native-toast-message';
import '../lib/i18n';
import i18n, { initI18n } from '../lib/i18n';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const isRTL = i18n.language === 'he';

  useEffect(() => {
    const load = async () => {
      await initI18n();
      setReady(true);
    };
    load();
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
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <Toast />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16 },
});
