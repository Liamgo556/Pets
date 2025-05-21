import React, { useEffect, useState } from 'react';
import { View, Platform, StyleSheet, I18nManager } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useTranslation } from 'react-i18next';
// import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { changeAppLanguage } from '@/lib/i18nHelpers';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language);

  useEffect(() => {
    const loadLang = async () => {
      const stored = await AsyncStorage.getItem('appLanguage');
      if ((stored === 'he' || stored === 'en') && stored !== i18n.language) {
        await changeAppLanguage(stored);
      }
    };
    loadLang();
  }, []);

  const handleChange = async (value: string) => {
    if (value === 'he' || value === 'en') {
      await changeAppLanguage(value);
      setLang(value);
    }
  };

  return (
    <View style={styles.container}>
      <RNPickerSelect
        value={lang}
        onValueChange={handleChange}
        items={[
          { label: 'עברית', value: 'he' },
          { label: 'English', value: 'en' },
        ]}
        placeholder={{}}
        style={{
          inputIOS: styles.input,
          inputAndroid: styles.input,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    marginRight: 12,
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#E5E7EB',
    color: '#1F2937',
    borderRadius: 8,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
});
