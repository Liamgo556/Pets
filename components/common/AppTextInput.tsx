import i18n from '@/lib/i18n';
import React from 'react';
import {
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';

export default function AppTextInput(props: TextInputProps) {
  const isRTL = i18n.language === 'he';

  return (
    <TextInput
      {...props}
      style={[
        styles.input(isRTL),
        props.style,
        { textAlign: isRTL ? 'right' : 'left' },
      ]}
    />
  );
}

const styles = {
  input: (isRTL: boolean) =>
    StyleSheet.create({
      input: {
        writingDirection: isRTL ? 'rtl' : 'ltr',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
      },
    }).input,
};
