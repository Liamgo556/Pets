import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications() {
  if (Platform.OS === 'web') {
    // Web doesn't support push notifications in the same way
    return null;
  }

  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return null;
  }

  // Get push token
  const token = await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  });

  // Store token in user metadata
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    await supabase.from('user_push_tokens').upsert({
      user_id: user.id,
      push_token: token.data,
      device_type: Platform.OS,
      created_at: new Date().toISOString(),
    });
  }

  // Set up notification configuration for Android
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export async function subscribeToNewPets() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    await supabase.from('user_preferences').upsert({
      user_id: user.id,
      notifications_new_pets: true,
    });
  }
}

export async function unsubscribeFromNewPets() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    await supabase.from('user_preferences').upsert({
      user_id: user.id,
      notifications_new_pets: false,
    });
  }
}