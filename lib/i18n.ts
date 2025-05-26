import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

import he from '../locales/he.json';
import en from '../locales/en.json';

const fallback = { languageTag: 'he', isRTL: true };

const resources = {
  en: { translation: en },
  he: { translation: he },
};

// Make sure this is only called once and before any usage of i18n
export const initI18n = async () => {
  let languageTag = fallback.languageTag;
  let isRTL = fallback.isRTL;

  try {
    const storedLang = await AsyncStorage.getItem('appLanguage');
    if (storedLang === 'he' || storedLang === 'en') {
      languageTag = storedLang;
      isRTL = storedLang === 'he';
    } else {
      const locales = RNLocalize.getLocales();
      if (locales.length > 0) {
        const best = locales[0].languageTag;
        languageTag = best.startsWith('he') ? 'he' : 'en';
        isRTL = languageTag === 'he';
      }
    }

    I18nManager.allowRTL(true);
    I18nManager.forceRTL(isRTL);

    if (!i18n.isInitialized) {
      await i18n.use(initReactI18next).init({
        lng: languageTag,
        fallbackLng: 'he',
        resources,
        interpolation: {
          escapeValue: false,
        },
      });
    }
  } catch (err) {
    console.warn('Failed to initialize i18n:', err);
  }
};

export default i18n;
