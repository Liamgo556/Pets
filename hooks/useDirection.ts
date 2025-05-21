import { I18nManager } from 'react-native';

export const useDirection = () =>
  I18nManager.isRTL ? { textAlign: 'right', writingDirection: 'rtl' } : {};
