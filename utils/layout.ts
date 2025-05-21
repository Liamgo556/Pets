import i18n from '@/lib/i18n';

export const rtlFlip = (ltrKey: string, rtlKey: string, value: number) => {
  return i18n.dir() === 'rtl' ? { [rtlKey]: value } : { [ltrKey]: value };
};
