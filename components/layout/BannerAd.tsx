import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Image,
  Linking,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';

type BannerAdProps = {
  position: 'left' | 'right' | 'bottom';
  adContent?: {
    imageUrl: string;
    linkUrl: string;
    altText: string;
  };
};

export default function BannerAd({
  position,
  adContent = {
    imageUrl:
      'data:image/jpeg;base64,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',
    linkUrl: 'https://www.0404.co.il/',
    altText: '0404 - אתר הבית של 0404',
  },
}: BannerAdProps) {
  if (Platform.OS !== 'web') return null;

  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  if (width < 1024) return null;

  const handlePress = () => {
    console.log('here');
    console.log(adContent);

    if (adContent?.linkUrl) {
      Linking.openURL(adContent.linkUrl);
    }
  };

  return (
    <View
      style={[
        styles.container,
        position === 'left' && styles.left,
        position === 'right' && styles.right,
        position === 'bottom' && [
          styles.bottom,
          width < 1024 ? styles.bottomSmall : styles.bottomLarge,
        ],
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[
          styles.adWrapper,
          position === 'bottom' && styles.adWrapperBottom,
        ]}
      >
        <Image
          source={{ uri: adContent.imageUrl }}
          style={styles.adImage}
          accessibilityLabel={adContent.altText}
        />
        <Text style={styles.sponsoredLabel}>{t('common.sponsored')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'fixed',
    top: '50%',
    transform: [{ translateY: -150 }],
    zIndex: 1000,
    pointerEvents: 'box-none',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  left: {
    left: 0,
    paddingLeft: 8,
  },
  right: {
    right: 0,
    paddingRight: 8,
  },
  adWrapper: {
    pointerEvents: 'auto',
    width: 160,
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  adImage: {
    width: '100%',
    height: '100%',
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  sponsoredLabel: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: 'white',
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bottom: {
    position: 'fixed',
    height: 'auto',
    top: 'auto',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: `-50%` as `${number}%` }], // override with width style
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  bottomSmall: {
    width: '80%',
  },
  bottomLarge: {
    width: '60%',
  },
  adWrapperBottom: {
    height: 120,
    width: '100%',
  },
});
