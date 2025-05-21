import React from 'react';
import { I18nManager, StyleSheet, View } from 'react-native';

type Props = {
  children: React.ReactNode;
};

export const DirectionProvider = ({ children }: Props) => {
  return (
    <View style={I18nManager.isRTL ? styles.rtl : styles.ltr}>{children}</View>
  );
};

const styles = StyleSheet.create({
  rtl: {
    flex: 1,
    direction: 'rtl',
    writingDirection: 'rtl',
  },
  ltr: {
    flex: 1,
    direction: 'ltr',
    writingDirection: 'ltr',
  },
});
