import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import i18n from './i18n';

export async function changeAppLanguage(lang: 'he' | 'en') {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem('appLanguage', lang);

  const isRTL = lang === 'he';
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);

    if (Platform.OS === 'web') {
      window.location.reload();
    } else {
      try {
        await Updates.reloadAsync();
      } catch (err) {
        console.warn('Failed to reload app for RTL/LTR change:', err);
      }
    }
  }
}
